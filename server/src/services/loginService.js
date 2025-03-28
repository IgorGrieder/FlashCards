import bcrypt from "bcrypt";
import jsonwebtoken from "jsonwebtoken";
import { ObjectId } from "mongodb";
import { DBUsers } from "../database/collectionsInstances.js";
import { created, internalServerErrorCode, noContentCode, notFoundCode, okCode } from "../constants/codeConstants.js";
import { unauthorizedCode, badRequest } from "../constants/codeConstants.js";
import { expiresIn, saltRounds } from "../constants/jwtConstants.js";
import { errorToken, expiredToken, unauthorizedMessage, userNotFound } from "../constants/messageConstants.js";

class LoginService {

  /**
     * Authenticates a user and generates JWT
     * @static
     * @async
     * @param {string} login - Username or email
     * @param {string} password - Plain text password
     * @returns {Promise<{success: boolean, code: string, token?: string, user?: import('mongodb').Document}>}
     */
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

  /**
     * Updates user password after validation
     * @static
     * @async
     * @param {string} login - Username or email
     * @param {string} oldPassword - Current plain text password
     * @param {string} newPassword - New plain text password
     * @returns {Promise<{passwordUpdated: boolean, code: string}>}
     */
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

  /**
    * Creates a new user account
    * @static
    * @async
    * @param {string} email - User email
    * @param {string} username - User username
    * @param {string} password - Plain text password
    * @returns {Promise<{accountCreated: boolean, code: string, token?: string, username?: string}>}
    */
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

  /**
    * Generates JWT token for authenticated user
    * @static
    * @param {import('mongodb').Document} user - User document from DB
    * @returns {Promise<{generated: boolean, token?: string, message?: string}>}
    */
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

  /**
     * Hashes plain text password using bcrypt
     * @static
     * @async
     * @param {string} password - Plain text password
     * @returns {Promise<string>} Resolves with hashed password
     */
  static async hashPassword(password) {
    try {
      const hashedPassword = await bcrypt.hash(password, saltRounds);
      return hashedPassword;
    } catch (error) {
      throw error;
    }
  }

  /**
     * Validates JWT token
     * @static
     * @param {{token: string}} validate - Object containing JWT token
     * @returns {Promise<{validated: boolean, decoded?: object, message?: string}>}
     */
  static validateJWT(validate) {
    return new Promise((resolve) => {
      jsonwebtoken.verify(validate.token, process.env.SECRET_KEY_JWT, (err, decoded) => {
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

  /**
     * Deletes a user account
     * @static
     * @async
     * @param {string} userId - MongoDB user ID as string
     * @returns {Promise<{deleted: boolean, code: string, message?: string}>}
     */
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

  /**
   * Checks if user exists by username or email
   * @static
   * @async
   * @param {string} login - Username or email to check
   * @param {boolean} isEmail - Flag to indicate email search
   * @returns {Promise<boolean>}
   */   }
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
