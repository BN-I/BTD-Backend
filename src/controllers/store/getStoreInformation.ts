import { Request, Response } from "express";
import { isValidObjectId } from "mongoose";
import StoreInformation from "../../models/storeInformation";

const getStoreInformation = async (req: Request, res: Response) => {
  try {
    if (!isValidObjectId(req.params.id)) {
      return res.status(400).json({
        message: "vendor ID is not valid",
      });
    }
    const storeInformation = await StoreInformation.findOne({
      vendorID: req.params.id,
    });
    res.status(200).json({ storeInformation });
  } catch (err) {
    res.status(500).json({ message: err });
  }
};

export default getStoreInformation;
