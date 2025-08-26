import { serve } from "https://deno.land/std@0.224.0/http/server.ts"

// Define CORS headers locally
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Max-Age': '86400',
}

interface TestPaymentRequest {
  cardNumber: string;
  expiryDate: string;
  cvv: string;
  amount: number;
  currency: string;
}

interface TestPaymentResponse {
  success: boolean;
  error?: string;
  errorType?: string;
  validationErrors?: string[];
  testMode: boolean;
}

function validateCardNumber(cardNumber: string): boolean {
  // Remove spaces and dashes
  const cleanNumber = cardNumber.replace(/\s+/g, '').replace(/-/g, '');
  
  // Check if it's a valid test card number
  if (cleanNumber === '4242424242424242') {
    return true;
  }
  
  // Check if it's an invalid test card
  if (cleanNumber === '1234567890123456') {
    return false;
  }
  
  // Basic Luhn algorithm check
  let sum = 0;
  let isEven = false;
  
  for (let i = cleanNumber.length - 1; i >= 0; i--) {
    let digit = parseInt(cleanNumber.charAt(i));
    
    if (isEven) {
      digit *= 2;
      if (digit > 9) {
        digit -= 9;
      }
    }
    
    sum += digit;
    isEven = !isEven;
  }
  
  return sum % 10 === 0;
}

function validateExpiryDate(expiryDate: string): boolean {
  const [month, year] = expiryDate.split('/');
  const currentDate = new Date();
  const currentYear = currentDate.getFullYear() % 100; // Get last 2 digits
  const currentMonth = currentDate.getMonth() + 1; // January is 0
  
  const expMonth = parseInt(month);
  const expYear = parseInt(year);
  
  if (expMonth < 1 || expMonth > 12) {
    return false;
  }
  
  if (expYear < currentYear || (expYear === currentYear && expMonth < currentMonth)) {
    return false;
  }
  
  return true;
}

function validateCVV(cvv: string): boolean {
  return cvv.length >= 3 && cvv.length <= 4 && /^\d+$/.test(cvv);
}

function validatePaymentData(data: TestPaymentRequest): TestPaymentResponse {
  const validationErrors: string[] = [];
  
  // Validate card number
  if (!data.cardNumber || data.cardNumber.trim() === '') {
    validationErrors.push('Card number is required');
  } else if (!validateCardNumber(data.cardNumber)) {
    validationErrors.push('Invalid card number');
  }
  
  // Validate expiry date
  if (!data.expiryDate || data.expiryDate.trim() === '') {
    validationErrors.push('Expiry date is required');
  } else if (!validateExpiryDate(data.expiryDate)) {
    validationErrors.push('Card has expired or invalid expiry date');
  }
  
  // Validate CVV
  if (!data.cvv || data.cvv.trim() === '') {
    validationErrors.push('CVV is required');
  } else if (!validateCVV(data.cvv)) {
    validationErrors.push('Invalid CVV');
  }
  
  // Validate amount
  if (data.amount <= 0) {
    validationErrors.push('Invalid amount');
  }
  
  // Validate currency
  if (!data.currency || !['GBP', 'USD', 'EUR'].includes(data.currency.toUpperCase())) {
    validationErrors.push('Invalid currency');
  }
  
  if (validationErrors.length > 0) {
    return {
      success: false,
      error: 'Payment validation failed',
      errorType: 'validation_error',
      validationErrors,
      testMode: true
    };
  }
  
  // Simulate different failure scenarios for testing
  if (data.cardNumber === '4000000000000002') {
    return {
      success: false,
      error: 'Your card was declined.',
      errorType: 'card_declined',
      testMode: true
    };
  }
  
  if (data.cardNumber === '4000000000009995') {
    return {
      success: false,
      error: 'Your card was declined.',
      errorType: 'insufficient_funds',
      testMode: true
    };
  }
  
  if (data.cardNumber === '4000000000009987') {
    return {
      success: false,
      error: 'Your card was declined.',
      errorType: 'lost_card',
      testMode: true
    };
  }
  
  // Success case
  return {
    success: true,
    testMode: true
  };
}

serve(async (req: Request) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    if (req.method === 'POST') {
      const body: TestPaymentRequest = await req.json();
      
      // Validate the payment data
      const result = validatePaymentData(body);
      
      // Simulate processing delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      return new Response(
        JSON.stringify(result),
        {
          status: result.success ? 200 : 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    } else if (req.method === 'GET') {
      return new Response(
        JSON.stringify({
          message: 'Test Stripe Failures Function',
          description: 'This function simulates Stripe checkout failures for testing invalid payment scenarios',
          testCards: {
            valid: '4242 4242 4242 4242',
            declined: '4000 0000 0000 0002',
            insufficient_funds: '4000 0000 0000 9995',
            lost_card: '4000 0000 0000 9987',
            invalid: '1234 5678 9012 3456'
          },
          testMode: true
        }),
        {
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    } else {
      return new Response(
        JSON.stringify({ error: 'Method not allowed' }),
        {
          status: 405,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }
  } catch (error) {
    return new Response(
      JSON.stringify({ 
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error',
        testMode: true
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
