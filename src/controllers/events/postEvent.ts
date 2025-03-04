import { Request, Response } from "express";
import Event from "../../models/event";
import { isValidObjectId } from "mongoose";
import { selectedProduct } from "../../types/types";
import { createNewNotification } from "../../service/notification";
import Product from "../../models/product";

const postEvent = async (req: Request, res: Response) => {
  const {
    title, //required: true
    date, //required: true
    time, //required: true
    location, //required: true
    note, //required: false
    recipientPhone, //required: false
    recurringEvent, //required: true
    user, //required: true
    gifts, //required: true
  } = req.body;

  var parsedDate: Date | undefined = undefined;
  var parsedTime: Date | undefined = undefined;
  //check Required Values and their types

  if (!title || title === "" || typeof title !== "string") {
    return res.status(400).json({
      message: "title is not valid or missing",
    });
  }

  if (!date || date === "" || typeof date !== "string") {
    return res.status(400).json({
      message: "date is not valid or missing",
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

  if (!time || time === "" || typeof time !== "string") {
    return res.status(400).json({
      message: "time is not valid or missing",
    });
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

  if (!location || location === "" || typeof location !== "string") {
    return res.status(400).json({
      message: "location is not valid or missing",
    });
  }

  if (recurringEvent == undefined || typeof recurringEvent !== "boolean") {
    return res.status(400).json({
      message: "recurringEvent is not valid or missing",
    });
  }

  if (!user || user === "" || !isValidObjectId(user)) {
    return res.status(400).json({
      message: "user is not valid or missing",
    });
  }

  //check Non Required Values and their types

  if (
    gifts &&
    (!Array.isArray(gifts) ||
      gifts.some((gift: selectedProduct) => !isValidObjectId(gift?.product)))
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

  var eventDate: string | number | undefined = parsedDate?.getUTCDate();
  var eventMonth: string | number | undefined =
    (parsedDate?.getUTCMonth() as number) + 1;
  var eventYear = parsedDate?.getUTCFullYear();

  if (eventMonth && eventMonth < 10) {
    eventMonth = "0" + eventMonth.toString();
  }

  if (eventDate && eventDate < 10) {
    eventDate = "0" + eventDate;
  }

  try {
    const event = await Event.create({
      title: title.trim(),
      fullDate: parsedDate,
      date: eventDate,
      month: eventMonth,
      year: eventYear,
      time: parsedTime,
      location,
      note,
      recipientPhone,
      recurringEvent,
      user,
      gifts,
    }).then(async (event: any) => {
      if (gifts?.length > 0) {
        await Product.findById(gifts[0].product).then((product: any) => {
          console.log(product);

          createNewNotification(user, {
            title: "New Event Created",
            description: "You have created a new event for " + event.title,
            imageURL: product.images[0],
            sendPushNotification: true,
          });
        });
      } else {
        createNewNotification(user, {
          title: "New Event Created",
          description: "You have created a new event for " + event.title,
          sendPushNotification: true,
        });
      }
    });

    res.status(201).json(event);
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Something went wrong", err });
  }
};

export { postEvent };
