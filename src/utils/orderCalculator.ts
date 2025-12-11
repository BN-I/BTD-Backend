import { OrderedProduct } from "../types/types";
import Product from "../models/product";
import { calculateOrderTax } from "../service/taxCalculator";
import { calculateOrderShipping } from "../service/shippingCalculator";

interface OrderCalculationParams {
  orderedGifts: OrderedProduct[];
  address: {
    line1: string;
    city: string;
    state: string;
    zipcode: string;
    country?: string;
  };
  customerId?: string;
  currency?: string;
}

interface OrderCalculationResult {
  subtotal: number; // Subtotal in cents
  taxAmount: number; // Tax amount in cents
  shippingAmount: number; // Shipping amount in cents
  totalAmount: number; // Total amount in cents
  taxRate?: number; // Tax rate percentage
  estimatedDeliveryDays?: number;
}

/**
 * Calculate complete order totals including subtotal, tax, and shipping
 * 
 * @param params - Order calculation parameters
 * @returns Promise with all order totals
 */
export const calculateOrderTotals = async (
  params: OrderCalculationParams
): Promise<OrderCalculationResult> => {
  const { orderedGifts, address, customerId, currency = "usd" } = params;

  // Calculate subtotal from ordered gifts
  const subtotal = orderedGifts.reduce(
    (sum, gift) => sum + Math.round(gift.price * 100), // Convert to cents
    0
  );

  // Fetch products to get weights
  const productIds = orderedGifts.map((gift) => gift.product);
  const products = await Product.find({ _id: { $in: productIds } });

  // Create a map for quick product lookup
  const productMap = new Map();
  products.forEach((product: any) => {
    productMap.set(product._id.toString(), product);
  });

  // Get weights for all products
  const productWeights: number[] = orderedGifts.map((gift) => {
    const product = productMap.get(gift.product.toString());
    return product?.weight || 0; // Default to 0 if weight not set
  });

  // Calculate shipping based on total weight
  const shippingResult = calculateOrderShipping(productWeights, {
    state: address.state,
    city: address.city,
    zipcode: address.zipcode,
  });

  // Calculate tax using Stripe Tax
  const taxResult = await calculateOrderTax(
    subtotal,
    currency,
    {
      line1: address.line1,
      city: address.city,
      state: address.state,
      postal_code: address.zipcode,
      country: address.country || "US",
    },
    customerId
  );

  // Calculate total amount
  const totalAmount = subtotal + taxResult.taxAmount + shippingResult.shippingAmount;

  return {
    subtotal,
    taxAmount: taxResult.taxAmount,
    shippingAmount: shippingResult.shippingAmount,
    totalAmount,
    taxRate: taxResult.taxRate,
    estimatedDeliveryDays: shippingResult.estimatedDays,
  };
};

