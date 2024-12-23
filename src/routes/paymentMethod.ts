import { Request, Response } from "express";
import { deleteModel } from "mongoose";
import { deletePaymentMethod } from "../controllers/paymentMethods/deletePaymentMethod";

const paymentMethodRouter = require("express").Router();
const {
  postPaymentMethod,
} = require("../controllers/paymentMethods/postPyamentMethod");
const {
  updatePaymentMethod,
} = require("../controllers/paymentMethods/updatePaymentMethod");
const {
  getPaymentMethod,
} = require("../controllers/paymentMethods/getPaymentMethod");

paymentMethodRouter.get(
  "/api/payment-method/:id",
  async (req: Request, res: Response) => {
    getPaymentMethod(req, res);
  }
);

paymentMethodRouter.post(
  "/api/payment-method",
  async (req: Request, res: Response) => {
    postPaymentMethod(req, res);
  }
);

paymentMethodRouter.put(
  "/api/payment-method/:id",
  async (req: Request, res: Response) => {
    updatePaymentMethod(req, res);
  }
);

paymentMethodRouter.delete(
  "/api/payment-method/:id",
  async (req: Request, res: Response) => {
    deletePaymentMethod(req, res);
  }
);

module.exports = paymentMethodRouter;
