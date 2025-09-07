import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'http://localhost:54321';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testNewsletterSignup() {
  const testEmail = 'support@backreform.co.uk';
  
  console.log('🚀 Testing newsletter signup for:', testEmail);
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
      console.log('🎟️ Discount Code:', data.discountCode);
      console.log('📨 Email sent:', data.emailSent ? 'Yes' : 'No (check Resend API key)');
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
      console.log('\n📊 Database Record:');
      console.log('  - Email:', subscriber.email);
      console.log('  - Discount Code:', subscriber.discount_code);
      console.log('  - Discount Amount:', subscriber.discount_amount + '%');
      console.log('  - Used:', subscriber.discount_used ? 'Yes' : 'No');
      console.log('  - Welcome Email Sent:', subscriber.welcome_email_sent ? 'Yes' : 'No');
      console.log('  - Subscribed At:', new Date(subscriber.subscribed_at).toLocaleString());
    }
    
  } catch (err) {
    console.error('❌ Exception:', err);
  }
}

// Run the test
testNewsletterSignup();