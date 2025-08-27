# Reform UK Admin Dashboard

A comprehensive admin dashboard for managing the Reform UK e-commerce platform, built with React, TypeScript, and Supabase.

## Features

### 🔐 **Authentication & Security**
- Secure admin login system
- Session management with Supabase Auth
- Protected admin routes
- Automatic logout on session expiry

### 📊 **Dashboard Overview**
- Real-time key metrics display
- Total orders, revenue, customers, and average order value
- Quick action buttons for common tasks
- Recent orders summary

### 📦 **Order Management**
- View all customer orders
- Search and filter orders by status
- Update order statuses (pending, processing, shipped, completed, cancelled)
- Detailed order information including customer details and items
- Order history tracking

### 📈 **Analytics & Reporting**
- Time-based analytics (7 days, 30 days, 90 days, 1 year)
- Revenue trends and order patterns
- Customer growth analysis
- Top-performing products
- Key business insights

### 👥 **Customer Management**
- View all customer profiles
- Search customers by name, email, or phone
- Customer details including contact information
- Member since dates and account information

### ⚙️ **Admin Settings**
- Email notification preferences
- Dashboard refresh rate configuration
- Security settings (session timeout, 2FA)
- API connection status monitoring

## Access

### URL Structure
- **Login**: `/admin/login`
- **Dashboard**: `/admin/dashboard`
- **Orders**: `/admin/orders`
- **Analytics**: `/admin/analytics`
- **Customers**: `/admin/customers`
- **Settings**: `/admin/settings`

### Getting Started
1. Navigate to `/admin/login`
2. Use your admin credentials to sign in
3. You'll be redirected to the dashboard upon successful authentication

## Technical Implementation

### Frontend Technologies
- **React 18** with TypeScript
- **Tailwind CSS** for styling
- **Heroicons** for consistent iconography
- **React Router** for navigation

### Backend Integration
- **Supabase** for authentication and database
- **Real-time data** from orders and customer tables
- **Secure API calls** with proper error handling

### Key Components
- `AdminLoginPage` - Secure login interface
- `AdminLayout` - Consistent navigation sidebar
- `AdminDashboard` - Main overview and metrics
- `AdminOrdersPage` - Order management interface
- `AdminAnalyticsPage` - Business intelligence and reporting
- `AdminCustomersPage` - Customer profile management
- `AdminSettingsPage` - Configuration and preferences

## Database Tables Used

### Orders
- `orders` - Main order information
- `order_items` - Individual items in orders

### Customers
- `customer_profiles` - Customer information
- `user_preferences` - User settings

### Authentication
- `auth.users` - Supabase auth users

## Security Features

- **Row Level Security (RLS)** policies on all tables
- **Authentication required** for all admin routes
- **Session validation** on every page load
- **Automatic redirect** to login for unauthenticated users

## Customization

### Adding New Admin Features
1. Create new component in `src/components/`
2. Add route to `App.tsx`
3. Update navigation in `AdminLayout.tsx`
4. Implement proper authentication checks

### Styling
- Uses Tailwind CSS utility classes
- Follows iOS-inspired design principles
- Consistent color scheme and spacing
- Responsive design for all screen sizes

### Data Fetching
- All data is fetched from Supabase
- Real-time updates possible with Supabase subscriptions
- Proper error handling and loading states

## Browser Support

- Modern browsers (Chrome, Firefox, Safari, Edge)
- Mobile responsive design
- Progressive Web App capabilities

## Performance

- Lazy loading of admin components
- Efficient data fetching with proper caching
- Minimal bundle size impact
- Optimized re-renders with React hooks

## Troubleshooting

### Common Issues
1. **Authentication errors** - Check Supabase configuration
2. **Data not loading** - Verify database permissions and RLS policies
3. **Navigation issues** - Ensure all routes are properly configured

### Development
- Check browser console for errors
- Verify Supabase connection in network tab
- Test authentication flow step by step

## Future Enhancements

- **Real-time notifications** for new orders
- **Advanced reporting** with charts and graphs
- **Bulk operations** for orders and customers
- **Export functionality** for reports
- **Mobile app** for admin access
- **Multi-language support**
- **Advanced user roles** and permissions

## Support

For technical support or feature requests, please contact the development team or create an issue in the project repository.
