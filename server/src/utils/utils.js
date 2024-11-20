class Utils {
  /**
   * @function validateJWTMiddleware
   * @description Middleware function to validate a JWT token from the `Authorization` header.
   *
   * This middleware extracts the token from the `Authorization` header, validates it using
   * `AuthService.validateJWT`, and either allows the request to proceed or sends an error response.
   *
   * @param {Object} req - The Express request object.
   * @param {Object} res - The Express response object.
   * @param {Function} next - The next middleware function to pass control to.
   *
   * @returns {Object|void} Returns an error response if the token is invalid; otherwise, calls `next()`.
   *
   * @example
   * // Protect a route with the middleware
   * app.get('/protected-route', Utils.validateJWTMiddleware, (req, res) => {
   *   res.status(200).json({ message: "You have access to this route!" });
   * });
   */
  static validateJWTMiddlewear(req, res, next) {
    if (!req.headers.authorization) {
      return res.status(401).json({ message: "Authorization header missing" });
    }

    const token = req.headers.authorization.split(" ")[1];
    if (!token) {
      return res.status(401).json({ message: "Token missing" });
    }

    const result = AuthService.validateJWT(token);
    if (!result.validated) {
      return res.status(401).json({ message: result.message });
    }

    // Proceed to the next middleware/route
    next();
  }
}

export default Utils;
