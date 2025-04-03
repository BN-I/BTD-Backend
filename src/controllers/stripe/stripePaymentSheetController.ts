import User from "../../models/user";
import { Request, Response } from "express";
import { stripe } from "../../utils/stripeInstance";

const stripePaymentSheetController = async (req: Request, res: Response) => {
  const { id, amount } = req.body;

  if (!id || !amount) {
    return res.status(400).json({ message: "Invalid request" });
  }

  const user = await User.findById(id);

  if (!user?.stripeCustomerId)
    return res
      .status(400)
      .json({ message: "User does not have a stripe customer id" });

  try {
    const ephemeralKey = await stripe.ephemeralKeys.create(
      { customer: user?.stripeCustomerId },
      { apiVersion: "2024-12-18.acacia" }
    );

    const paymentIntent = await stripe.paymentIntents.create({
      amount: amount,
      currency: "usd",
      customer: user?.stripeCustomerId,
      automatic_payment_methods: {
        enabled: true,
      },
    });

    res.json({
      paymentIntent: paymentIntent.client_secret,
      ephemeralKey: ephemeralKey.secret,
      customer: user?.stripeCustomerId,
      publishableKey: process.env.STRIPE_PUSLISHABLE_KEY,
    });
  } catch (error) {
    res.status(400).json({ message: "Invalid request" });
    console.log(error);
  }
};

module.exports = { stripePaymentSheetController };
