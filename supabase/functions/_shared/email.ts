// This is a shared utility file for email-related functions

/**
 * Sends an order notification email to the support team
 * 
 * @param orderId The ID of the order
 * @param customerEmail The customer's email address
 * @returns A promise that resolves when the email is sent
 */
export async function sendOrderEmail(orderId: string, customerEmail: string): Promise<Response> {
  try {
    const response = await fetch(`${Deno.env.get('SUPABASE_URL')}/functions/v1/send-order-email`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')}`,
      },
      body: JSON.stringify({
        orderId,
        customerEmail,
      }),
    });
    
    return response;
  } catch (error) {
    console.error('Error sending order email:', error);
    throw error;
  }
}