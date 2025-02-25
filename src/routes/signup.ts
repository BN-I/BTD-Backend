const signupRouter = require("express").Router();
const signupController = require("../controllers/signup");
import { Request, Response } from "express";

signupRouter.post("/api/signup", async (req: Request, res: Response) => {
  signupController.Execute(req, res);
});

module.exports = signupRouter;
