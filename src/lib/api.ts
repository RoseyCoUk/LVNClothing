import { supabase } from './supabase'

export interface Product {
  id: string
  name: string
  variant: string | null
  description: string | null
  price_pence: number
  category: string | null
  created_at: string
  updated_at: string
}

/**
 * Fetches all products from the products table
 * @returns Promise<Product[]> Array of product objects
 * @throws Error if the database query fails
 */
export async function getProducts(): Promise<Product[]> {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .order('name', { ascending: true })

  if (error) {
    throw new Error(`Failed to fetch products: ${error.message}`)
  }

  return data || []
} 