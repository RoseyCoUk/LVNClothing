# 🚀 Frontend Shipping Integration Testing Guide

This guide will help you test the complete shipping integration in your React app.

## 📋 **Prerequisites**

Make sure you have completed the backend setup:
- ✅ Supabase Edge Functions deployed
- ✅ Environment variables configured
- ✅ Backend APIs tested and working

## 🧪 **Testing Setup**

### **1. Start Your Development Server**

```bash
npm run dev
# or
yarn dev
```

### **2. Navigate to Test Routes**

Your app now has these test routes:
- `/shipping-test` - Basic shipping test
- `/shipping-dashboard` - Comprehensive test dashboard ⭐ **RECOMMENDED**
- `/shipping-example` - Full shipping flow example

## 🎯 **Recommended Testing Path**

### **Phase 1: Basic Component Testing**
Navigate to `/shipping-dashboard` for the most comprehensive testing experience.

### **Phase 2: Integration Testing**
Test the complete flow with real data.

### **Phase 3: Production Integration**
Test in your actual checkout flow.

## 🧪 **Test Dashboard Features**

The `/shipping-dashboard` route provides:

#### **🧪 Test Controls**
- **Run All Tests** - Execute all tests at once
- **Test Money Utils** - Test currency conversion functions
- **Test Types** - Validate TypeScript type definitions
- **Validate Test Data** - Check test data structure

#### **🛒 Cart Controls**
- **Add Test Item** - Add single item to cart
- **Add Multiple Items** - Add multiple items to cart
- **Clear Cart** - Reset cart state

#### **📍 Test Configuration**
- **Test Address** - Choose from London, Manchester, Dublin
- **Test Items** - Select single, multiple, or large order
- **Test Shipping Quotes** - Fetch shipping options

#### **📊 Test Results**
Real-time status of all tests with pass/fail indicators.

#### **🛒 Current State**
Live view of cart items, selected shipping, and available options.

#### **🚚 Shipping Methods**
Interactive shipping method selection component.

#### **📟 Console Output**
Captured console logs for debugging.

## 🔍 **Step-by-Step Testing**

### **Step 1: Basic Utility Testing**

1. **Navigate to `/shipping-dashboard`**
2. **Click "Test Money Utils"**
3. **Verify results show "✅ Pass"**
4. **Check console output for detailed results**

### **Step 2: Type System Testing**

1. **Click "Test Types"**
2. **Verify results show "✅ Pass"**
3. **Check console for type validation output**

### **Step 3: Data Validation Testing**

1. **Click "Validate Test Data"**
2. **Verify results show "✅ Pass"**
3. **Check console for validation details**

### **Step 4: Cart Integration Testing**

1. **Click "Add Test Item"**
2. **Verify item appears in cart**
3. **Click "Add Multiple Items"**
4. **Verify multiple items appear**
5. **Click "Clear Cart"**
6. **Verify cart is empty**

### **Step 5: Shipping Quotes Testing**

1. **Select test address** (London, Manchester, or Dublin)
2. **Select test items** (single, multiple, or large)
3. **Click "Test Shipping Quotes"**
4. **Verify shipping options appear**
5. **Check test results show "✅ Pass"**

### **Step 6: Shipping Selection Testing**

1. **With shipping options visible, click on a shipping method**
2. **Verify selection is registered**
3. **Check test results show "✅ Pass"**

### **Step 7: Complete Integration Test**

1. **Click "Run All Tests"**
2. **Watch all tests execute automatically**
3. **Verify all results show "✅ Pass"**
4. **Check console output for detailed results**

## 🐛 **Troubleshooting Common Issues**

### **Issue: "Cannot find module" errors**

**Solution:** Check file imports and paths
```bash
# Verify files exist
ls -la src/lib/shipping/
ls -la src/hooks/
ls -la src/components/checkout/
```

### **Issue: TypeScript compilation errors**

**Solution:** Check type definitions
```bash
# Run TypeScript check
npm run build
# or
yarn build
```

### **Issue: API calls failing**

**Solution:** Verify environment variables and Supabase function status
```bash
# Check .env file
cat .env

# Test Supabase function directly
curl -X OPTIONS "https://your-project.supabase.co/functions/v1/shipping-quotes"
```

### **Issue: Components not rendering**

**Solution:** Check browser console for errors
1. **Open DevTools (F12)**
2. **Check Console tab for errors**
3. **Check Network tab for failed requests**

## 📱 **Console Testing**

### **Manual Console Testing**

Open browser console and run:

```javascript
// Test basic utilities
runBasicTests()

// Test specific functions
testMoneyUtils()
testTypes()
validateTestData()

// Check global test runner
window.runBasicTests()
```

### **Console Output Analysis**

Look for these patterns:
- **✅ PASS** - Test successful
- **❌ FAIL** - Test failed
- **🧪 Testing** - Test in progress
- **🚀 Running** - Batch test started

## 🔧 **Advanced Testing**

### **Custom Test Data**

Modify `src/test-shipping-utils.ts` to add:
- New test addresses
- Different item combinations
- Custom shipping scenarios

### **Performance Testing**

1. **Test with large orders** (10+ items)
2. **Test multiple address changes**
3. **Monitor response times**
4. **Check memory usage**

### **Error Handling Testing**

1. **Test with invalid addresses**
2. **Test with invalid variant IDs**
3. **Test network failures**
4. **Verify error messages**

## 📊 **Success Criteria**

Your integration is working when:

- ✅ **All utility tests pass**
- ✅ **Type validation passes**
- ✅ **Data validation passes**
- ✅ **Shipping quotes load successfully**
- ✅ **Shipping selection works**
- ✅ **Cart integration functions**
- ✅ **Console output is clean**

## 🚀 **Next Steps After Testing**

1. **Verify all tests pass** in the dashboard
2. **Test in your actual checkout flow**
3. **Deploy to staging environment**
4. **Run end-to-end tests**
5. **Deploy to production**

## 📞 **Getting Help**

If you encounter issues:

1. **Check the console output** in the test dashboard
2. **Review browser console** for detailed errors
3. **Verify Supabase function status**
4. **Check environment variables**
5. **Review the backend testing results**

## 🎯 **Quick Test Checklist**

- [ ] **Navigate to `/shipping-dashboard`**
- [ ] **Click "Run All Tests"**
- [ ] **Verify all tests show "✅ Pass"**
- [ ] **Test cart functionality**
- [ ] **Test shipping quotes**
- [ ] **Test shipping selection**
- [ ] **Check console output**
- [ ] **Verify no errors in browser console**

## 🏆 **Congratulations!**

When all tests pass, you have successfully integrated:
- ✅ **Live shipping rates** from Printful
- ✅ **Dynamic PaymentIntent updates** with Stripe
- ✅ **Real-time shipping calculations**
- ✅ **Seamless checkout integration**

Your shipping system is ready for production! 🎉
