const userRouter = require("express").Router();
import { Request, Response } from "express";
import updatePackage from "../controllers/users/updatePackage";
import getUsers from "../controllers/users/getUsers";
import changeUserStatus from "../controllers/users/changeUserStatus";

const deleteUser = require("../controllers/users/deleteUser");
const updateUser = require("../controllers/users/updateUser");

userRouter.get("/api/users", async (req: Request, res: Response) => {
  getUsers(req, res);
});

userRouter.put("/api/user/:id", async (req: Request, res: Response) => {
  updateUser(req, res);
});

userRouter.post(
  "/api/user/updatePackage/:id",
  async (req: Request, res: Response) => {
    updatePackage(req, res);
  }
);

userRouter.post(
  "/api/user/updateStatus/:id",
  async (req: Request, res: Response) => {
    changeUserStatus(req, res);
  }
);

userRouter.delete("/api/user/:id", async (req: Request, res: Response) => {
  deleteUser(req, res);
});

module.exports = userRouter;
