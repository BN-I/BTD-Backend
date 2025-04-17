import { Request, Response } from "express";
import BusinessInformation from "../../models/businessInformation";
import { isValidObjectId } from "mongoose";

const getBusinessInformation = async (req: Request, res: Response) => {
  try {
    if (!isValidObjectId(req.params.id)) {
      return res.status(400).json({
        message: "vendor ID is not valid",
      });
    }

    const businessInformation = await BusinessInformation.findOne({
      vendorID: req.params.id,
    });
    res.status(200).json({ businessInformation });
  } catch (err) {
    res.status(500).json({ message: err });
  }
};

export default getBusinessInformation;
