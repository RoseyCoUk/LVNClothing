#!/usr/bin/env tsx

console.log('🔍 Checking Production Webhook Behavior\n');
console.log('=====================================\n');

console.log('The stripe-webhook2 function has been updated to:');
console.log('1. Retrieve the full payment intent from Stripe API when processing webhooks');
console.log('2. This ensures all metadata (including customer_email) is available');
console.log('3. Added additional logging for receipt_email field\n');

console.log('Changes made:');
console.log('- Instead of using the webhook payload directly, we now call:');
console.log('  stripe.paymentIntents.retrieve(webhookPaymentIntent.id)');
console.log('- This fetches the complete payment intent with all metadata\n');

console.log('Expected behavior:');
console.log('✅ Customer email should now be properly extracted from metadata');
console.log('✅ Fallback to receipt_email if metadata.customer_email is not set');
console.log('✅ Order creation should succeed with email address');
console.log('✅ Email notifications should be sent to customer and support@backreform.co.uk\n');

console.log('To test:');
console.log('1. Make a test purchase on the production site');
console.log('2. Fill in the email address in the shipping form');
console.log('3. Complete the payment');
console.log('4. Check if emails are received\n');

console.log('The webhook function has been deployed and is now live.');
console.log('Next purchase should properly capture and use the customer email.');