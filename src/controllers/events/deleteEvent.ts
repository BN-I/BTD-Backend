import { Request, Response } from "express";
import Event from "../../models/event";
import { isValidObjectId } from "mongoose";

const deleteEvent = async (req: Request, res: Response) => {
  const { id } = req.params;

  if (!isValidObjectId(id)) {
    return res.status(400).json({
      message: "Event ID is not valid",
    });
  }

  try {
    const event = await Event.findByIdAndDelete(id);
    if (!event) {
      return res.status(404).json({
        message: "Event not found",
      });
    }
    res.status(200).json(event);
  } catch (err) {
    res.status(500).json({ message: err });
  }
};

export { deleteEvent };
