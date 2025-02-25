import { Request, Response } from "express";
import { isValidObjectId } from "mongoose";
import PaymentMethod from "../../models/paymentMethod";

const deletePaymentMethod = async (req: Request, res: Response) => {
  const { id } = req.params;

  if (!isValidObjectId(id)) {
    return res.status(400).json({
      message: "Payment Method ID is not valid",
    });
  }

  try {
    const paymentMethod = await PaymentMethod.findByIdAndDelete(id);
    if (!paymentMethod) {
      return res.status(404).json({
        message: "Payment Method not found",
      });
    }
    res.status(200).json(paymentMethod);
  } catch (err) {
    res.status(500).json({ message: err });
  }
};

export { deletePaymentMethod };
