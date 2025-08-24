export type Recipient = {
  name?: string
  address1: string
  address2?: string
  city: string
  state_code?: string
  country_code: string // ISO-2 e.g. "GB","IE","US"
  zip: string
  phone?: string
  email?: string
}

export type CartItem = {
  printful_variant_id: number
  quantity: number
  // optional: title, price, etc. (ignored here)
}

export type ShippingQuoteRequest = {
  recipient: Recipient
  items: CartItem[]
}

export type ShippingOption = {
  id: string             // Printful rate_id
  name: string           // "Standard", "Express", etc.
  rate: string           // decimal string, e.g. "5.99"
  currency: string       // e.g. "GBP"
  minDeliveryDays?: number
  maxDeliveryDays?: number
  carrier?: string
}

export type ShippingQuoteResponse = {
  options: ShippingOption[]
  ttlSeconds: number
}
