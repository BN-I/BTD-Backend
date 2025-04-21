import updateNotification from "../controllers/notifications/updateNotification";
import { Request, Response } from "express";

const notificationRouter = require("express").Router();
const getNotifications = require("../controllers/notifications/getNotifications");

notificationRouter.get(
  "/api/notifications/user/:id",
  async (req: Request, res: Response) => {
    getNotifications(req, res);
  }
);

notificationRouter.put(
  "/api/notifications/:id",
  async (req: Request, res: Response) => {
    updateNotification(req, res);
  }
);

module.exports = notificationRouter;
