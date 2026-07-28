import { stripe } from "../../utils/stripeInstance";
import User from "../../models/user";
import { Request, Response } from "express";
import Order from "../../models/order";
import { sendEmail } from "../../utils/mailer";
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

    const payoutAmount = Math.floor(
      order.subtotal -
        (order.subtotal * 8) / 100 +
        order.taxAmount +
        order.shippingAmount
    );

    const transfer = await stripe.transfers.create({
      amount: payoutAmount * 100, // cents
      currency: "usd",
      destination: vendor.stripeAccountId,
    });

    // Update order status
    order.amountDispatched = true;
    await order.save();

    // Notify the vendor and admins by email; don't fail the dispatch if
    // email delivery fails.
    (async () => {
      try {
        const admins = await User.find({ role: "Admin" });
        const variables = {
          vendorName: vendor.name || "Vendor",
          orderId: order._id.toString(),
          amount: payoutAmount.toFixed(2),
          transferId: transfer.id,
        };

        if (vendor.email) {
          await sendEmail({
            to: vendor.email,
            subject: `Payout Sent - Order #${order._id}`,
            template: "payoutDispatchedVendor",
            variables: {
              ...variables,
              dashboardUrl: process.env.DASHBOARD_URL
                ? `${process.env.DASHBOARD_URL}/payment`
                : "#",
            },
          });
        }

        await Promise.all(
          admins
            .filter((admin: any) => admin.email)
            .map((admin: any) =>
              sendEmail({
                to: admin.email,
                subject: `Payout Dispatched - Order #${order._id}`,
                template: "payoutDispatchedAdmin",
                variables: {
                  ...variables,
                  dashboardUrl: process.env.ADMIN_URL
                    ? `${process.env.ADMIN_URL}/payments`
                    : "#",
                },
              }),
            ),
        );
      } catch (emailErr) {
        console.error("Error sending payout dispatched emails:", emailErr);
      }
    })();

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
