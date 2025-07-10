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
  image_url?: string
  slug?: string // Add slug property
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
  const mappedProducts = (data || []).map(product => {
    const mappedProduct = {
      id: product.id,
      name: product.name,
      variant: product.variant,
      description: product.description,
      price_pence: Number(product.price_pence) || 0, // Ensure it's always a number
      category: product.category || 'gear', // Default to 'gear' if no category
      tags: product.tags || [], // Use database tags or empty array
      reviews: product.reviews || 0, // Use database reviews or default
      rating: product.rating || 4.5, // Use database rating or default
      dateAdded: product.created_at, // Use created_at as dateAdded
      created_at: product.created_at,
      updated_at: product.updated_at,
      image_url: product.image_url, // Map image_url
      slug: product.slug // Map slug
    };
    
    // Debug logging for Activist Bundle
    if (product.name === 'Activist Bundle') {
      console.log('Activist Bundle found:', {
        original: product.price_pence,
        converted: mappedProduct.price_pence,
        type: typeof mappedProduct.price_pence
      });
    }
    
    return mappedProduct;
  });

  console.log('Mapped products:', mappedProducts);
  return mappedProducts;
} 

/**
 * Fetches product variants for a specific product
 * @param productId The product ID to get variants for
 * @returns Promise<any[]> Array of variant objects
 * @throws Error if the database query fails
 */
export async function getProductVariants(productId: string): Promise<any[]> {
  console.log('Fetching product variants for:', productId);
  
  const { data, error } = await supabase
    .from('product_variants')
    .select('*')
    .eq('product_id', productId)
    .order('description', { ascending: true })

  console.log('Product variants response:', { data, error });

  if (error) {
    console.error('Error fetching product variants:', error);
    throw new Error(`Failed to fetch product variants: ${error.message}`)
  }

  console.log('Product variants data:', data);
  return data || [];
} 