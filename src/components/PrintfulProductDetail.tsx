import { useState, useEffect } from 'react'
import pf, { h } from '../lib/printful/client'

interface PrintfulProduct {
  sync_product: {
    id: number
    name: string
    thumbnail_url: string
    description: string
  }
  sync_variants: Array<{
    id: number
    name: string
    retail_price: string
    variant_id: number
    files: Array<{
      id: number
      type: string
      url: string
      preview_url: string
      thumbnail_url: string
    }>
    options: Array<{
      id: string
      value: string
    }>
  }>
}

interface PrintfulProductDetailProps {
  productId: string
}

export default function PrintfulProductDetail({ productId }: PrintfulProductDetailProps) {
  const [product, setProduct] = useState<PrintfulProduct | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchProductDetails = async () => {
    setLoading(true)
    setError(null)
    
    try {
      // Get product details using the typed client
      const { data, error: apiError } = await pf.GET('/store/products/{id}', {
        headers: h(),
        params: { path: { id: productId } },
      })
      
      if (apiError) {
        setError(`API Error: ${apiError.status} - ${JSON.stringify(apiError)}`)
        return
      }
      
      setProduct(data?.result as PrintfulProduct)
    } catch (err) {
      setError(`Client Error: ${err instanceof Error ? err.message : String(err)}`)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (productId) {
      fetchProductDetails()
    }
  }, [productId])

  if (loading) {
    return (
      <div className="p-6 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
        <p className="mt-2">Loading product details...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          <strong>Error:</strong> {error}
        </div>
        <button
          onClick={fetchProductDetails}
          className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Retry
        </button>
      </div>
    )
  }

  if (!product) {
    return (
      <div className="p-6 text-center">
        <p>No product found</p>
      </div>
    )
  }

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">{product.sync_product.name}</h1>
      
      {/* Product Images */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Product Images</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {product.sync_variants[0]?.files?.map((file) => (
            <div key={file.id} className="border rounded-lg p-4">
              <img 
                src={file.preview_url || file.thumbnail_url} 
                alt={`${product.sync_product.name} - ${file.type}`}
                className="w-full h-48 object-cover rounded"
              />
              <p className="mt-2 text-sm text-gray-600 capitalize">{file.type}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Product Variants */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Product Variants</h2>
        <div className="grid gap-4">
          {product.sync_variants.map((variant) => (
            <div key={variant.id} className="border rounded-lg p-4">
              <h3 className="font-medium text-lg">{variant.name}</h3>
              <p className="text-gray-600">Price: £{variant.retail_price}</p>
              
              {/* Variant Options (sizes, colors, etc.) */}
              {variant.options && variant.options.length > 0 && (
                <div className="mt-2">
                  <p className="text-sm font-medium">Options:</p>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {variant.options.map((option) => (
                      <span 
                        key={option.id} 
                        className="px-2 py-1 bg-gray-100 text-gray-700 text-sm rounded"
                      >
                        {option.value}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Variant Images */}
              {variant.files && variant.files.length > 0 && (
                <div className="mt-3">
                  <p className="text-sm font-medium">Variant Images:</p>
                  <div className="flex gap-2 mt-1 overflow-x-auto">
                    {variant.files.map((file) => (
                      <img 
                        key={file.id}
                        src={file.thumbnail_url} 
                        alt={`${variant.name} - ${file.type}`}
                        className="w-16 h-16 object-cover rounded border"
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Product Description */}
      {product.sync_product.description && (
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4">Description</h2>
          <div className="prose max-w-none">
            <p>{product.sync_product.description}</p>
          </div>
        </div>
      )}

      {/* Refresh Button */}
      <button
        onClick={fetchProductDetails}
        className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
      >
        Refresh Product Details
      </button>
    </div>
  )
}
