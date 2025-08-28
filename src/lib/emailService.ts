import { supabase } from './supabase';

interface OrderItem {
  name: string;
  quantity: number;
  price: number;
}

interface EmailOrderData {
  customerEmail: string;
  customerName: string;
  orderId: string;
  orderTotal: number;
  orderItems: OrderItem[];
  type: 'confirmation' | 'shipped' | 'delivered';
}

export const sendOrderEmail = async (emailData: EmailOrderData): Promise<boolean> => {
  try {
    const { data, error } = await supabase.functions.invoke('send-order-email', {
      body: {
        to: emailData.customerEmail,
        customerName: emailData.customerName,
        orderId: emailData.orderId,
        orderTotal: emailData.orderTotal,
        orderItems: emailData.orderItems,
        type: emailData.type
      }
    });

    if (error) {
      console.error('Email service error:', error);
      return false;
    }

    if (!data?.success) {
      console.error('Email sending failed:', data?.error);
      return false;
    }

    console.log('Email sent successfully:', data.messageId);
    return true;
    
  } catch (error) {
    console.error('Email service exception:', error);
    return false;
  }
};

// Helper function to send order confirmation email
export const sendOrderConfirmation = async (
  customerEmail: string,
  customerName: string,
  orderId: string,
  orderTotal: number,
  orderItems: OrderItem[]
): Promise<boolean> => {
  return sendOrderEmail({
    customerEmail,
    customerName,
    orderId,
    orderTotal,
    orderItems,
    type: 'confirmation'
  });
};

// Helper function to send shipping notification
export const sendShippingNotification = async (
  customerEmail: string,
  customerName: string,
  orderId: string,
  orderTotal: number,
  orderItems: OrderItem[]
): Promise<boolean> => {
  return sendOrderEmail({
    customerEmail,
    customerName,
    orderId,
    orderTotal,
    orderItems,
    type: 'shipped'
  });
};

// Helper function to send delivery confirmation
export const sendDeliveryConfirmation = async (
  customerEmail: string,
  customerName: string,
  orderId: string,
  orderTotal: number,
  orderItems: OrderItem[]
): Promise<boolean> => {
  return sendOrderEmail({
    customerEmail,
    customerName,
    orderId,
    orderTotal,
    orderItems,
    type: 'delivered'
  });
};
