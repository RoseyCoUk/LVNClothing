const PRINTFUL_TOKEN = process.env.PRINTFUL_TOKEN || 'dHfrvwWHc1abLufS0xz4EEEqgE0XboN7cDMX24mB';
const PRINTFUL_STORE_ID = process.env.PRINTFUL_STORE_ID || '16651763';

async function testPrintfulShipping() {
  const payload = {
    recipient: {
      address1: "123 Test St",
      city: "London",
      country_code: "GB",
      zip: "SW1A 1AA"
    },
    items: [{
      variant_id: 8923, // Catalog variant ID for t-shirt
      quantity: 1
    }]
  };

  console.log('Testing Printful shipping API with:', JSON.stringify(payload, null, 2));
  console.log('Today\'s date:', new Date().toISOString().split('T')[0]);

  const headers: Record<string, string> = {
    'Authorization': `Bearer ${PRINTFUL_TOKEN}`,
    'Content-Type': 'application/json',
    'X-PF-Store-Id': PRINTFUL_STORE_ID
  };

  const response = await fetch('https://api.printful.com/shipping/rates', {
    method: 'POST',
    headers,
    body: JSON.stringify(payload)
  });

  const data = await response.json();
  
  console.log('\n=== FULL PRINTFUL RESPONSE ===');
  console.log(JSON.stringify(data, null, 2));
  
  if (data.result && data.result[0]) {
    const firstOption = data.result[0];
    console.log('\n=== FIRST SHIPPING OPTION ===');
    console.log('ID:', firstOption.id);
    console.log('Name:', firstOption.name);
    console.log('Rate:', firstOption.rate, firstOption.currency);
    console.log('\n=== ALL DELIVERY FIELDS ===');
    Object.keys(firstOption).forEach(key => {
      if (key.toLowerCase().includes('delivery') || key.toLowerCase().includes('days')) {
        console.log(`${key}:`, firstOption[key]);
      }
    });
    
    // Calculate what days these dates would be
    if (firstOption.minDeliveryDate) {
      const minDate = new Date(firstOption.minDeliveryDate);
      const today = new Date();
      const diffTime = Math.abs(minDate.getTime() - today.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      console.log(`\nMin delivery date ${firstOption.minDeliveryDate} is ${diffDays} calendar days from today`);
      
      // Calculate business days
      let businessDays = 0;
      let currentDate = new Date(today);
      while (currentDate < minDate) {
        currentDate.setDate(currentDate.getDate() + 1);
        const dayOfWeek = currentDate.getDay();
        if (dayOfWeek !== 0 && dayOfWeek !== 6) {
          businessDays++;
        }
      }
      console.log(`That's ${businessDays} business days`);
    }
    if (firstOption.maxDeliveryDate) {
      const maxDate = new Date(firstOption.maxDeliveryDate);
      const today = new Date();
      const diffTime = Math.abs(maxDate.getTime() - today.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      console.log(`Max delivery date ${firstOption.maxDeliveryDate} is ${diffDays} calendar days from today`);
      
      // Calculate business days
      let businessDays = 0;
      let currentDate = new Date(today);
      while (currentDate < maxDate) {
        currentDate.setDate(currentDate.getDate() + 1);
        const dayOfWeek = currentDate.getDay();
        if (dayOfWeek !== 0 && dayOfWeek !== 6) {
          businessDays++;
        }
      }
      console.log(`That's ${businessDays} business days`);
    }
  }
}

testPrintfulShipping().catch(console.error);