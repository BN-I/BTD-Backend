import { Request, Response } from "express";
import { getAllAdmins } from "../controllers/admin/getAllAdmins";

const adminsRouter = require("express").Router();

adminsRouter.get("/api/admins", async (req: Request, res: Response) => {
  getAllAdmins(req, res);
});

module.exports = adminsRouter;
