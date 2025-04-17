const vendorRouter = require("express").Router();
import { Request, Response } from "express";
import getDashboardDetails from "../controllers/vendor/getDashboardDetails";

vendorRouter.get(
  "/api/vendor/dashboardDetails/:id",
  async (req: Request, res: Response) => {
    getDashboardDetails(req, res);
  }
);

module.exports = vendorRouter;
