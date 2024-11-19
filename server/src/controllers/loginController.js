import { Router } from "express";

const logInRoutes = new Router();

// Route to validate the login in the request body

// Route to provide user to log in or not
logInRoutes.post("/login", validateLogIn, async (req, res) => {});

export default logInRoutes;
