import mongoose from "mongoose";
import cardSchema from "../schemas/cardSchema.js";

const collectionSchema = mongoose.Schema({
  name: { type: String, required: true },
  owner: { type: String, required: true },
  category: { type: String, required: true },
  cards: { type: [cardSchema], required: true },
});

const collectionModel = mongoose.model("Collections", collectionSchema);
export default collectionModel;
