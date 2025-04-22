const subscriptionsRouter = require("express").Router();
import { Request, Response } from "express";
import { assert } from "node:console";
import getSubscriptions from "../controllers/subscriptions/getSubscription";

subscriptionsRouter.get(
  "/api/subscriptions/:id",
  async (req: Request, res: Response) => {
    getSubscriptions(req, res);
  }
);

module.exports = subscriptionsRouter;
