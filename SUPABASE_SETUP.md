# Supabase + Stripe Integration Setup Guide

This guide covers the complete setup for automatic email triggering, RLS policy fixes, and manual testing capabilities.

## 🚀 Overview

The integration includes:
1. **Automatic email triggering** via database triggers
2. **Fixed RLS policies** for manual testing
3. **Enhanced webhook processing** with email calls
4. **Manual test Edge Function** for development

## 📋 Prerequisites

- Supabase project with Edge Functions enabled
- Stripe account with webhook endpoint configured
- Resend account for email delivery
- Environment variables configured

## 🔧 Environment Variables

### Supabase Dashboard Settings

Add these to your Supabase project's environment variables:

```bash
# Stripe Configuration
STRIPE_SECRET_KEY=sk_live_... or sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Email Configuration
RESEND_API_KEY=re_...

# Supabase Configuration (auto-configured)
SUPABASE_URL=https://your-project-ref.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJ...
```

### Frontend Environment Variables

Add to your `.env.local`:

```bash
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_ANON_KEY=eyJ...
VITE_STRIPE_PUBLISHABLE_KEY=pk_live_... or pk_test_...
```

## 🗄️ Database Setup

### 1. Run Migrations

Deploy the migrations in order:

```bash
# Initial schema
supabase db push

# Readable order ID with trigger
supabase db push

# Email trigger and RLS fixes
supabase db push
```

### 2. Database Tables

The system includes these key tables:

1. **orders** - Main order records with readable_order_id
2. **order_items** - Individual line items for each order
3. **products** - Product catalog
4. **product_variants** - Product variations and pricing

### 3. Database Triggers

The system includes triggers for:

1. **Readable Order ID Generation** - Automatically generates human-readable order IDs
2. **Order Items Management** - Links individual items to orders

### 4. RLS Policies

Updated policies allow:
- Service role full access to orders
- Authenticated users to view their own orders
- Anonymous users to view orders (guest checkout)
- Manual testing via Edge Functions

## 🔄 Edge Functions

### 1. Deploy Functions

```bash
# Deploy all functions
supabase functions deploy

# Or deploy individually
supabase functions deploy stripe-webhook
supabase functions deploy send-order-email
supabase functions deploy manual-test-insert
```

### 2. Function Overview

#### `stripe-webhook`
- Processes Stripe checkout.session.completed events
- Inserts orders into database
- Calls email function automatically
- Handles readable_order_id generation via trigger

#### `send-order-email`
- Sends order confirmation emails via Resend
- Uses direct order_id lookup for fast, reliable order retrieval
- Includes fallback to session_id lookup for legacy support
- Formats emails with order details and readable_order_id

#### `manual-test-insert`
- Allows manual insertion of test orders
- Bypasses RLS policies using service role
- Automatically triggers email sending
- Used for development and testing

## 🧪 Testing

### 1. Manual Test Mode

Use the TestPaymentFlow component in your frontend:

1. Navigate to `/test-payment-flow`
2. Select checkout type (user/guest)
3. Enter test email
4. Click "Insert Manual Test Data"
5. Verify email delivery

### 2. Real Payment Flow

1. Add items to cart
2. Proceed to checkout
3. Complete Stripe payment
4. Verify webhook processing
5. Check email delivery

### 3. Debugging

Check Supabase logs for:
- Edge Function execution
- Database trigger logs
- Email delivery status

## 📧 Email Configuration

### Resend Setup

1. Create Resend account
2. Add domain verification
3. Configure sending domain
4. Add API key to environment variables

### Email Template

The system uses a responsive HTML template with:
- Order confirmation details
- Product list with prices
- Readable order ID display
- Fallback for processing orders

## 🔍 Troubleshooting

### Common Issues

1. **RLS Policy Violations**
   - Ensure service role key is used for database operations
   - Check RLS policies are properly applied

2. **Email Not Sending**
   - Verify Resend API key is correct
   - Check email template formatting
   - Review Edge Function logs

3. **Readable Order ID Missing**
   - Check database trigger is active
   - Verify trigger function permissions
   - Review migration execution
   - Check order lookup method (order_id vs session_id)

4. **Order Items Not Found**
   - Verify order_items table exists
   - Check foreign key relationships
   - Ensure order_items are being inserted with orders
   - Review RLS policies for order_items table

5. **Webhook Failures**
   - Verify Stripe webhook secret
   - Check webhook endpoint URL
   - Review Edge Function logs

### Debug Commands

```bash
# Check Edge Function logs
supabase functions logs stripe-webhook
supabase functions logs send-order-email
supabase functions logs manual-test-insert

# Check database triggers
supabase db diff

# Test Edge Functions locally
supabase functions serve

# Monitor order lookup performance
# The system now uses direct order_id lookup for faster email delivery
```

## 🔐 Security Considerations

1. **Service Role Key**: Only use in Edge Functions, never expose to frontend
2. **Webhook Verification**: Always verify Stripe webhook signatures
3. **RLS Policies**: Ensure proper access controls
4. **Environment Variables**: Keep secrets secure

## 📈 Monitoring

### Key Metrics to Monitor

1. **Email Delivery Rate**: Track successful email sends
2. **Webhook Success Rate**: Monitor Stripe webhook processing
3. **Order Creation**: Track successful order insertions
4. **Error Rates**: Monitor Edge Function failures

### Log Analysis

Use Supabase logs to monitor:
- Edge Function execution times
- Database operation success rates
- Email delivery status
- Error patterns and frequency

## 🚀 Production Deployment

1. **Environment**: Switch to production Stripe keys
2. **Domain**: Configure production domain for emails
3. **Monitoring**: Set up error tracking and alerts
4. **Testing**: Verify all flows work in production
5. **Backup**: Ensure database backups are configured

## 📞 Support

For issues or questions:
1. Check Supabase logs first
2. Review this documentation
3. Test with manual test mode
4. Contact support with specific error details

---

**Last Updated**: January 2025
**Version**: 1.0.0 