import { Request, Response } from "express";
import { isValidObjectId } from "mongoose";
import Order from "../../models/order";
import User from "../../models/user";
import { createNewNotification } from "../../service/notification";
import { sendEmail } from "../../utils/mailer";

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

    // Notify the vendor and admins by email; don't fail the request if
    // email delivery fails.
    (async () => {
      try {
        const vendorUser: any = order.vendor;
        const amount = (
          order.subtotal -
          (order.subtotal * 8) / 100 +
          order.taxAmount +
          order.shippingAmount
        ).toFixed(2);

        const variables = {
          vendorName: vendorUser?.name || "Vendor",
          orderId: order._id.toString(),
          amount,
        };

        if (vendorUser?.email) {
          await sendEmail({
            to: vendorUser.email,
            subject: `Payout Requested - Order #${order._id}`,
            template: "payoutRequestedVendor",
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
                subject: `Vendor Requested Payout - Order #${order._id}`,
                template: "payoutRequestedAdmin",
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
        console.error("Error sending payout request emails:", emailErr);
      }
    })();

    res.status(200).json(newOrder);
  } catch (err) {
    res.status(500).json({ message: err });
  }
};

export default requestPayment;
