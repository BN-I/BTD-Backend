import { Request, Response } from "express";
import { OrderedProduct } from "../../types/types";
import order from "../../models/order";
import Notification from "../../models/notification";
import Event from "../../models/event";
import { createNewNotification } from "../../service/notification";
import Product from "../../models/product";

const checkoutController = async (req: Request, res: Response) => {
  const {
    orderedGifts,
    user,
    event,
    totalAmount,

    address,
    state,
    city,
    zipcode,
    additionalAddressInfo,
  } = req.body as {
    orderedGifts: OrderedProduct[];
    amount: number;
    vendor: string;
    user: string;
    event: string;
    totalAmount: number;
    address: string;
    state: string;
    city: string;
    zipcode: string;
    additionalAddressInfo?: string;
  };

  console.log(req.body);

  if (!orderedGifts || !totalAmount) {
    return res.status(400).json({ message: "Invalid request" });
  }

  if (!user) {
    return res.status(400).json({ message: "User ID is required" });
  }

  if (!address) {
    return res.status(400).json({ message: "Address is required" });
  }
  if (!state) {
    return res.status(400).json({ message: "State is required" });
  }
  if (!city) {
    return res.status(400).json({ message: "City is required" });
  }
  if (!zipcode) {
    return res.status(400).json({ message: "Zipcode is required" });
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
          address,
          state,
          city,
          zipcode,
          additionalAddressInfo,
          // Add any additional order data here like status, user info, etc.
        });

        // Save the order to the database
        await newOrder.save();

        await Product.findById(giftsByVendor[vendor][0].product).then(
          (product: any) => {
            try {
              createNewNotification(user, "new_order", {
                title: "New Order",
                description: "You have a new order for " + eventObj.title,
                imageURL: product.images[0],
                sendPushNotification: true,
              });

              createNewNotification(vendor, "payment", {
                title: "Payment Received",
                description: `Your payment has been received for order ${newOrder._id}`,
                sendPushNotification: false,
              });
            } catch (err) {
              console.log(err);
            }
          }
        );

        var allGifts = [] as any;

        for (const gift of giftsByVendor[vendor]) {
          await Product.findById(gift.product).then((product: any) => {
            allGifts.push(product);
          });
        }

        createNewNotification(vendor, "new_order", {
          title: "New Order",
          description:
            "You have a new order for " +
            allGifts.map((gift: any) => gift.title).join(", "),
          imageURL: allGifts[0].images[0],
          sendPushNotification: false,
        });

        return newOrder;
      })
    );

    return res
      .status(201)
      .json({ message: "Orders created successfully", orders });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: err });
  }
};

module.exports = { checkoutController };
