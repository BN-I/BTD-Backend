# EasyPost Shipping Integration Setup

## Environment Variables Required

Add the following environment variables to your `.env` file:

```env
# EasyPost API Key (get from https://www.easypost.com/)
EASYPOST_API_KEY=your_easypost_api_key_here

# Shipping Origin Address (your warehouse/fulfillment center)
SHIPPING_ORIGIN_STREET1=123 Main St
SHIPPING_ORIGIN_CITY=New York
SHIPPING_ORIGIN_STATE=NY
SHIPPING_ORIGIN_ZIPCODE=10001
SHIPPING_ORIGIN_COUNTRY=US
```

## Product Model Updates

Products now require:

- **weight** (in grams) - Required for shipping calculation
- **length** (in centimeters) - Optional, for more accurate shipping
- **width** (in centimeters) - Optional, for more accurate shipping
- **height** (in centimeters) - Optional, for more accurate shipping

## How It Works

1. **Weight-based calculation**: EasyPost uses the total weight of all products in the order (in grams, converted to ounces for EasyPost API)

2. **Dimension-based calculation**: If product dimensions are provided, EasyPost uses them for more accurate rate calculation

3. **Multiple carriers**: EasyPost returns rates from multiple carriers (USPS, UPS, FedEx, etc.) and selects the cheapest option

4. **Fallback**: If EasyPost API fails, the system falls back to a simple weight-based calculation

## API Usage

### Request Format

When calling `/api/stripe/payment-sheet`, include:

```json
{
  "id": "user_id",
  "orderedGifts": [
    {
      "product": "product_id",
      "price": 29.99,
      "vendor": "vendor_id",
      "selectedVariations": {
        "color": "red",
        "size": "M"
      }
    }
  ],
  "address": {
    "line1": "123 Shipping St",
    "line2": "Apt 4B",
    "city": "Los Angeles",
    "state": "CA",
    "zipcode": "90001",
    "country": "US"
  }
}
```

### Response Format

The response includes shipping calculation breakdown:

```json
{
  "paymentIntent": "...",
  "ephemeralKey": "...",
  "customer": "...",
  "publishableKey": "...",
  "calculation": {
    "subtotal": 2999,
    "taxAmount": 240,
    "shippingAmount": 800,
    "totalAmount": 4039,
    "taxRate": 8.0,
    "estimatedDeliveryDays": 3
  }
}
```

## Testing

1. **Test Mode**: Use EasyPost test API key for development
2. **Production**: Use EasyPost production API key for live orders

## Notes

- All weights should be in **grams**
- All dimensions should be in **centimeters**
- EasyPost automatically converts to the required units (ounces and inches)
- Shipping rates are returned in cents for consistency with Stripe
