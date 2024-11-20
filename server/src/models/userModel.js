import mongoose from "mongoose";
import collectionSchema from "./collectionModel.js";

const userSchema = mongoose.Schema({
  username: { type: String, required: true },
  email: { type: String, required: true },
  password: { type: String, required: true },
  collections: { type: [collectionSchema], required: true },
});

const userModel = mongoose.model("Users", userSchema);
export default userModel;
