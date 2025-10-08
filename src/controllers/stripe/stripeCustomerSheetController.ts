import { Request, Response } from "express";
import { stripe } from "../../utils/stripeInstance";
import User from "../../models/user";

const stripeCustomerSheetController = async (req: Request, res: Response) => {
  const { id } = req.body;

  try {
    if (!id) {
      return res.status(400).json({ message: "Invalid request" });
    }

    const user = await User.findById(id);

    if (!user?.stripeCustomerId)
      return res
        .status(400)
        .json({ message: "User does not have a stripe customer id" });

    const ephemeralKey = await stripe.ephemeralKeys.create(
      { customer: user?.stripeCustomerId },
      { apiVersion: "2024-12-18.acacia" }
    );

    const setupIntent = await stripe.setupIntents.create({
      customer: user?.stripeCustomerId,
    });

    res.json({
      setupIntent: setupIntent.client_secret,
      ephemeralKey: ephemeralKey.secret,
      customer: user?.stripeCustomerId,
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: err });
  }
};

module.exports = { stripeCustomerSheetController };
