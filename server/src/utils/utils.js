import AuthService from "../services/authService.js";

class Utils {
  /**
   * Validates the JWT from the user's cookies.
   *
   * This middleware checks if a valid JWT is present in the `jwt` cookie. It decodes
   * and validates the token, attaching decoded information to `req.body.decoded`.
   * Unauthorized requests receive a 401 status response.
   *
   * @static
   * @function validateJWTMiddlewear
   * @param {Object} req - Express request object
   * @param {Object} req.cookies - Cookies attached to the request
   * @param {string} req.cookies.jwt - JWT session token stored in an HTTP-only cookie
   * @param {Object} res - Express response object
   * @param {Function} next - Middleware progression function
   *
   * @throws {401} Unauthorized - When token is missing or invalid
   *
   * @returns {void}
   * - Calls `next()` for valid tokens
   * - Sends 401 response for invalid tokens
   *
   * @example
   * // Valid token scenario
   * req.cookies.jwt = "<valid-token>";
   * // Middleware will attach decoded data:
   * req.body.decoded = { userId: "12345", role: "user" };
   *
   * @example
   * // Invalid/missing token scenario
   * req.cookies.jwt = null;
   * // Responds with:
   * // Status: 401
   * // Body: { message: "No token provided" }
   */
  static validateJWTMiddlewear(req, res, next) {
    try {
      const token = req.cookies.jwt;

      // Add null/undefined check
      if (!token) {
        return res.status(401).json({ message: "No token provided" });
      }

      const result = AuthService.validateJWT(token);

      if (!result.validated) {
        return res.status(401).json({ message: result.message });
      }

      req.body.decoded = result.decoded;
      next();
    } catch (error) {
      console.error("JWT Validation Error:", error);
      return res.status(401).json({ message: "Invalid token" });
    }
  }
}

export default Utils;
