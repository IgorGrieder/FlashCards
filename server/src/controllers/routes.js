import cardRoutes from "./cardController.js";
import logInRoutes from "./loginController.js";

// Main function that will populate the main application with all the routes
const setUpRoutes = (app) => {
  app.use(cardRoutes);
  app.use(logInRoutes);
};

export default setUpRoutes;
