import { Request, Response } from "express";
import { isValidObjectId } from "mongoose";
import Subcriptions from "../../models/subcriptions";

const getSubscriptions = async (req: Request, res: Response) => {
  const { id } = req.params;

  if (!isValidObjectId(id)) {
    return res.status(400).json({
      message: "vendor ID is not valid",
    });
  }

  try {
    const subscription = await Subcriptions.findOne({
      vendorID: id,
    });

    res.status(200).json({ subscription });
  } catch (err) {
    res.status(500).json({ message: err });
  }
};

export default getSubscriptions;
