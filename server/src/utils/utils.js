import AuthService from "../services/authService.js";

class Utils {
  /**
   * Middleware to validate the JWT from the user's cookies.
   *
   * This middleware checks if a valid JWT is stored in the `jwt` cookie. If the token is valid, it decodes the token and
   * attaches the decoded information to `req.body.decoded`. If the token is missing or invalid, it responds with a 401 status.
   *
   * @static
   * @function validateJWTMiddlewear
   * @param {Object} req - The request object.
   * @param {Object} req.cookies - The cookies from the client.
   * @param {string} req.cookies.jwt - The HTTP-only JWT cookie containing the session token.
   * @param {Object} res - The response object.
   * @param {Function} next - The next middleware function.
   *
   * @response {number} 401 - Indicates an unauthorized request due to a missing or invalid JWT.
   * @responseBody {string} message - An error message describing the issue.
   *
   * @returns {void}
   * - If the token is valid, calls `next()` to proceed to the next middleware or route handler.
   * - If the token is invalid, sends a 401 Unauthorized response.
   *
   * @example
   * // Request with valid JWT cookie
   * {
   *   "cookies": {
   *     "jwt": "<valid-token>"
   *   }
   * }
   *
   * // Middleware attaches decoded data and proceeds
   * req.body.decoded = { userId: "12345", role: "user" };
   *
   * @example
   * // Request with missing/invalid JWT cookie
   * {
   *   "cookies": {
   *     "jwt": null
   *   }
   * }
   *
   * // Response
   * 401 Unauthorized
   * {
   *   "message": "Invalid token"
   * }
   */
  static validateJWTMiddlewear(req, res, next) {
    const token = req.cookies.jwt;
    const result = AuthService.validateJWT(token);
    if (!result.validated) {
      return res.status(401).json({ message: result.message });
    }

    req.body.decoded = result.decoded;
    next();
  }
}

export default Utils;
