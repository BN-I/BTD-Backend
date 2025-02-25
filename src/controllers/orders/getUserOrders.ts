import { Request, Response } from "express";
import { isValidObjectId } from "mongoose";
import order from "../../models/order";

const getUserOrders = async (req: Request, res: Response) => {
  const { page = 1, perPage = 10 } = req.query;
  const { id } = req.params;

  if (!isValidObjectId(id)) {
    return res.status(400).json({
      message: "User ID is not valid",
    });
  }

  try {
    const orders = await order
      .find({
        user: id,
      })
      .skip((Number(page) - 1) * Number(perPage))
      .limit(Number(perPage));
    res.status(200).json(orders);
  } catch (err) {
    res.status(500).json({ message: err });
  }
};

export = { getUserOrders };
