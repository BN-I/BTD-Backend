import { OrderedProduct } from "../types/types";
import Product from "../models/product";
import { calculateOrderTax } from "../service/taxCalculator";
import { calculateOrderShipping } from "../service/shippingCalculator";

interface OrderCalculationParams {
  orderedGifts: OrderedProduct[];
  address: {
    line1: string;
    line2?: string;
    city: string;
    state: string;
    zipcode: string;
    country?: string;
  };
  customerId?: string;
  currency?: string;
  fromAddress?: {
    street1: string;
    street2?: string;
    city: string;
    state: string;
    zipcode: string;
    country?: string;
  };
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

  // Get weights and dimensions for all products
  const productWeights: number[] = orderedGifts.map((gift) => {
    const product = productMap.get(gift.product.toString());
    return product?.weight || 0; // Weight in grams
  });

  const productDimensions = orderedGifts.map((gift) => {
    const product = productMap.get(gift.product.toString());
    return {
      length: product?.length || 0, // Length in cm
      width: product?.width || 0, // Width in cm
      height: product?.height || 0, // Height in cm
    };
  });

  // Calculate shipping using EasyPost
  const shippingResult = await calculateOrderShipping(
    productWeights,
    {
      street1: address.line1,
      street2: address.line2,
      city: address.city,
      state: address.state,
      zipcode: address.zipcode,
      country: address.country || "US",
    },
    productDimensions,
    params.fromAddress
  );

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

