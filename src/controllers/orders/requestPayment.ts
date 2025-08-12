import { Request, Response } from "express";
import { isValidObjectId } from "mongoose";
import Order from "../../models/order";
import User from "../../models/user";
import { createNewNotification } from "../../service/notification";

const requestPayment = async (req: Request, res: Response) => {
  const { id } = req.params;

  if (!isValidObjectId(id)) {
    return res.status(400).json({
      message: "Order ID is not valid",
    });
  }

  try {
    const order = await Order.findById(id);
    const admins = await User.find({ role: "Admin" });

    if (!order) {
      return res.status(404).json({
        message: "Order not found",
      });
    }

    const newOrder = await Order.findOneAndUpdate(
      { _id: id },
      { paymentRequestedAt: new Date() },
      { new: true }
    );

    createNewNotification(order.vendor, "new_order", {
      title: "Payment Requested",
      description: "You requested payment for order #" + order._id,
      sendPushNotification: false,
    });

    for (const admin of admins) {
      createNewNotification(admin._id, "new_order", {
        title: "Payment Requested",
        description: "Vendor requested payment for order #" + order._id,
        sendPushNotification: false,
      });
    }

    res.status(200).json(newOrder);
  } catch (err) {
    res.status(500).json({ message: err });
  }
};

export default requestPayment;
