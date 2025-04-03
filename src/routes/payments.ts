const paymentsRouter = require("express").Router();
import { Request, Response } from "express";
import { paymentsStats } from "../controllers/payments/paymentsStats";

paymentsRouter.get(
  "/api/paymentsStats/:id",
  async (req: Request, res: Response) => {
    paymentsStats(req, res);
  }
);

module.exports = paymentsRouter;
