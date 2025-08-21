# CORS Issue Fix Guide for Stripe Checkout Edge Function

## Problem Description

You're experiencing a CORS (Cross-Origin Resource Sharing) error when calling the `stripe-checkout` Edge Function from your production domain `https://backreform.co.uk`. The error message indicates:

```
Origin https://backreform.co.uk is not allowed by Access-Control-Allow-Origin. Status code: 500
```

## Root Cause

The issue is likely one of the following:

1. **Edge Function Not Deployed**: The `stripe-checkout` function may not be deployed to your production Supabase project
2. **Supabase Project-Level CORS Restrictions**: Your production Supabase project may have CORS restrictions that override the function-level settings
3. **Function-Level CORS Configuration**: The CORS headers in the Edge Function may not be properly configured

## Solution Steps

### Step 1: Deploy the Edge Function

First, ensure the `stripe-checkout` function is deployed to production:

```bash
# Navigate to your project directory
cd /path/to/your/ReformUK/project

# Deploy the function
supabase functions deploy stripe-checkout

# Or use the deployment script
./deploy-supabase.sh
```

### Step 2: Verify CORS Configuration

The Edge Function has been updated with proper CORS handling that includes your domain:

```typescript
const allowedOrigins = [
  'https://backreform.co.uk',
  'https://www.backreform.co.uk',
  'http://localhost:3000',
  'http://127.0.0.1:3000',
  'http://localhost:5173',
  'http://127.0.0.1:5173'
];
```

### Step 3: Check Supabase Project Settings

1. Go to your Supabase dashboard
2. Navigate to **Settings** > **API**
3. Check if there are any CORS restrictions set at the project level
4. Ensure your domain `https://backreform.co.uk` is allowed

### Step 4: Test the CORS Configuration

Use the provided `test-cors.html` file to test the CORS configuration:

1. Open `test-cors.html` in your browser
2. Update the `SUPABASE_URL` variable to match your project URL
3. Run the tests to verify CORS is working correctly

### Step 5: Monitor Function Logs

Check the Edge Function logs for any errors:

```bash
supabase functions logs stripe-checkout
```

## Alternative Solutions

### Option 1: Use Supabase Client (Recommended)

Instead of calling the Edge Function directly, use the Supabase client which handles CORS automatically:

```typescript
import { supabase } from './lib/supabase';

const { data, error } = await supabase.functions.invoke('stripe-checkout', {
  body: checkoutRequest
});
```

### Option 2: Proxy Through Your Backend

If CORS issues persist, you can proxy the request through your backend server.

### Option 3: Update Supabase Project CORS Settings

In your Supabase dashboard, go to **Settings** > **API** and add your domain to the allowed origins.

## Testing

1. **Local Testing**: Test with `http://localhost:3000` or `http://localhost:5173`
2. **Production Testing**: Test with `https://backreform.co.uk`
3. **CORS Test Page**: Use the provided `test-cors.html` for comprehensive testing

## Common Issues and Solutions

### Issue: Function Returns 500 Error
- Check function logs: `supabase functions logs stripe-checkout`
- Verify environment variables are set correctly
- Check Stripe API key configuration

### Issue: CORS Still Blocked After Deployment
- Clear browser cache
- Check if there are multiple Supabase projects
- Verify the function is deployed to the correct project

### Issue: Function Not Found (404)
- Ensure the function is deployed: `supabase functions list`
- Check the function name matches exactly: `stripe-checkout`

## Verification Checklist

- [ ] Edge Function is deployed to production
- [ ] CORS headers are properly set in the function
- [ ] Domain `https://backreform.co.uk` is in allowed origins
- [ ] Function logs show successful requests
- [ ] CORS test page passes all tests
- [ ] Production checkout flow works without CORS errors

## Next Steps

After implementing these fixes:

1. Test the checkout flow in production
2. Monitor function logs for any remaining issues
3. Update your deployment process to include the `stripe-checkout` function
4. Consider implementing error monitoring for production Edge Functions

## Support

If issues persist after following this guide:

1. Check Supabase community forums
2. Review Supabase documentation on Edge Functions and CORS
3. Contact Supabase support if it's a platform-level issue
4. Check your browser's developer console for detailed error messages
