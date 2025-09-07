function calculateDeliveryDates(minDays: number, maxDays: number) {
  const today = new Date();
  const minDate = new Date(today);
  const maxDate = new Date(today);
  
  console.log('Today:', today.toISOString().split('T')[0], today.toLocaleDateString('en-GB', { weekday: 'short' }));
  console.log('Min delivery days:', minDays);
  console.log('Max delivery days:', maxDays);
  
  // Add business days for min date
  let daysToAdd = minDays;
  let daysAdded = 0;
  while (daysAdded < daysToAdd) {
    minDate.setDate(minDate.getDate() + 1);
    console.log(`  Day ${minDate.getDate()}: ${minDate.toLocaleDateString('en-GB', { weekday: 'short' })}`);
    // Skip weekends (0 = Sunday, 6 = Saturday)
    if (minDate.getDay() !== 0 && minDate.getDay() !== 6) {
      daysAdded++;
      console.log(`    -> Business day ${daysAdded}`);
    } else {
      console.log(`    -> Weekend, skipping`);
    }
  }
  
  // Add business days for max date
  daysToAdd = maxDays;
  daysAdded = 0;
  while (daysAdded < daysToAdd) {
    maxDate.setDate(maxDate.getDate() + 1);
    console.log(`  Day ${maxDate.getDate()}: ${maxDate.toLocaleDateString('en-GB', { weekday: 'short' })}`);
    // Skip weekends
    if (maxDate.getDay() !== 0 && maxDate.getDay() !== 6) {
      daysAdded++;
      console.log(`    -> Business day ${daysAdded}`);
    } else {
      console.log(`    -> Weekend, skipping`);
    }
  }
  
  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-GB', { 
      month: 'short', 
      day: 'numeric'
    });
  };
  
  console.log('\nCalculated dates:');
  console.log('Min delivery date:', minDate.toISOString().split('T')[0], formatDate(minDate));
  console.log('Max delivery date:', maxDate.toISOString().split('T')[0], formatDate(maxDate));
  
  return `${formatDate(minDate)}–${formatDate(maxDate)}`;
}

console.log('Testing with 2-4 business days (what Printful returns):');
const result = calculateDeliveryDates(2, 4);
console.log('Result:', result);
console.log('\nExpected from Printful: Sep 9–11');