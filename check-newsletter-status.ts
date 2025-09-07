import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'http://localhost:54321';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkNewsletterStatus() {
  console.log('📊 CHECKING NEWSLETTER SUBSCRIBERS STATUS');
  console.log('=========================================\n');
  
  // Get all subscribers
  const { data: subscribers, error } = await supabase
    .from('newsletter_subscribers')
    .select('*')
    .order('subscribed_at', { ascending: false });
  
  if (error) {
    console.error('Error fetching subscribers:', error);
    return;
  }
  
  console.log(`Total subscribers: ${subscribers.length}\n`);
  
  subscribers.forEach((sub, index) => {
    console.log(`${index + 1}. ${sub.email}`);
    console.log(`   - Status: ${sub.is_active ? '✅ Active' : '❌ Unsubscribed'}`);
    console.log(`   - Discount Code: ${sub.discount_code || 'None'}`);
    console.log(`   - Discount Used: ${sub.discount_used ? 'Yes' : 'No'}`);
    console.log(`   - Welcome Email Sent: ${sub.welcome_email_sent ? 'Yes' : 'No'}`);
    console.log(`   - Subscribed: ${new Date(sub.subscribed_at).toLocaleString()}`);
    if (sub.unsubscribed_at) {
      console.log(`   - Unsubscribed: ${new Date(sub.unsubscribed_at).toLocaleString()}`);
    }
    console.log('');
  });
  
  // Check for potential issues
  const duplicateEmails = subscribers.filter((sub, index, self) =>
    index !== self.findIndex(s => s.email === sub.email)
  );
  
  if (duplicateEmails.length > 0) {
    console.log('⚠️ WARNING: Duplicate emails found:');
    duplicateEmails.forEach(dup => {
      console.log(`   - ${dup.email}`);
    });
  }
  
  // Count active vs inactive
  const activeCount = subscribers.filter(s => s.is_active).length;
  const inactiveCount = subscribers.filter(s => !s.is_active).length;
  
  console.log('\n📈 SUMMARY:');
  console.log(`   - Active subscribers: ${activeCount}`);
  console.log(`   - Unsubscribed: ${inactiveCount}`);
  console.log(`   - Total: ${subscribers.length}`);
}

// Run the check
checkNewsletterStatus();