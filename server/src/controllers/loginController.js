import { Router } from "express";
import AuthService from "../services/authService.js";

const logInRoutes = new Router();

/**
 * Middleware to validate the login request body.
 *
 * Ensures that both the `login` and `password` fields are present in the request body.
 * If either field is missing, it responds with a 400 status code and an error message.
 * Otherwise, it proceeds to the next middleware or route handler.
 *
 * @param {object} req - The Express request object.
 * @param {object} req.body - The request body containing the `login` and `password` fields.
 * @param {object} res - The Express response object.
 * @param {function} next - The next middleware or route handler.
 *
 * @example
 * // Example request body
 * {
 *   "login": "user@example.com",
 *   "password": "password123"
 * }
 */
const validateLogIn = (req, res, next) => {
  const { login, password } = req.body;

  if (!login || !password) {
    return res
      .status(400)
      .json({ message: "Email/username e senha são obrigatórios" });
  }
  next();
};

/**
 * POST /login - Authenticates a user and returns a JWT token if successful.
 *
 * This route accepts a login identifier (email or username) and a password in the request body.
 * It uses `validateLogIn` middleware to ensure the input is valid.
 * If authentication succeeds, a JWT token is returned. Otherwise, an error message is sent.
 *
 * @name POST /login
 * @function
 * @param {object} req - The Express request object.
 * @param {object} req.body - The request body containing the `login` and `password` fields.
 * @param {object} res - The Express response object.
 * @returns {object} JSON response with the following structure:
 *   - On success: { logged: true, token: "JWT_TOKEN" }
 *   - On failure: { logged: false, message: "Your email/username or your password is wrong, try again" }
 */
logInRoutes.post("/login", validateLogIn, async (req, res) => {
  const { login, password } = req.body;

  const result = AuthService.logIn(login, password);

  if (result.success) {
    res.status(200).json({ loggged: true, token: result.token });
  }

  res.status(401).json({
    logged: false,
    message: "Your email/username or your password is worng, try again",
  });
});

export default logInRoutes;
