import { Request, Response } from "express";
import Event from "../../models/event";
import { isValidObjectId } from "mongoose";
import Product from "../../models/product";
import storeInformation from "../../models/storeInformation";

const getEvents = async (req: Request, res: Response) => {
  const { page = 1, perPage = 10 } = req.query;
  const { id } = req.params;

  if (!isValidObjectId(id)) {
    return res.status(400).json({
      message: "User ID is not valid",
    });
  }

  try {
    let events = await Event.find({
      user: id,
    })
      .skip((Number(page) - 1) * Number(perPage))
      .limit(Number(perPage))
      .lean();
    for (const [index, event] of events.entries()) {
      for (const [giftIndex, gift] of event.gifts.entries()) {
        const product = await Product.findById(gift.product);
        const store = await storeInformation.findOne({
          vendorID: product.vendor._id,
        });
        events[index].gifts[giftIndex].product.storeInfo = store;
      }
    }

    res.status(200).json(events);
  } catch (err) {
    res.status(500).json({ message: err });
  }
};

export { getEvents };
