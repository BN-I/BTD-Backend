import User from "../../models/user";
import { Request, Response } from "express";
import { stripe } from "../../utils/stripeInstance";
import { calculateOrderTotals } from "../../utils/orderCalculator";
import { OrderedProduct } from "../../types/types";

const stripePaymentSheetController = async (req: Request, res: Response) => {
  const { id, orderedGifts, address } = req.body as {
    id: string;
    orderedGifts?: OrderedProduct[];
    address?: {
      line1: string;
      city: string;
      state: string;
      zipcode: string;
      country?: string;
    };
    amount?: number; // Legacy support - if amount is provided, use it directly
  };

  if (!id) {
    return res.status(400).json({ message: "User ID is required" });
  }

  const user = await User.findById(id);

  if (!user?.stripeCustomerId)
    return res
      .status(400)
      .json({ message: "User does not have a stripe customer id" });

  try {
    let totalAmount: number;

    // If orderedGifts and address are provided, calculate tax and shipping
    if (orderedGifts && address) {
      const calculation = await calculateOrderTotals({
        orderedGifts,
        address: {
          line1: address.line1,
          city: address.city,
          state: address.state,
          zipcode: address.zipcode,
          country: address.country || "US",
        },
        customerId: user.stripeCustomerId,
      });

      totalAmount = calculation.totalAmount;

      // Return calculation breakdown along with payment intent
      const ephemeralKey = await stripe.ephemeralKeys.create(
        { customer: user?.stripeCustomerId },
        { apiVersion: "2024-12-18.acacia" }
      );

      const paymentIntent = await stripe.paymentIntents.create({
        amount: totalAmount,
        currency: "usd",
        customer: user?.stripeCustomerId,
        automatic_tax: {
          enabled: true,
        },
        shipping: {
          address: {
            line1: address.line1,
            city: address.city,
            state: address.state,
            postal_code: address.zipcode,
            country: address.country || "US",
          },
        },
        automatic_payment_methods: {
          enabled: true,
        },
      });

      return res.json({
        paymentIntent: paymentIntent.client_secret,
        ephemeralKey: ephemeralKey.secret,
        customer: user?.stripeCustomerId,
        publishableKey: process.env.STRIPE_PUBLISHABLE_KEY,
        calculation: {
          subtotal: calculation.subtotal,
          taxAmount: calculation.taxAmount,
          shippingAmount: calculation.shippingAmount,
          totalAmount: calculation.totalAmount,
          taxRate: calculation.taxRate,
          estimatedDeliveryDays: calculation.estimatedDeliveryDays,
        },
      });
    } else if (req.body.amount) {
      // Legacy support: if amount is provided directly, use it
      totalAmount = Math.round(req.body.amount * 100); // Convert to cents if in dollars

      const ephemeralKey = await stripe.ephemeralKeys.create(
        { customer: user?.stripeCustomerId },
        { apiVersion: "2024-12-18.acacia" }
      );

      const paymentIntent = await stripe.paymentIntents.create({
        amount: totalAmount,
        currency: "usd",
        customer: user?.stripeCustomerId,
        automatic_payment_methods: {
          enabled: true,
        },
      });

      return res.json({
        paymentIntent: paymentIntent.client_secret,
        ephemeralKey: ephemeralKey.secret,
        customer: user?.stripeCustomerId,
        publishableKey: process.env.STRIPE_PUBLISHABLE_KEY,
      });
    } else {
      return res
        .status(400)
        .json({
          message:
            "Either 'amount' or 'orderedGifts' with 'address' must be provided",
        });
    }
  } catch (error) {
    res.status(400).json({ message: "Invalid request" });
    console.log(error);
  }
};

module.exports = { stripePaymentSheetController };
