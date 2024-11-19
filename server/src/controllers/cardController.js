import { Router } from "express";

const cardRoutes = new Router();
cardRoutes.get("/", (req, res) => {
  res.send("haha");
});

export default cardRoutes;
