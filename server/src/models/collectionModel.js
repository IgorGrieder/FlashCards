import mongoose from "mongoose";
import cardSchema from "./cardModel.js";

const collectionSchema = mongoose.Schema({
  name: { type: String, required: true },
  cards: { type: [cardSchema], required: true },
});

export default collectionSchema;
