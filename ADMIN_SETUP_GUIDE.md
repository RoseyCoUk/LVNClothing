# 🚀 Admin Dashboard Setup Guide

This guide will walk you through setting up the complete admin dashboard system for Reform UK.

## 📋 **Prerequisites**

- ✅ Supabase CLI installed and configured
- ✅ Supabase project linked to your local development
- ✅ Node.js and npm installed
- ✅ Existing user account in your Supabase auth system

## 🔧 **Step 1: Apply Database Migration**

The admin system requires new database tables and functions. Run this command to apply the migration:

```bash
npm run setup:admin
```

This will:
- Apply the admin database migration
- Deploy the admin authentication Edge Function
- Set up all necessary database structures

## 👤 **Step 2: Create Your First Admin User**

### **Option A: Using the Setup Script (Recommended)**

1. Run the setup script:
   ```bash
   npm run setup:admin
   ```

2. The script will guide you through the process

### **Option B: Manual Database Setup**

1. **Find your user ID** in Supabase:
   ```sql
   SELECT id, email, created_at 
   FROM auth.users 
   WHERE email = 'your-email@example.com';
   ```

2. **Create admin role** (replace `YOUR_USER_ID_HERE` with your actual user ID):
   ```sql
   INSERT INTO public.admin_roles (user_id, role, permissions) 
   VALUES (
     'YOUR_USER_ID_HERE',
     'super_admin', 
     '["admin_access"]'
   );
   ```

3. **Verify the setup**:
   ```sql
   SELECT public.get_user_admin_role('YOUR_USER_ID_HERE');
   ```

## 🎯 **Step 3: Test the Admin System**

1. **Start your development server**:
   ```bash
   npm run dev
   ```

2. **Navigate to admin login**:
   ```
   http://localhost:5173/admin/login
   ```

3. **Log in with your credentials**:
   - Use the same email/password you use for regular site access
   - The system will automatically check if you have admin privileges

4. **Access the dashboard**:
   - You should be redirected to `/admin/dashboard`
   - The sidebar will show all available admin sections

## 🔐 **Admin Roles & Permissions**

### **Role Types**
- **`super_admin`**: Full access to all features and can manage other admin users
- **`admin`**: Standard admin access with configurable permissions

### **Available Permissions**
- `view_orders` - View all orders
- `manage_orders` - Update order statuses
- `view_customers` - View customer profiles
- `manage_customers` - Edit customer information
- `view_analytics` - View business analytics
- `view_settings` - View admin settings
- `manage_settings` - Update admin settings
- `admin_access` - Full access (super admin only)

## 🛠️ **Creating Additional Admin Users**

Once you have a super admin account, you can create additional admin users:

1. **Through the admin dashboard** (recommended):
   - Navigate to Settings → User Management
   - Add new admin users with specific permissions

2. **Directly in the database**:
   ```sql
   INSERT INTO public.admin_roles (user_id, role, permissions) 
   VALUES (
     'NEW_USER_ID',
     'admin', 
     '["view_orders", "view_customers", "view_analytics"]'
   );
   ```

## 🔍 **Troubleshooting**

### **Common Issues**

1. **"No admin role found" error**:
   - Ensure you've created the admin role in the database
   - Check that the user ID matches exactly
   - Verify the admin_roles table exists

2. **Edge Function deployment fails**:
   - Check your Supabase CLI connection
   - Ensure you have the necessary permissions
   - Try running `supabase functions deploy admin-auth` manually

3. **Permission denied errors**:
   - Check your user's admin role and permissions
   - Verify the permission names match exactly
   - Ensure the admin role is active

### **Debug Steps**

1. **Check database tables**:
   ```sql
   SELECT * FROM public.admin_roles;
   SELECT * FROM public.admin_permissions;
   ```

2. **Test permission function**:
   ```sql
   SELECT public.check_admin_permission('YOUR_USER_ID', 'orders', 'read');
   ```

3. **Check Edge Function logs**:
   ```bash
   supabase functions logs admin-auth
   ```

## 📱 **Accessing Admin Dashboard**

### **URLs**
- **Login**: `/admin/login`
- **Dashboard**: `/admin/dashboard`
- **Orders**: `/admin/orders`
- **Analytics**: `/admin/analytics`
- **Customers**: `/admin/customers`
- **Settings**: `/admin/settings`

### **Security Features**
- ✅ Authentication required for all admin routes
- ✅ Role-based access control
- ✅ Permission-based feature access
- ✅ Automatic session management
- ✅ Secure API endpoints

## 🚀 **Next Steps**

After successful setup:

1. **Customize permissions** for different admin users
2. **Set up notifications** for new orders
3. **Configure analytics** time ranges and metrics
4. **Add custom admin features** as needed
5. **Set up monitoring** for admin access

## 📞 **Support**

If you encounter issues:

1. Check the troubleshooting section above
2. Review the `ADMIN_DASHBOARD_README.md` for detailed documentation
3. Check Supabase logs for errors
4. Verify database permissions and RLS policies

## 🔒 **Security Notes**

- Admin roles are stored securely in the database
- All admin routes are protected by authentication
- Permissions are checked on every request
- Session tokens are validated automatically
- RLS policies ensure data isolation

---

**🎉 Congratulations!** Your admin dashboard is now fully functional with proper authentication, role-based access control, and secure backend infrastructure.
