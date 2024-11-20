import dotenv from "dotenv";
import express from "express";
import setUpRoutes from "./controllers/routes.js";
import connectDB from "./database/config.js";

const app = express();
dotenv.config();
const PORT = process.env.PORT;

/**
 * startServer - This function handles the initialization of the server, ensuring
 * that the database connection is successful before setting up the Express app and
 * starting the server. It also includes a middleware that checks the database
 * connection status during each request.
 *
 * 1. Attempts to connect to the database using the `connectDB` function.
 * 2. Once the database is connected, sets up middleware and routes.
 * 3. Adds a middleware to verify the database connection status on each request.
 * 4. Starts the Express server on the configured port if the connection is successful.
 * 5. If the database connection fails, logs the error and exits the process.
 *
 * @returns {void}
 */
const startServer = async () => {
  try {
    await connectDB(); // Ensure the DB connection is successful before proceeding

    // Set up middlewares and routes after DB connection is established
    app.use(express.json());
    app.use(express.urlencoded({ extended: true }));

    // Middleware to check DB connection status
    app.use((req, res, next) => {
      if (mongoose.connection.readyState !== 1) {
        return res.status(503).json({
          success: false,
          message: "Service unavailable. Database is not connected.",
        });
      }
      next();
    });

    // Set up routes
    setUpRoutes(app);

    // Start the server after DB connection is successful
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.log(error.message);
    process.exit(1); // Exit the process if DB connection fails
  }
};

// Start the server and connect to the database
startServer();
