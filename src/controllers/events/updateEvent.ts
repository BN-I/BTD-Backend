import { Request, Response } from "express";
import Event from "../../models/event";
import { isValidObjectId } from "mongoose";

const updateEvent = async (req: Request, res: Response) => {
  const { id } = req.params;
  const {
    title, //required: true
    date, //required: true
    time, //required: true
    location, //required: true
    note, //required: false
    recipientPhone, //required: false
    recurringEvent, //required: true
    gifts, //required: true
  } = req.body;

  var parsedDate: Date | undefined = undefined;
  var parsedTime: Date | undefined = undefined;

  console.log(id);
  if (!isValidObjectId(id)) {
    return res.status(400).json({
      message: "Event ID is not valid",
    });
  }

  if (title && (title === "" || typeof title !== "string")) {
    return res.status(400).json({
      message: "title is not valid",
    });
  }

  if (date) {
    try {
      parsedDate = new Date(date);
      if (isNaN(parsedDate.getDate())) {
        throw new Error("date is not valid or missing");
      }
    } catch (err) {
      return res.status(400).json({
        message: "date is not valid or missing",
      });
    }
  }

  if (time) {
    try {
      parsedTime = new Date(time);
      if (isNaN(parsedTime.getTime())) {
        throw new Error("time is not valid or missing");
      }
    } catch (err) {
      return res.status(400).json({
        message: "time is not valid or missing",
      });
    }
  }

  if (location && (location === "" || typeof location !== "string")) {
    return res.status(400).json({
      message: "location is not valid or missing",
    });
  }

  if (recurringEvent !== undefined && typeof recurringEvent !== "boolean") {
    return res.status(400).json({
      message: "recurringEvent is not valid or missing",
    });
  }

  if (
    gifts &&
    (!Array.isArray(gifts) ||
      gifts.some((gift: string) => !isValidObjectId(gift)))
  ) {
    return res.status(400).json({
      message: "gifts should be array of valid gift ids",
    });
  }

  if (note && typeof note !== "string") {
    return res.status(400).json({
      message: "note is not valid ",
    });
  }

  if (recipientPhone && typeof recipientPhone !== "string") {
    return res.status(400).json({
      message: "recipientPhone is not valid ",
    });
  }

  try {
    const event = await Event.findOneAndUpdate(
      { _id: id },
      {
        title,
        date: parsedDate,
        time: parsedTime,
        location,
        note,
        recipientPhone,
        recurringEvent,
        gifts,
      },
      { new: true }
    );

    res.status(200).json(event);
  } catch (err) {
    res.status(500).json({ message: err });
  }
};

export { updateEvent };