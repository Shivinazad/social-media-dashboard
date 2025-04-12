const mongoose = require("mongoose");

mongoose
  .connect("mongodb://127.0.0.1:27017/analyticsDB", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.error("MongoDB connection error:", err));

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
});

seedData
  .save()
  .then(() => {
    console.log("Seed data added successfully");
    mongoose.connection.close();
  })
  .catch((err) => console.error("Error adding seed data:", err));
