import bcrypt from "bcryptjs/dist/bcrypt.js";
import userModel from "../models/userModel.js";
import jsonwebtoken from "jsonwebtoken";

class AuthService {
  /**
   * Logs in a user by verifying their credentials.
   *
   * This function accepts a login identifier (email or username) and a password.
   * It first determines whether the login is an email or a username, searches for
   * the corresponding user in the database, and then validates the provided password.
   * If the credentials are valid, it generates an authentication token.
   * @function
   * @async
   * @param {string} login - The user's login identifier (email or username).
   * @param {string} password - The user's plaintext password.
   * @returns {Promise<object>} A promise that resolves to an object with the following structure:
   *   - `success` {boolean}: Indicates if the login attempt was successful.
   *   - `code` {number}: Indicates the respective HTTP status that will be returned.
   *   - `message` {string}: A descriptive message (e.g., "User not found", "Invalid password").
   *   - `token` {string} [optional]: The authentication token, provided if login is successful.
   *
   * @example
   * // Example usage:
   * const response = await logIn('user@example.com', 'password123');
   * if (response.success) {
   *   console.log('Login successful:', response.token);
   * } else {
   *   console.error('Login failed:', response.message);
   * }
   */
  static async logIn(login, password) {
    const result = await AuthService.findUser(login);
    if (!result.success) {
      return { success: false, code: result.code };
    }

    const isPasswordValid = await bcrypt.compare(
      password,
      result.user.password,
    );
    if (!isPasswordValid) {
      return { success: false, code: 401 };
    }

    const token = AuthService.generateJWT(result.user);
    return { success: true, code: 200, token, user: result.user };
  }

  /**
   * Updates a user's password after verifying the old password.
   *
   * This function first checks whether the old password provided by the user matches the
   * current password in the database. If valid, the password is updated to a new hashed
   * password and saved to the database. If any errors occur during the process, the function
   * will handle them gracefully and return an appropriate response.
   *
   * @async
   * @function updatePassword
   * @param {string} login - The username or email of the user trying to update their password.
   * @param {string} oldPassword - The user's current password to verify.
   * @param {string} newPassword - The new password that the user wants to set.
   * @returns {Promise<Object>} A promise that resolves to an object with the status of the operation.
   * @returns {boolean} return.passwordUpdated - Indicates whether the password update was successful.
   * @returns {number} return.code - The HTTP status code indicating the result of the operation:
   *   - 200: Password updated successfully.
   *   - 401: Invalid old password.
   *   - 404: User not found (if `findUser` fails).
   *   - 500: Internal server error (if there's a failure in saving the new password).
   *
   * @example
   * const result = await AuthService.updatePassword("user@example.com", "oldPassword123", "newPassword456");
   * if (result.passwordUpdated) {
   *   console.log("Password updated successfully");
   * } else {
   *   console.log(`Failed to update password, status code: ${result.code}`);
   * }
   */
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

  /**
   * Creates a new user account with the provided email, username, and password.
   *
   * This function hashes the provided password securely and attempts to create a new user record in the database
   * using the hashed password. If the account creation succeeds, it generates a JWT for the newly created user.
   * The method handles various outcomes and returns an appropriate response object.
   *
   * @function
   * @async
   * @param {string} email - The email address for the new user account.
   * @param {string} username - The username for the new user account.
   * @param {string} password - The plain-text password, which will be hashed before storing.
   * @returns {Promise<object>} A promise that resolves to an object with the result of the account creation:
   * - `accountCreated` (boolean): Indicates whether the account was successfully created.
   * - `code` (number): An HTTP-like status code indicating the result:
   *   - `201`: Account created successfully.
   *   - `400`: Account creation failed (e.g., validation issues).
   *   - `500`: Internal server error.
   * - `token` (string, optional): A JWT for the newly created user, included only if `accountCreated` is `true`.
   * - `username` (string, optional): The username of the newly created user, included only if `accountCreated` is `true`.
   *
   * @example
   * const result = await AuthService.createAccount("user@example.com", "username", "password123");
   * if (result.accountCreated) {
   *   console.log("Account created successfully!");
   *   console.log("JWT:", result.token);
   * } else {
   *   console.error("Account creation failed with code:", result.code);
   * }
   */
  static async createAccount(email, username, password) {
    try {
      const hashedPassword = await AuthService.hashPassword(password);
      const newUser = await userModel.create({
        username,
        email,
        password: hashedPassword,
      });

      if (!newUser) {
        return { accountCreated: false, code: 400 };
      }

      const token = AuthService.generateJWT(newUser);

      return { accountCreated: true, code: 201, token, username };
    } catch (error) {
      return { accountCreated: false, code: 500 };
    }
  }

  /**
   * Generates a JSON Web Token (JWT) for a user.
   *
   * This function creates a JWT containing user-specific data (e.g., user ID, username, email).
   * The token is signed using a secret key and has a default expiration time of 1 hour.
   *
   * @param {object} user - The user object for which the token is generated.
   * @param {string} user._id - The unique identifier of the user.
   * @param {string} user.username - The username of the user.
   * @param {string} user.email - The email address of the user.
   * @returns {string} The generated JWT as a string.
   *
   * @example
   * // Example usage:
   * const token = AuthService.generateJWT({
   *   _id: "123456",
   *   username: "exampleUser",
   *   email: "user@example.com",
   * });
   * console.log("Generated token:", token);
   */
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

  /**
   * Hashes a plain-text password using bcrypt.
   *
   * This function generates a hashed version of the provided password using bcrypt with a predefined
   * number of salt rounds (currently set to 10). It ensures that sensitive passwords are securely
   * stored in a hashed format.
   *
   * @function
   * @async
   * @param {string} password - The plain-text password to be hashed.
   * @returns {Promise<string>} The hashed password.
   * @throws {Error} If an error occurs during the hashing process, it propagates the error.
   *
   * @example
   * try {
   *   const hashedPassword = await AuthService.hashPassword("mySecurePassword123");
   *   console.log("Hashed password:", hashedPassword);
   * } catch (error) {
   *   console.error("Error hashing password:", error);
   * }
   */
  static async hashPassword(password) {
    try {
      const saltRounds = 10;
      const hashedPassword = await bcrypt.hash(password, saltRounds);
      return hashedPassword;
    } catch (error) {
      throw error;
    }
  }

  /**
   * @function validateJWT
   * @description Validates a JWT token and returns the validation status along with the decoded payload if valid.
   *
   * This function uses `jsonwebtoken.verify` to check the validity of the provided token.
   * If the token is valid, it returns the decoded payload. Otherwise, it returns an appropriate error message.
   *
   * @param {string} token - The JWT token to be validated.
   * @returns {Object} An object containing the validation result:
   * - `validated` (boolean): Indicates whether the token is valid.
   * - `decoded` (Object|null): The decoded payload if the token is valid; otherwise, `null`.
   * - `message` (string|null): An error message if the token is invalid or an error occurred; otherwise, `null`.
   *
   * @example
   * // Example usage
   * const result = AuthService.validateJWT(token);
   * if (result.validated) {
   *   console.log("Token is valid:", result.decoded);
   * } else {
   *   console.error("Token validation failed:", result.message);
   * }
   */
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

  /**
   * This function attempts to delete a user document from the `userModel` collection using the provided `userId`.
   * If the deletion is successful, it returns a success response with a status code of 204 (No Content).
   * If an error occurs during the deletion process, it returns a failure response with a status code of 500 (Internal Server Error).
   * @function
   * @async
   * @param {string} userId - The ID of the user to be deleted.
   * @returns {Object} An object containing the deletion status and HTTP status code:
   * - `deleted` (boolean): Indicates whether the user was successfully deleted.
   * - `code` (number): The HTTP status code related to the deletion operation.
   *   - `204` if the user was deleted successfully.
   *   - `500` if an error occurred during deletion.
   *
   * @example
   * // Example usage
   * const result = await AuthService.deleteUser(userId);
   * if (result.deleted) {
   *   console.log("User deleted successfully.");
   * } else {
   *   console.error("Failed to delete user.");
   * }
   */
  static async deleteUser(userId) {
    try {
      await userModel.deleteOne({ _id: userId });
      return { deleted: true, code: 204 };
    } catch (error) {
      return { deleted: false, code: 500 };
    }
  }

  /**
   * Finds a user by their email or username.
   *
   * This function checks whether the provided login is an email or a username.
   * It then queries the database to find a user by their email or username.
   * If a matching user is found, it is returned; otherwise, `null` is returned.
   *
   * @function
   * @async
   * @param {string} login - The login identifier (either email or username) of the user.
   * @returns {Promise<object|null>} A promise that resolves to the user object if found, or `null` if no user is found.
   */
  static async findUser(login) {
    let isEmail = false;
    let user;

    if (login.includes("@")) {
      isEmail = true;
    }

    try {
      if (isEmail) {
        user = await userModel.findOne({ email: login });
      } else {
        user = await userModel.findOne({ username: login });
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
