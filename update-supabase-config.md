# 🔧 Manual Supabase Configuration Update Required

## 🚨 Critical Action Needed

The authentication fixes have been implemented in the code, but the Supabase project configuration needs to be manually updated to include the correct development server URLs.

## 📋 Current Issue

The Supabase project is configured with redirect URLs that don't match the development server ports:
- **Current config:** `http://127.0.0.1:3000`
- **Actual dev servers:** `http://localhost:5173` and `http://localhost:5174`

This mismatch prevents authentication from working properly in development.

## 🔧 Steps to Fix

### 1. Access Supabase Dashboard
1. Go to [https://supabase.com/dashboard](https://supabase.com/dashboard)
2. Sign in to your account
3. Select the **ReformUK** project (`nsmrxwnrtsllxvplazmm`)

### 2. Update Authentication Settings
1. Navigate to **Authentication** → **Settings**
2. Scroll down to **URL Configuration**
3. Update the following fields:

#### Site URL
```
http://localhost:5173
```

#### Additional Redirect URLs
Add these URLs (one per line):
```
http://localhost:5173
http://localhost:5174
http://127.0.0.1:5173
http://127.0.0.1:5174
http://127.0.0.1:3000
```

### 3. Save Changes
1. Click **Save** button
2. Wait for the changes to be applied (usually takes a few seconds)

## ✅ Verification Steps

After updating the configuration:

1. **Test the authentication test page:**
   - Open `test-authentication-fixes.html` in your browser
   - Run all the authentication tests
   - Verify that signup and login tests pass

2. **Test the React app:**
   - Go to `http://localhost:5173` or `http://localhost:5174`
   - Try to sign up with a new account
   - Try to log in with the created account
   - Verify that protected pages (Account, Orders) are accessible when logged in

3. **Test checkout flow:**
   - Add items to cart
   - Navigate to checkout
   - Verify that checkout page loads properly (not redirected to shop)

## 🐛 Common Issues and Solutions

### Issue: "Invalid redirect URL" error
**Solution:** Make sure all URLs in the redirect list are exactly correct, including protocol (http/https) and port numbers.

### Issue: Authentication still not working after config update
**Solution:** 
1. Wait a few minutes for changes to propagate
2. Clear browser cache and cookies
3. Restart the development server

### Issue: CORS errors
**Solution:** The redirect URL update should resolve CORS issues. If problems persist, check that the site URL matches exactly.

## 📊 Expected Results After Fix

- ✅ User signup should work without email confirmation
- ✅ User login should work with valid credentials
- ✅ Protected pages should be accessible when authenticated
- ✅ Checkout page should load properly with items in cart
- ✅ No more 401 Unauthorized errors from authentication endpoints

## 🔍 Monitoring

After the fix, monitor the browser console for:
- Successful authentication requests
- Proper session management
- No more redirect URL errors

## 📞 Support

If you encounter issues after updating the configuration:
1. Check the Supabase project logs in the dashboard
2. Verify the configuration was saved correctly
3. Test with the authentication test page first
4. Check browser console for specific error messages

---

**Status:** ⏳ **PENDING** - Manual configuration update required
**Priority:** 🔴 **HIGH** - Authentication cannot work without this update
**Estimated Time:** 5-10 minutes
