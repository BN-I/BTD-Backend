import { Request, Response } from "express";
import BusinessInformation from "../../models/businessInformation";
import axios from "axios";
import StoreInformation from "../../models/storeInformation";

const getShippingCharges = async (req: Request, res: Response) => {
  try {
    const { vendor, address, city, state, zip, weight } = req.body;

    if (!vendor || !address || !city || !state || !zip || !weight) {
      return res.status(400).json({ message: "Invalid request" });
    }

    const businessInformation = await BusinessInformation.findOne({
      vendorID: vendor,
    });
    const storeInformation = await StoreInformation.findOne({
      vendorID: vendor,
    });
    const carriers = await axios.get("https://api.shipengine.com/v1/carriers", {
      headers: {
        "Content-Type": "application/json",
        "API-Key": process.env.SHIPENGINE_API_KEY || "",
      },
    });

    const shippingRates = await axios.post(
      "https://api.shipengine.com/v1/rates ",
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
            phone: "222-333-4444",
            name: "Customer",
            company_name: "",
          },
          ship_from: {
            name: storeInformation?.storeName || "Before the dates",
            phone: "222-333-4444",
            company_name: storeInformation?.storeName || "Before the dates",
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

    //find the lowest rate
    const rate = shippingRates.data.rate_response.rates.reduce(
      (prev: any, curr: any) =>
        parseFloat(prev.shipping_amount.amount) <=
        parseFloat(curr.shipping_amount.amount)
          ? prev
          : curr,
      shippingRates.data.rate_response.rates[0]
    );

    res.status(200).json({
      rates: rate || {
        currency: "usd",
        amount: 5.5,
      },
    });
  } catch (err: any) {
    console.log(err.response.data);
    res.status(500).json({ ...(err?.response?.data || err) });
  }
};

export { getShippingCharges };
