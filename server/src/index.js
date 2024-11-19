require("dotenv/config");
const express = require("express");
const app = express();
const PORT = process.env.PORT;
app.get("/", (req, res) => {
  return res.json("Ola Mundo!");
});
app.listen(PORT);
