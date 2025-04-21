import { Request, Response } from "express";
import Notification from "../../models/notification";

const updateNotification = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { title, description, isRead, type } = req.body;
  try {
    await Notification.findByIdAndUpdate(
      id,
      {
        title,
        description,
        isRead,
        type,
      },
      { new: true }
    )
      .then((notification: any) => {
        res
          .status(200)
          .json({ message: "Notification updated successfully", notification });
      })
      .catch((err: any) => res.status(500).json({ message: err }));
  } catch (err) {
    res.status(500).json({ message: err });
  }
};

export default updateNotification;
