# Frontend Integration Guide - Merged Printful Variants

This guide shows you how to integrate the merged Printful variant files into your frontend code.

## 🎯 **New Product Structure**

### **Reform UK T-Shirt** (100 variants total)
- **DARK design**: 60 variants (5 sizes × 12 colors)
- **LIGHT design**: 40 variants (5 sizes × 8 colors)
- **One product** with design selection + size + color

### **Reform UK Hoodie** (45 variants total)
- **DARK design**: 25 variants (5 sizes × 5 colors)
- **LIGHT design**: 20 variants (5 sizes × 4 colors)
- **One product** with design selection + size + color

---

## 📁 **Files to Use**

### **Replace Old Files With:**
- `src/hooks/tshirt-variants-merged.ts` (instead of `tshirt-variants.ts`)
- `src/hooks/hoodie-variants-merged.ts` (instead of `hoodie-variants.ts`)

### **Keep Existing Files:**
- `src/hooks/cap-variants.ts` (8 variants)
- `src/hooks/mug-variants.ts` (1 variant)
- `src/hooks/totebag-variants.ts` (1 variant)
- `src/hooks/waterbottle-variants.ts` (1 variant)
- `src/hooks/mousepad-variants.ts` (1 variant)

---

## 🔧 **How to Use the New Variant Structure**

### **1. Import the Merged Variants**

```typescript
// OLD WAY (separate files)
import { tshirtVariants } from '@/hooks/tshirt-variants-clean';
import { hoodieVariants } from '@/hooks/hoodie-variants-clean';

// NEW WAY (merged files)
import { 
  TshirtVariants, 
  findTshirtVariant,
  tshirtDesigns,
  tshirtSizes,
  tshirtColors 
} from '@/hooks/tshirt-variants-merged';

import { 
  HoodieVariants, 
  findHoodieVariant,
  hoodieDesigns,
  hoodieSizes,
  hoodieColors 
} from '@/hooks/hoodie-variants-merged';
```

### **2. Find Variants by Design + Size + Color**

```typescript
// Find a specific t-shirt variant
const tshirtVariant = findTshirtVariant('DARK', 'M', 'Color 3');
if (tshirtVariant) {
  console.log(`Price: £${tshirtVariant.price}`);
  console.log(`Catalog Variant ID: ${tshirtVariant.catalogVariantId}`);
  console.log(`External ID: ${tshirtVariant.externalId}`);
}

// Find a specific hoodie variant
const hoodieVariant = findHoodieVariant('LIGHT', 'L', 'Color 2');
if (hoodieVariant) {
  console.log(`Price: £${hoodieVariant.price}`);
  console.log(`Catalog Variant ID: ${hoodieVariant.catalogVariantId}`);
}
```

### **3. Get All Variants by Design**

```typescript
// Get all DARK t-shirt variants
const darkTshirts = getTshirtVariantsByDesign('DARK');
console.log(`Found ${darkTshirts.length} DARK t-shirt variants`);

// Get all LIGHT hoodie variants
const lightHoodies = getHoodieVariantsByDesign('LIGHT');
console.log(`Found ${lightHoodies.length} LIGHT hoodie variants`);
```

### **4. Get Available Options**

```typescript
// Get all available designs
console.log('Available t-shirt designs:', tshirtDesigns); // ['DARK', 'LIGHT']
console.log('Available hoodie designs:', hoodieDesigns); // ['DARK', 'LIGHT']

// Get all available sizes
console.log('Available sizes:', tshirtSizes); // ['S', 'M', 'L', 'XL', '2XL']

// Get all available colors
console.log('Available t-shirt colors:', tshirtColors); // ['Color 1', 'Color 2', ...]
console.log('Available hoodie colors:', hoodieColors); // ['Color 1', 'Color 2', ...]
```

---

## 🛒 **Cart & Checkout Integration**

### **1. Add to Cart**

```typescript
function addTshirtToCart(design: 'DARK' | 'LIGHT', size: string, color: string, quantity: number) {
  const variant = findTshirtVariant(design, size, color);
  
  if (!variant) {
    throw new Error(`T-shirt variant not found: ${design} ${size} ${color}`);
  }
  
  const cartItem = {
    productId: 'reform-uk-tshirt',
    variantId: variant.catalogVariantId, // Real Printful catalog variant ID
    design: variant.design,
    size: variant.size,
    color: variant.color,
    price: variant.price,
    quantity: quantity,
    externalId: variant.externalId, // For reference
  };
  
  // Add to cart logic here
  addToCart(cartItem);
}
```

### **2. Create Printful Order**

```typescript
function createPrintfulOrder(cartItems: CartItem[]) {
  const lineItems = cartItems.map(item => ({
    variant_id: item.variantId, // Real Printful catalog variant ID
    quantity: item.quantity,
    // Add any other required fields
  }));
  
  const order = {
    recipient: {
      name: customerName,
      address1: address1,
      city: city,
      country_code: countryCode,
      // ... other address fields
    },
    items: lineItems,
  };
  
  // Send to Printful API
  return printfulClient.createOrder(order);
}
```

---

## 🎨 **Frontend UI Components**

### **1. Product Selection Component**

```typescript
function ProductSelector({ productType }: { productType: 'tshirt' | 'hoodie' }) {
  const [selectedDesign, setSelectedDesign] = useState<'DARK' | 'LIGHT'>('DARK');
  const [selectedSize, setSelectedSize] = useState<string>('M');
  const [selectedColor, setSelectedColor] = useState<string>('Color 1');
  
  const designs = productType === 'tshirt' ? tshirtDesigns : hoodieDesigns;
  const sizes = productType === 'tshirt' ? tshirtSizes : hoodieSizes;
  const colors = productType === 'tshirt' ? tshirtColors : hoodieColors;
  
  const findVariant = productType === 'tshirt' ? findTshirtVariant : findHoodieVariant;
  const variant = findVariant(selectedDesign, selectedSize, selectedColor);
  
  return (
    <div className="product-selector">
      {/* Design Selection */}
      <div className="design-selector">
        <label>Design:</label>
        {designs.map(design => (
          <button
            key={design}
            onClick={() => setSelectedDesign(design)}
            className={selectedDesign === design ? 'active' : ''}
          >
            {design}
          </button>
        ))}
      </div>
      
      {/* Size Selection */}
      <div className="size-selector">
        <label>Size:</label>
        {sizes.map(size => (
          <button
            key={size}
            onClick={() => setSelectedSize(size)}
            className={selectedSize === size ? 'active' : ''}
          >
            {size}
          </button>
        ))}
      </div>
      
      {/* Color Selection */}
      <div className="color-selector">
        <label>Color:</label>
        {colors.map(color => (
          <button
            key={color}
            onClick={() => setSelectedColor(color)}
            className={selectedColor === color ? 'active' : ''}
          >
            {color}
          </button>
        ))}
      </div>
      
      {/* Product Info */}
      {variant && (
        <div className="product-info">
          <p>Price: £{variant.price}</p>
          <p>Design: {variant.design}</p>
          <p>Size: {variant.size}</p>
          <p>Color: {variant.color}</p>
          <button onClick={() => addToCart(variant)}>
            Add to Cart
          </button>
        </div>
      )}
    </div>
  );
}
```

### **2. Cart Item Display**

```typescript
function CartItem({ item }: { item: CartItem }) {
  return (
    <div className="cart-item">
      <div className="product-details">
        <h3>Reform UK {item.productType === 'tshirt' ? 'T-Shirt' : 'Hoodie'}</h3>
        <p>Design: {item.design}</p>
        <p>Size: {item.size}</p>
        <p>Color: {item.color}</p>
        <p>Price: £{item.price}</p>
        <p>Quantity: {item.quantity}</p>
      </div>
      
      <div className="actions">
        <button onClick={() => updateQuantity(item.id, item.quantity - 1)}>-</button>
        <button onClick={() => updateQuantity(item.id, item.quantity + 1)}>+</button>
        <button onClick={() => removeFromCart(item.id)}>Remove</button>
      </div>
    </div>
  );
}
```

---

## 🔍 **Debugging & Testing**

### **1. Verify Variant Lookups**

```typescript
// Test t-shirt variant lookup
const testVariant = findTshirtVariant('DARK', 'M', 'Color 3');
console.log('Test variant found:', testVariant);

if (testVariant) {
  console.log('Catalog Variant ID:', testVariant.catalogVariantId);
  console.log('Price:', testVariant.price);
  console.log('External ID:', testVariant.externalId);
}
```

### **2. Check Available Options**

```typescript
// Log all available options
console.log('T-shirt designs:', tshirtDesigns);
console.log('T-shirt sizes:', tshirtSizes);
console.log('T-shirt colors:', tshirtColors);

console.log('Hoodie designs:', hoodieDesigns);
console.log('Hoodie sizes:', hoodieSizes);
console.log('Hoodie colors:', hoodieColors);
```

### **3. Validate Variant Counts**

```typescript
// Verify variant counts match expectations
const darkTshirts = getTshirtVariantsByDesign('DARK');
const lightTshirts = getTshirtVariantsByDesign('LIGHT');

console.log(`DARK t-shirts: ${darkTshirts.length} (expected: 60)`);
console.log(`LIGHT t-shirts: ${lightTshirts.length} (expected: 40)`);
console.log(`Total t-shirts: ${TshirtVariants.length} (expected: 100)`);
```

---

## 🚀 **Migration Steps**

### **Step 1: Update Imports**
Replace old imports with new merged variant imports in your components.

### **Step 2: Update Product Selection Logic**
Modify your product selection components to use the new `findTshirtVariant` and `findHoodieVariant` functions.

### **Step 3: Update Cart Logic**
Ensure your cart uses the real `catalogVariantId` for Printful orders.

### **Step 4: Test Variant Lookups**
Verify that all variant combinations work correctly.

### **Step 5: Test Order Creation**
Create test orders to ensure Printful receives the correct variant IDs.

---

## ✅ **Benefits of the New Structure**

1. **Single Product per Garment Type** - Cleaner UI, easier management
2. **Real Printful IDs** - No more mock IDs, reliable order creation
3. **Design Selection** - Users can choose DARK/LIGHT design variants
4. **Helper Functions** - Easy variant lookup and filtering
5. **Type Safety** - Full TypeScript support with proper types
6. **Easy Debugging** - Clear structure for troubleshooting

---

## 🔧 **Troubleshooting**

### **Common Issues:**

1. **Variant Not Found** - Check design, size, and color values match exactly
2. **Wrong Catalog ID** - Verify you're using `catalogVariantId`, not `syncVariantId`
3. **Missing Variants** - Run `npm run printful:sync` to regenerate data

### **Need Help?**
- Check the variant files for correct data
- Use the helper functions to debug lookups
- Verify external IDs match your Printful dashboard

**Your Printful integration is now ready with real catalog variant IDs!** 🎉
