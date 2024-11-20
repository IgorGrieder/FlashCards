import { Router } from "express";
import AuthService from "../services/authService";

const logInRoutes = new Router();

// Route to validate the login in the request body
const validateLogin = (req, res, next) => {
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

  if (result) {
    res.status(200).json({ loggged: true, token: result.token });
  } else {
    res.status(400).json({
      logged: false,
      message: "An error occured while trying to log in, try again",
    });
  }
});

export default logInRoutes;
