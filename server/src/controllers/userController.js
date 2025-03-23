import { Router } from "express";
import LoginService from "../services/loginService.js";
import Utils from "../utils/utils.js";
import { badRequest, internalServerErrorCode, noContentCode, notFoundCode, okCode } from "../constants/codeConstants.js";
import { emailAlreadyUsed, invalidArguments, logoutMessage, passwordChanged, unauthorizedMessage, unexpectedError, usernameAlreadyUsed, userNotFound } from "../constants/messageConstants.js";
import { jwt, maxAge, sameSite } from "../constants/jwtConstants.js";

// Router instance
const userRoutes = new Router();

// Middlewares ----------------------------------------------------------------
const validateLogIn = (req, res, next) => {
  const { login, password } = req.body;
  if (!login || !password) {
    return res.status(badRequest).json({
      logged: false,
      message: invalidArguments,
    });
  }

  next();
};

const validatePasswordChange = (req, res, next) => {
  const { login, oldPassword, newPassword } = req.body;
  if (!login || !oldPassword || !newPassword) {
    return res.status(badRequest).json({
      logged: false,
      message: invalidArguments,
    });
  }

  next();
};

const validateCreateAccount = async (req, res, next) => {
  const { username, email, password } = req.body;
  let result;

  if (!username || !email || !password) {
    return res.status(badRequest).json({
      accountCreated: false,
      message: invalidArguments,
    });
  }

  result = await LoginService.findUser(username, false);

  if (result) {
    return res.status(badRequest).json({
      accountCreated: false,
      message: usernameAlreadyUsed,
    });
  }

  result = await LoginService.findUser(email, true);

  if (result) {
    return res.status(badRequest).json({
      accountCreated: false,
      message: emailAlreadyUsed,
    });
  }

  next();
};

// Routes ---------------------------------------------------------------------
userRoutes.post("/create-account", validateCreateAccount, async (req, res) => {
  const { email, username, password } = req.body;
  const result = await LoginService.createAccount(email, username, password);

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
  const result = await LoginService.logIn(login, password);

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

userRoutes.post("/logout", (_, res) => {
  res.clearCookie("jwt");
  res.json({ loggedOut: true, message: logoutMessage });
});

userRoutes.post(
  "/change-password",
  validatePasswordChange,
  async (req, res) => {
    const { login, oldPassword, newPassword } = req.body;

    const result = await LoginService.updatePassword(
      login,
      oldPassword,
      newPassword,
    );

    if (result.passwordUpdated) {
      return res.status(okCode).json({
        passwordChanged: true,
        message: passwordChanged,
      });
    }

    // User Not Found
    if (result.code === notFoundCode) {
      return res.status(result.code).json({
        passwordChanged: false,
        message: userNotFound
      })
    }

    // Internal server error
    if (result.code === internalServerErrorCode) {
      return res.status(result.code).json({
        passwordChanged: false,
        message: unexpectedError,
      });
    }

  },
);

userRoutes.delete(
  "/delete-account",
  Utils.validateJWTMiddlewear,
  async (req, res) => {
    const { userId } = req.body;

    const result = await LoginService.deleteUser(userId);

    // In case of success
    if (result.code = noContentCode) {
      return res.status(result.code).json({
        deleted: true
      });
    }

    // Internal server error
    if (result.code === internalServerErrorCode) {
      return res.status(result.code).json({
        deleted: false,
        message: unexpectedError,
      });
    }

  },
);

export default userRoutes;
