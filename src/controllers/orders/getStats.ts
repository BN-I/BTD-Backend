import { Request, Response } from "express";
import Order from "../../models/order";

const getStats = async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    const totalOrders = await Order.countDocuments({ vendor: id });
    const processingOrders = await Order.countDocuments({
      vendor: id,
      status: "processing",
    });
    const cancelledOrders = await Order.countDocuments({
      vendor: id,
      status: "cancelled",
    });

    res.status(200).json({
      message: "Stats fetched successfully",
      totalOrders,
      processingOrders,
      cancelledOrders,
    });
  } catch (error) {
    res.status(500).send({ message: "Internal Server Error" });
  }
};

export { getStats };
