import { easypost } from "../utils/easypostInstance";
import BusinessInformation from "../models/businessInformation";

interface ShippingCalculationParams {
  totalWeight: number; // Total weight in grams
  dimensions?: {
    length: number; // Length in cm
    width: number; // Width in cm
    height: number; // Height in cm
  };
  toAddress: {
    street1: string;
    street2?: string;
    city: string;
    state: string;
    zipcode: string;
    country?: string;
  };
  vendorId: string; // Vendor ID to get their address from BusinessInformation
}

interface ShippingRate {
  service: string;
  carrier: string;
  rate: number; // Rate in cents
  estimatedDays?: number;
}

interface ShippingCalculationResult {
  shippingAmount: number; // Shipping cost in cents (cheapest rate)
  availableRates: ShippingRate[]; // All available shipping rates from DHL, USPS, UPS, FedEx
  estimatedDays?: number; // Estimated delivery days
  error?: string;
}

/**
 * Calculate shipping rates using EasyPost API
 * Gets rates from vendor's location (from BusinessInformation) to delivery address
 * Only returns rates from DHL, USPS, UPS, and FedEx
 * 
 * @param params - Shipping calculation parameters
 * @returns Promise with shipping rates
 */
export const calculateShipping = async (
  params: ShippingCalculationParams
): Promise<ShippingCalculationResult> => {
  try {
    const { totalWeight, dimensions, toAddress, vendorId } = params;

    // Get vendor's address from BusinessInformation
    const businessInfo = await BusinessInformation.findOne({
      vendorID: vendorId,
    });

    if (!businessInfo) {
      throw new Error("Vendor business information not found");
    }

    // Convert weight from grams to ounces (EasyPost uses ounces)
    const weightInOunces = totalWeight / 28.3495;

    // Create parcel with weight and dimensions
    const parcelData: any = {
      weight: parseFloat(weightInOunces.toFixed(2)),
    };

    // Add dimensions if provided (convert from cm to inches)
    if (dimensions) {
      parcelData.length = parseFloat((dimensions.length / 2.54).toFixed(2));
      parcelData.width = parseFloat((dimensions.width / 2.54).toFixed(2));
      parcelData.height = parseFloat((dimensions.height / 2.54).toFixed(2));
    }

    const parcel = new easypost.Parcel(parcelData);

    // Create destination address
    const destinationAddress = new easypost.Address({
      street1: toAddress.street1,
      street2: toAddress.street2,
      city: toAddress.city,
      state: toAddress.state,
      zip: toAddress.zipcode,
      country: toAddress.country || "US",
    });

    // Create origin address from vendor's business information
    const originAddress = new easypost.Address({
      street1: businessInfo.businessAddress,
      city: businessInfo.city,
      state: businessInfo.state,
      zip: businessInfo.postalCode,
      country: businessInfo.country || "US",
    });

    // Create shipment
    const shipment = new easypost.Shipment({
      to_address: destinationAddress,
      from_address: originAddress,
      parcel: parcel,
    });

    // Get shipping rates
    const createdShipment = await shipment.save();
    const rates = createdShipment.rates || [];

    // Filter rates to only include DHL, USPS, UPS, FedEx
    const allowedCarriers = ["DHL", "USPS", "UPS", "FedEx"];
    const filteredRates = rates.filter((rate: any) =>
      allowedCarriers.includes(rate.carrier)
    );

    // Convert rates to our format
    const availableRates: ShippingRate[] = filteredRates.map((rate: any) => ({
      service: rate.service || "",
      carrier: rate.carrier || "",
      rate: Math.round(parseFloat(rate.rate) * 100), // Convert to cents
      estimatedDays: rate.est_delivery_days
        ? parseInt(rate.est_delivery_days)
        : undefined,
    }));

    // Sort rates by price (lowest first)
    availableRates.sort((a, b) => a.rate - b.rate);

    // Find cheapest rate
    const cheapestRate =
      availableRates.length > 0 ? availableRates[0] : null;

    if (!cheapestRate) {
      throw new Error("No shipping rates available from allowed carriers");
    }

    return {
      shippingAmount: cheapestRate.rate,
      availableRates,
      estimatedDays: cheapestRate.estimatedDays,
    };
  } catch (error: any) {
    console.error("Error calculating shipping with EasyPost:", error);

    // Fallback to simple weight-based calculation if EasyPost fails
    return calculateShippingFallback(params.totalWeight);
  }
};

/**
 * Fallback shipping calculation if EasyPost API fails
 * Simple weight-based calculation
 * 
 * @param totalWeight - Total weight in grams
 * @returns Shipping amount in cents
 */
const calculateShippingFallback = (
  totalWeight: number
): ShippingCalculationResult => {
  // Convert grams to pounds for fallback calculation
  const weightInPounds = totalWeight / 453.592;

  let shippingAmount = 0;

  if (totalWeight <= 0) {
    shippingAmount = 0;
  } else if (weightInPounds <= 1) {
    shippingAmount = 500; // $5.00
  } else if (weightInPounds <= 5) {
    shippingAmount = 800; // $8.00
  } else if (weightInPounds <= 10) {
    shippingAmount = 1200; // $12.00
  } else if (weightInPounds <= 20) {
    shippingAmount = 1800; // $18.00
  } else {
    shippingAmount = 2500; // $25.00
  }

  return {
    shippingAmount,
    availableRates: [
      {
        service: "Standard",
        carrier: "Fallback",
        rate: shippingAmount,
        estimatedDays: 3,
      },
    ],
    estimatedDays: 3,
  };
};

/**
 * Calculate shipping for multiple products based on their total weight and dimensions
 * 
 * @param productWeights - Array of product weights in grams
 * @param productDimensions - Array of product dimensions in cm (optional)
 * @param toAddress - Delivery address
 * @param vendorId - Vendor ID to get their address from BusinessInformation
 * @returns Promise with shipping rates
 */
export const calculateOrderShipping = async (
  productWeights: number[],
  toAddress: {
    street1: string;
    street2?: string;
    city: string;
    state: string;
    zipcode: string;
    country?: string;
  },
  vendorId: string,
  productDimensions?: Array<{
    length: number;
    width: number;
    height: number;
  }>
): Promise<ShippingCalculationResult> => {
  // Sum all product weights
  const totalWeight = productWeights.reduce((sum, weight) => sum + weight, 0);

  // Calculate combined dimensions if provided
  let combinedDimensions;
  if (productDimensions && productDimensions.length > 0) {
    // Simple approach: use the largest dimensions
    // In production, you might want to use a more sophisticated box packing algorithm
    const maxLength = Math.max(...productDimensions.map((d) => d.length));
    const maxWidth = Math.max(...productDimensions.map((d) => d.width));
    const totalHeight = productDimensions.reduce(
      (sum, d) => sum + d.height,
      0
    );

    combinedDimensions = {
      length: maxLength,
      width: maxWidth,
      height: totalHeight,
    };
  }

  return calculateShipping({
    totalWeight,
    dimensions: combinedDimensions,
    toAddress,
    vendorId,
  });
};

/**
 * Get shipping rate configuration
 * 
 * @param weight - Total weight in grams
 * @param toAddress - Delivery address
 * @param vendorId - Vendor ID to get their address from BusinessInformation
 * @returns Promise with shipping amount in cents
 */
export const getShippingRate = async (
  weight: number,
  toAddress: {
    street1: string;
    street2?: string;
    city: string;
    state: string;
    zipcode: string;
    country?: string;
  },
  vendorId: string
): Promise<number> => {
  const result = await calculateShipping({
    totalWeight: weight,
    toAddress,
    vendorId,
  });

  return result.shippingAmount;
};
