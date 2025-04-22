import { Request, Response } from "express";
import { isValidObjectId } from "mongoose";
import order from "../../models/order";

const paymentsStats = async (req: Request, res: Response) => {
  const { id } = req.params;

  if (!isValidObjectId(id)) {
    return res.status(400).json({
      message: "Vendor ID is not valid",
    });
  }

  try {
    const allOrders = await order
      .find({
        vendor: id,
      })
      .sort({ createdAt: -1 });

    const totalEarnings = allOrders.reduce((acc: number, order: any) => {
      return acc + order.totalAmount;
    }, 0);
    const totalOrders = allOrders.length;

    //////////////////////////////////////

    const pendingPaymentOrders = await order
      .find({
        vendor: id,
        amountDispatched: false,
      })
      .sort({ createdAt: -1 });
    const pendingPaymentOrdersAmount = pendingPaymentOrders.reduce(
      (acc: number, order: any) => {
        return acc + order.totalAmount;
      },
      0
    );

    ////////////////////////////////////////

    const receivedPaymentOrders = await order
      .find({
        vendor: id,
        amountDispatched: true,
      })
      .sort({ createdAt: -1 });
    const receivedPaymentOrdersAmount = receivedPaymentOrders.reduce(
      (acc: number, order: any) => {
        return acc + order.totalAmount;
      },
      0
    );

    const paymentStats = {
      totalEarnings,
      totalOrders,
      pendingPaymentOrders,
      pendingPaymentOrdersAmount,
      receivedPaymentOrders,
      receivedPaymentOrdersAmount,
    };

    res.status(200).json(paymentStats);
  } catch (err) {
    res.status(500).json({ message: err });
  }
};

export { paymentsStats };
