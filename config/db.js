const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    const mongoURI = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/healthDB";
    await mongoose.connect(mongoURI);
    console.log("✅ MongoDB Connected");
  } catch (error) {
    console.error(error);
  }
};

module.exports = connectDB;