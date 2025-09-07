// Debug script to check webhook configuration
console.log('🔍 Webhook Debug Information');
console.log('============================\n');

// 1. Check Supabase Edge Function URL
console.log('1. WEBHOOK ENDPOINT URL:');
console.log('   https://nsmrxwnrtsllxvplazmm.supabase.co/functions/v1/stripe-webhook2');
console.log('   ✅ This should be exactly what\'s in your Stripe Dashboard\n');

// 2. Check environment variables
console.log('2. ENVIRONMENT VARIABLES TO VERIFY:');
console.log('   In Supabase Dashboard (Settings > Edge Functions > Secrets):');
console.log('   - STRIPE_SECRET_KEY (should start with sk_test_)');
console.log('   - STRIPE_WEBHOOK_SECRET (should be: whsec_7l63cpQ2ETfRw5lkLPlX6RwtIZwYeDKG)');
console.log('   - RESEND_API_KEY (for sending emails)');
console.log('   - SUPABASE_SERVICE_ROLE_KEY (should be set automatically)\n');

// 3. Test webhook endpoint directly
console.log('3. TEST WEBHOOK ENDPOINT:');
console.log('   Run this command to test if the endpoint is accessible:');
console.log('   curl -X POST https://nsmrxwnrtsllxvplazmm.supabase.co/functions/v1/stripe-webhook2 \\');
console.log('     -H "Content-Type: application/json" \\');
console.log('     -H "stripe-signature: test" \\');
console.log('     -d \'{"test": true}\'');
console.log('   Expected: Should get an error about invalid signature (not 401)\n');

// 4. Check Stripe Dashboard
console.log('4. STRIPE DASHBOARD CHECKS:');
console.log('   Go to: https://dashboard.stripe.com/test/webhooks');
console.log('   Click on your webhook endpoint');
console.log('   Check the "Webhook attempts" tab');
console.log('   Look for your recent payment attempts');
console.log('   - What status code do they show? (200, 401, 500?)');
console.log('   - Click on an attempt to see the full error message\n');

// 5. Payment Intent IDs
console.log('5. YOUR RECENT PAYMENT INTENT IDs:');
console.log('   From your console logs:');
console.log('   - pi_3S4ZFb6AAjJ6M3ik01lcJCJ3');
console.log('   - pi_3S4YmU6AAjJ6M3ik0782Ep5f');
console.log('   Search for these in Stripe Dashboard to verify they exist\n');

// 6. Questions to answer
console.log('6. PLEASE PROVIDE:');
console.log('   a) What status code shows in Stripe webhook attempts?');
console.log('   b) What error message (if any) appears?');
console.log('   c) Are you using Stripe TEST keys everywhere?');
console.log('   d) In Netlify env vars, what Stripe keys are set?');
console.log('   e) Can you see any logs in Supabase Dashboard > Functions > Logs?');

console.log('\n7. CRITICAL CHECK:');
console.log('   The webhook signing secret MUST match exactly:');
console.log('   - In Stripe Dashboard webhook settings');
console.log('   - In Supabase Edge Function secrets');
console.log('   - Should be: whsec_7l63cpQ2ETfRw5lkLPlX6RwtIZwYeDKG');

console.log('\n8. FUNCTION DEPLOYMENT:');
console.log('   Last deployed with --no-verify-jwt flag');
console.log('   This means NO authorization header should be required');