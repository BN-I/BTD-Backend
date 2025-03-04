import notificationSetrtings from "../../models/notificationSettings";
import { Request, Response } from "express";
const getNotificationSettings = async (req: Request, res: Response) => {
  const { page = 1, perPage = 10 } = req.query;
  const { id } = req.params;

  try {
    const notificationSettings = await notificationSetrtings
      .findOne({
        user: id,
      })
      .skip((Number(page) - 1) * Number(perPage))
      .limit(Number(perPage));
    res.status(200).send(notificationSettings);
  } catch (error) {
    console.error(error);
    res.status(500).send({ message: "Internal Server Error" });
  }
};

export = { getNotificationSettings };
