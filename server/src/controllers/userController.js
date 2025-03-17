import { Router } from "express";
import AuthService from "../services/authService.js";
import Utils from "../utils/utils.js";
import { internalServerErrorCode, okCode } from "../constants/codeConstants.js";
import { unauthorizedMessage, unexpectedError } from "../constants/messageConstants.js";
import { jwt, maxAge, sameSite } from "../constants/jwtConstants.js";

// Router instance
const userRoutes = new Router();

// Middlewares ----------------------------------------------------------------
const validateLogIn = (req, res, next) => {
  const { login, password } = req.body;
  if (!login || !password) {
    return res.status(400).json({
      logged: false,
      message: "Email/username and password are required.",
    });
  }

  next();
};

const validatePasswordChange = (req, res, next) => {
  const { login, oldPassword, newPassword } = req.body;
  if (!login || !oldPassword || !newPassword) {
    return res.status(400).json({
      logged: false,
      message: "Email/username and passwords are required.",
    });
  }

  next();
};

const validateCreateAccount = async (req, res, next) => {
  const { username, email, password } = req.body;
  let user;

  if (!username || !email || !password) {
    return res.status(400).json({
      accountCreated: false,
      message: "Email/username and password are required.",
    });
  }

  user = await AuthService.findUser(username);
  if (user.success) {
    return res.status(400).json({
      accountCreated: false,
      message: "Username already exists, try another one",
    });
  }

  user = await AuthService.findUser(email);
  if (user.success) {
    return res.status(400).json({
      accountCreated: false,
      message: "Email already exists, try another one",
    });
  }

  next();
};

// Routes ---------------------------------------------------------------------
userRoutes.post("/create-account", validateCreateAccount, async (req, res) => {
  const { email, username, password } = req.body;
  const result = await AuthService.createAccount(email, username, password);

  if (result.accountCreated) {
    res.cookie("jwt", result.token, {
      httpOnly: true,
      secure: process.env.ENVIROMENT === "DEV" ? false : true,
      sameSite,
      maxAge,
    });

    return res
      .status(okCode)
      .json({ accountCreated: true, username: result.username });
  }

  // Internal server error
  if (result.code === internalServerErrorCode) {
    return res.status(result.code).json({
      accountCreated: false,
      message: unexpectedError,
    });
  }
});

userRoutes.post("/login", validateLogIn, async (req, res) => {
  const { login, password } = req.body;
  const result = await AuthService.logIn(login, password);

  if (result.success) {
    res.cookie(jwt, result.token, {
      httpOnly: true,
      secure: process.env.ENVIROMENT === "DEV" ? false : true,
      sameSite,
      maxAge,
    });

    return res
      .status(okCode)
      .json({ logged: true, username: result.user.username });
  }

  // Internal server error
  if (result.code === internalServerErrorCode) {
    return res.status(result.code).json({
      logged: false,
      message: unexpectedError,
    });
  }

  // Unauthorized log in
  return res.status(result.code).json({
    logged: false,
    message: unauthorizedMessage,
  });
});

userRoutes.post("/logout", (req, res) => {
  res.clearCookie("jwt");
  res.json({ loggedOut: true, message: "Logged out successfully" });
});

userRoutes.patch(
  "/change-password",
  validatePasswordChange,
  async (req, res) => {
    const { login, oldPassword, newPassword } = req.body;

    const result = await AuthService.updatePassword(
      login,
      oldPassword,
      newPassword,
    );
    if (result.passwordUpdated) {
      return res.status(200).json({
        passwordChanged: true,
        message: "Your password was changed successfully",
      });
    }

    // Internal server error
    if (result.code === 500) {
      return res.status(500).json({
        passwordChanged: false,
        message: "An unexpected error occurred.",
      });
    }
  },
);

userRoutes.delete(
  "/delete-account",
  Utils.validateJWTMiddlewear,
  async (req, res) => {
    const { userId } = req.body.decoded;

    const result = await AuthService.deleteUser(userId);

    // Internal server error
    if (result.code === 500) {
      return res.status(500).json({
        accountCreated: false,
        message: "An unexpected error occurred.",
      });
    }

    return res.status(204).send();
  },
);

export default userRoutes;
