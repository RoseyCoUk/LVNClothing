import { useState, useEffect } from 'react'
import { useCart } from '../contexts/CartContext'
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
  const { addToCart } = useCart()
  const [product, setProduct] = useState<PrintfulProduct | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [selectedVariant, setSelectedVariant] = useState<number>(0)
  const [selectedOptions, setSelectedOptions] = useState<Record<string, string>>({})
  const [addingToCart, setAddingToCart] = useState(false)

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
        setError(`API Error: ${apiError.code || 'Unknown'} - ${JSON.stringify(apiError)}`)
        return
      }
      
      setProduct(data?.result as PrintfulProduct)
      
      // Initialize selected options with first variant
      if (data?.result?.sync_variants?.[0]?.options) {
        const initialOptions: Record<string, string> = {}
        data.result.sync_variants[0].options.forEach(option => {
          initialOptions[option.id] = option.value
        })
        setSelectedOptions(initialOptions)
      }
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

  // Get available options (sizes, colors, etc.)
  const getAvailableOptions = () => {
    if (!product) return {}
    
    const options: Record<string, string[]> = {}
    product.sync_variants.forEach(variant => {
      variant.options?.forEach(option => {
        // Ensure option.id is not empty
        if (option.id && option.id.trim() !== '') {
          if (!options[option.id]) {
            options[option.id] = []
          }
          if (!options[option.id].includes(option.value)) {
            options[option.id].push(option.value)
          }
        }
      })
    })
    
    return options
  }

  // Find variant based on selected options
  const findVariantByOptions = (options: Record<string, string>) => {
    if (!product) return null
    
    return product.sync_variants.find(variant => {
      return variant.options?.every(option => 
        options[option.id] === option.value
      )
    })
  }

  // Handle option selection
  const handleOptionChange = (optionId: string, value: string) => {
    const newOptions = { ...selectedOptions, [optionId]: value }
    setSelectedOptions(newOptions)
    
    // Find the variant that matches these options
    const variant = findVariantByOptions(newOptions)
    if (variant) {
      const variantIndex = product!.sync_variants.findIndex(v => v.id === variant.id)
      setSelectedVariant(variantIndex)
    }
  }

  // Add to cart function
  const handleAddToCart = () => {
    console.log('handleAddToCart called')
    console.log('Product:', product)
    console.log('Selected variant:', selectedVariant)
    console.log('Available variants:', product?.sync_variants)
    
    if (!product || selectedVariant < 0 || selectedVariant >= product.sync_variants.length) {
      console.error('Invalid product or variant selection')
      
      // Fallback: Add a test product to cart for debugging
      console.log('Adding fallback test product to cart')
      const testProduct = {
        id: 'test-product-1',
        name: 'Test Product - Debug',
        price: 19.99,
        image: '/BackReformLogo.png',
        printful_variant_id: 1,
        quantity: 1
      }
      addToCart(testProduct)
      return
    }

    const variant = product.sync_variants[selectedVariant]
    console.log('Selected variant details:', variant)
    setAddingToCart(true)

    try {
      const cartItem = {
        id: `${product.sync_product.id}-${variant.id}`,
        name: `${product.sync_product.name} - ${variant.name}`,
        price: parseFloat(variant.retail_price),
        image: variant.files?.[0]?.thumbnail_url || product.sync_product.thumbnail_url || '',
        printful_variant_id: variant.variant_id,
        quantity: 1
      }

      console.log('Cart item to add:', cartItem)
      addToCart(cartItem)
      console.log('Product added to cart successfully')
      
      // Show success feedback
      setTimeout(() => setAddingToCart(false), 1000)
    } catch (err) {
      console.error('Error adding to cart:', err)
      setAddingToCart(false)
    }
  }

  // Get current variant
  const currentVariant = product?.sync_variants[selectedVariant]
  
  // Get main product image (use first variant's preview_url or fallback to thumbnail)
  const getMainImage = () => {
    if (currentVariant?.files?.[0]?.preview_url) {
      return currentVariant.files[0].preview_url
    }
    return product?.sync_product.thumbnail_url
  }

  // Fetch size chart from Printful catalog
  const [sizeChart, setSizeChart] = useState<any>(null)
  const [loadingSizeChart, setLoadingSizeChart] = useState(false)

  const fetchSizeChart = async (catalogProductId: number) => {
    setLoadingSizeChart(true)
    try {
      const { data, error } = await pf.GET('/products/{id}/sizes', {
        headers: { ...h(), 'X-PF-Language': 'en_GB' },
        params: { path: { id: catalogProductId } },
      })
      
      if (error) {
        setSizeChart(null)
        return
      }
      
      if (data?.result) {
        setSizeChart(data.result)
      } else {
        setSizeChart(null)
        
        // If this failed and we have a variant_id, try that as a fallback
        if (currentVariant?.variant_id && catalogProductId !== currentVariant.variant_id) {
          fetchSizeChart(currentVariant.variant_id)
        }
      }
    } catch (err) {
      setSizeChart(null)
    } finally {
      setLoadingSizeChart(false)
    }
  }

  const handleSizeChartClick = () => {
    // Try to get the catalog product ID
    // The sync_product.id is more likely to be the catalog product ID
    if (product?.sync_product?.id) {
      fetchSizeChart(product.sync_product.id)
    } else if (currentVariant?.variant_id) {
      fetchSizeChart(currentVariant.variant_id)
    }
  }

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

  const availableOptions = getAvailableOptions()

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Product Images */}
        <div>
          <h1 className="text-3xl font-bold mb-6 lg:hidden">{product.sync_product.name}</h1>
          
          {/* Main Product Image */}
          <div className="mb-4">
            <img 
              src={getMainImage()} 
              alt={product.sync_product.name}
              className="w-full h-96 object-cover rounded-lg border"
            />
          </div>
          
          {/* Thumbnail Gallery */}
          {currentVariant?.files && currentVariant.files.length > 1 && (
            <div className="grid grid-cols-4 gap-2">
              {currentVariant.files.map((file, index) => (
                <img 
                  key={`${file.id}-${index}`}
                  src={file.preview_url || file.thumbnail_url} 
                  alt={`${product.sync_product.name} - ${file.type}`}
                  className="w-full h-20 object-cover rounded border cursor-pointer hover:opacity-75 transition-opacity"
                  onClick={() => {
                    // Update main image when thumbnail is clicked
                    const newVariant = product.sync_variants.find(v => 
                      v.files.some(f => f.id === file.id)
                    )
                    if (newVariant) {
                      const variantIndex = product.sync_variants.findIndex(v => v.id === newVariant.id)
                      setSelectedVariant(variantIndex)
                    }
                  }}
                />
              ))}
            </div>
          )}
        </div>

        {/* Product Details & Options */}
        <div>
          <h1 className="text-3xl font-bold mb-4 hidden lg:block">{product.sync_product.name}</h1>
          
          {/* Price */}
          {currentVariant && (
            <div className="mb-6">
              <p className="text-2xl font-bold text-gray-900">
                £{currentVariant.retail_price}
              </p>
            </div>
          )}

          {/* Size/Color Selectors */}
          {Object.keys(availableOptions).length > 0 && (
            <div className="mb-6 space-y-4">
              {Object.entries(availableOptions).map(([optionId, values]) => (
                <div key={`option-${optionId}`}>
                  <label className="block text-sm font-medium text-gray-700 mb-2 capitalize">
                    {optionId.replace('_', ' ')}:
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {values.map((value, valueIndex) => (
                      <button
                        key={`${optionId}-${value}-${valueIndex}`}
                        onClick={() => handleOptionChange(optionId, value)}
                        className={`px-4 py-2 border rounded-md text-sm font-medium transition-colors ${
                          selectedOptions[optionId] === value
                            ? 'border-blue-500 bg-blue-50 text-blue-700'
                            : 'border-gray-300 text-gray-700 hover:border-gray-400'
                        }`}
                      >
                        {value}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Add to Cart Button */}
          <div className="mb-6">
            <button 
              onClick={handleAddToCart}
              disabled={addingToCart}
              className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-blue-700 transition-colors"
            >
              {addingToCart ? 'Adding to Cart...' : 'Add to Cart'}
            </button>
            
            {/* Test button for debugging */}
            <button 
              onClick={() => {
                console.log('Test button clicked')
                console.log('Current cart state:', { product, selectedVariant, availableOptions })
              }}
              className="w-full mt-2 bg-gray-500 text-white py-2 px-4 rounded-lg text-sm"
            >
              Debug Cart State
            </button>
            
            {/* Simple test add to cart */}
            <button 
              onClick={() => {
                console.log('Test add to cart clicked')
                const testProduct = {
                  id: 'test-product-2',
                  name: 'Test Product 2',
                  price: 29.99,
                  image: '/BackReformLogo.png',
                  printful_variant_id: 2,
                  quantity: 1
                }
                addToCart(testProduct)
              }}
              className="w-full mt-2 bg-green-500 text-white py-2 px-4 rounded-lg text-sm"
            >
              Test Add to Cart
            </button>
          </div>

          {/* Product Description */}
          {product.sync_product.description && (
            <div className="mb-6">
              <h2 className="text-lg font-semibold mb-2">Description</h2>
              <div className="prose text-gray-600">
                <p>{product.sync_product.description}</p>
              </div>
            </div>
          )}

          {/* Size Chart */}
          <div className="mb-6">
            <h2 className="text-lg font-semibold mb-2">Size Chart</h2>
            <div className="bg-gray-50 p-4 rounded-lg">
              {!sizeChart ? (
                <>
                  {/* Show available sizes from current product data */}
                  {currentVariant?.options && (
                    <div className="mb-4">
                      <h4 className="text-sm font-medium text-gray-700 mb-2">Available Sizes:</h4>
                      <div className="flex flex-wrap gap-2 mb-3">
                        {currentVariant.options
                          .filter(option => option.id.toLowerCase().includes('size'))
                          .map((option, index) => (
                            <span 
                              key={`size-${option.value}-${index}`}
                              className="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full"
                            >
                              {option.value}
                            </span>
                          ))}
                      </div>
                    </div>
                  )}
                  
                  <p className="text-sm text-gray-600 mb-2">
                    Size charts are available for most products. Please refer to our comprehensive size guide for accurate measurements.
                  </p>
                  <div className="flex gap-2">
                    <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                      View Size Guide →
                    </button>
                    {product?.sync_product?.id && (
                      <button 
                        onClick={handleSizeChartClick}
                        disabled={loadingSizeChart}
                        className={`text-sm font-medium transition-colors ${
                          loadingSizeChart 
                            ? 'text-gray-400 cursor-not-allowed' 
                            : 'text-green-600 hover:text-green-800'
                        }`}
                      >
                        {loadingSizeChart ? 'Loading...' : 'Load Printful Size Chart'}
                      </button>
                    )}
                  </div>
                </>
              ) : (
                <div>
                  <div className="flex justify-between items-center mb-3">
                    <h3 className="font-medium text-gray-900">Product Size Guide</h3>
                    <button 
                      onClick={() => setSizeChart(null)}
                      className="text-gray-500 hover:text-gray-700 text-sm"
                    >
                      Close
                    </button>
                  </div>
                  
                  {/* Display size chart data */}
                  {sizeChart.available_sizes && (
                    <div className="mb-3">
                      <h4 className="text-sm font-medium text-gray-700 mb-2">Available Sizes:</h4>
                      <div className="flex flex-wrap gap-2">
                        {sizeChart.available_sizes.map((size: string, index: number) => (
                          <span 
                            key={`size-${size}-${index}`}
                            className="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full"
                          >
                            {size}
                        </span>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {sizeChart.size_guide && (
                    <div className="text-sm text-gray-600">
                      <h4 className="font-medium text-gray-700 mb-2">Size Guide:</h4>
                      <div 
                        className="prose prose-sm max-w-none"
                        dangerouslySetInnerHTML={{ __html: sizeChart.size_guide }}
                      />
                    </div>
                  )}
                  
                  {sizeChart.measurement_guide && (
                    <div className="text-sm text-gray-600 mt-3">
                      <h4 className="font-medium text-gray-700 mb-2">Measurement Guide:</h4>
                      <div 
                        className="prose prose-sm max-w-none"
                        dangerouslySetInnerHTML={{ __html: sizeChart.measurement_guide }}
                      />
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Variant Details */}
          {currentVariant && (
            <div className="border-t pt-6">
              <h3 className="text-lg font-semibold mb-2">Product Details</h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">Variant ID:</span>
                  <span className="ml-2 font-medium">{currentVariant.variant_id}</span>
                </div>
                <div>
                  <span className="text-gray-600">Sync ID:</span>
                  <span className="ml-2 font-medium">{currentVariant.id}</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* All Variants Section */}
      <div className="mt-12">
        <h2 className="text-2xl font-bold mb-6">All Available Variants</h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {product.sync_variants.map((variant, index) => (
            <div 
              key={variant.id} 
              className={`border rounded-lg p-4 cursor-pointer transition-colors ${
                selectedVariant === index ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
              }`}
              onClick={() => setSelectedVariant(index)}
            >
              <h3 className="font-medium text-lg">{variant.name}</h3>
              <p className="text-gray-600">£{variant.retail_price}</p>
              
              {/* Variant Options */}
              {variant.options && variant.options.length > 0 && (
                <div className="mt-2">
                  <div className="flex flex-wrap gap-1">
                    {variant.options.map((option) => (
                      <span 
                        key={option.id} 
                        className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded"
                      >
                        {option.value}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Variant Thumbnail */}
              {variant.files?.[0]?.thumbnail_url && (
                <img 
                  src={variant.files[0].thumbnail_url} 
                  alt={variant.name}
                  className="w-full h-32 object-cover rounded mt-2"
                />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Refresh Button */}
      <div className="mt-8 text-center">
        <button
          onClick={fetchProductDetails}
          className="px-6 py-3 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
        >
          Refresh Product Details
        </button>
      </div>
    </div>
  )
}
