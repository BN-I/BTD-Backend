import { Request, Response } from "express";
import BusinessInformation from "../../models/businessInformation";
import StoreInformation from "../../models/storeInformation";
import axios from "axios";
import { stripe } from "../../utils/stripeInstance";

const getShippingCharges = async (req: Request, res: Response) => {
  try {
    console.log("Request body:", req.body);
    const {
      vendor,
      address,
      city,
      state,
      zip,
      weight,
      amount, // product subtotal in cents
    } = req.body;

    if (!vendor || !address || !city || !state || !zip || !weight || !amount) {
      return res.status(400).json({ message: "Invalid request" });
    }

    // Fetch vendor info
    const businessInformation = await BusinessInformation.findOne({
      vendorID: vendor,
    });

    const storeInformation = await StoreInformation.findOne({
      vendorID: vendor,
    });

    if (!businessInformation || !storeInformation) {
      return res.status(404).json({ message: "Vendor not found" });
    }

    // Get carriers
    const carriers = await axios.get("https://api.shipengine.com/v1/carriers", {
      headers: {
        "Content-Type": "application/json",
        "API-Key": process.env.SHIPENGINE_API_KEY || "",
      },
    });

    // Get shipping rates
    const shippingRates = await axios.post(
      "https://api.shipengine.com/v1/rates",
      {
        rate_options: {
          carrier_ids: carriers.data.carriers.map(
            (carrier: any) => carrier.carrier_id
          ),
          package_type: "package",
        },
        shipment: {
          validate_address: "no_validation",
          ship_to: {
            address_line1: address,
            city_locality: city,
            state_province: state,
            postal_code: zip,
            country_code: "US",
            address_residential_indicator: "no",
            name: "Customer",
          },
          ship_from: {
            name: storeInformation.storeName,
            company_name: storeInformation.storeName,
            phone: "222-333-4444",
            address_line1: businessInformation.businessAddress,
            city_locality: businessInformation.city,
            state_province: businessInformation.state,
            postal_code: businessInformation.postalCode,
            country_code: "US",
            address_residential_indicator: "no",
          },
          packages: [
            {
              weight: {
                value: weight,
                unit: "ounce",
              },
            },
          ],
        },
      },
      {
        headers: {
          "Content-Type": "application/json",
          "API-Key": process.env.SHIPENGINE_API_KEY || "",
        },
      }
    );

    // Pick lowest shipping rate
    const rate = shippingRates.data.rate_response.rates.reduce(
      (prev: any, curr: any) =>
        parseFloat(prev.shipping_amount.amount) <=
        parseFloat(curr.shipping_amount.amount)
          ? prev
          : curr,
      shippingRates.data.rate_response.rates[0]
    );

    const shippingAmount = Math.round(parseFloat(rate.shipping_amount.amount));

    // ============================
    // STRIPE TAX CALCULATION
    // ============================

    console.log("type", typeof amount, amount);
    const subtotalInCents = Math.round(Number(amount));

    const taxCalculation = await stripe.tax.calculations.create({
      currency: "usd",
      customer_details: {
        address: {
          line1: address,
          city: city,
          state: state,
          postal_code: zip,
          country: "US",
        },
        address_source: "billing",
      },
      line_items: [
        {
          amount: subtotalInCents,
          quantity: 1,
          tax_code: "txcd_99999999",
          reference: "product",
        },
      ],
    });

    console.log("Tax calculation:", taxCalculation);

    const taxAmount = taxCalculation.amount_tax;
    const totalAmount = taxCalculation.amount_total + shippingAmount;

    // ============================
    // RESPONSE
    // ============================
    return res.status(200).json({
      shipping: shippingAmount,
      tax: taxAmount,
      subtotal: amount,
      total: totalAmount,
      tax_breakdown: taxCalculation.tax_breakdown,
    });
  } catch (err: any) {
    console.error(err?.response?.data || err);
    return res.status(500).json(err?.response?.data || err);
  }
};

export { getShippingCharges };
