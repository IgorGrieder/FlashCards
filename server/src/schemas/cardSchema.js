import mongoose from "mongoose";

const cardSchema = mongoose.Schema({
  category: { type: String, required: true },
  question: { type: String, required: true },
  answer: { type: String, required: true },
  img: { type: String },
});

export default cardSchema;
