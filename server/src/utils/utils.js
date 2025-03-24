import { unauthorizedCode } from "../constants/codeConstants.js";
import { invalidToken, noToken } from "../constants/messageConstants.js";
import LoginService from "../services/loginService.js";

class Utils {
  static async validateJWTMiddlewear(req, res, next) {
    try {
      const token = req.cookies.jwt;

      // Add null/undefined check
      if (!token) {
        return res.status(unauthorizedCode).json({ message: noToken });
      }

      const result = await LoginService.validateJWT(token);

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
