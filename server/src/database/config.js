import mongoose from "mongoose";

const connectDB = async () => {
  const connectionString = process.env.DB_STRING;
  try {
    await mongoose.connect(connectionString);
  } catch (error) {
    throw new Error(error.message);
  }
};

export default connectDB;
