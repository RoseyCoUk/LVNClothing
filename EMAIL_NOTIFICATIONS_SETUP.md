# 📧 Email Notifications Setup Guide

## Overview
LVN Clothing now includes a comprehensive email notification system for order confirmations, shipping updates, and delivery notifications.

## Setup Instructions

### 1. Resend API Configuration
1. Sign up at [Resend.com](https://resend.com)
2. Create an API key in your Resend dashboard
3. Add the API key to your Supabase environment variables:
   ```bash
   # In Supabase Dashboard > Settings > Environment Variables
   RESEND_API_KEY=your_resend_api_key_here
   ```

### 2. Domain Verification (Production)
1. In Resend dashboard, add your domain `lvnclothing.com`
2. Add the required DNS records for domain verification
3. Update the `from` email in the function to use your verified domain

### 3. Deploy Email Function
```bash
# Deploy the email function to Supabase
supabase functions deploy send-order-email
```

### 4. Test Email Functionality
```javascript
import { sendOrderConfirmation } from '../lib/emailService';

// Example usage in checkout process
const testEmail = async () => {
  const success = await sendOrderConfirmation(
    'customer@example.com',
    'John Doe',
    'ORD-001',
    89.99,
    [
      { name: 'LVN Premium Hoodie', quantity: 1, price: 89.99 }
    ]
  );
  
  if (success) {
    console.log('Order confirmation sent!');
  }
};
```

## Email Templates

The system includes three beautiful email templates:

### 1. Order Confirmation (`confirmation`)
- Sent immediately after successful checkout
- Includes order details, items, and total
- Matthew 13:33 scripture reference
- LVN branding with maroon color scheme

### 2. Shipping Notification (`shipped`)
- Sent when order status changes to "shipped"
- Includes tracking information
- Estimated delivery timeframe

### 3. Delivery Confirmation (`delivered`)
- Sent when order is marked as delivered
- Encourages social media sharing
- Links to shop again

## Integration Points

### Checkout Process
Add to your checkout success handler:
```typescript
import { sendOrderConfirmation } from '../lib/emailService';

// After successful order creation
await sendOrderConfirmation(
  order.customer_email,
  order.customer_name,
  order.id,
  order.total,
  order.items
);
```

### Admin Dashboard
Add email triggers when updating order status:
```typescript
import { sendShippingNotification, sendDeliveryConfirmation } from '../lib/emailService';

// When marking order as shipped
if (newStatus === 'shipped') {
  await sendShippingNotification(
    order.customer_email,
    order.customer_name,
    order.id,
    order.total,
    order.items
  );
}

// When marking order as delivered
if (newStatus === 'delivered') {
  await sendDeliveryConfirmation(
    order.customer_email,
    order.customer_name,
    order.id,
    order.total,
    order.items
  );
}
```

## Email Features

✅ **Premium Design** - LVN branded templates with Matthew 13:33  
✅ **Mobile Responsive** - Optimized for all email clients  
✅ **Order Details** - Complete itemized breakdown  
✅ **Scripture Integration** - Matthew 13:33 leaven message  
✅ **Social Links** - Instagram, Facebook, Twitter, TikTok  
✅ **Unsubscribe** - Compliance with email regulations  
✅ **Error Handling** - Graceful failure with logging  

## Monitoring & Analytics

### Email Delivery Tracking
- Resend provides delivery analytics
- Track open rates, click rates, bounces
- Monitor email reputation

### Error Handling
- Failed emails are logged to console
- Returns boolean success/failure
- Graceful degradation (order still processes if email fails)

## Security & Compliance

### Data Privacy
- Customer emails are only used for order notifications
- No marketing emails without explicit consent
- Unsubscribe links in all emails

### Rate Limiting
- Resend handles rate limiting automatically
- Built-in retry logic for failed sends

## Customization

### Template Modifications
Edit `supabase/functions/send-order-email/index.ts` to customize:
- Email styling and layout
- Scripture references
- Social media links
- Company information

### Additional Email Types
Add new email types by:
1. Adding new type to `EmailOrderData` interface
2. Adding template logic in `generateEmailHTML`
3. Creating helper function in `emailService.ts`

## Production Checklist

- [ ] Resend API key configured
- [ ] Domain verified with Resend
- [ ] Email function deployed to Supabase
- [ ] Test emails sent successfully
- [ ] Checkout integration complete
- [ ] Admin dashboard integration complete
- [ ] Email templates reviewed and approved
- [ ] Unsubscribe page created
- [ ] Privacy policy updated

## Support

For issues with email delivery:
1. Check Supabase function logs
2. Verify Resend API key is correct
3. Confirm domain verification status
4. Test with different email addresses

**Email notifications are now ready to keep your customers informed throughout their LVN Clothing journey! 📧✨**
