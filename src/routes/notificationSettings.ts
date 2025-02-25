const notificationSettingsRouter = require("express").Router();
const {
  postNotificationSettings,
} = require("../controllers/notificationSettings/postNotificationSettings");

notificationSettingsRouter.post(
  "/api/notificationsSetings",
  async (req: Request, res: Response) => {
    postNotificationSettings(req, res);
  }
);

module.exports = notificationSettingsRouter;
