import { Request, Response } from "express";
import { stripe } from "../../utils/stripeInstance"; // make sure this exports a valid Stripe instance

import dotenv from "dotenv";

dotenv.config();

const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export const stripeWebhooks = async (req: Request, res: Response) => {
  const sig = req.headers["stripe-signature"] as string;
  let event;

  try {
    const rawBody = (req as any).rawBody; // `rawBody` will be populated by custom middleware
    event = stripe.webhooks.constructEvent(rawBody, sig, endpointSecret);
  } catch (err: any) {
    console.error("Error verifying webhook signature:", err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Handle Stripe events
  switch (event.type) {
    case "customer.subscription.updated":
      await handleSubscriptionUpdated(event.data.object);
      break;
    case "customer.subscription.deleted":
      await handleSubscriptionDeleted(event.data.object);
      break;
    case "invoice.payment_succeeded":
      await handleInvoicePaid(event.data.object);
      break;
    default:
      console.log(`Unhandled event type: ${event.type}`);
  }

  res.status(200).json({ received: true });
};

async function handleSubscriptionUpdated(subscription: any) {
  console.log("Subscription updated:", subscription.id);
  // TODO: Add logic to update DB
}

async function handleSubscriptionDeleted(subscription: any) {
  console.log("Subscription deleted:", subscription.id);
  // TODO: Add logic to update DB
}

async function handleInvoicePaid(invoice: any) {
  console.log("Invoice paid:", invoice.id);
  // TODO: Add logic to update DB
}

export default stripeWebhooks;
