const orderRouter = require("express").Router();
const {
  checkoutController,
} = require("../controllers/orders/checkoutController");
import { Request, Response } from "express";
import { get } from "mongoose";
const { getVendorOrders } = require("../controllers/orders/getVendorOrders");
const { getUserOrders } = require("../controllers/orders/getUserOrders");

orderRouter.post("/api/checkout", async (req: Request, res: Response) => {
  checkoutController(req, res);
});

orderRouter.get("/api/orders/user/:id", async (req: Request, res: Response) => {
  getUserOrders(req, res);
});

orderRouter.get(
  "/api/orders/vendor/:id",
  async (req: Request, res: Response) => {
    getVendorOrders(req, res);
  }
);

module.exports = orderRouter;
