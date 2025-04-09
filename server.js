const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();
const PORT = 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Connect to MongoDB
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
});

const Analytics = mongoose.model("Analytics", analyticsSchema);

// Analytics Endpoint
app.get("/analytics", async (req, res) => {
  try {
    const analyticsData = await Analytics.findOne();
    if (!analyticsData) {
      return res.status(404).json({ message: "No analytics data found" });
    }
    res.json(analyticsData);
  } catch (error) {
    res.status(500).json({ message: "Error fetching analytics data", error });
  }
});

// Start Server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
