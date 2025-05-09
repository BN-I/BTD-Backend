import { Request, Response } from "express";
import Event from "../../models/event";

const getAllEvents = async (req: Request, res: Response) => {
  const { page = 1, perPage = 99999 } = req.query;

  try {
    const events = await Event.find()
      .skip((Number(page) - 1) * Number(perPage))
      .limit(Number(perPage));
    res.status(200).json(events);
  } catch (err) {
    res.status(500).json({ message: err });
  }
};

export { getAllEvents };
