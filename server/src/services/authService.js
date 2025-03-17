import bcrypt from "bcrypt";
import jsonwebtoken from "jsonwebtoken";
import { DBUsers } from "../database/collectionsInstances.js";
import { created, internalServerErrorCode, notFoundCode, okCode } from "../constants/codeConstants.js";
import { unauthorizedCode, badRequest } from "../constants/codeConstants.js";

class AuthService {
  static async logIn(login, password) {

    // Since the user can login with username or email we need to check for both
    try {
      const result = await DBUsers().findOne({ $or: [{ username: login }, { email: login }] });

      // result will be null if it doesn't match
      if (!result) {
        return { success: false, code: notFoundCode };
      }

      // Defining if the password is valid
      const isPasswordValid = await bcrypt.compare(
        password,
        result.password,
      );

      if (!isPasswordValid) {
        return { success: false, code: unauthorizedCode };
      }

      // If the login is valid a token is created and sent back
      const token = AuthService.generateJWT(result.user);
      return { success: true, code: okCode, token, user: result };

    } catch (error) {
      console.log(error);
      return { success: false, code: internalServerErrorCode }
    }
  }

  static async updatePassword(login, oldPassword, newPassword) {
    const result = await AuthService.findUser(login);

    if (!result.success) {
      return { passwordUpdated: false, code: result.code };
    }

    const isPasswordValid = await bcrypt.compare(
      oldPassword,
      result.user.password,
    );
    if (!isPasswordValid) {
      return { passwordUpdated: false, code: 401 };
    }

    try {
      const hashedNewPassword = await AuthService.hashPassword(newPassword);
      result.user.password = hashedNewPassword;
      await result.user.save();
      return { passwordUpdated: true, code: 200 };
    } catch (error) {
      return { passwordUpdated: false, code: 500 };
    }
  }

  static async createAccount(email, username, password) {
    try {
      const hashedPassword = await AuthService.hashPassword(password);
      const newUser = await DBUsers().insertOne({
        username,
        email,
        password: hashedPassword,
      });

      if (!newUser) {
        return { accountCreated: false, code: badRequest };
      }

      const token = AuthService.generateJWT(newUser);

      return { accountCreated: true, code: created, token, username };
    } catch (error) {
      return { accountCreated: false, code: internalServerErrorCode };
    }
  }

  static generateJWT(user) {
    const payload = {
      userId: user._id,
      username: user.username,
      email: user.email,
    };

    return jsonwebtoken.sign(payload, process.env.SECRET_KEY_JWT, {
      expiresIn: "1h",
    });
  }

  static async hashPassword(password) {
    try {
      const saltRounds = 10;
      const hashedPassword = await bcrypt.hash(password, saltRounds);
      return hashedPassword;
    } catch (error) {
      throw error;
    }
  }

  static validateJWT(token) {
    try {
      const decoded = jsonwebtoken.verify(token, process.env.SECRET_KEY_JWT);
      return { validated: true, decoded };
    } catch (error) {
      // Log or handle specific error types if needed
      if (error.name === "TokenExpiredError") {
        return { validated: false, message: "Token has expired" };
      } else if (error.name === "JsonWebTokenError") {
        return { validated: false, message: "Invalid token" };
      } else {
        return {
          validated: false,
          message: "An error occurred while validating the token",
        };
      }
    }
  }

  static async deleteUser(userId) {
    try {
      return { deleted: true, code: 204 };
    } catch (error) {
      return { deleted: false, code: 500 };
    }
  }

  static async findUser(login) {
    let isEmail = false;
    let user;

    if (login.includes("@")) {
      isEmail = true;
    }

    try {
      if (isEmail) {
        /* u */ser = await userModel.findOne({ email: login });
      } else {
        /* u */ser = await userModel.findOne({ username: login });
      }

      if (!user) {
        return { success: false, code: 400 };
      }
    } catch (error) {
      return {
        success: false,
        code: 500,
      };
    }
    return { success: true, user };
  }
}

export default AuthService;
