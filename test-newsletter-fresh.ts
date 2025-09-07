import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'http://localhost:54321';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function testFreshNewsletterSignup() {
  const testEmail = 'support@backreform.co.uk';
  
  console.log('🧹 Cleaning up existing record for:', testEmail);
  
  // Delete existing record
  const { error: deleteError } = await supabase
    .from('newsletter_subscribers')
    .delete()
    .eq('email', testEmail.toLowerCase());
  
  if (deleteError) {
    console.log('No existing record or error deleting:', deleteError.message);
  } else {
    console.log('✅ Existing record deleted');
  }
  
  console.log('\n🚀 Testing fresh newsletter signup for:', testEmail);
  console.log('---');
  
  try {
    // Call the edge function
    const { data, error } = await supabase.functions.invoke('newsletter-signup', {
      body: { email: testEmail }
    });

    if (error) {
      console.error('❌ Error signing up:', error);
      return;
    }

    console.log('✅ Signup successful!');
    console.log('📧 Response:', data);
    
    if (data?.discountCode) {
      console.log('\n🎟️ DISCOUNT CODE:', data.discountCode);
      console.log('📨 Email sent:', data.emailSent ? 'Yes - Check support@backreform.co.uk inbox!' : 'No (check Resend API key)');
    }
    
    // Check if the record was created in the database
    const { data: subscriber, error: dbError } = await supabase
      .from('newsletter_subscribers')
      .select('*')
      .eq('email', testEmail.toLowerCase())
      .single();
    
    if (dbError) {
      console.error('❌ Database check error:', dbError);
    } else {
      console.log('\n📊 Database Record Created:');
      console.log('  - Email:', subscriber.email);
      console.log('  - Discount Code:', subscriber.discount_code);
      console.log('  - Discount Amount:', subscriber.discount_amount + '%');
      console.log('  - Single Use Only:', !subscriber.discount_used);
      console.log('  - Welcome Email Sent:', subscriber.welcome_email_sent ? 'Yes' : 'No');
      console.log('  - Subscribed At:', new Date(subscriber.subscribed_at).toLocaleString());
      
      if (data.emailSent) {
        console.log('\n✉️ EMAIL SENT SUCCESSFULLY!');
        console.log('Check the inbox for support@backreform.co.uk');
        console.log('The email should contain:');
        console.log('  - Welcome message');
        console.log('  - 10% discount code:', subscriber.discount_code);
        console.log('  - Instructions on how to use it');
      }
    }
    
  } catch (err) {
    console.error('❌ Exception:', err);
  }
}

// Run the test
testFreshNewsletterSignup();