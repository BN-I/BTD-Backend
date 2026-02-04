import { Request, Response } from "express";
import { OrderedProduct } from "../../types/types";
import order from "../../models/order";
import Notification from "../../models/notification";
import Event from "../../models/event";
import { createNewNotification } from "../../service/notification";
import Product from "../../models/product";
import { sendEmail } from "../../utils/mailer";
import User from "../../models/user";

const checkoutController = async (req: Request, res: Response) => {
  const {
    orderedGifts,
    user,
    event,
    paymentBreakdown,
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
    paymentBreakdown?: {
      vendor: string;
      shipping: number;
      tax: number;
      subtotal: number;
      total: number;
      selectedCarrier?: string;
    }[];
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

  if (!paymentBreakdown || paymentBreakdown.length === 0) {
    return res.status(400).json({ message: "Payment breakdown is required" });
  }

  // Group gifts by vendor
  const giftsByVendor = orderedGifts.reduce(
    (acc, gift) => {
      if (!acc[gift.vendor]) {
        acc[gift.vendor] = [];
      }
      acc[gift.vendor].push(gift);
      return acc;
    },
    {} as { [key: string]: OrderedProduct[] },
  );

  try {
    console.log(event);
    const eventObj = await Event.findOne({
      _id: event,
    });
    const orders = await Promise.all(
      Object.keys(giftsByVendor).map(async (vendor) => {
        const vendorGifts = giftsByVendor[vendor];
        console.log(typeof vendor);

        // Calculate vendor subtotal (assuming prices are in dollars, convert to cents)
        // const vendorSubtotal = Math.round(
        //   vendorGifts.reduce((acc, gift) => acc + gift.price, 0) * 100
        // );

        // Calculate vendor's portion of tax and shipping (proportional to their subtotal)
        // Note: subtotal, taxAmount, shippingAmount from request are in cents
        // We need to convert to dollars for database storage
        // const totalSubtotalCents = subtotal
        //   ? subtotal
        //   : Math.round(
        //       orderedGifts.reduce((acc, gift) => acc + gift.price, 0) * 100
        //     );

        // const vendorTaxAmountCents =
        //   subtotal && taxAmount
        //     ? Math.round((vendorSubtotal / totalSubtotalCents) * taxAmount)
        //     : 0;
        // const vendorShippingAmountCents =
        //   subtotal && shippingAmount
        //     ? Math.round((vendorSubtotal / totalSubtotalCents) * shippingAmount)
        //     : 0;
        // const vendorTotalAmountCents =
        //   vendorSubtotal + vendorTaxAmountCents + vendorShippingAmountCents;

        // Convert to dollars for database storage (assuming database stores in dollars)
        // const vendorSubtotalDollars = vendorSubtotal / 100;
        // const vendorTaxAmountDollars = vendorTaxAmountCents / 100;
        // const vendorShippingAmountDollars = vendorShippingAmountCents / 100;
        // const vendorTotalAmountDollars = vendorTotalAmountCents / 100;

        // Create a new order record for this vendor
        const newOrder = new order({
          vendor,
          gifts: vendorGifts,
          amount: paymentBreakdown.find((pb) => pb.vendor === vendor)
            ? paymentBreakdown.find((pb) => pb.vendor === vendor)!.total
            : vendorGifts.reduce((acc, gift) => acc + gift.price, 0),
          subtotal: paymentBreakdown.find((pb) => pb.vendor === vendor)
            ? paymentBreakdown.find((pb) => pb.vendor === vendor)!.subtotal
            : 0,
          taxAmount: paymentBreakdown.find((pb) => pb.vendor === vendor)
            ? paymentBreakdown.find((pb) => pb.vendor === vendor)!.tax
            : 0,
          shippingAmount: paymentBreakdown.find((pb) => pb.vendor === vendor)
            ? paymentBreakdown.find((pb) => pb.vendor === vendor)!.shipping
            : 0,
          totalAmount: paymentBreakdown.find((pb) => pb.vendor === vendor)
            ? paymentBreakdown.find((pb) => pb.vendor === vendor)!.total
            : 0,
          user,
          event,
          address,
          state,
          city,
          zipcode,
          additionalAddressInfo,
          selectedCarrier: paymentBreakdown.find((pb) => pb.vendor === vendor)
            ? paymentBreakdown.find((pb) => pb.vendor === vendor)!
                .selectedCarrier
            : undefined,
          // Add any additional order data here like status, user info, etc.
        });

        // Save the order to the database
        await newOrder.save();

        await Product.findById(giftsByVendor[vendor][0].product)
          .then((product: any) => {
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
          })
          .catch((err: any) => console.log(err));

        // Fetch all products for this vendor's gifts
        const productPromises = vendorGifts.map((gift) =>
          Product.findById(gift.product),
        );
        const allProducts = await Promise.all(productPromises);

        // Create a map for quick product lookup
        const productMap = new Map();
        allProducts.forEach((product: any) => {
          if (product) {
            productMap.set(product._id.toString(), product);
          }
        });

        createNewNotification(vendor, "new_order", {
          title: "New Order",
          description:
            "You have a new order for " +
            allProducts.map((product: any) => product?.title || "").join(", "),
          imageURL: allProducts[0]?.images?.[0] || "",
          sendPushNotification: false,
        });

        // Send email notification to vendor
        try {
          const vendorUser = await User.findById(vendor);
          const customerUser = await User.findById(user);

          if (vendorUser && customerUser) {
            // Format products list as HTML
            let productsListHTML = "";
            for (const gift of vendorGifts) {
              const product = productMap.get(gift.product.toString());
              if (!product) continue;

              const productImage =
                product.images && product.images[0] ? product.images[0] : "";
              const variations = [];
              if (gift.selectedVariations?.color) {
                variations.push(
                  `<span class="variation-item"><span class="variation-label">Color:</span> ${gift.selectedVariations.color}</span>`,
                );
              }
              if (gift.selectedVariations?.size) {
                variations.push(
                  `<span class="variation-item"><span class="variation-label">Size:</span> ${gift.selectedVariations.size}</span>`,
                );
              }
              const variationsHTML =
                variations.length > 0
                  ? `<div class="product-variations">${variations.join(
                      "",
                    )}</div>`
                  : "";

              productsListHTML += `
                <div class="product-item">
                  <img src="${productImage}" alt="${
                    product.title
                  }" class="product-image" />
                  <div class="product-details">
                    <div class="product-name">${product.title}</div>
                    ${variationsHTML}
                    <div class="product-price">$${gift.price.toFixed(2)}</div>
                  </div>
                </div>
              `;
            }

            // Format event date and time
            const eventDate = new Date(eventObj.fullDate);
            const eventTime = new Date(eventObj.time);
            const formattedEventDate = eventDate.toLocaleDateString("en-US", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            });
            const formattedEventTime = eventTime.toLocaleTimeString("en-US", {
              hour: "numeric",
              minute: "2-digit",
              hour12: true,
            });

            // Format order date
            const orderDate = new Date(newOrder.createdAt || Date.now());
            const formattedOrderDate = orderDate.toLocaleDateString("en-US", {
              year: "numeric",
              month: "long",
              day: "numeric",
            });

            // Format event note if exists
            const eventNoteHTML = eventObj.note
              ? `<div class="event-detail-row">
                  <span class="event-detail-label">Note:</span>
                  <span class="event-detail-value">${eventObj.note}</span>
                </div>`
              : "";

            // Format additional address info if exists
            const additionalAddressHTML = additionalAddressInfo
              ? `${additionalAddressInfo}<br />`
              : "";

            // Format tax and shipping rows for email
            const taxAmountRow =
              paymentBreakdown.find((pb) => pb.vendor === vendor) &&
              paymentBreakdown.find((pb) => pb.vendor === vendor)!.tax > 0
                ? `<div class="order-info-row">
                  <span class="order-info-label">Tax:</span>
                  <span class="order-info-value">$${paymentBreakdown
                    .find((pb) => pb.vendor === vendor)!
                    .tax.toFixed(2)}</span>
                </div>`
                : "";

            const shippingAmountRow =
              paymentBreakdown.find((pb) => pb.vendor === vendor) &&
              paymentBreakdown.find((pb) => pb.vendor === vendor)!.shipping > 0
                ? `<div class="order-info-row">
                  <span class="order-info-label">Shipping:</span>
                  <span class="order-info-value">$${paymentBreakdown
                    .find((pb) => pb.vendor === vendor)!
                    .shipping.toFixed(2)}</span>
                </div>`
                : "";

            await sendEmail({
              to: vendorUser.email,
              subject: `New Order Received - Order #${newOrder._id}`,
              templateName: "orderReceived.html",
              variables: {
                vendorName: vendorUser.name || "Vendor",
                orderId: newOrder._id.toString(),
                orderDate: formattedOrderDate,
                orderStatus: newOrder.status || "paid",
                productsList: productsListHTML,
                eventTitle: eventObj.title,
                eventDate: formattedEventDate,
                eventTime: formattedEventTime,
                eventNote: eventNoteHTML,
                customerName: customerUser.name || "Customer",
                address: address,
                city: city,
                state: state,
                zipcode: zipcode,
                additionalAddressInfo: additionalAddressHTML,
                subtotal: paymentBreakdown
                  .find((pb) => pb.vendor === vendor)!
                  .subtotal.toFixed(2),
                taxAmount: paymentBreakdown
                  .find((pb) => pb.vendor === vendor)!
                  .tax.toFixed(2),
                shippingAmount: paymentBreakdown
                  .find((pb) => pb.vendor === vendor)!
                  .shipping.toFixed(2),
                taxAmountRow: taxAmountRow,
                shippingAmountRow: shippingAmountRow,
                totalAmount: paymentBreakdown
                  .find((pb) => pb.vendor === vendor)!
                  .total.toFixed(2),
                dashboardUrl: process.env.DASHBOARD_URL
                  ? `${process.env.DASHBOARD_URL}/dashboard/orders`
                  : "#",
              },
            });
          }
        } catch (emailErr) {
          console.error("Error sending order email:", emailErr);
          // Don't fail the order creation if email fails
        }

        eventObj.checkoutCompleted = true;
        await eventObj.save();

        return newOrder;
      }),
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
