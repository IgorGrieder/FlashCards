import mongoose from "mongoose";

const cardSchema = mongoose.Schema({
  question: { type: String, required: true },
});

export default cardSchema;
