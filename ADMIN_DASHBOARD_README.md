# LVN Clothing Admin Dashboard

A comprehensive admin dashboard for LVN Clothing that mimics Shopify's style and functionality. Built with React, TypeScript, Tailwind CSS, and Supabase.

## 🚀 Features

### Authentication & Security
- **Protected Admin Routes**: Only authenticated admin users can access the dashboard
- **Supabase Authentication**: Secure email/password login
- **Admin Role Verification**: Checks user permissions before granting access
- **Session Management**: Automatic logout and session timeout

### Dashboard Layout
- **Sidebar Navigation**: Clean, responsive sidebar with main sections
- **Top Navigation Bar**: Profile dropdown and mobile menu
- **Responsive Design**: Works perfectly on desktop and mobile devices
- **LVN Branding**: Consistent with the main website design

### Pages & Functionality

#### 📊 Overview Dashboard
- **Key Metrics**: Total sales, revenue, orders, customers
- **Weekly Sales Chart**: Visual representation of sales data
- **Recent Activity**: Latest orders, customers, and product updates
- **Quick Actions**: Easy access to common tasks

#### 📦 Orders Management
- **Order Table**: Complete order history with filtering and search
- **Status Tracking**: Paid, fulfilled, shipped, pending statuses
- **Order Details**: Customer information, totals, and dates
- **Export Functionality**: Download order data

#### 🛍️ Products Management
- **Product Grid/List View**: Toggle between different viewing modes
- **Stock Management**: Track inventory levels and alerts
- **Product Categories**: Filter by apparel, gear, accessories
- **Search & Filter**: Find products quickly
- **Product Actions**: View, edit, and manage products

#### 👥 Customers Management
- **Customer Database**: All captured emails and subscriber data
- **Newsletter Subscribers**: Track subscription status
- **Customer Analytics**: New customers, total customers, etc.
- **Export CSV**: Download customer data

#### ⚙️ Settings
- **General Settings**: Store name, admin email, timezone
- **Email Configuration**: SMTP settings for notifications
- **Security Settings**: 2FA, session timeout, password management
- **Appearance**: Theme, sidebar position, layout options
- **Integrations**: Supabase, Printful, Stripe, Resend API keys

## 🛠️ Technical Implementation

### Tech Stack
- **Frontend**: React 18 + TypeScript
- **Styling**: Tailwind CSS + shadcn/ui components
- **Icons**: Lucide React
- **Charts**: Custom chart components
- **Backend**: Supabase (Database + Auth)
- **Routing**: React Router v6

### File Structure
```
src/components/admin/
├── AdminLoginPage.tsx          # Admin login form
├── AdminLayout.tsx             # Main admin layout with sidebar
├── AdminOverviewPage.tsx       # Dashboard overview
├── AdminOrdersPage.tsx         # Orders management
├── AdminProductsPage.tsx       # Products management
├── AdminCustomersPage.tsx      # Customers management
├── AdminSettingsPage.tsx       # Settings page
├── ProtectedAdminRoute.tsx     # Route protection component
└── ui/
    └── button.tsx              # Reusable button component

src/contexts/
└── AdminAuthContext.tsx        # Admin authentication context
```

### Key Components

#### AdminAuthContext
- Manages admin authentication state
- Handles login/logout functionality
- Verifies admin permissions
- Provides admin user data to components

#### ProtectedAdminRoute
- Wraps admin routes for protection
- Redirects to login if not authenticated
- Shows loading state during auth check

#### AdminLayout
- Main layout with sidebar navigation
- Responsive mobile menu
- Profile dropdown
- Active page highlighting

## 🚀 Setup Instructions

### 1. Database Setup
Run the following SQL in your Supabase SQL editor:

```sql
-- Add is_admin column to user_preferences table
ALTER TABLE user_preferences ADD COLUMN IF NOT EXISTS is_admin BOOLEAN DEFAULT false;

-- Create admin user (replace with your user ID)
INSERT INTO user_preferences (
  user_id,
  is_admin,
  notification_preferences,
  created_at,
  updated_at
) VALUES (
  'your-user-id-here',
  true,
  '{"email": true, "sms": false}',
  NOW(),
  NOW()
);
```

### 2. Finding Your User ID
1. Go to Supabase Dashboard > Authentication > Users
2. Find your user email
3. Copy the user ID (UUID)
4. Replace 'your-user-id-here' in the SQL above

### 3. Access the Admin Dashboard
1. Navigate to `/admin/login`
2. Log in with your admin credentials
3. You'll be redirected to `/admin` dashboard
4. The LVN logo in the header will now redirect to admin if you're an admin user

## 🔧 Configuration

### Environment Variables
The admin dashboard uses the same environment variables as the main site:
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

### Customization
- **Colors**: Update Tailwind config for custom color scheme
- **Layout**: Modify `AdminLayout.tsx` for different sidebar/navbar
- **Pages**: Add new admin pages by creating components and adding routes
- **Permissions**: Extend `AdminAuthContext` for role-based access

## 📱 Responsive Design

The admin dashboard is fully responsive and includes:
- **Mobile Sidebar**: Collapsible sidebar for mobile devices
- **Touch-Friendly**: All buttons and interactions work on touch devices
- **Flexible Grid**: Adapts to different screen sizes
- **Mobile Navigation**: Hamburger menu for mobile

## 🔒 Security Features

- **Route Protection**: All admin routes are protected
- **Admin Verification**: Checks user permissions on each route
- **Session Management**: Automatic logout on session expiry
- **Secure API Calls**: All database calls go through Supabase

## 🎨 Design System

### Colors
- **Primary**: `lvn-maroon` (#800000)
- **Background**: `gray-50` for dashboard, `lvnBg` for main site
- **Text**: `gray-900` for headings, `gray-600` for body text

### Components
- **Cards**: White background with subtle shadows
- **Buttons**: Consistent styling with hover states
- **Tables**: Clean, sortable tables with hover effects
- **Forms**: Accessible form controls with proper focus states

## 🚀 Future Enhancements

### Planned Features
- **Real-time Updates**: Live order notifications
- **Advanced Analytics**: More detailed charts and reports
- **Bulk Operations**: Mass product/order updates
- **API Integrations**: Printful, Stripe webhook handling
- **User Management**: Add/edit admin users
- **Audit Logs**: Track admin actions

### Performance Optimizations
- **Lazy Loading**: Load pages on demand
- **Caching**: Cache frequently accessed data
- **Pagination**: Handle large datasets efficiently
- **Search Optimization**: Fast, fuzzy search

## 🐛 Troubleshooting

### Common Issues

**"Access Denied" Error**
- Verify user has `is_admin: true` in `user_preferences` table
- Check user authentication status in Supabase

**Navigation Not Working**
- Ensure all routes are properly configured in `App.tsx`
- Check that `ProtectedAdminRoute` is wrapping admin routes

**Data Not Loading**
- Verify Supabase connection and API keys
- Check browser console for errors
- Ensure database tables exist and have correct permissions

### Debug Mode
To enable debug logging, add to your admin components:
```typescript
console.log('Admin data:', data);
```

## 📞 Support

For issues or questions about the admin dashboard:
1. Check the browser console for errors
2. Verify Supabase configuration
3. Test with a known admin user
4. Check database permissions and RLS policies

---

**Built with ❤️ for LVN Clothing**
*Kingdom Leaven • Matthew 13:33*
