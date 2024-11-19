import dotenv from "dotenv";
import connectDB from "./database/config.js";
import express from "express";
import setUpRoutes from "./controllers/routes.js";

dotenv.config();
const app = express();
const PORT = process.env.PORT;

// Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
connectDB();

setUpRoutes(app);

app.listen(PORT);
