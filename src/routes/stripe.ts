const stripeRouter = require("express").Router();
import { Request, Response } from "express";
import { getPublishableKey } from "../controllers/stripe/getPublishableKey";
import subscriptionPlans from "../controllers/stripe/subscriptionPlans";
import { create } from "domain";
import createCheckoutSession from "../controllers/stripe/createCheckoutSession";
import checkSession from "../controllers/stripe/checkSession";
import createPortalSession from "../controllers/stripe/createPortalSession";
import stripeWebhooks from "../controllers/stripe/stripeWebhooks";
import bodyParser from "body-parser";
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

stripeRouter.get(
  "/api/subscription-plans",
  async (req: Request, res: Response) => {
    subscriptionPlans(req, res);
  }
);

stripeRouter.post(
  "/api/create-checkout-session",
  async (req: Request, res: Response) => {
    createCheckoutSession(req, res);
  }
);

stripeRouter.post("/api/check-session", async (req: Request, res: Response) => {
  checkSession(req, res);
});

stripeRouter.post(
  "/api/create-portal-session",
  async (req: Request, res: Response) => {
    createPortalSession(req, res);
  }
);

stripeRouter.post(
  "/api/stripe/webhook",
  bodyParser.raw({ type: "application/json" }),
  async (req: Request, res: Response) => {
    stripeWebhooks(req, res);
  }
);

module.exports = stripeRouter;
