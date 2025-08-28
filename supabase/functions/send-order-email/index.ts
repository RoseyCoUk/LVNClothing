import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')

interface OrderEmailData {
  to: string
  customerName: string
  orderId: string
  orderTotal: number
  orderItems: Array<{
    name: string
    quantity: number
    price: number
  }>
  type: 'confirmation' | 'shipped' | 'delivered'
}

serve(async (req) => {
  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 })
  }

  try {
    const data: OrderEmailData = await req.json()

    if (!RESEND_API_KEY) {
      throw new Error('RESEND_API_KEY not configured')
    }

    const emailHTML = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; color: #333; background: #F3F0E6; }
          .container { max-width: 600px; margin: 0 auto; background: white; }
          .header { background: #800000; color: white; padding: 30px; text-align: center; }
          .content { padding: 30px; }
          .footer { background: #333; color: white; padding: 20px; text-align: center; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Order ${data.type === 'confirmation' ? 'Confirmed' : data.type === 'shipped' ? 'Shipped' : 'Delivered'}!</h1>
            <p>LVN Clothing - Premium Christian Streetwear</p>
          </div>
          <div class="content">
            <h2>Hello ${data.customerName}!</h2>
            <p>Order #${data.orderId} - £${data.orderTotal.toFixed(2)}</p>
            <p>"The kingdom of heaven is like leaven..." - Matthew 13:33</p>
          </div>
          <div class="footer">
            <p>LVN Clothing • Kingdom Leaven • Matthew 13:33</p>
          </div>
        </div>
      </body>
      </html>
    `

    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: 'LVN Clothing <orders@lvnclothing.com>',
        to: [data.to],
        subject: `Order ${data.type} - LVN Clothing #${data.orderId}`,
        html: emailHTML,
      }),
    })

    const result = await res.json()
    
    return new Response(
      JSON.stringify({ success: true, messageId: result.id }),
      { headers: { 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    )
  }
})