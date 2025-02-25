const notificationRouter = require("express").Router();
const getNotifications = require("../controllers/notifications/getNotifications");

notificationRouter.get(
  "/api/notifications/user/:id",
  async (req: Request, res: Response) => {
    getNotifications(req, res);
  }
);

module.exports = notificationRouter;
