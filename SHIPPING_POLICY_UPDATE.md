# Shipping Policy Update

## 🚚 Overview

We've updated our shipping policy to provide **transparent, cost-effective shipping** that works seamlessly with our Printful fulfillment partner.

## 🔄 What Changed

### Before (Removed)
- ❌ Free shipping on orders over £50
- ❌ Complex shipping cost overrides
- ❌ Potential cost overruns from international fulfillment

### After (New Policy)
- ✅ **Best shipping rates** from Printful
- ✅ **Bulk shipping optimization** for multiple items
- ✅ **Transparent pricing** - customers see actual costs upfront
- ✅ **Flexible fulfillment** - Printful can optimize shipping routes

## 💡 Benefits

### For Customers
- **Clear pricing** - no hidden shipping costs
- **Best rates** - Printful's optimized shipping network
- **Bulk savings** - multiple items ship together at better rates

### For Business
- **Cost control** - no unexpected shipping expenses
- **Simpler integration** - direct Printful shipping rates
- **Flexible fulfillment** - Printful can ship from optimal locations

## 🛍️ How It Works

### Single Items
- Shipping calculated based on destination and item weight
- Standard rates from Printful's network

### Multiple Items
- **Bulk shipping optimization** - items ship together when possible
- **Combined rates** - often cheaper than shipping items separately
- **Smart routing** - Printful chooses the most cost-effective fulfillment center

### Bundle Orders
- All bundle items ship together
- Single shipping cost for the entire bundle
- Optimized packaging and shipping

## 🌍 Shipping Destinations

- **Primary**: United Kingdom
- **Future**: International shipping (when Printful expands coverage)
- **Fulfillment**: Printful's global network of fulfillment centers

## 📦 Shipping Options

### Standard Delivery
- **Cost**: Calculated based on destination and items
- **Time**: 3-5 business days (UK)
- **Features**: Tracking included

### Express Delivery
- **Cost**: Calculated based on destination and items  
- **Time**: 2-3 business days (UK)
- **Features**: Priority handling, tracking included

## 💰 Pricing Examples

### Single Item (T-Shirt)
- **Product**: £24.99
- **Shipping**: £3.99 (standard UK)
- **Total**: £28.98

### Bundle (Starter Bundle)
- **Bundle**: £49.99 (10% discount applied)
- **Shipping**: £4.99 (bulk rate for 3 items)
- **Total**: £54.98

### Multiple Individual Items
- **3 T-Shirts**: £74.97
- **Shipping**: £5.99 (bulk rate)
- **Total**: £80.96

## 🔧 Technical Implementation

### Shipping Calculation
- Uses Printful's live shipping API
- No hardcoded shipping costs
- Real-time rate calculation based on:
  - Destination address
  - Item weights and dimensions
  - Available shipping methods

### Bulk Optimization
- Printful automatically groups items when beneficial
- Combined shipping rates applied
- Single tracking number for multiple items

## 📋 Updated Components

The following components have been updated to reflect the new shipping policy:

- `CartDrawer.tsx` - Updated messaging
- `CheckoutPage.tsx` - Removed free shipping promises
- `ProductBundles.tsx` - Removed free shipping badges
- `ShippingInfoPage.tsx` - Updated shipping options display
- `Hero.tsx` - Updated main messaging
- `Footer.tsx` - Updated footer messaging
- Individual bundle pages - Removed free shipping references

## 🎯 Next Steps

1. **Test shipping integration** with Printful
2. **Monitor customer feedback** on new shipping policy
3. **Optimize bulk shipping** rates and packaging
4. **Consider international expansion** when Printful coverage improves

## 📞 Support

For questions about shipping rates or delivery times, customers can:
- Check shipping costs at checkout
- Contact support for bulk order inquiries
- Review shipping information on product pages

---

*This policy update ensures we can provide the best possible shipping experience while maintaining cost transparency and operational efficiency.*
