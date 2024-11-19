import cardSchema from "./cardModel";
import mongoose from "mongoose";

const userSchema = mongoose.Schema({
  name: { type: String, required: true },
  password: { type: String, required: true },
  cards: { type: [cardSchema], required: true },
});

const userModel = mongoose.model("Users", userSchema);
export default userModel;
