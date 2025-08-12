import { Request, Response } from "express";
import { stripe } from "../../utils/stripeInstance";
import User from "../../models/user";
const createPortalSession = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const vendor = await User.findById(id);
    // Get the customer ID from your database based on the authenticated user
    const customerId = vendor?.stripeCustomerId; // Replace with actual customer ID retrieval logic

    const session = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: `${process.env.CLIENT_URL}/dashboard/`,
    });

    return res.status(200).json({ url: session.url });
  } catch (error) {
    console.error(error);

    return res.status(500).json({ error: "Error creating portal session" });
  }
};

export default createPortalSession;
