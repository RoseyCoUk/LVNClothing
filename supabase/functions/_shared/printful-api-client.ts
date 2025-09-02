// Real Printful API Client
// Uses actual Printful API credentials to fetch real data

interface PrintfulProduct {
  id: number;
  external_id: string;
  name: string;
  variants: number;
  synced: number;
  thumbnail_url?: string;
  is_ignored: boolean;
}

interface PrintfulVariant {
  id: number;
  external_id: string;
  sync_variant_id: number;
  name: string;
  synced: boolean;
  variant_id: number;
  main_category_id: number;
  warehouse_product_variant_id?: number;
  retail_price: string;
  sku?: string;
  product: {
    variant_id: number;
    product_id: number;
    image: string;
    name: string;
  };
  files: Array<{
    id: number;
    type: string;
    hash?: string;
    url?: string;
    filename?: string;
    mime_type?: string;
    size: number;
    width?: number;
    height?: number;
    x?: number;
    y?: number;
    scale?: number;
    visible: boolean;
    status: string;
  }>;
  options: Array<{
    id: string;
    value: string;
  }>;
  is_ignored: boolean;
}

interface PrintfulStoreProduct {
  id: number;
  external_id: string;
  name: string;
  variants: number;
  synced: number;
  thumbnail_url?: string;
  is_ignored: boolean;
}

interface PrintfulProductDetail {
  sync_product: {
    id: number;
    external_id: string;
    name: string;
    variants: number;
    synced: number;
    thumbnail_url?: string;
    is_ignored: boolean;
  };
  sync_variants: PrintfulVariant[];
}

export class PrintfulAPIClient {
  private readonly baseURL = 'https://api.printful.com';
  private readonly token: string;
  private readonly storeId: string;

  constructor() {
    const token = Deno.env.get('PRINTFUL_TOKEN');
    const storeId = Deno.env.get('PRINTFUL_STORE_ID');
    
    if (!token) {
      throw new Error('PRINTFUL_TOKEN environment variable is required');
    }
    
    if (!storeId) {
      throw new Error('PRINTFUL_STORE_ID environment variable is required');
    }

    this.token = token;
    this.storeId = storeId;
  }

  private async makeRequest(endpoint: string): Promise<any> {
    const url = `${this.baseURL}${endpoint}`;
    
    console.log(`🌐 Making request to: ${url}`);
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${this.token}`,
        'Content-Type': 'application/json',
        'User-Agent': 'Reform-UK-Store/1.0',
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`❌ Printful API error (${response.status}): ${errorText}`);
      throw new Error(`Printful API error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    
    // Printful API rate limit: 120 requests per minute
    // Add small delay to be safe
    await new Promise(resolve => setTimeout(resolve, 600));
    
    return data;
  }

  async getStoreProducts(): Promise<PrintfulStoreProduct[]> {
    console.log('📦 Fetching store products...');
    const response = await this.makeRequest('/store/products');
    
    if (!response.result || !Array.isArray(response.result)) {
      throw new Error('Invalid response format from /store/products');
    }

    const products = response.result;
    console.log(`✅ Found ${products.length} products in store`);
    
    return products;
  }

  async getProductDetails(productId: number): Promise<PrintfulProductDetail> {
    console.log(`🔍 Fetching product details for ID: ${productId}`);
    const response = await this.makeRequest(`/store/products/${productId}`);
    
    if (!response.result) {
      throw new Error(`Invalid response format from /store/products/${productId}`);
    }

    const product = response.result;
    console.log(`✅ Found product: ${product.sync_product?.name} with ${product.sync_variants?.length || 0} variants`);
    
    return product;
  }

  async getAllProductsWithVariants(): Promise<PrintfulProductDetail[]> {
    console.log('🚀 Starting comprehensive product fetch from Printful API...');
    
    // Step 1: Get all store products
    const storeProducts = await this.getStoreProducts();
    console.log(`📊 Processing ${storeProducts.length} store products...`);

    // Step 2: Get detailed info for each product
    const detailedProducts: PrintfulProductDetail[] = [];
    
    for (const storeProduct of storeProducts) {
      if (storeProduct.is_ignored) {
        console.log(`⏭️ Skipping ignored product: ${storeProduct.name}`);
        continue;
      }

      try {
        const productDetail = await this.getProductDetails(storeProduct.id);
        detailedProducts.push(productDetail);
        
        console.log(`✅ Added product: ${productDetail.sync_product.name} (${productDetail.sync_variants?.length || 0} variants)`);
      } catch (error) {
        console.error(`❌ Failed to fetch product ${storeProduct.id}:`, error);
        // Continue with other products
      }
    }

    const totalVariants = detailedProducts.reduce((sum, product) => 
      sum + (product.sync_variants?.length || 0), 0
    );

    console.log(`🎉 Successfully fetched ${detailedProducts.length} products with ${totalVariants} total variants`);
    
    return detailedProducts;
  }

  async downloadImage(imageUrl: string): Promise<Uint8Array> {
    console.log(`📸 Downloading image: ${imageUrl}`);
    
    const response = await fetch(imageUrl);
    
    if (!response.ok) {
      throw new Error(`Failed to download image: ${response.status}`);
    }

    const arrayBuffer = await response.arrayBuffer();
    return new Uint8Array(arrayBuffer);
  }

  // Helper method to extract color and size from Printful variant options
  parseVariantOptions(variant: PrintfulVariant): { color?: string; size?: string; colorCode?: string } {
    const options = variant.options || [];
    let color: string | undefined;
    let size: string | undefined;
    let colorCode: string | undefined;

    for (const option of options) {
      if (option.id === 'color') {
        color = option.value;
      } else if (option.id === 'size') {
        size = option.value;
      }
    }

    // If no explicit color in options, try to extract from variant name
    if (!color && variant.name) {
      const colorMatch = variant.name.match(/\b(Black|White|Navy|Red|Blue|Green|Gray|Grey|Pink|Purple|Yellow|Orange|Brown)\b/i);
      if (colorMatch) {
        color = colorMatch[1];
      }
    }

    // Map common colors to hex codes
    if (color) {
      const colorMap: Record<string, string> = {
        'Black': '#000000',
        'White': '#FFFFFF',
        'Navy': '#1c2330',
        'Red': '#8e0a1f',
        'Blue': '#a6b9c6',
        'Gray': '#393639',
        'Grey': '#393639',
        'Green': '#008000',
        'Pink': '#FFC0CB',
        'Purple': '#800080',
        'Yellow': '#FFFF00',
        'Orange': '#FFA500',
        'Brown': '#A52A2A'
      };
      
      colorCode = colorMap[color] || '#CCCCCC';
    }

    return { color, size, colorCode };
  }

  // Helper to categorize products based on Printful data
  categorizeProduct(product: PrintfulProductDetail): string {
    const name = product.sync_product.name.toLowerCase();
    
    if (name.includes('t-shirt') || name.includes('tshirt') || name.includes('tee')) {
      return 'tshirt';
    } else if (name.includes('hoodie') || name.includes('sweatshirt')) {
      return 'hoodie';
    } else if (name.includes('cap') || name.includes('hat')) {
      return 'cap';
    } else if (name.includes('mug') || name.includes('cup')) {
      return 'mug';
    } else if (name.includes('tote') || name.includes('bag')) {
      return 'tote';
    } else if (name.includes('bottle') || name.includes('water')) {
      return 'water-bottle';
    } else if (name.includes('mouse') || name.includes('pad')) {
      return 'mouse-pad';
    } else {
      // Default category
      return 'merchandise';
    }
  }
}