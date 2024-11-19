require("dotenv/config");
const connectDB = require("./database/config.js");
const express = require("express");
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
