import mongoose from "mongoose";

const cardSchema = mongoose.Schema({
  question: { type: String, required: true },
  category: { type: String, required: true },
  img: { type: String },
});

export default cardSchema;
