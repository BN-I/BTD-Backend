const loginRouter = require("express").Router();
const loginController = require("../controllers/login");
import { Request, Response } from "express";

loginRouter.post("/api/login", async (req: Request, res: Response) => {
  loginController.Execute(req, res);
});

module.exports = loginRouter;
