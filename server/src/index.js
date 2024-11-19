import dotenv from "dotenv";
import connectDB from "./database/config.js";
import express from "express";

dotenv.config();
const app = express();
const PORT = process.env.PORT;

// Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
connectDB();

app.get("/", (req, res) => {
  return res.json("Ola Mundo!");
});

app.listen(PORT);
