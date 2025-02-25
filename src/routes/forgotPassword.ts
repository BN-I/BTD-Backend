const forgotPasswordRouter = require("express").Router();
const forgotPasswordController = require("../controllers/forgotPassword");
import { Request, Response } from "express";

forgotPasswordRouter.post(
  "/api/forgot-password",
  async (req: Request, res: Response) => {
    forgotPasswordController.Execute(req, res);
  }
);

module.exports = forgotPasswordRouter;
