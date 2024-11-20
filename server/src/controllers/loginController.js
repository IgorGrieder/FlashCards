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
    return res.status(400).json({
      logged: false,
      message: "Email/username and password are required.",
    });
  }

  next();
};

/**
 * Middleware to validate the creation of a user account.
 *
 * This function checks that the `username`, `email`, and `password` fields are provided in the request body.
 * It then checks if the `username` or `email` already exists in the system by querying the `AuthService.findUser` method.
 * If any of the fields are missing or if the username/email is already taken, it returns a `400 Bad Request` response.
 * If all validations pass, it proceeds to the next middleware or route handler.
 *
 * @function
 * @async
 * @param {object} req - The Express request object.
 * @param {object} req.body - The request body containing the `username`, `email`, and `password`.
 * @param {object} res - The Express response object used to send responses.
 * @param {function} next - The next middleware function to pass control to.
 * @returns {void} This function either responds with an error or calls `next()` to continue the request processing.
 */
const validateCreateAccount = async (req, res, next) => {
  const { username, email, password } = req.body;
  let user;

  if (!username || !email || !password) {
    return res.status(400).json({
      accountCreated: false,
      message: "Email/username and password are required.",
    });
  }

  user = await AuthService.findUser(username);
  if (user) {
    return res.status(400).json({
      accountCreated: false,
      message: "Username already exists, try another one",
    });
  }

  user = await AuthService.findUser(email);
  if (user) {
    return res.status(400).json({
      accountCreated: false,
      message: "Email already exists, try another one",
    });
  }

  next();
};

logInRoutes.post("/create-account", validateCreateAccount, async (req, res) => {
  const { email, username, password } = req.body;

  const result = await AuthService.createAccount(email, username, password);

  if (result.success) {
    return res.status(200).json({
      accountCreated: true,
      message: "Your account was created",
    });
  }

  // Internal server error
  if (result.code === 500) {
    return res.status(500).json({
      logged: false,
      message: "An unexpected error occurred.",
    });
  }
});

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

  const result = await AuthService.logIn(login, password);

  // Log in accepted
  if (result.success) {
    return res.status(200).json({ loggged: true, token: result.token });
  }

  // Internal server error
  if (result.code === 500) {
    return res.status(500).json({
      logged: false,
      message: "An unexpected error occurred.",
    });
  }

  // Unauthorized log in
  return res.status(401).json({
    logged: false,
    message: "Invalid credentials",
  });
});

export default logInRoutes;
