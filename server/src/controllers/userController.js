import { Router } from "express";
import AuthService from "../services/authService.js";
import Utils from "../utils/utils.js";

const userRoutes = new Router();

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
 * Middleware to validate the input for password change requests.
 *
 * This middleware checks that the request body contains the necessary fields for changing the password.
 * It ensures that `login`, `oldPassword`, and `newPassword` are provided by the client.
 * If any of these fields are missing, the middleware responds with a 400 status and an error message.
 *
 * @middleware
 * @route POST /change-password
 * @param {string} login.body.required - The email/username of the user requesting the password change.
 * @param {string} oldPassword.body.required - The current password of the user.
 * @param {string} newPassword.body.required - The new password to be set for the user.
 * @returns {Object} 400 - An error message if the request body is missing required fields.
 *
 * @example
 * // Example request body
 * {
 *   "login": "user@example.com",
 *   "oldPassword": "oldPassword123",
 *   "newPassword": "newPassword456"
 * }
 *
 * @example
 * // Example response (400)
 * {
 *   "logged": false,
 *   "message": "Email/username and passwords are required."
 * }
 */
const validatePasswordChange = (req, res, next) => {
  const { login, oldPassword, newPassword } = req.body;
  if (!login || !oldPassword || !newPassword) {
    return res.status(400).json({
      logged: false,
      message: "Email/username and passwords are required.",
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
  if (user.success) {
    return res.status(400).json({
      accountCreated: false,
      message: "Username already exists, try another one",
    });
  }

  user = await AuthService.findUser(email);
  if (user.success) {
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
userRoutes.post("/create-account", validateCreateAccount, async (req, res) => {
  const { email, username, password } = req.body;
  const result = await AuthService.createAccount(email, username, password);

  if (result.accountCreated) {
    return res.status(201).json({
      accountCreated: true,
      username: username,
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
 * POST /login
 *
 * Authenticates a user and issues a session token as an HTTP-only cookie.
 * On successful login, a JSON Web Token (JWT) is stored in a secure cookie for subsequent authentication.
 *
 * @async
 * @function
 * @param {Object} req - The request object.
 * @param {Object} req.body - The body of the request.
 * @param {string} req.body.login - The user's login credential (required).
 * @param {string} req.body.password - The user's password (required).
 * @param {Object} res - The response object.
 *
 * @response {number} 200 - Indicates successful login.
 * @responseBody {boolean} logged - Always `true` when login succeeds.
 *
 * @response {number} 401 - Indicates invalid credentials.
 * @responseBody {boolean} logged - Always `false` when login fails.
 * @responseBody {string} message - An error message indicating invalid credentials.
 *
 * @response {number} 500 - Indicates an unexpected server error.
 * @responseBody {boolean} logged - Always `false` when an internal error occurs.
 * @responseBody {string} message - An error message indicating the issue.
 *
 * @example
 * // Request
 * POST /login
 * {
 *   "login": "user123",
 *   "password": "password123"
 * }
 *
 * // Response for successful login
 * 200 OK
 * {
 *   "logged": true
 * }
 *
 * // Response for invalid credentials
 * 401 Unauthorized
 * {
 *   "logged": false,
 *   "message": "Invalid credentials"
 * }
 *
 * // Response for server error
 * 500 Internal Server Error
 * {
 *   "logged": false,
 *   "message": "An unexpected error occurred."
 * }
 */
userRoutes.post("/login", validateLogIn, async (req, res) => {
  const { login, password } = req.body;
  const result = await AuthService.logIn(login, password);

  if (result.success) {
    res.cookie("jwt", result.token, {
      httpOnly: true,
      secure: process.env.ENVIROMENT === "DEV" ? false : true,
      sameSite: "strict",
      maxAge: 3600000,
    });

    return res
      .status(200)
      .json({ logged: true, username: result.user.username });
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
 * POST /logout
 *
 * Logs the user out by clearing the `jwt` cookie and sending a success response.
 * This endpoint removes the session token stored in an HTTP-only cookie, effectively ending the user's session.
 *
 * @function
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 *
 * @response {number} 200 - Indicates successful logout.
 * @responseBody {boolean} loggedOut - Always `true` when logout succeeds.
 * @responseBody {string} message - A success message indicating the user has been logged out.
 *
 * @example
 * // Request
 * POST /logout
 *
 * // Response
 * 200 OK
 * {
 *   "loggedOut": true,
 *   "message": "Logged out successfully"
 * }
 */
userRoutes.post("/logout", (req, res) => {
  res.clearCookie("jwt");
  res.json({ loggedOut: true, message: "Logged out successfully" });
});

/**
 * Route to change the password of a user.
 *
 * This endpoint allows a user to change their password. It first verifies the old password
 * provided by the user and then updates it with the new password if the old password is correct.
 *
 * @route PATCH /change-password
 * @group Auth - Operations related to authentication
 * @param {string} login.body.required - The username or email of the user requesting the password change.
 * @param {string} oldPassword.body.required - The current password to authenticate the user.
 * @param {string} newPassword.body.required - The new password to set for the user.
 * @returns {Object} 200 - A success message when the password is updated successfully.
 * @returns {Object} 400 - An error message if the old password is incorrect or the user doesn't exist.
 * @returns {Object} 500 - An error message if an unexpected server error occurs.
 *
 * @example
 * // Example request body
 * {
 *   "login": "user@example.com",
 *   "oldPassword": "oldPassword123",
 *   "newPassword": "newPassword456"
 * }
 *
 * @example
 * // Example response (200)
 * {
 *   "passwordChanged": true,
 *   "message": "Your password was changed successfully"
 * }
 *
 * @example
 * // Example response (500)
 * {
 *   "passwordChanged": false,
 *   "message": "An unexpected error occurred."
 * }
 */
userRoutes.patch(
  "/change-password",
  validatePasswordChange,
  async (req, res) => {
    const { login, oldPassword, newPassword } = req.body;

    const result = await AuthService.updatePassword(
      login,
      oldPassword,
      newPassword,
    );
    if (result.passwordUpdated) {
      return res.status(200).json({
        passwordChanged: true,
        message: "Your password was changed successfully",
      });
    }

    // Internal server error
    if (result.code === 500) {
      return res.status(500).json({
        passwordChanged: false,
        message: "An unexpected error occurred.",
      });
    }
  },
);

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
 * DELETE /delete-account
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
userRoutes.delete(
  "/delete-account",
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

export default userRoutes;
