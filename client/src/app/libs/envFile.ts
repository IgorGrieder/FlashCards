import path from "path";
import dotenv from "dotenv";

// Load the .env file
const envPath = path.resolve(__dirname, "../.env");
dotenv.config({ path: envPath });

// Export Next.js configuration
module.exports = {
  env: {
    API_URL: process.env.API_URL, // Explicitly pass the variable
  },
};
