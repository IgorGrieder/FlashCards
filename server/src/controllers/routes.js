import cardRoutes from "./cardController.js";
import userRoutes from "./userController.js";
import collectionRoutes from "./collectionController.js";

const setUpRoutes = (app) => {
  app.use("/api/cards", cardRoutes);
  app.use("/api/users", userRoutes);
  app.use("/api/collections", collectionRoutes)
};

export default setUpRoutes;
