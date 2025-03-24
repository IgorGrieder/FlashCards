import bcrypt from "bcrypt";
import jsonwebtoken from "jsonwebtoken";
import { ObjectId } from "mongodb";
import { DBUsers } from "../database/collectionsInstances.js";
import { created, internalServerErrorCode, noContentCode, notFoundCode, okCode } from "../constants/codeConstants.js";
import { unauthorizedCode, badRequest } from "../constants/codeConstants.js";
import { expiresIn, saltRounds } from "../constants/jwtConstants.js";
import { errorToken, expiredToken, unauthorizedMessage, userNotFound } from "../constants/messageConstants.js";

class LoginService {
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
      const token = await LoginService.generateJWT(result);
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
      const hashedNewPassword = await LoginService.hashPassword(newPassword);

      await DBUsers().updateOne({ _id: result._id }, { $set: { password: hashedNewPassword } });
      return { passwordUpdated: true, code: okCode };
    } catch (error) {
      console.log(error);
      return { passwordUpdated: false, code: internalServerErrorCode };
    }
  }

  static async createAccount(email, username, password) {
    try {
      const hashedPassword = await LoginService.hashPassword(password);
      const newUser = await DBUsers().insertOne({
        username,
        email,
        password: hashedPassword,
      });

      if (!newUser) {
        return { accountCreated: false, code: badRequest };
      }

      const token = await LoginService.generateJWT(newUser);

      return { accountCreated: true, code: created, token, username };
    } catch (error) {
      return { accountCreated: false, code: internalServerErrorCode };
    }
  }

  static generateJWT(user) {
    return new Promise((resolve) => {
      const payload = {
        userId: user._id,
        username: user.username,
        email: user.email,
      };

      jsonwebtoken.sign(payload, process.env.SECRET_KEY_JWT, {
        expiresIn
      }, (err, token) => {
        if (err) {
          resolve({ generated: false, message: err.message });
        }
        resolve({ generated: true, token });
      })
    })
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
    return new Promise((resolve) => {
      jsonwebtoken.verify(token, process.env.SECRET_KEY_JWT, (err, decoded) => {
        if (err) {
          // Handle specific error types
          if (err.name === "TokenExpiredError") {
            resolve({ validated: false, message: expiredToken });
          } else if (err.name === "JsonWebTokenError") {
            resolve({ validated: false, message: errorToken });
          } else {
            resolve({ validated: false, message: unauthorizedMessage });
          }
        } else {
          resolve({ validated: true, decoded });
        }
      });
    });
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

export default LoginService;
