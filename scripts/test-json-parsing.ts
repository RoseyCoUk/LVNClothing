// Test JSON parsing issue from webhook
const rawItems = `[{"id":"activist-bundle-hoodie-0","qty":1,"price":39.99},{"id":"activist-bundle-tshirt-1","qty":1,"price":24.99},{"id":"activist-bundle-cap-2","qty":1,"price":19.99},{"id":"activist-bundle-tote-3","qty":1,"price":24.99},{"id":"activist-bundle-water-bottle-4","qty":1,"price":24.99},{"id":"activist-bundle-mug-5","qty":1,"price":9.99},{"id":"activist-bundle-mouse-pad-6","qty":1,"price":14.99},{"id":"activist-bundle-discount","qty":1,"price":-31.940000000000012}]`;

const rawShipping = `{"name":"f f","address1":"75","city":"new","country_code":"GB","zip":"bt34"}`;

console.log('Testing JSON parsing from webhook metadata...\n');

// Test 1: Direct parsing (should fail)
console.log('1. Direct parsing:');
try {
  const items = JSON.parse(rawItems);
  console.log('✅ Items parsed successfully:', items.length, 'items');
} catch (e) {
  console.log('❌ Failed:', e.message);
}

try {
  const shipping = JSON.parse(rawShipping);
  console.log('✅ Shipping parsed successfully:', shipping);
} catch (e) {
  console.log('❌ Failed:', e.message);
}

// Test 2: With quote replacement
console.log('\n2. With quote replacement:');
try {
  const itemsFixed = rawItems.replace(/\\"/g, '"').replace(/"{/g, '{').replace(/}"/g, '}');
  const items = JSON.parse(itemsFixed);
  console.log('✅ Items parsed successfully:', items.length, 'items');
} catch (e) {
  console.log('❌ Failed:', e.message);
}

// Test 3: Check actual string content
console.log('\n3. Analyzing raw string:');
console.log('First 100 chars of items:', rawItems.substring(0, 100));
console.log('Contains escaped quotes (\\"):', rawItems.includes('\\"'));
console.log('Contains malformed quotes ("{):', rawItems.includes('"{'));

// Test 4: Simple fix - items appear to be valid JSON already
console.log('\n4. The issue might be in how Stripe stores metadata:');
console.log('Items appear to be valid JSON. The problem might be:');
console.log('- Stripe metadata has a character limit');
console.log('- The items array is being truncated or modified');
console.log('- We need to handle the metadata differently');

// Show what we're receiving vs what we expect
console.log('\n5. Metadata structure:');
console.log('Expected: metadata.items should be a JSON string');
console.log('Actual: It appears to be a valid JSON string already');
console.log('\nThe real issue might be elsewhere in the webhook processing.');