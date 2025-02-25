import { json } from "stream/consumers";
import Notification from "../models/notification";
import User from "../models/user";
import { getMessaging } from "firebase-admin/messaging";

export const createNewNotification = async (
  userId: string,
  options: {
    title: string;
    description: string;
    imageURL?: string;
    sendPushNotification?: boolean;
  }
) => {
  try {
    await User.findById(userId)
      .then(async (user: typeof User) => {
        const notification = new Notification({
          title: options.title,
          description: options.description,
          user: user._id,
          isRead: false,
          type: "new_order",
        });

        await notification.save().catch((e: Error) => console.log(e));

        if (options.sendPushNotification) {
          const message = {
            data: {
              title: options.title,
              description: options.description,
              imageURL: options.imageURL || "",
            },
            token: user.FCMToken,
          };

          getMessaging()
            .send(message)
            .then((response) => {
              // Response is a message ID string.
              console.log("Successfully sent message:", response);
            })
            .catch((error) => {
              console.log("Error sending message:", error);
            });
        }
      })
      .catch((err: Error) => {
        console.log(err);
      });
  } catch (err) {
    console.log(err);
  }
};
