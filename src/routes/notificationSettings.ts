const notificationSettingsRouter = require("express").Router();
const {
  postNotificationSettings,
} = require("../controllers/notificationSettings/postNotificationSettings");
const {
  getNotificationSettings,
} = require("../controllers/notificationSettings/getNotificationSettings");

notificationSettingsRouter.post(
  "/api/notificationsSetings",
  async (req: Request, res: Response) => {
    postNotificationSettings(req, res);
  }
);

notificationSettingsRouter.get(
  "/api/notificationsSetings/user/:id",
  async (req: Request, res: Response) => {
    getNotificationSettings(req, res);
  }
);

module.exports = notificationSettingsRouter;
