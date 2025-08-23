import { useState } from 'react'
import pf, { h } from '../lib/printful/client'

export default function PrintfulTest() {
  const [products, setProducts] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const testPrintfulClient = async () => {
    setLoading(true)
    setError(null)
    
    try {
      // Test the typed client
      const { data, error: apiError } = await pf.GET('/store/products', { 
        headers: h() 
      })
      
      if (apiError) {
        setError(`API Error: ${apiError.status} - ${JSON.stringify(apiError)}`)
        return
      }
      
      setProducts(data?.result || [])
    } catch (err) {
      setError(`Client Error: ${err instanceof Error ? err.message : String(err)}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Printful Client Smoke Test</h1>
      
      <button
        onClick={testPrintfulClient}
        disabled={loading}
        className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50 mb-4"
      >
        {loading ? 'Testing...' : 'Test Printful Client'}
      </button>

      {error && (
        <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
          <strong>Error:</strong> {error}
        </div>
      )}

      {products.length > 0 && (
        <div>
          <h2 className="text-xl font-semibold mb-2">Store Products ({products.length})</h2>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {products.map((product: any) => (
              <div key={product.id} className="border rounded-lg p-4">
                <h3 className="font-medium">{product.name}</h3>
                <p className="text-sm text-gray-600">ID: {product.id}</p>
                <p className="text-sm text-gray-600">Variants: {product.variants}</p>
                <p className="text-sm text-gray-600">Synced: {product.synced}</p>
                {product.thumbnail_url && (
                  <img 
                    src={product.thumbnail_url} 
                    alt={product.name}
                    className="w-full h-32 object-cover rounded mt-2"
                  />
                )}
                <div className="mt-3">
                  <a
                    href={`/printful-product/${product.id}`}
                    className="inline-block px-3 py-2 bg-blue-500 text-white text-sm rounded hover:bg-blue-600 transition-colors"
                  >
                    View Details
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
