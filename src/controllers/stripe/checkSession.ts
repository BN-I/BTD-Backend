import { Request, Response } from "express";
import { stripe } from "../../utils/stripeInstance";
import user from "../../models/user";
import subcriptions from "../../models/subcriptions";
const checkSession = async (req: Request, res: Response) => {
  const { sessionId } = req.body;

  try {
    const session = await stripe.checkout.sessions.retrieve(sessionId);

    if (session.payment_status === "paid") {
      const newUser = await user.findOneAndUpdate(
        { _id: session.metadata.vendorID },
        { stripeCustomerId: session.customer },
        { new: true }
      );

      const subscription = await stripe.subscriptions.retrieve(
        session.subscription as string
      );

      console.log(subscription);
      const subscriptionOBJ = await subcriptions.findOneAndUpdate(
        {
          vendorID: session.metadata.vendorID,
        },
        {
          plan: session.metadata.plan,
          priceID: subscription.plan.id,
          amount: session.amount_total,
          startDate: new Date(subscription.current_period_start * 1000),
          endDate: new Date(subscription.current_period_end * 1000),
          status: subscription.status, // e.g., "active"
        },
        { upsert: true, new: true }
      );

      return res.status(200).json({ session, subscription: subscriptionOBJ });
    }

    return res.status(200).json({ session });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
};

export default checkSession;
