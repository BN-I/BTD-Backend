const stripeRouter = require("express").Router();
import { Request, Response } from "express";
import { getPublishableKey } from "../controllers/stripe/getPublishableKey";
const {
  stripePaymentSheetController,
} = require("../controllers/stripe/stripePaymentSheetController");
const {
  stripeCustomerSheetController,
} = require("../controllers/stripe/stripeCustomerSheetController");

stripeRouter.get(
  "/api/stripe/publishable-key",
  async (req: Request, res: Response) => {
    getPublishableKey(req, res);
  }
);

stripeRouter.post(
  "/api/stripe/payment-sheet",
  async (req: Request, res: Response) => {
    stripePaymentSheetController(req, res);
  }
);

stripeRouter.post(
  "/api/stripe/customer-sheet",
  async (req: Request, res: Response) => {
    stripeCustomerSheetController(req, res);
  }
);

module.exports = stripeRouter;
