require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const bodyParser = require("body-parser");
const cors = require("cors");
const nodemailer = require("nodemailer");
const path = require("path");

const app = express();
const PORT = process.env.AUTH_PORT || 3001;

// Add support for proxy in production
app.set("trust proxy", 1);

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Serve static files from the root directory
app.use(express.static(path.join(__dirname, "../")));

// Root route should serve index.html
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "../html/index.html"));
});

// Serve HTML files for all other routes
app.get("*", (req, res, next) => {
  const path_parts = req.path.split("/");
  const last_part = path_parts[path_parts.length - 1];

  // If it's an API call or static file, let it pass through
  if (last_part.includes(".") || req.path.startsWith("/api/")) {
    return next();
  }

  // Otherwise serve index.html
  res.sendFile(path.join(__dirname, "../html/index.html"));
});

// MongoDB Connection
const MONGODB_URI =
  process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/dashboard";

mongoose
  .connect(MONGODB_URI, {
    serverSelectionTimeoutMS: 5000,
    family: 4, // Force IPv4
  })
  .then(() => console.log("Auth server: Connected to MongoDB"))
  .catch((err) => console.error("Auth server: MongoDB connection error:", err));

// Configure email transporter
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD,
  },
});

// Verify email configuration
transporter.verify(function (error, success) {
  if (error) {
    console.error("Email configuration error:", error);
  } else {
    console.log("Server is ready to send emails");
  }
});

// User Schema
const userSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  password: String,
});

let User;
try {
  User = mongoose.model("User");
} catch {
  User = mongoose.model("User", userSchema);
}

// Signup Route
app.post("/signup", async (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ message: "All fields are required" });
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({ name, email, password: hashedPassword });
    await newUser.save();
    res.status(201).json({ message: "User registered successfully" });
  } catch (error) {
    if (error.code === 11000) {
      res.status(400).json({ message: "Email already exists" });
    } else {
      res.status(500).json({ message: "Error registering user", error });
    }
  }
});

// Login Route
app.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    // Return the user's name and a session token
    res
      .status(200)
      .json({ message: "Login successful", name: user.name, userId: user._id });
  } catch (error) {
    res.status(500).json({ message: "Error logging in", error });
  }
});

// Get User Data by ID
app.get("/user/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({ name: user.name });
  } catch (error) {
    res.status(500).json({ message: "Error fetching user data", error });
  }
});

// Contact form endpoint
app.post("/contact", async (req, res) => {
  const { name, email, message } = req.body;

  if (!name || !email || !message) {
    return res.status(400).json({ message: "All fields are required" });
  }

  const mailOptions = {
    from: process.env.GMAIL_USER, // Changed from email to your Gmail
    to: process.env.GMAIL_USER, // Your Gmail address from env
    subject: `New Contact Form Message from ${name}`,
    text: `
Name: ${name}
Email: ${email}
Message: ${message}
    `,
    html: `
      <h3>New Contact Form Message</h3>
      <p><strong>Name:</strong> ${name}</p>
      <p><strong>Email:</strong> ${email}</p>
      <p><strong>Message:</strong></p>
      <p>${message}</p>
    `,
  };

  try {
    console.log("Attempting to send email...");
    await transporter.sendMail(mailOptions);
    console.log("Email sent successfully");
    res.status(200).json({ message: "Message sent successfully" });
  } catch (error) {
    console.error("Error details:", {
      message: error.message,
      code: error.code,
      response: error.response,
    });
    res.status(500).json({
      message: "Error sending message",
      details: error.message,
    });
  }
});

// Start Server
app.listen(PORT, () => {
  console.log(`Auth server running on http://localhost:${PORT}`);
});
