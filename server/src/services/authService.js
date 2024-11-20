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
    const user = await AuthService.findUser(login);

    if (!user) {
      return { success: false, code: 401 };
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return { success: false, code: 401 };
    }

    const token = AuthService.generateToken(user);
    return { success: true, code: 200, token };
  }

  /**
   * Creates a new user account with the provided email, username, and password.
   *
   * This function hashes the provided password, then attempts to create a new user in the database
   * using the hashed password. It handles possible errors and returns appropriate responses based on
   * the outcome of the account creation process.
   *
   * @function
   * @async
   * @param {string} email - The email address of the user to be created.
   * @param {string} username - The username of the user to be created.
   * @param {string} password - The plain-text password of the user to be hashed and stored securely.
   * @returns {Promise<object>} An object containing the result of the operation:
   * - `accountCreated` (boolean): Indicates whether the account was successfully created.
   * - `code` (number): The HTTP-like status code representing the result:
   *   - `201` for successful account creation.
   *   - `400` if the account could not be created.
   *   - `500` if an internal server error occurred.
   *
   * @example
   * const result = await AuthService.createAccount("user@example.com", "username", "password123");
   * if (result.accountCreated) {
   *   console.log("Account created successfully!");
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

      return { accountCreated: true, code: 201 };
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

    return jwt.sign(payload, process.env.SECRET_KET_JWT, { expiresIn: "1h" });
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
    } catch (error) {
      return {
        success: false,
        code: 500,
      };
    }
    return user;
  }
}

export default AuthService;
