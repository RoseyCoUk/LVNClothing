import { supabase } from '../../lib/supabase'

// Admin API Client for interacting with admin Edge Functions
export class AdminAPI {
  private baseUrl: string

  constructor() {
    // Get the base URL from environment or use a default
    this.baseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://your-project.supabase.co'
  }

  // Helper method to get function URL
  private getFunctionUrl(functionName: string): string {
    return `${this.baseUrl}/functions/v1/${functionName}`
  }

  // Helper method to make authenticated requests
  private async makeRequest(functionName: string, body: any) {
    const { data: { session } } = await supabase.auth.getSession()
    
    if (!session?.access_token) {
      throw new Error('No active session')
    }

    const response = await fetch(this.getFunctionUrl(functionName), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session.access_token}`,
        'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY || ''
      },
      body: JSON.stringify(body)
    })

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Request failed' }))
      throw new Error(error.error || `HTTP ${response.status}`)
    }

    return response.json()
  }

  // ===== ORDERS MANAGEMENT =====
  
  async getOrders(page: number = 1, limit: number = 50, status?: string, search?: string) {
    return this.makeRequest('admin-orders', {
      action: 'get_orders',
      page,
      limit,
      status,
      search
    })
  }

  async updateOrderStatus(orderId: string, newStatus: string) {
    return this.makeRequest('admin-orders', {
      action: 'update_order_status',
      orderId,
      newStatus
    })
  }

  async getOrderDetails(orderId: string) {
    return this.makeRequest('admin-orders', {
      action: 'get_order_details',
      orderId
    })
  }

  async getOrdersStats() {
    return this.makeRequest('admin-orders', {
      action: 'get_orders_stats'
    })
  }

  // ===== ANALYTICS =====
  
  async getDashboardStats() {
    return this.makeRequest('admin-analytics', {
      action: 'get_dashboard_stats'
    })
  }

  async getRevenueTrends(timeRange: '7d' | '30d' | '90d' | '1y' = '30d') {
    return this.makeRequest('admin-analytics', {
      action: 'get_revenue_trends',
      timeRange
    })
  }

  async getCustomerGrowth(timeRange: '7d' | '30d' | '90d' | '1y' = '30d') {
    return this.makeRequest('admin-analytics', {
      action: 'get_customer_growth',
      timeRange
    })
  }

  async getTopProducts() {
    return this.makeRequest('admin-analytics', {
      action: 'get_top_products'
    })
  }

  // ===== CUSTOMERS MANAGEMENT =====
  
  async getCustomers(page: number = 1, limit: number = 50, search?: string) {
    return this.makeRequest('admin-customers', {
      action: 'get_customers',
      page,
      limit,
      search
    })
  }

  async getCustomerDetails(customerId: string) {
    return this.makeRequest('admin-customers', {
      action: 'get_customer_details',
      customerId
    })
  }

  async updateCustomer(customerId: string, updates: any) {
    return this.makeRequest('admin-customers', {
      action: 'update_customer',
      customerId,
      updates
    })
  }

  async getCustomerStats() {
    return this.makeRequest('admin-customers', {
      action: 'get_customer_stats'
    })
  }

  // ===== ADMIN AUTHENTICATION =====
  
  async checkAdminPermission(resource: string, action: string = 'read') {
    return this.makeRequest('admin-auth', {
      action: 'check_permission',
      resource,
      permission_action: action
    })
  }

  async getAdminRole() {
    return this.makeRequest('admin-auth', {
      action: 'get_role'
    })
  }

  async validateAdminAccess() {
    return this.makeRequest('admin-auth', {
      action: 'validate_access'
    })
  }
}

// Export a singleton instance
export const adminAPI = new AdminAPI()

// Export types for API responses
export interface OrdersResponse {
  orders: any[]
  total: number
  page: number
  limit: number
}

export interface DashboardStats {
  totalOrders: number
  totalRevenue: number
  totalCustomers: number
  averageOrderValue: number
}

export interface RevenueTrends {
  revenueTrends: Array<{
    month: string
    count: number
    revenue: number
  }>
}

export interface CustomerGrowth {
  customerGrowth: Array<{
    month: string
    count: number
  }>
}

export interface TopProducts {
  topProducts: Array<{
    name: string
    quantity: number
    revenue: number
  }>
}

export interface CustomersResponse {
  customers: any[]
  total: number
  page: number
  limit: number
}

export interface CustomerDetails {
  customer: any
  orders: any[]
}
