import { Request, Response } from "express";
import PaymentMethod from "../../models/paymentMethod";
import { isValidObjectId } from "mongoose";

const getPaymentMethod = async (req: Request, res: Response) => {
  const { page = 1, perPage = 10 } = req.query;
  const { id } = req.params;

  if (!isValidObjectId(id)) {
    return res.status(400).json({
      message: "User ID is not valid",
    });
  }

  try {
    const paymentMethod = await PaymentMethod.find({
      user: id,
    })
      .skip((Number(page) - 1) * Number(perPage))
      .limit(Number(perPage));

    res.status(200).json(paymentMethod);
  } catch (err) {
    res.status(500).json({ message: err });
  }
};

export { getPaymentMethod };
