export const toMinor = (amount: string | number, currency = 'GBP') => {
  const n = typeof amount === 'string' ? parseFloat(amount) : amount
  // Stripe minor units: GBP/EUR/USD => cents/pence
  return Math.round(n * 100)
}

export const fromMinor = (amount: number, currency = 'GBP') => {
  // Convert Stripe minor units back to decimal
  return amount / 100
}

export const formatCurrency = (amount: number, currency = 'GBP') => {
  return new Intl.NumberFormat('en-GB', {
    style: 'currency',
    currency: currency,
  }).format(amount)
}
