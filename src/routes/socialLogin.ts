const socialLoginRouter = require("express").Router();
const socialLoginRouterController = require("../controllers/socialLogin");
import { Request, Response } from "express";

socialLoginRouter.post(
  "/api/social-login",
  async (req: Request, res: Response) => {
    socialLoginRouterController.Execute(req, res);
  }
);

module.exports = socialLoginRouter;
