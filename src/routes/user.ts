const userRouter = require("express").Router();
import { Request, Response } from "express";
const updateUser = require("../controllers/users/updateUser");

userRouter.put("/api/user/:id", async (req: Request, res: Response) => {
  updateUser(req, res);
});

module.exports = userRouter;
