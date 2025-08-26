# API Configuration Guide - Reform UK Checkout System

## Current Status: ✅ **FUNCTIONS WORKING, NEED API KEYS**

The checkout system is now fully functional locally, but requires API keys to work with real services.

## Quick Setup (5 minutes)

### 1. Get Stripe Test API Key
1. Go to: https://dashboard.stripe.com/test/apikeys
2. Copy your **Secret key** (starts with `sk_test_`)
3. Add it to `supabase/.env.local`:
   ```bash
   STRIPE_SECRET_KEY=sk_test_your_actual_key_here
   ```

### 2. Get Printful API Token
1. Go to: https://www.printful.com/dashboard/api
2. Copy your **API key**
3. Add it to `supabase/.env.local`:
   ```bash
   PRINTFUL_TOKEN=your_actual_printful_token_here
   ```

### 3. Restart Functions
```bash
# Stop current functions (Ctrl+C if running)
# Then restart with new environment:
supabase functions serve --env-file supabase/.env.local
```

### 4. Test Again
Open `test-checkout-fix.html` and run all tests. They should now pass completely.

## What This Will Enable

✅ **Real Stripe checkout sessions**  
✅ **Live Printful product pricing**  
✅ **Dynamic shipping quotes**  
✅ **Complete payment processing**  
✅ **Test 7 will pass completely**  

## Troubleshooting

### If functions still show "Load failed":
1. Make sure Supabase is running: `supabase start`
2. Check functions are served: `supabase functions serve --env-file supabase/.env.local`
3. Verify API keys are correct in `supabase/.env.local`

### If you get Stripe API errors:
- Ensure you're using **test** keys, not production keys
- Test keys start with `sk_test_`
- Production keys start with `sk_live_`

### If you get Printful API errors:
- Verify your API token is active
- Check if you have the correct permissions
- Ensure your Printful account is active

## Next Steps After Configuration

1. **Test the checkout flow** with real products
2. **Verify Test 7 passes** completely
3. **Test with real payment methods** (Stripe test cards)
4. **Deploy to production** when ready

## Test Cards for Stripe

Use these test card numbers:
- **Visa**: 4242 4242 4242 4242
- **Mastercard**: 5555 5555 5555 4444
- **Expiry**: Any future date
- **CVC**: Any 3 digits
- **ZIP**: Any valid ZIP code

## Need Help?

If you encounter issues:
1. Check the browser console for errors
2. Verify API keys are correctly formatted
3. Ensure functions are running with `supabase functions serve`
4. Check Supabase status with `supabase status`
