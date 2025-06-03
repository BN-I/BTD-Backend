import { stripe } from "../../utils/stripeInstance";
import User from "../../models/user";
import { Request, Response } from "express";
import Order from "../../models/order";
const dispatchAmount = async (req: Request, res: Response) => {
  const { orderID } = req.body;

  if (!orderID) {
    return res.status(400).json({ message: "Order ID is required" });
  }

  try {
    const order = await Order.findById(orderID);

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    if (order.amountDispatched) {
      return res.status(400).json({ message: "Amount already dispatched" });
    }

    const vendor = await User.findById(order.vendor);

    if (!vendor || !vendor.stripeAccountId) {
      return res
        .status(400)
        .json({ message: "Vendor Stripe account not found" });
    }

    const transfer = await stripe.transfers.create({
      amount: Math.floor(order.totalAmount * 100), // cents
      currency: "usd",
      destination: vendor.stripeAccountId,
    });

    // Update order status
    order.amountDispatched = true;
    await order.save();

    res.status(200).json({
      message: "Amount dispatched successfully",
      transfer,
    });
  } catch (error) {
    console.error("Dispatch error:", error);
    res.status(500).json({ message: "Internal Server Error", error });
  }
};

export default dispatchAmount;
