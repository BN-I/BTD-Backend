const orderRouter = require("express").Router();
const {
  checkoutController,
} = require("../controllers/orders/checkoutController");
import { Request, Response } from "express";
import { get } from "mongoose";
import { getStats } from "../controllers/orders/getStats";
import { changeStatus } from "../controllers/orders/changeStatus";
const { getVendorOrders } = require("../controllers/orders/getVendorOrders");
const { getUserOrders } = require("../controllers/orders/getUserOrders");

orderRouter.post("/api/checkout", async (req: Request, res: Response) => {
  checkoutController(req, res);
});

orderRouter.post(
  "/api/orders/change-status",
  async (req: Request, res: Response) => {
    changeStatus(req, res);
  }
);

orderRouter.get("/api/orders/user/:id", async (req: Request, res: Response) => {
  getUserOrders(req, res);
});

orderRouter.get(
  "/api/orders/vendor/:id",
  async (req: Request, res: Response) => {
    getVendorOrders(req, res);
  }
);

orderRouter.get(
  "/api/orders-stats/vendor/:id",
  async (req: Request, res: Response) => {
    getStats(req, res);
  }
);

module.exports = orderRouter;
