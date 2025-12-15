import { easypost } from "../utils/easypostInstance";

interface ShippingCalculationParams {
  totalWeight: number; // Total weight in grams
  dimensions?: {
    length: number; // Length in cm
    width: number; // Width in cm
    height: number; // Height in cm
  };
  address: {
    street1: string;
    street2?: string;
    city: string;
    state: string;
    zipcode: string;
    country?: string;
  };
  fromAddress?: {
    street1: string;
    street2?: string;
    city: string;
    state: string;
    zipcode: string;
    country?: string;
  };
}

interface ShippingRate {
  service: string;
  carrier: string;
  rate: number; // Rate in cents
  estimatedDays?: number;
}

interface ShippingCalculationResult {
  shippingAmount: number; // Shipping cost in cents (cheapest rate)
  availableRates: ShippingRate[]; // All available shipping rates
  estimatedDays?: number; // Estimated delivery days
  error?: string;
}

/**
 * Calculate shipping rates using EasyPost API
 * 
 * @param params - Shipping calculation parameters
 * @returns Promise with shipping rates
 */
export const calculateShipping = async (
  params: ShippingCalculationParams
): Promise<ShippingCalculationResult> => {
  try {
    const {
      totalWeight,
      dimensions,
      address,
      fromAddress,
    } = params;

    // Default origin address (can be configured via environment variables)
    const originAddress = fromAddress || {
      street1: process.env.SHIPPING_ORIGIN_STREET1 || "123 Main St",
      city: process.env.SHIPPING_ORIGIN_CITY || "New York",
      state: process.env.SHIPPING_ORIGIN_STATE || "NY",
      zipcode: process.env.SHIPPING_ORIGIN_ZIPCODE || "10001",
      country: process.env.SHIPPING_ORIGIN_COUNTRY || "US",
    };

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
    const toAddress = new easypost.Address({
      street1: address.street1,
      street2: address.street2,
      city: address.city,
      state: address.state,
      zip: address.zipcode,
      country: address.country || "US",
    });

    // Create origin address
    const fromAddr = new easypost.Address({
      street1: originAddress.street1,
      street2: originAddress.street2,
      city: originAddress.city,
      state: originAddress.state,
      zip: originAddress.zipcode,
      country: originAddress.country || "US",
    });

    // Create shipment
    const shipment = new easypost.Shipment({
      to_address: toAddress,
      from_address: fromAddr,
      parcel: parcel,
    });

    // Get shipping rates
    const createdShipment = await shipment.save();
    const rates = createdShipment.rates || [];

    // Convert rates to our format
    const availableRates: ShippingRate[] = rates.map((rate: any) => ({
      service: rate.service || "",
      carrier: rate.carrier || "",
      rate: Math.round(parseFloat(rate.rate) * 100), // Convert to cents
      estimatedDays: rate.est_delivery_days
        ? parseInt(rate.est_delivery_days)
        : undefined,
    }));

    // Find cheapest rate
    const cheapestRate = availableRates.reduce((prev, current) =>
      prev.rate < current.rate ? prev : current
    );

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
 * @param address - Shipping address
 * @param fromAddress - Origin address (optional)
 * @returns Promise with shipping rates
 */
export const calculateOrderShipping = async (
  productWeights: number[],
  address: {
    street1: string;
    street2?: string;
    city: string;
    state: string;
    zipcode: string;
    country?: string;
  },
  productDimensions?: Array<{
    length: number;
    width: number;
    height: number;
  }>,
  fromAddress?: {
    street1: string;
    street2?: string;
    city: string;
    state: string;
    zipcode: string;
    country?: string;
  }
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
    address,
    fromAddress,
  });
};

/**
 * Get shipping rate configuration
 * This can be used to customize shipping rates per state, zipcode, etc.
 * 
 * @param state - State code
 * @param weight - Total weight in grams
 * @param address - Full address object
 * @returns Promise with shipping amount in cents
 */
export const getShippingRate = async (
  state: string,
  weight: number,
  address: {
    street1: string;
    street2?: string;
    city: string;
    state: string;
    zipcode: string;
    country?: string;
  }
): Promise<number> => {
  const result = await calculateShipping({
    totalWeight: weight,
    address,
  });

  return result.shippingAmount;
};
