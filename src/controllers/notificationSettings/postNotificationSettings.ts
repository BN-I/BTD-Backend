import { Request, Response } from "express";
import NotificationSetrtings from "../../models/notificationSetrtings";

const postNotificationSettings = async (req: Request, res: Response) => {
  const { pushNotification, emailNotification, textMessages, user } = req.body;

  if (!pushNotification && !emailNotification && !textMessages) {
    return res.status(400).send({
      message: "At least one notification type must be enabled.",
    });
  }

  if (!user) {
    return res.status(401).send({ message: "Unauthorized" });
  }

  try {
    const notificationSettings = await NotificationSetrtings.findOneAndUpdate(
      { user: user },
      { $set: { pushNotification, emailNotification, textMessages } },
      { upsert: true, new: true }
    );

    res.status(200).send(notificationSettings);
  } catch (error) {
    console.error(error);
    res.status(500).send({ message: "Internal Server Error" });
  }
};

export { postNotificationSettings };
