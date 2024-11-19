import cardRoutes from "./cardController.js";

// Main function that will populate the main application with all the routes
const setUpRoutes = (app) => {
  app.use(cardRoutes);
};

export default setUpRoutes;
