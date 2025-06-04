import { Request, Response } from "express";
import { stripe } from "../../utils/stripeInstance";

const createCheckoutSession = async (req: Request, res: Response) => {
  const { priceId, vendorID, planName } = req.body;
  try {
    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      payment_method_types: ["card"],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      success_url: `https://btd-portal.vercel.app/dashboard/payment-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `https://btd-portal.vercel.app/dashboard`,
      metadata: {
        vendorID,
        plan: planName,
      },
    });

    return res.status(200).json({ sessionId: session.id });
  } catch (error) {
    console.error(error);

    return res.status(500).send({
      error: "Error creating checkout session",
    });
  }
};

export default createCheckoutSession;
