import bcrypt from "bcryptjs/dist/bcrypt.js";
import userModel from "../models/userModel.js";

class AuthService {
  /**
   * Logs in a user by verifying their credentials.
   *
   * This function accepts a login identifier (email or username) and a password.
   * It first determines whether the login is an email or a username, searches for
   * the corresponding user in the database, and then validates the provided password.
   * If the credentials are valid, it generates an authentication token.
   *
   * @param {string} login - The user's login identifier (email or username).
   * @param {string} password - The user's plaintext password.
   * @returns {Promise<object>} A promise that resolves to an object with the following structure:
   *   - `success` {boolean}: Indicates if the login attempt was successful.
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
        return { success: false, message: "User not found." };
      }

      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        return { success: false, message: "Invalid password" };
      }

      const token = AuthService.generateToken(user);
      return { success: true, token };
    } catch (error) {
      return {
        success: false,
        message: "An error occurred",
      };
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

    return jwt.sign(payload, process.env.SECRET_KET_JWT, { expiresIn: "1h" });
  }
}

export default AuthService;
