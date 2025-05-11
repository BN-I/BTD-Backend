import { Request, Response } from "express";
import { getAllAdmins } from "../controllers/admin/getAllAdmins";
import getAdminDashboardDetails from "../controllers/admin/getDashboardDetails";

const adminsRouter = require("express").Router();

adminsRouter.get("/api/admins", async (req: Request, res: Response) => {
  getAllAdmins(req, res);
});

adminsRouter.get(
  "/api/admin/dashboardDetails",
  async (req: Request, res: Response) => {
    getAdminDashboardDetails(req, res);
  }
);

module.exports = adminsRouter;
