import { Request, Response } from "express";
import { OrderedProduct } from "../../types/types";
import order from "../../models/order";
import Notification from "../../models/notification";
import Event from "../../models/event";
import { createNewNotification } from "../../service/notification";
import Product from "../../models/product";

const checkoutController = async (req: Request, res: Response) => {
  const { orderedGifts, user, event, totalAmount } = req.body as {
    orderedGifts: OrderedProduct[];
    amount: number;
    vendor: string;
    user: string;
    event: string;
    totalAmount: number;
  };

  if (!orderedGifts || !totalAmount) {
    return res.status(400).json({ message: "Invalid request" });
  }

  // Group gifts by vendor
  const giftsByVendor = orderedGifts.reduce((acc, gift) => {
    if (!acc[gift.vendor]) {
      acc[gift.vendor] = [];
    }
    acc[gift.vendor].push(gift);
    return acc;
  }, {} as { [key: string]: OrderedProduct[] });

  try {
    console.log(event);
    const eventObj = await Event.findOne({
      _id: event,
    });
    const orders = await Promise.all(
      Object.keys(giftsByVendor).map(async (vendor) => {
        const vendorGifts = giftsByVendor[vendor];
        console.log(typeof vendor);

        const amount = vendorGifts.reduce((acc, gift) => acc + gift.price, 0);

        // Create a new order record for this vendor
        const newOrder = new order({
          vendor,
          gifts: vendorGifts,
          amount: amount,
          totalAmount: totalAmount,
          user,
          event,
          // Add any additional order data here like status, user info, etc.
        });

        // Save the order to the database
        await newOrder.save();

        await Product.findById(giftsByVendor[vendor][0].product).then(
          (product: any) => {
            try {
              createNewNotification(user, {
                title: "New Order",
                description: "You have a new order for " + eventObj.title,
                imageURL: product.images[0],
                sendPushNotification: true,
              });
            } catch (err) {
              console.log(err);
            }
          }
        );

        return newOrder;
      })
    );

    return res
      .status(201)
      .json({ message: "Orders created successfully", orders });
  } catch (err) {}
};

module.exports = { checkoutController };
