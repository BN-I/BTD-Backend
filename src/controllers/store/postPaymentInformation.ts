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
    bankToken,
    phoneNumber,
    addressP,
    cityP,
    stateP,
    postalCodeP,
    countryP,
    id_number,
    dobDay,
    dobMonth,
    dobYear,
    industry,
  } = req.body;

  if (
    !vendorID ||
    !bankName ||
    !accountNumber ||
    !routingNumber ||
    !businessUrl ||
    !accountHolderFirstName ||
    !accountHolderLastName ||
    !bankToken ||
    !phoneNumber ||
    !addressP ||
    !cityP ||
    !stateP ||
    !postalCodeP ||
    !countryP ||
    !id_number ||
    !dobDay ||
    !dobMonth ||
    !dobYear ||
    !industry
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
          phoneNumber,
          addressP,
          cityP,
          stateP,
          postalCodeP,
          countryP,
          id_number,
          dobDay,
          dobMonth,
          dobYear,
          industry,
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
          card_payments: { requested: true },
          transfers: { requested: true },
        },
        tos_acceptance: {
          date: Math.floor(Date.now() / 1000),
          ip: req.ip,
        },
        business_profile: {
          url: businessUrl,
          mcc: industry,
        },
        individual: {
          first_name: accountHolderFirstName,
          last_name: accountHolderLastName,
          email: vendor.email,
          phone: phoneNumber,
          address: {
            line1: addressP,
            city: cityP,
            state: stateP,
            postal_code: postalCodeP,
            country: countryP,
          },
          dob: {
            day: dobDay,
            month: dobMonth,
            year: dobYear,
          },
          id_number,
        },
      });

      stripeAccountId = account.id;
      vendor.stripeAccountId = stripeAccountId;
      await vendor.save();

      console.log("account:", JSON.stringify(account));
    }

    const newExternalAccount = await stripe.accounts.createExternalAccount(
      stripeAccountId,
      {
        external_account: bankToken,
        default_for_currency: true,
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
