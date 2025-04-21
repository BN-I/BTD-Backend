import { Request, Response } from "express";
import { isValidObjectId } from "mongoose";
import Notification from "../../models/notification";

const getNotifications = async (req: Request, res: Response) => {
  const { page = 1, perPage = 10, isRead } = req.query;
  const { id } = req.params;

  if (!isValidObjectId(id)) {
    return res.status(400).json({
      message: "User ID is not valid",
    });
  }
  console.log("/notifications");
  try {
    const filter = {
      user: id,
    } as any;

    if (isRead) {
      filter["isRead"] = isRead;
    }

    const notifications = await Notification.find({
      user: id,
    })
      .skip((Number(page) - 1) * Number(perPage))
      .limit(Number(perPage));

    res.status(200).json(notifications);
  } catch (err) {
    res.status(500).json({ message: err });
  }
};

module.exports = getNotifications;
