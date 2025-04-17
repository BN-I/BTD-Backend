import { Request, Response } from "express";
import PaymentInformation from "../../models/paymentInformation";
import { isValidObjectId } from "mongoose";
const getPaymentInformation = async (req: Request, res: Response) => {
  const vendorID = req.params.id;

  if (!vendorID || !isValidObjectId(vendorID)) {
    return res.status(400).json({
      message: "vendor ID is not valid",
    });
  }

  try {
    const paymentInformation = await PaymentInformation.findOne({
      vendorID: vendorID,
    });
    res.status(200).json({ paymentInformation });
  } catch (err) {
    res.status(500).json({ message: err });
  }
};

export default getPaymentInformation;
