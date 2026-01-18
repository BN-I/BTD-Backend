const orderRouter = require("express").Router();
const {
  checkoutController,
} = require("../controllers/orders/checkoutController");
import { Request, Response } from "express";
import { getStats } from "../controllers/orders/getStats";
import { changeStatus } from "../controllers/orders/changeStatus";
import requestPayment from "../controllers/orders/requestPayment";
import { getAllOrders } from "../controllers/orders/getAllOrders";
import dispatchAmount from "../controllers/orders/dispatchAmount";
import { getShippingCharges } from "../controllers/orders/getShippingCharges";
import { getCarriers } from "../controllers/orders/getCarriers";
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

orderRouter.get("/api/orders", async (req: Request, res: Response) => {
  getAllOrders(req, res);
});

orderRouter.get(
  "/api/orders-stats/vendor/:id",
  async (req: Request, res: Response) => {
    getStats(req, res);
  }
);

orderRouter.post(
  "/api/orders/request-payment/:id",
  async (req: Request, res: Response) => {
    requestPayment(req, res);
  }
);

orderRouter.post(
  "/api/orders/dispatch-amount",
  async (req: Request, res: Response) => {
    dispatchAmount(req, res);
  }
);

orderRouter.get("/api/carriers", async (req: Request, res: Response) => {
  getCarriers(req, res);
});

orderRouter.post(
  "/api/get-shipping-charges",
  async (req: Request, res: Response) => {
    getShippingCharges(req, res);
  }
);

module.exports = orderRouter;
