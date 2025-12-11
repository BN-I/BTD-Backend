interface ShippingCalculationParams {
  totalWeight: number; // Total weight in pounds
  address: {
    state: string;
    city?: string;
    zipcode: string;
  };
}

interface ShippingCalculationResult {
  shippingAmount: number; // Shipping cost in cents
  estimatedDays?: number; // Estimated delivery days
}

/**
 * Simple weight-based shipping calculation
 * This is a basic implementation that can be customized based on your needs
 * 
 * Shipping rates (in cents):
 * - 0-1 lbs: $5.00 (500 cents)
 * - 1-5 lbs: $8.00 (800 cents)
 * - 5-10 lbs: $12.00 (1200 cents)
 * - 10-20 lbs: $18.00 (1800 cents)
 * - 20+ lbs: $25.00 (2500 cents)
 * 
 * @param params - Shipping calculation parameters
 * @returns Shipping amount in cents
 */
export const calculateShipping = (
  params: ShippingCalculationParams
): ShippingCalculationResult => {
  const { totalWeight } = params;

  // Default shipping rates based on weight (in cents)
  let shippingAmount = 0;

  if (totalWeight <= 0) {
    shippingAmount = 0;
  } else if (totalWeight <= 1) {
    shippingAmount = 500; // $5.00
  } else if (totalWeight <= 5) {
    shippingAmount = 800; // $8.00
  } else if (totalWeight <= 10) {
    shippingAmount = 1200; // $12.00
  } else if (totalWeight <= 20) {
    shippingAmount = 1800; // $18.00
  } else {
    shippingAmount = 2500; // $25.00
  }

  // Estimate delivery days based on weight (optional)
  let estimatedDays = 3; // Default 3 days
  if (totalWeight > 20) {
    estimatedDays = 5;
  } else if (totalWeight > 10) {
    estimatedDays = 4;
  }

  return {
    shippingAmount,
    estimatedDays,
  };
};

/**
 * Calculate shipping for multiple products based on their total weight
 * 
 * @param productWeights - Array of product weights in pounds
 * @param address - Shipping address
 * @returns Shipping amount in cents
 */
export const calculateOrderShipping = (
  productWeights: number[],
  address: {
    state: string;
    city?: string;
    zipcode: string;
  }
): ShippingCalculationResult => {
  // Sum all product weights
  const totalWeight = productWeights.reduce((sum, weight) => sum + weight, 0);

  return calculateShipping({
    totalWeight,
    address,
  });
};

/**
 * Get shipping rate configuration
 * This can be used to customize shipping rates per state, zipcode, etc.
 * 
 * @param state - State code
 * @param weight - Total weight in pounds
 * @returns Shipping amount in cents
 */
export const getShippingRate = (
  state: string,
  weight: number
): number => {
  // You can customize rates per state here
  // For now, using the standard weight-based calculation
  const result = calculateShipping({
    totalWeight: weight,
    address: {
      state,
      zipcode: "",
    },
  });

  return result.shippingAmount;
};

