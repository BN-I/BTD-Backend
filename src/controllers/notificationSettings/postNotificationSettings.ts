import { Request, Response } from "express";
import NotificationSetrtings from "../../models/notificationSettings";

const postNotificationSettings = async (req: Request, res: Response) => {
  const { pushNotification, emailNotification, textNotification, user } =
    req.body;

  if (!pushNotification && !emailNotification && !textNotification) {
    return res.status(400).send({
      message: "At least one notification type must be enabled.",
    });
  }

  if (!user) {
    return res.status(401).send({ message: "Unauthorized" });
  }

  console.log(pushNotification);

  try {
    const notificationSettings = await NotificationSetrtings.findOneAndUpdate(
      { user: user },
      { $set: { pushNotification, emailNotification, textNotification } },
      { upsert: true, new: true }
    );

    res.status(200).send(notificationSettings);
  } catch (error) {
    console.error(error);
    res.status(500).send({ message: "Internal Server Error" });
  }
};

export { postNotificationSettings };
