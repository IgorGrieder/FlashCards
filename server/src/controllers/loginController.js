import { Router } from "express";
import AuthService from "../services/authService.js";

const logInRoutes = new Router();

// Route to validate the login in the request body
const validateLogIn = (req, res, next) => {
  const { login, password } = req.body;

  if (!login || !password) {
    return res
      .status(400)
      .json({ message: "Email/username e senha são obrigatórios" });
  }
  next();
};

// Route to provide user to log in or not
logInRoutes.post("/login", validateLogIn, async (req, res) => {
  const { login, password } = req.body;

  const result = AuthService.logIn(login, password);

  // If the user was validated we will return the JWT token to it and allow the log in
  if (result.success) {
    res.status(200).json({ loggged: true, token: result.token });
  }

  res.status(400).json({
    logged: false,
    message: "Your email/username or your password is worng, try again",
  });
});

export default logInRoutes;
