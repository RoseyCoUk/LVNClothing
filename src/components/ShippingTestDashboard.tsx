import React, { useState, useEffect } from 'react'
import { useShippingQuotes } from '../hooks/useShippingQuotes'
import { useShipping } from '../contexts/ShippingContext'
import { useCart } from '../contexts/CartContext'
import ShippingMethods from './checkout/ShippingMethods'
import { testMoneyUtils, testTypes, testData, createTestRequest, validateTestData } from '../test-shipping-utils'
import type { ShippingOption } from '../lib/shipping/types'

const ShippingTestDashboard: React.FC = () => {
  const { addToCart, cartItems, clearCart } = useCart()
  const { selectShippingOption, selectedShippingOption } = useShipping()
  const { loading, options, error, fetchQuotes, clearQuotes } = useShippingQuotes()
  
  const [selectedAddress, setSelectedAddress] = useState<keyof typeof testData.addresses>('london')
  const [selectedItems, setSelectedItems] = useState<keyof typeof testData.items>('single')
  const [testResults, setTestResults] = useState<{ [key: string]: boolean }>({})
  const [consoleOutput, setConsoleOutput] = useState<string[]>([])

  // Capture console output for testing
  useEffect(() => {
    const originalLog = console.log
    const originalError = console.error
    
    console.log = (...args) => {
      const message = args.map(arg => 
        typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg)
      ).join(' ')
      setConsoleOutput(prev => [...prev, `LOG: ${message}`])
      originalLog(...args)
    }
    
    console.error = (...args) => {
      const message = args.map(arg => 
        typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg)
      ).join(' ')
      setConsoleOutput(prev => [...prev, `ERROR: ${message}`])
      originalError(...args)
    }
    
    return () => {
      console.log = originalLog
      console.error = originalError
    }
  }, [])

  const addTestItem = () => {
    addToCart({
      id: 'test-1',
      name: 'Test T-Shirt',
      price: 19.99,
      image: '/test-image.jpg',
      printful_variant_id: 17008
    })
  }

  const addMultipleTestItems = () => {
    addToCart({
      id: 'test-2',
      name: 'Test Hoodie',
      price: 29.99,
      image: '/test-image.jpg',
      printful_variant_id: 17009
    })
  }

  const testShippingQuotes = async () => {
    try {
      const request = createTestRequest(selectedAddress, selectedItems)
      console.log('🧪 Testing Shipping Quotes with:', request)
      
      await fetchQuotes(request)
      setTestResults(prev => ({ ...prev, shippingQuotes: true }))
    } catch (error) {
      console.error('❌ Shipping quotes test failed:', error)
      setTestResults(prev => ({ ...prev, shippingQuotes: false }))
    }
  }

  const testMoneyUtils = () => {
    try {
      const results = testMoneyUtils()
      const allPassed = Object.values(results).every(Boolean)
      setTestResults(prev => ({ ...prev, moneyUtils: allPassed }))
      console.log('Money utils test results:', results)
      
      // Show detailed results in console
      if (!allPassed) {
        console.log('❌ Money utils test failed. Details:')
        Object.entries(results).forEach(([key, value]) => {
          console.log(`${key}: ${value ? '✅ PASS' : '❌ FAIL'}`)
        })
      }
    } catch (error) {
      console.error('❌ Money utils test failed:', error)
      setTestResults(prev => ({ ...prev, moneyUtils: false }))
    }
  }

  const testTypes = () => {
    try {
      const results = testTypes()
      setTestResults(prev => ({ ...prev, types: true }))
      console.log('Types test completed:', results)
    } catch (error) {
      console.error('❌ Types test failed:', error)
      setTestResults(prev => ({ ...prev, types: false }))
    }
  }

  const testDataValidation = () => {
    try {
      const isValid = validateTestData()
      setTestResults(prev => ({ ...prev, dataValidation: isValid }))
      console.log('Data validation test completed:', isValid)
    } catch (error) {
      console.error('❌ Data validation test failed:', error)
      setTestResults(prev => ({ ...prev, dataValidation: false }))
    }
  }

  const runAllTests = async () => {
    console.log('🚀 Running all tests...')
    setTestResults({})
    
    // Run utility tests
    testMoneyUtils()
    testTypes()
    testDataValidation()
    
    // Run integration tests
    await testShippingQuotes()
    
    console.log('✅ All tests completed')
  }

  const handleShippingSelect = (option: ShippingOption) => {
    selectShippingOption(option)
    setTestResults(prev => ({ ...prev, shippingSelection: true }))
    console.log('✅ Shipping option selected:', option)
  }

  const clearConsole = () => {
    setConsoleOutput([])
  }

  const getTestStatus = (testName: string) => {
    if (testResults[testName] === undefined) return '⏳ Not Run'
    return testResults[testName] ? '✅ Pass' : '❌ Fail'
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6 text-center">🚀 Shipping Integration Test Dashboard</h1>
      
      {/* Test Controls */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div className="bg-gray-50 p-4 rounded-lg">
          <h2 className="text-lg font-semibold mb-4">🧪 Test Controls</h2>
          
          <div className="space-y-3">
            <button
              onClick={runAllTests}
              className="w-full bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              Run All Tests
            </button>
            
            <button
              onClick={testMoneyUtils}
              className="w-full bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
            >
              Test Money Utils
            </button>
            
            <button
              onClick={testTypes}
              className="w-full bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700"
            >
              Test Types
            </button>
            
            <button
              onClick={testDataValidation}
              className="w-full bg-yellow-600 text-white px-4 py-2 rounded hover:bg-yellow-700"
            >
              Validate Test Data
            </button>
          </div>
        </div>

        <div className="bg-gray-50 p-4 rounded-lg">
          <h2 className="text-lg font-semibold mb-4">🛒 Cart Controls</h2>
          
          <div className="space-y-3">
            <button
              onClick={addTestItem}
              className="w-full bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
            >
              Add Test Item
            </button>
            
            <button
              onClick={addMultipleTestItems}
              className="w-full bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              Add Multiple Items
            </button>
            
            <button
              onClick={clearCart}
              className="w-full bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
            >
              Clear Cart
            </button>
          </div>
        </div>

        <div className="bg-gray-50 p-4 rounded-lg">
          <h2 className="text-lg font-semibold mb-4">📍 Test Configuration</h2>
          
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium mb-1">Test Address</label>
              <select
                value={selectedAddress}
                onChange={(e) => setSelectedAddress(e.target.value as keyof typeof testData.addresses)}
                className="w-full border rounded px-3 py-2"
              >
                <option value="london">London, UK</option>
                <option value="manchester">Manchester, UK</option>
                <option value="dublin">Dublin, IE</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Test Items</label>
              <select
                value={selectedItems}
                onChange={(e) => setSelectedItems(e.target.value as keyof typeof testData.items)}
                className="w-full border rounded px-3 py-2"
              >
                <option value="single">Single Item</option>
                <option value="multiple">Multiple Items</option>
                <option value="large">Large Order</option>
              </select>
            </div>
            
            <button
              onClick={testShippingQuotes}
              className="w-full bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700"
            >
              Test Shipping Quotes
            </button>
          </div>
        </div>
      </div>

      {/* Test Results */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="bg-white border rounded-lg p-4">
          <h2 className="text-lg font-semibold mb-4">📊 Test Results</h2>
          
          <div className="space-y-2">
            <div className="flex justify-between">
              <span>Money Utils:</span>
              <span className={getTestStatus('moneyUtils').includes('Pass') ? 'text-green-600' : 'text-red-600'}>
                {getTestStatus('moneyUtils')}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Types:</span>
              <span className={getTestStatus('types').includes('Pass') ? 'text-green-600' : 'text-red-600'}>
                {getTestStatus('types')}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Data Validation:</span>
              <span className={getTestStatus('dataValidation').includes('Pass') ? 'text-green-600' : 'text-red-600'}>
                {getTestStatus('dataValidation')}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Shipping Quotes:</span>
              <span className={getTestStatus('shippingQuotes').includes('Pass') ? 'text-green-600' : 'text-red-600'}>
                {getTestStatus('shippingQuotes')}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Shipping Selection:</span>
              <span className={getTestStatus('shippingSelection').includes('Pass') ? 'text-green-600' : 'text-red-600'}>
                {getTestStatus('shippingSelection')}
              </span>
            </div>
          </div>
        </div>

        <div className="bg-white border rounded-lg p-4">
          <h2 className="text-lg font-semibold mb-4">🛒 Current State</h2>
          
          <div className="space-y-3">
            <div>
              <span className="font-medium">Cart Items:</span> {cartItems.length}
              {cartItems.map(item => (
                <div key={item.id} className="text-sm text-gray-600 ml-2">
                  {item.name} x{item.quantity} - £{item.price}
                  {item.printful_variant_id && ` (Variant: ${item.printful_variant_id})`}
                </div>
              ))}
            </div>
            
            <div>
              <span className="font-medium">Selected Shipping:</span>
              <div className="text-sm text-gray-600">
                {selectedShippingOption ? (
                  <div>
                    {selectedShippingOption.name} - £{selectedShippingOption.rate}
                  </div>
                ) : (
                  'None selected'
                )}
              </div>
            </div>
            
            <div>
              <span className="font-medium">Shipping Options:</span>
              <div className="text-sm text-gray-600">
                {loading ? 'Loading...' : `${options.length} available`}
                {error && <div className="text-red-600">Error: {error}</div>}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Shipping Methods Component */}
      {options.length > 0 && (
        <div className="bg-white border rounded-lg p-4 mb-8">
          <h2 className="text-lg font-semibold mb-4">🚚 Shipping Methods</h2>
          <ShippingMethods
            options={options}
            value={selectedShippingOption?.id}
            onChange={handleShippingSelect}
          />
        </div>
      )}

      {/* Console Output */}
      <div className="bg-black text-green-400 p-4 rounded-lg font-mono text-sm">
        <div className="flex justify-between items-center mb-2">
          <h2 className="text-lg font-semibold">📟 Console Output</h2>
          <button
            onClick={clearConsole}
            className="bg-gray-700 text-white px-2 py-1 rounded text-xs hover:bg-gray-600"
          >
            Clear
          </button>
        </div>
        
        <div className="max-h-64 overflow-y-auto">
          {consoleOutput.length === 0 ? (
            <div className="text-gray-500">No console output yet. Run tests to see results.</div>
          ) : (
            consoleOutput.map((line, index) => (
              <div key={index} className="mb-1">
                {line}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}

export default ShippingTestDashboard
