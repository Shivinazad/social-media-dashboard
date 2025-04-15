require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, "../")));

// MongoDB Connection
const MONGODB_URI =
  process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/dashboard";

mongoose
  .connect(MONGODB_URI, {
    serverSelectionTimeoutMS: 5000,
    family: 4, // Force IPv4
  })
  .then(() => console.log("Main server: Connected to MongoDB"))
  .catch((err) => console.error("Main server: MongoDB connection error:", err));

// Define Schema and Model
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

let Analytics;
try {
  Analytics = mongoose.model("Analytics");
} catch {
  Analytics = mongoose.model("Analytics", analyticsSchema);
}

const taskSchema = new mongoose.Schema({
  description: String,
  createdAt: { type: Date, default: Date.now },
});

let Task;
try {
  Task = mongoose.model("Task");
} catch {
  Task = mongoose.model("Task", taskSchema);
}

// Function to generate mock data
const generateMockData = () => {
  return {
    balance: Math.floor(Math.random() * 10000) + 1000,
    facebookShares: Math.floor(Math.random() * 100),
    instagramFollowers: Math.floor(Math.random() * 100),
    linkedInViews: Math.floor(Math.random() * 100),
    engagementRate: (Math.random() * 10).toFixed(2),
    conversion: Math.random() > 0.5 ? "High" : "Low",
    analyticsSummary: [
      "Could do better",
      "Instagram is still the same",
      "Marketing budget ++",
      "Conversion is low",
    ],
  };
};

// Save mock data with proper error handling
const saveMockData = async () => {
  try {
    const mockData = generateMockData();
    mockData.timestamp = new Date();
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

// Routes
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

// Serve HTML files
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "../html/index.html"));
});

// Start Server
app.listen(PORT, () => {
  console.log(`Main server running on http://localhost:${PORT}`);
});
