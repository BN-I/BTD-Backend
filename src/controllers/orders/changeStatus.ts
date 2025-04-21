import { Request, Response } from "express";
import { OrderStatus } from "../../types/types";
import order from "../../models/order";
import { create } from "domain";
import { createNewNotification } from "../../service/notification";

const changeStatus = async (req: Request, res: Response) => {
  const { orderID, status, trackingID, trackingURL, shippingService } =
    req.body;

  if (!orderID) {
    return res.status(400).json({ message: "Order ID is required" });
  }

  if (!status || !Object.values(OrderStatus).includes(status)) {
    return res.status(400).json({ message: "Status is required" });
  }

  if (
    status == "shipped" &&
    (!trackingID || !trackingURL || !shippingService)
  ) {
    return res.status(400).json({
      message: "Tracking ID, Tracking URL and Shipping Service are required",
    });
  }

  try {
    const updatedOrder = await order.findByIdAndUpdate(
      orderID,
      { status, trackingID, trackingURL, shippingService },
      { new: true }
    );

    createNewNotification(updatedOrder.user, "new_order", {
      title: "Order Status Updated",
      description: `Your order status has been updated to ${status}`,
      sendPushNotification: true,
    });

    createNewNotification(updatedOrder.vendor, "new_order", {
      title: "Order Status Updated",
      description: `Your order with ID ${orderID} status has been updated to ${status}`,
      sendPushNotification: false,
    });

    res
      .status(200)
      .json({ message: "Status changed successfully", order: updatedOrder });
  } catch (err) {
    res.status(500).json({ message: err });
  }
};

export { changeStatus };
