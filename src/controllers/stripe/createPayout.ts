import { Request, Response } from "express";
import { stripe } from "../../utils/stripeInstance";

const createPayout = async (req: Request, res: Response) => {
  await stripe.accounts.createExternalAccount("account.id", {
    external_account: {
      object: "bank_account",
      country: "US",
      currency: "usd",
      routing_number: "110000000",
      account_number: "000123456789",
      account_holder_name: "John Doe",
      account_holder_type: "individual",
    },
  });
};

export default createPayout;
