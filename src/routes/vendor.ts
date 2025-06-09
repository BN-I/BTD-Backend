const vendorRouter = require("express").Router();
import { Request, Response } from "express";
import getDashboardDetails from "../controllers/vendor/getDashboardDetails";
import getVendors from "../controllers/vendor/getVendors";
import updateVendorStatus from "../controllers/vendor/updateVendorStatus";

vendorRouter.get(
  "/api/vendor/dashboardDetails/:id",
  async (req: Request, res: Response) => {
    getDashboardDetails(req, res);
  }
);

vendorRouter.get("/api/vendors", async (req: Request, res: Response) => {
  getVendors(req, res);
});

vendorRouter.put(
  "/api/vendor/updateStatus/:id",
  async (req: Request, res: Response) => {
    updateVendorStatus(req, res);
  }
);

module.exports = vendorRouter;
