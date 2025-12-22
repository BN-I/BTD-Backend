import { stripe } from "../utils/stripeInstance";

interface TaxCalculationParams {
  amount: number; // Amount in cents
  currency: string;
  address: {
    line1: string;
    city: string;
    state: string;
    postal_code: string;
    country: string;
  };
  customerId?: string;
}

interface TaxCalculationResult {
  taxAmount: number; // Tax amount in cents
  totalAmount: number; // Total amount including tax in cents
  taxRate?: number; // Tax rate percentage
}

/**
 * Calculate tax using Stripe Tax
 * Note: Stripe Tax is automatically calculated when creating a PaymentIntent
 * with automatic_tax enabled. This function provides an estimate based on
 * typical US tax rates, but actual tax will be calculated by Stripe during payment.
 * 
 * For accurate tax calculation, Stripe will handle it automatically when
 * the PaymentIntent is created with automatic_tax enabled.
 * 
 * @param params - Tax calculation parameters
 * @returns Promise with estimated tax amount and total amount
 */
export const calculateTax = async (
  params: TaxCalculationParams
): Promise<TaxCalculationResult> => {
  try {
    const { amount, currency, address } = params;

    // Basic US state tax rate estimation (as fallback)
    // Stripe Tax will calculate the actual tax when PaymentIntent is created
    // This is just an estimate for display purposes
    const stateTaxRates: { [key: string]: number } = {
      CA: 7.25, // California
      NY: 8.0, // New York
      TX: 6.25, // Texas
      FL: 6.0, // Florida
      IL: 6.25, // Illinois
      PA: 6.0, // Pennsylvania
      OH: 5.75, // Ohio
      GA: 4.0, // Georgia
      NC: 4.75, // North Carolina
      MI: 6.0, // Michigan
    };

    // Get tax rate for state (default to 6% if not found)
    const stateTaxRate = stateTaxRates[address.state.toUpperCase()] || 6.0;
    const estimatedTaxAmount = Math.round((amount * stateTaxRate) / 100);
    const totalAmount = amount + estimatedTaxAmount;

    return {
      taxAmount: estimatedTaxAmount,
      totalAmount: totalAmount,
      taxRate: stateTaxRate,
    };
  } catch (error: any) {
    console.error("Error calculating tax:", error);

    // Fallback: return zero tax if calculation fails
    return {
      taxAmount: 0,
      totalAmount: params.amount,
      taxRate: 0,
    };
  }
};

/**
 * Calculate tax for an order with multiple line items
 * This is a simpler approach that estimates tax based on subtotal
 * 
 * @param subtotal - Subtotal amount in cents
 * @param currency - Currency code (default: 'usd')
 * @param address - Shipping address
 * @param customerId - Optional Stripe customer ID
 * @returns Promise with tax amount and total amount
 */
export const calculateOrderTax = async (
  subtotal: number,
  currency: string = "usd",
  address: {
    line1: string;
    city: string;
    state: string;
    postal_code: string;
    country: string;
  },
  customerId?: string
): Promise<TaxCalculationResult> => {
  return calculateTax({
    amount: subtotal,
    currency,
    address,
    customerId,
  });
};

