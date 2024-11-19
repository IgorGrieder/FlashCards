const mongoose = require("mongoose");
require("dotenv/config");

const connectDB = async () => {
  const connectionString = process.env.DB_STRING;
  try {
    await mongoose.connect(connectionString);
    console.log("Database connected successfully!");
  } catch (e) {
    console.error("Error connecting to the database:", e.message);
  }
};

module.exports = connectDB;
