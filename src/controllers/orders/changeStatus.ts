import { Request, Response } from "express";
import { OrderStatus } from "../../types/types";
import order from "../../models/order";

const changeStatus = async (req: Request, res: Response) => {
  const { orderID, status } = req.body;

  if (!orderID) {
    return res.status(400).json({ message: "Order ID is required" });
  }

  if (!status || !Object.values(OrderStatus).includes(status)) {
    return res.status(400).json({ message: "Status is required" });
  }

  try {
    const updatedOrder = await order.findByIdAndUpdate(
      orderID,
      { status },
      { new: true }
    );

    res
      .status(200)
      .json({ message: "Status changed successfully", order: updatedOrder });
  } catch (err) {
    res.status(500).json({ message: err });
  }
};

export { changeStatus };
