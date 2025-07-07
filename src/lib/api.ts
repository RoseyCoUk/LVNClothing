import { supabase } from './supabase'

export interface Product {
  id: string
  name: string
  variant: string | null
  description: string | null
  price_pence: number
  category: string | null
  tags: string[]
  reviews: number
  rating: number
  dateAdded: string
  created_at: string
  updated_at: string
}

/**
 * Fetches all products from the products table
 * @returns Promise<Product[]> Array of product objects
 * @throws Error if the database query fails
 */
export async function getProducts(): Promise<Product[]> {
  console.log('Fetching products from Supabase...');
  
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .order('name', { ascending: true })

  console.log('Supabase response:', { data, error });

  if (error) {
    console.error('Error fetching products:', error);
    throw new Error(`Failed to fetch products: ${error.message}`)
  }

  console.log('Raw products data:', data);

  // Map database fields to Product interface
  const mappedProducts = (data || []).map(product => ({
    id: product.id,
    name: product.name,
    variant: product.variant,
    description: product.description,
    price_pence: product.price_pence,
    category: product.category || 'gear', // Default to 'gear' if no category
    tags: product.tags || [], // Use database tags or empty array
    reviews: product.reviews || 0, // Use database reviews or default
    rating: product.rating || 4.5, // Use database rating or default
    dateAdded: product.created_at, // Use created_at as dateAdded
    created_at: product.created_at,
    updated_at: product.updated_at
  }));

  console.log('Mapped products:', mappedProducts);
  return mappedProducts;
} 