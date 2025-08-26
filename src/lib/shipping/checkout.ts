import { toMinor } from '../money'
import type { ShippingOption } from './types'

interface ShippingSelectionRequest {
  paymentIntentId: string
  itemsTotal: string | number
  shipping: {
    rate_id: string
    rate: string
    currency: string
    name?: string
  }
  taxTotal?: string | number
  orderDraftId?: string
}

interface ShippingSelectionResponse {
  ok: boolean
  paymentIntent: {
    id: string
    amount: number
    currency: string
    status: string
  }
  breakdown: {
    items: number
    shipping: number
    tax: number
    total: number
  }
}

/**
 * Update Stripe PaymentIntent with selected shipping option
 */
export async function updatePaymentIntentWithShipping(
  request: ShippingSelectionRequest
): Promise<ShippingSelectionResponse> {
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
  const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

  if (!supabaseUrl || !anonKey) {
    throw new Error('Missing Supabase configuration')
  }

  // Updating PaymentIntent with shipping information

  const response = await fetch(`${supabaseUrl}/functions/v1/checkout-shipping-select`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${anonKey}`,
    },
    body: JSON.stringify(request)
  })

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}))
    throw new Error(`Failed to update PaymentIntent: ${response.status} - ${errorData.error || response.statusText}`)
  }

  const data = await response.json()
  return data
}

/**
 * Helper function to create shipping selection request from cart and shipping data
 */
export function createShippingSelectionRequest(
  paymentIntentId: string,
  itemsTotal: number,
  selectedShipping: ShippingOption,
  taxTotal?: number,
  orderDraftId?: string
): ShippingSelectionRequest {
  return {
    paymentIntentId,
    itemsTotal,
    shipping: {
      rate_id: selectedShipping.id,
      rate: selectedShipping.rate,
      currency: selectedShipping.currency,
      name: selectedShipping.name
    },
    taxTotal,
    orderDraftId
  }
}

/**
 * Validate shipping selection before sending to backend
 */
export function validateShippingSelection(
  paymentIntentId: string,
  itemsTotal: number,
  selectedShipping: ShippingOption
): string[] {
  const errors: string[] = []

  if (!paymentIntentId?.trim()) {
    errors.push('PaymentIntent ID is required')
  }

  if (typeof itemsTotal !== 'number' || itemsTotal <= 0) {
    errors.push('Items total must be a positive number')
  }

  if (!selectedShipping?.id?.trim()) {
    errors.push('Shipping rate ID is required')
  }

  if (!selectedShipping?.rate?.trim()) {
    errors.push('Shipping rate is required')
  }

  if (!selectedShipping?.currency?.trim()) {
    errors.push('Shipping currency is required')
  }

  // Validate rate is a valid number
  const rate = parseFloat(selectedShipping.rate)
  if (isNaN(rate) || rate < 0) {
    errors.push('Shipping rate must be a valid positive number')
  }

  return errors
}

/**
 * Format amounts for display (convert from minor units back to major)
 */
export function formatAmount(amountMinor: number, currency = 'GBP'): string {
  const amount = amountMinor / 100
  return new Intl.NumberFormat('en-GB', {
    style: 'currency',
    currency: currency,
  }).format(amount)
}
