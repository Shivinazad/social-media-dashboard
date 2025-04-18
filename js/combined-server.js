require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const bodyParser = require("body-parser");
const cors = require("cors");
const nodemailer = require("nodemailer");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;

// Add support for proxy in production
app.set("trust proxy", 1);

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, "../")));

// Serve HTML files
app.get("*.html", (req, res) => {
  res.sendFile(path.join(__dirname, "../html", req.path));
});

// MongoDB Connection
const MONGODB_URI =
  process.env.NODE_ENV === "production"
    ? process.env.MONGODB_URI
    : "mongodb://127.0.0.1:27017/dashboard";

mongoose
  .connect(MONGODB_URI)
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.error("MongoDB connection error:", err));

// Define Schemas and Models
const analyticsSchema = new mongoose.Schema({
  balance: Number,
  facebookShares: Number,
  instagramFollowers: Number,
  linkedInViews: Number,
  engagementRate: Number,
  conversion: String,
  analyticsSummary: [String],
  timestamp: { type: Date, default: Date.now },
});

const Analytics = mongoose.model("Analytics", analyticsSchema);

// Function to generate mock data
const generateMockData = () => {
  return {
    balance: Math.floor(Math.random() * 10000) + 1000,
    facebookShares: Math.floor(Math.random() * 100),
    instagramFollowers: Math.floor(Math.random() * 100),
    linkedInViews: Math.floor(Math.random() * 100),
    engagementRate: (Math.random() * 10).toFixed(2),
    conversion: Math.random() > 0.5 ? "high" : "low",
    analyticsSummary: [
      "Could do better",
      "Instagram is still the same",
      "Marketing budget ++",
      "Conversion is low",
    ],
    timestamp: new Date(),
  };
};

// Save mock data with proper error handling
const saveMockData = async () => {
  try {
    const mockData = generateMockData();
    const analytics = new Analytics(mockData);
    await analytics.save();
    console.log(
      "Mock analytics data saved with timestamp:",
      mockData.timestamp
    );
  } catch (error) {
    console.error("Error saving mock data:", error);
  }
};

// Run mock data generator every 2 minutes
setInterval(saveMockData, 2 * 60 * 1000);

// Generate initial data
saveMockData();

const userSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  password: String,
});

const User = mongoose.model("User", userSchema);

const taskSchema = new mongoose.Schema({
  description: String,
  createdAt: { type: Date, default: Date.now },
});

const Task = mongoose.model("Task", taskSchema);

// Configure email transporter
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD,
  },
});

// Root route should serve index.html
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "../html/index.html"));
});

// Analytics Routes
app.get("/analytics", async (req, res) => {
  try {
    const latestData = await Analytics.findOne().sort({ timestamp: -1 });
    if (!latestData) {
      return res.status(404).json({ message: "No analytics data found" });
    }
    res.json(latestData);
  } catch (error) {
    res.status(500).json({ message: "Error fetching analytics data", error });
  }
});

// Auth Routes
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

app.post("/login", async (req, res) => {
  const { email, password } = req.body;
  console.log("Login attempt for email:", email);

  try {
    const user = await User.findOne({ email });
    if (!user) {
      console.log("User not found for email:", email);
      return res.status(400).json({ message: "Invalid email or password" });
    }

    console.log("User found, verifying password");
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      console.log("Invalid password for email:", email);
      return res.status(400).json({ message: "Invalid email or password" });
    }

    console.log("Login successful for user:", user.name);
    res.status(200).json({
      message: "Login successful",
      name: user.name,
      userId: user._id,
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Error logging in", error: error.message });
  }
});

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

// Task Routes
app.get("/tasks", async (req, res) => {
  try {
    const tasks = await Task.find();
    res.status(200).json(tasks);
  } catch (error) {
    res.status(500).json({ message: "Error fetching tasks", error });
  }
});

app.post("/tasks", async (req, res) => {
  const { description } = req.body;

  if (!description) {
    return res.status(400).json({ message: "Task description is required" });
  }

  try {
    const newTask = new Task({ description });
    await newTask.save();
    res.status(201).json({ message: "Task added successfully", task: newTask });
  } catch (error) {
    res.status(500).json({ message: "Error adding task", error });
  }
});

app.delete("/tasks/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const deletedTask = await Task.findByIdAndDelete(id);
    if (!deletedTask) {
      return res.status(404).json({ message: "Task not found" });
    }
    res.status(200).json({ message: "Task deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting task", error });
  }
});

// Contact form endpoint
app.post("/contact", async (req, res) => {
  const { name, email, message } = req.body;

  if (!name || !email || !message) {
    return res.status(400).json({ message: "All fields are required" });
  }

  try {
    // Log the contact form submission for demonstration
    console.log("Contact form submission:", { name, email, message });

    // For demonstration, we'll just return success without actually sending an email
    res
      .status(200)
      .json({ message: "Message received successfully! (Demo Mode)" });
  } catch (error) {
    console.error("Error handling contact form:", error);
    res.status(500).json({
      message: "Error processing your message",
      details: error.message,
    });
  }
});

// Handle all other routes to serve the corresponding HTML file
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

// Start Server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
