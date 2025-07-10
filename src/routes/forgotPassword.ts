const forgotPasswordRouter = require("express").Router();
const forgotPasswordController = require("../controllers/forgotPassword");
import { Request, Response } from "express";

forgotPasswordRouter.post(
  "/api/forgot-password",
  async (req: Request, res: Response) => {
    forgotPasswordController.Execute(req, res);
  }
);

forgotPasswordRouter.post(
  "/api/verify-otp",
  async (req: Request, res: Response) => {
    forgotPasswordController.verifyOTP(req, res);
  }
);

forgotPasswordRouter.post(
  "/api/reset-password",
  async (req: Request, res: Response) => {
    forgotPasswordController.resetPassword(req, res);
  }
);

module.exports = forgotPasswordRouter;
