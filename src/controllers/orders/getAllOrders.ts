import { Request, Response } from "express";
import { isValidObjectId } from "mongoose";
import order from "../../models/order";

const getAllOrders = async (req: Request, res: Response) => {
  const { page = 1, perPage = 99999 } = req.query;

  try {
    const orders = await order
      .find()
      .skip((Number(page) - 1) * Number(perPage))
      .limit(Number(perPage));
    res.status(200).json(orders);
  } catch (err) {
    res.status(500).json({ message: err });
  }
};

export { getAllOrders };
