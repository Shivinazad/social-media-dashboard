const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();
const PORT = 3000;

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB Connection
mongoose
  .connect("mongodb://127.0.0.1:27017/analyticsDB", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.error("MongoDB connection error:", err));

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

const Analytics = mongoose.model("Analytics", analyticsSchema);

// Task Schema and Model
const taskSchema = new mongoose.Schema({
  description: String,
  createdAt: { type: Date, default: Date.now },
});

const Task = mongoose.model("Task", taskSchema);

// Function to generate random analytics data
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
  };
};

// Ensure the timestamp is correctly set when saving mock data
const saveMockData = async () => {
  const mockData = generateMockData();
  mockData.timestamp = new Date(); // Explicitly set the timestamp
  const analytics = new Analytics(mockData);
  await analytics.save();
  console.log("Mock analytics data saved with timestamp:", mockData.timestamp);
};

// Run the mock data generator every 2 minutes
setInterval(saveMockData, 2 * 60 * 1000); // 2 minutes

// Mock Analytics Data
const analyticsData = {
  balance: 4500,
  facebookShares: 10,
  instagramFollowers: 27,
  linkedInViews: 50,
  engagementRate: 3.75,
  conversion: "low",
  analyticsSummary: [
    "Could do better",
    "Instagram is still the same",
    "Marketing budget ++",
    "Conversion is low",
  ],
  timestamp: new Date(), // Add a timestamp field
};

// Update the /analytics endpoint to fetch the latest data from MongoDB
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

// Get All Tasks
app.get("/tasks", async (req, res) => {
  try {
    const tasks = await Task.find();
    res.status(200).json(tasks);
  } catch (error) {
    res.status(500).json({ message: "Error fetching tasks", error });
  }
});

// Add a New Task
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

// Delete a Task
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

// Start Server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
