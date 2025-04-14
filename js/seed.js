require("dotenv").config();
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const seedAndClose = async () => {
  try {
    await mongoose.connect(
      process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/dashboard"
    );
    console.log("Seed: Connected to MongoDB");

    // Analytics Schema and Model
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

    // User Schema and Model
    const userSchema = new mongoose.Schema({
      name: String,
      email: { type: String, unique: true },
      password: String,
    });

    const User = mongoose.model("User", userSchema);

    // Create mock analytics data
    const seedData = new Analytics({
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
      timestamp: new Date(),
    });

    // Create mock user
    const hashedPassword = await bcrypt.hash("password123", 10);
    const mockUser = new User({
      name: "Demo User",
      email: "demo@example.com",
      password: hashedPassword,
    });

    // Save both mock data
    await seedData.save();
    await mockUser.save();
    console.log("Seed data and mock user added successfully");
  } catch (err) {
    console.error("Error in seed operation:", err);
  } finally {
    await mongoose.connection.close();
    console.log("Seed: MongoDB connection closed");
    process.exit(0);
  }
};

seedAndClose();
