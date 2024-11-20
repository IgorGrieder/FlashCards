import { Router } from "express";
import AuthService from "../services/authService.js";
import Utils from "../utils/utils.js";

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

/**
 * Endpoint to handle user account creation.
 *
 * This endpoint first runs the `validateCreateAccount` middleware to validate the input data
 * (username, email, password) and check for uniqueness. If validation passes, it proceeds to call the
 * `AuthService.createAccount` function to create the new user account. The response depends on the result:
 * - If the account creation is successful, it returns a `200 OK` status with a success message.
 * - If an internal server error occurs, it returns a `500 Internal Server Error` with an error message.
 *
 * @function
 * @async
 * @param {object} req - The Express request object containing the `email`, `username`, and `password` in the body.
 * @param {object} req.body - The request body containing user account details (`email`, `username`, `password`).
 * @param {object} res - The Express response object used to send back the response.
 * @returns {void} Sends a JSON response with either success or error details.
 */
logInRoutes.post("/create-account", validateCreateAccount, async (req, res) => {
  const { email, username, password } = req.body;
  const result = await AuthService.createAccount(email, username, password);

  if (result.accountCreated) {
    return res.status(201).json({
      accountCreated: true,
      message: "Your account was created",
    });
  }

  // Internal server error
  if (result.code === 500) {
    return res.status(500).json({
      accountCreated: false,
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

/**
 * This route requires a valid JWT token to authenticate the user making the request.
 * If the token is valid, the server will attempt to delete the user associated with the `userId` from the token's payload.
 * If successful, it will return a `204 No Content` response.
 * If there is an error during deletion, a `500 Internal Server Error` is returned.
 *
 * @security BearerAuth
 * @async
 * @function
 * @param {Object} req - The request object containing the JWT token in the header and the user data in the body.
 * @param {Object} res - The response object to send the result of the deletion request.
 * @returns {Object} 204 No Content or 500 Internal Server Error response.
 *
 * @example
 * // Example request
 * DELETE /delete-user
 * Authorization: Bearer <valid-jwt-token>
 *
 * // Example success response
 * HTTP/1.1 204 No Content
 *
 * // Example error response
 * HTTP/1.1 500 Internal Server Error
 * {
 *   "accountCreated": false,
 *   "message": "An unexpected error occurred."
 * }
 */
logInRoutes.delete(
  "/delete-user",
  Utils.validateJWTMiddlewear,
  async (req, res) => {
    const { userId } = req.body.decoded;

    const result = await AuthService.deleteUser(userId);

    // Internal server error
    if (result.code === 500) {
      return res.status(500).json({
        accountCreated: false,
        message: "An unexpected error occurred.",
      });
    }

    return res.status(204).send();
  },
);

export default logInRoutes;
