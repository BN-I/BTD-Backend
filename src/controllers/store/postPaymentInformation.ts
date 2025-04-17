import { Request, Response } from "express";
import PaymentInformation from "../../models/paymentInformation";

const postPaymentInformation = async (req: Request, res: Response) => {
  const {
    vendorID,
    bankName,
    accountHolderName,
    accountNumber,
    routingNumber,
  } = req.body;

  if (
    !vendorID ||
    !bankName ||
    !accountHolderName ||
    !accountNumber ||
    !routingNumber
  ) {
    return res.status(400).json({ message: "All fields are required" });
  }

  try {
    const existingPaymentInformation =
      await PaymentInformation.findOneAndUpdate(
        { vendorID: vendorID },
        {
          bankName,
          accountHolderName,
          accountNumber,
          routingNumber,
        },
        { new: true, upsert: true }
      );

    res.status(200).json(existingPaymentInformation);
  } catch (err) {
    res.status(500).json({ message: err });
  }
};

export { postPaymentInformation };
