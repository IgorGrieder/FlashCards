import { unauthorizedCode } from "../constants/codeConstants.js";
import { invalidToken } from "../constants/messageConstants.js";
import AuthService from "../services/authService.js";

class Utils {
  static validateJWTMiddlewear(req, res, next) {
    try {
      const token = req.cookies.jwt;

      // Add null/undefined check
      if (!token) {
        return res.status(unauthorizedCode).json({ message: "No token provided" });
      }

      const result = AuthService.validateJWT(token);

      if (!result.validated) {
        return res.status(unauthorizedCode).json({ message: result.message });
      }

      req.body.decoded = result.decoded;
      next();
    } catch (error) {
      console.error("JWT Validation Error:", error);
      return res.status(unauthorizedCode).json({ message: invalidToken });
    }
  }
}

export default Utils;
