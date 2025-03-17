import bcrypt from "bcrypt";
import jsonwebtoken from "jsonwebtoken";
import { ObjectId } from "mongodb";
import { DBUsers } from "../database/collectionsInstances.js";
import { created, internalServerErrorCode, noContentCode, notFoundCode, okCode } from "../constants/codeConstants.js";
import { unauthorizedCode, badRequest } from "../constants/codeConstants.js";
import { expiresIn, saltRounds } from "../constants/jwtConstants.js";
import { errorToken, expiredToken, userNotFound } from "../constants/messageConstants.js";

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
      const token = AuthService.generateJWT(result);
      return { success: true, code: okCode, token, user: result };

    } catch (error) {
      console.log(error);
      return { success: false, code: internalServerErrorCode }
    }
  }

  static async updatePassword(login, oldPassword, newPassword) {
    try {
      const result = await DBUsers().findOne({ $or: [{ username: login }, { email: login }] });

      // We can return if we dont find a match
      if (!result) {
        return { passwordUpdated: false, code: notFoundCode };
      }

      const isPasswordValid = await bcrypt.compare(
        oldPassword,
        result.password,
      );

      if (!isPasswordValid) {
        return { passwordUpdated: false, code: unauthorizedCode };
      }

      // Hashing the new password
      const hashedNewPassword = await AuthService.hashPassword(newPassword);

      await DBUsers().updateOne({ _id: result._id }, { $set: { password: hashedNewPassword } });
      return { passwordUpdated: true, code: okCode };
    } catch (error) {
      console.log(error);
      return { passwordUpdated: false, code: internalServerErrorCode };
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
      expiresIn
    });
  }

  static async hashPassword(password) {
    try {
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
        return { validated: false, message: expiredToken };
      } else if (error.name === "JsonWebTokenError") {
        return { validated: false, message: errorToken };
      } else {
        return {
          validated: false,
          message: errorToken,
        };
      }
    }
  }

  static async deleteUser(userId) {
    try {
      const result = await DBUsers().deleteOne({ _id: new ObjectId(userId) });

      if (result.deletedCount == 0) {
        return {
          deleted: false,
          message: userNotFound
        }
      }

      return { deleted: true, code: noContentCode };
    } catch (error) {
      return { deleted: false, code: internalServerErrorCode };
    }
  }

  static async findUser(login, isEmail) {
    try {
      let result = null;

      if (isEmail) {
        result = await DBUsers().findOne({ email: login });
      } else {
        result = await DBUsers().findOne({ username: login });
      }

      if (!result) {
        return false
      }
      return true
    } catch (error) {
      return false
    }
  }
}

export default AuthService;
