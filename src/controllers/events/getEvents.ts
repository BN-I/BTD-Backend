import { Request, Response } from "express";
import Event from "../../models/event";

const getEvents = async (req: Request, res: Response) => {
  const { page = 1, perPage = 10 } = req.query;
  const { id } = req.params;
  try {
    const events = await Event.find({
      user: id,
    })
      .skip((Number(page) - 1) * Number(perPage))
      .limit(Number(perPage));

    res.status(200).json(events);
  } catch (err) {
    res.status(500).json({ message: err });
  }
};

export { getEvents };
