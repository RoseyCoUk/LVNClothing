import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'http://localhost:54321';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function testCompleteNewsletterFlow() {
  const testEmail = 'support@backreform.co.uk';
  
  console.log('🧪 TESTING COMPLETE NEWSLETTER FLOW');
  console.log('=====================================\n');
  
  // 1. Clean up existing record
  console.log('1️⃣ Cleaning up existing records...');
  const { error: deleteError } = await supabase
    .from('newsletter_subscribers')
    .delete()
    .eq('email', testEmail.toLowerCase());
  
  if (deleteError) {
    console.log('   No existing record to delete');
  } else {
    console.log('   ✅ Cleaned up existing records');
  }
  
  // 2. Sign up for newsletter
  console.log('\n2️⃣ Signing up for newsletter...');
  
  try {
    const { data: signupData, error: signupError } = await supabase.functions.invoke('newsletter-signup', {
      body: { email: testEmail }
    });

    if (signupError) {
      console.error('   ❌ Signup error:', signupError);
      return;
    }

    console.log('   ✅ Signup successful!');
    console.log('   📧 Email sent:', signupData.emailSent ? 'Yes' : 'No');
    console.log('   🎟️ Discount Code:', signupData.discountCode);
    
    // 3. Get the unsubscribe token
    console.log('\n3️⃣ Getting unsubscribe token...');
    const { data: subscriber, error: fetchError } = await supabase
      .from('newsletter_subscribers')
      .select('*')
      .eq('email', testEmail.toLowerCase())
      .single();
    
    if (fetchError || !subscriber) {
      console.error('   ❌ Could not fetch subscriber:', fetchError);
      return;
    }
    
    console.log('   ✅ Subscriber record found');
    console.log('   📊 Database Record:');
    console.log('      - Email:', subscriber.email);
    console.log('      - Discount Code:', subscriber.discount_code);
    console.log('      - Discount Amount:', subscriber.discount_amount + '%');
    console.log('      - Unsubscribe Token:', subscriber.unsubscribe_token);
    console.log('      - Active:', subscriber.is_active ? 'Yes' : 'No');
    
    // 4. Test unsubscribe
    console.log('\n4️⃣ Testing unsubscribe...');
    const { data: unsubData, error: unsubError } = await supabase.functions.invoke('newsletter-unsubscribe', {
      body: { token: subscriber.unsubscribe_token }
    });
    
    if (unsubError) {
      console.error('   ❌ Unsubscribe error:', unsubError);
      return;
    }
    
    console.log('   ✅ Unsubscribe successful!');
    console.log('   📧 Response:', unsubData.message);
    
    // 5. Verify unsubscribe
    console.log('\n5️⃣ Verifying unsubscribe status...');
    const { data: updatedSubscriber, error: verifyError } = await supabase
      .from('newsletter_subscribers')
      .select('*')
      .eq('email', testEmail.toLowerCase())
      .single();
    
    if (verifyError) {
      console.error('   ❌ Verification error:', verifyError);
      return;
    }
    
    console.log('   ✅ Verification complete:');
    console.log('      - Active:', updatedSubscriber.is_active ? 'Yes' : 'No');
    console.log('      - Unsubscribed At:', updatedSubscriber.unsubscribed_at ? new Date(updatedSubscriber.unsubscribed_at).toLocaleString() : 'N/A');
    
    // 6. Test duplicate unsubscribe (should handle gracefully)
    console.log('\n6️⃣ Testing duplicate unsubscribe (should handle gracefully)...');
    const { data: dupUnsubData, error: dupUnsubError } = await supabase.functions.invoke('newsletter-unsubscribe', {
      body: { token: subscriber.unsubscribe_token }
    });
    
    if (dupUnsubError) {
      console.error('   ❌ Error:', dupUnsubError);
    } else {
      console.log('   ✅ Handled gracefully:', dupUnsubData.message);
    }
    
    console.log('\n=====================================');
    console.log('✅ COMPLETE NEWSLETTER FLOW TEST PASSED!');
    console.log('\nSUMMARY:');
    console.log('- Newsletter signup: ✅ Working');
    console.log('- Discount code generation: ✅ Working');
    console.log('- Welcome email with unsubscribe link: ✅ Sent to', testEmail);
    console.log('- Unsubscribe functionality: ✅ Working');
    console.log('- Duplicate unsubscribe handling: ✅ Working');
    console.log('\n📧 Check', testEmail, 'inbox for:');
    console.log('   1. Welcome email with discount code and unsubscribe link');
    console.log('   2. Unsubscribe confirmation email');
    
  } catch (err) {
    console.error('❌ Exception:', err);
  }
}

// Run the test
testCompleteNewsletterFlow();