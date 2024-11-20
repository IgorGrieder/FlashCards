import cardRoutes from "./cardController.js";
import logInRoutes from "./loginController.js";

/**
 * setUpRoutes - This function sets up the application's routes by attaching route handlers
 * for various API endpoints. It configures the Express app to use the specified route files
 * for handling different types of requests, such as card-related operations and user login.
 *
 * 1. Attaches the routes defined in `cardRoutes` to handle requests related to flashcards.
 * 2. Attaches the routes defined in `logInRoutes` to handle requests related to user authentication.
 *
 * @param {Object} app - The Express app instance where the routes will be added.
 * @returns {void}
 */
const setUpRoutes = (app) => {
  app.use(cardRoutes);
  app.use(logInRoutes);
};

export default setUpRoutes;
