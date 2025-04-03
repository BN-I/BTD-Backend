const userRouter = require("express").Router();
import { Request, Response } from "express";
import updatePackage from "../controllers/users/updatePackage";
const updateUser = require("../controllers/users/updateUser");

userRouter.put("/api/user/:id", async (req: Request, res: Response) => {
  updateUser(req, res);
});

userRouter.post(
  "/api/user/updatePackage/:id",
  async (req: Request, res: Response) => {
    updatePackage(req, res);
  }
);

module.exports = userRouter;
