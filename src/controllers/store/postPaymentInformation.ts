import { Request, Response } from "express";
import PaymentInformation from "../../models/paymentInformation";
import User from "../../models/user";
import { stripe } from "../../utils/stripeInstance";

const postPaymentInformation = async (req: Request, res: Response) => {
  const {
    vendorID,
    bankName,
    accountNumber,
    routingNumber,
    businessUrl,
    accountHolderFirstName,
    accountHolderLastName,
  } = req.body;

  if (
    !vendorID ||
    !bankName ||
    !accountNumber ||
    !routingNumber ||
    !businessUrl ||
    !accountHolderFirstName ||
    !accountHolderLastName
  ) {
    return res.status(400).json({ message: "All fields are required" });
  }

  try {
    const existingPaymentInformation =
      await PaymentInformation.findOneAndUpdate(
        { vendorID: vendorID },
        {
          bankName,
          accountHolderFirstName,
          accountHolderLastName,
          businessUrl,
          accountNumber,
          routingNumber,
        },
        { new: true, upsert: true }
      );

    let vendor = await User.findById(vendorID);
    let stripeAccountId = vendor?.stripeAccountId;

    // 2. Get or create Stripe connected account
    if (!stripeAccountId) {
      const account = await stripe.accounts.create({
        type: "custom",
        country: "US",
        email: vendor.email,
        business_type: "individual",
        capabilities: {
          transfers: { requested: true },
        },
        tos_acceptance: {
          date: Math.floor(Date.now() / 1000),
          ip: req.ip,
        },
        business_profile: {
          url: businessUrl, // Include business profile URL here
        },
        individual: {
          first_name: accountHolderFirstName, // Include individual first name here
          last_name: accountHolderLastName, // Include individual last name here
          dob: {
            day: 1,
            month: 1,
            year: 1990,
          },
          ssn_last_4: "0000",
        },
      });

      stripeAccountId = account.id;
      vendor.stripeAccountId = stripeAccountId;
      await vendor.save();

      console.log("account:", JSON.stringify(account));
    }

    // 3. Add new external bank account

    // const newExternalAccount = await stripe.accounts.createExternalAccount(
    //   stripeAccountId,
    //   {
    //     external_account: {
    //       object: "bank_account",
    //       country: "US",
    //       currency: "usd",
    //       account_holder_name: `${accountHolderFirstName} ${accountHolderLastName}`,
    //       account_holder_type: "individual",
    //       routing_number: routingNumber,
    //       account_number: accountNumber,
    //     },
    //     default_for_currency: true, // Set new one as default
    //   }
    // );

    const newExternalAccount = await stripe.accounts.createExternalAccount(
      stripeAccountId,
      {
        external_account: "btok_us_verified", // Test bank token
      }
    );

    // 4. List existing external accounts and remove if needed
    const externalAccounts = await stripe.accounts.listExternalAccounts(
      stripeAccountId,
      {
        object: "bank_account",
      }
    );

    if (externalAccounts.data.length > 0) {
      // Remove existing bank accounts (optional but recommended to avoid duplicates)
      for (const acc of externalAccounts.data) {
        if (acc.id !== newExternalAccount.id) {
          await stripe.accounts.deleteExternalAccount(stripeAccountId, acc.id);
        }
      }
    }

    console.log("External accounts:", JSON.stringify(newExternalAccount));

    res.status(200).json(existingPaymentInformation);
  } catch (err) {
    res.status(500).json({ message: err });
  }
};

export { postPaymentInformation };
