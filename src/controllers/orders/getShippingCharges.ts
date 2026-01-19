import { Request, Response } from "express";
import BusinessInformation from "../../models/businessInformation";
import StoreInformation from "../../models/storeInformation";
import axios from "axios";
import { stripe } from "../../utils/stripeInstance";
import Event from "../../models/event";

const getShippingCharges = async (req: Request, res: Response) => {
  try {
    const {
      vendor,
      address,
      city,
      state,
      zip,
      weight,
      amount, // product subtotal in cents
      event,
    } = req.body;

    if (!vendor || !address || !city || !state || !zip || !weight || !amount) {
      return res.status(400).json({ message: "Invalid request" });
    }

    // ============================
    // FETCH DATA
    // ============================

    const [eventData, businessInformation, storeInformation] =
      await Promise.all([
        event ? Event.findById(event) : null,
        BusinessInformation.findOne({ vendorID: vendor }),
        StoreInformation.findOne({ vendorID: vendor }),
      ]);

    if (!businessInformation || !storeInformation) {
      return res.status(404).json({ message: "Vendor not found" });
    }

    // ============================
    // GET SHIPPING RATES
    // ============================

    const carriers = await axios.get("https://api.shipengine.com/v1/carriers", {
      headers: {
        "Content-Type": "application/json",
        "API-Key": process.env.SHIPENGINE_API_KEY || "",
      },
    });

    let filteredCarriers: any[] = [];

    if (!storeInformation.carrier || storeInformation.carrier === "other") {
      filteredCarriers = carriers.data.carriers;
    } else {
      filteredCarriers = carriers.data.carriers.filter((carrier: any) => {
        console.log("carrier.carrier_code", carrier.carrier_code);
        console.log("storeInformation.carrier", storeInformation.carrier);
        return carrier.carrier_code === storeInformation.carrier;
      });
    }

    const shippingRatesResponse = await axios.post(
      "https://api.shipengine.com/v1/rates",
      {
        rate_options: {
          carrier_ids: filteredCarriers.map(
            (carrier: any) => carrier.carrier_id,
          ),
          package_type: "package",
        },
        shipment: {
          validate_address: "no_validation",
          ship_to: {
            name: "Customer",
            address_line1: address,
            city_locality: city,
            state_province: state,
            postal_code: zip,
            country_code: "US",
            address_residential_indicator: "no",
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
      },
    );

    const rates = shippingRatesResponse.data?.rate_response?.rates || [];

    if (!rates.length) {
      return res.status(400).json({ message: "No shipping rates available" });
    }

    // ============================
    // PICK BEST SHIPPING RATE
    // ============================

    let selectedRate: any = null;

    // 1️⃣ If event date exists → pick cheapest rate arriving on/before event
    if (eventData?.fullDate) {
      const eventDate = new Date(eventData.fullDate);
      const eligibleRates = await rates.filter((rate: any) => {
        if (!rate.estimated_delivery_date) return false;
        const deliveryDate = new Date(rate.estimated_delivery_date);
        console.log("deliveryDate", deliveryDate);
        console.log("eventDate", eventDate);
        return deliveryDate <= eventDate;
      });
      console.log("eligibleRates", JSON.stringify(eligibleRates));
      if (eligibleRates.length) {
        selectedRate = await eligibleRates.reduce((cheapest: any, rate: any) =>
          Number(rate.shipping_amount.amount) <
          Number(cheapest.shipping_amount.amount)
            ? rate
            : cheapest,
        );
      }

      console.log("selectedRate1", JSON.stringify(selectedRate));
    }

    if (!selectedRate) {
      // console.log("rates2", JSON.stringify(rates));
      selectedRate = await rates.reduce((highest: any, rate: any) =>
        Number(rate.shipping_amount.amount) >
        Number(highest.shipping_amount.amount)
          ? rate
          : highest,
      );

      console.log("selectedRate2", JSON.stringify(selectedRate));
    }
    const shippingAmount = Math.round(
      Number(selectedRate.shipping_amount.amount),
    );

    // ============================
    // STRIPE TAX CALCULATION
    // ============================

    const subtotalInCents = Math.round(Number(amount));

    const taxCalculation = await stripe.tax.calculations.create({
      currency: "usd",
      customer_details: {
        address: {
          line1: address,
          city,
          state,
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

    const taxAmount = taxCalculation.amount_tax;
    const totalAmount = taxCalculation.amount_total + shippingAmount;

    // ============================
    // RESPONSE
    // ============================

    return res.status(200).json({
      shipping: shippingAmount,
      tax: taxAmount,
      subtotal: subtotalInCents,
      total: totalAmount,
      selected_rate: {
        carrier: selectedRate.carrier_code,
        service: selectedRate.service_type,
        delivery_date: selectedRate.estimated_delivery_date,
      },
    });
  } catch (err: any) {
    console.error(err?.response?.data || err);
    return res
      .status(500)
      .json(err?.response?.data || { message: "Server error" });
  }
};

export { getShippingCharges };
