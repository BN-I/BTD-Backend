const vendorRouter = require("express").Router();
import { Request, Response } from "express";
import getDashboardDetails from "../controllers/vendor/getDashboardDetails";
import getVendors from "../controllers/vendor/getVendors";

vendorRouter.get(
  "/api/vendor/dashboardDetails/:id",
  async (req: Request, res: Response) => {
    getDashboardDetails(req, res);
  }
);

vendorRouter.get("/api/vendors", async (req: Request, res: Response) => {
  getVendors(req, res);
});

module.exports = vendorRouter;
