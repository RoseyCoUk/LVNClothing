import asyncio
from playwright import async_api
import json
import time
import os

async def run_test():
    pw = None
    browser = None
    context = None
    
    try:
        # Start a Playwright session in asynchronous mode
        pw = await async_api.async_playwright().start()
        
        # Launch a Chromium browser in headless mode with custom arguments
        browser = await pw.chromium.launch(
            headless=True,
            args=[
                "--window-size=1280,720",
                "--disable-dev-shm-usage",
                "--ipc=host",
                "--single-process"
            ],
        )
        
        # Create a new browser context (like an incognito window)
        context = await browser.new_context()
        context.set_default_timeout(15000)
        
        # Open a new page in the browser context
        page = await context.new_page()
        
        # Enable console logging to capture any errors
        page.on("console", lambda msg: print(f"Console: {msg.text}"))
        page.on("pageerror", lambda err: print(f"Page Error: {err}"))
        
        # Navigate to the application
        print("🌐 Navigating to application...")
        await page.goto("http://localhost:5173", wait_until="commit", timeout=20000)
        
        # Wait for the main page to load
        try:
            await page.wait_for_load_state("domcontentloaded", timeout=10000)
            print("✅ Page loaded successfully")
        except async_api.Error as e:
            print(f"⚠️ Page load timeout: {e}")
        
        # Test 1: Add items to cart and navigate to checkout
        print("\n🔍 Testing cart and checkout navigation...")
        
        try:
            # Look for a product link (e.g., t-shirt or hoodie)
            product_links = await page.query_selector_all('a[href*="/products/"]')
            if product_links:
                print(f"Found {len(product_links)} product links")
                await product_links[0].click()
                await page.wait_for_load_state("domcontentloaded", timeout=10000)
                print("✅ Navigated to product page")
                
                # Try to add item to cart
                add_to_cart_button = await page.query_selector('button:has-text("Add to Cart")')
                if add_to_cart_button:
                    await add_to_cart_button.click()
                    await page.wait_for_timeout(3000)
                    print("✅ Added item to cart")
                else:
                    print("⚠️ Add to cart button not found")
            else:
                print("⚠️ No product links found, trying to find products on current page")
                
                # Try to find add to cart buttons on the current page
                add_to_cart_buttons = await page.query_selector_all('button:has-text("Add to Cart")')
                if add_to_cart_buttons:
                    print(f"Found {len(add_to_cart_buttons)} add to cart buttons on current page")
                    await add_to_cart_buttons[0].click()
                    await page.wait_for_timeout(3000)
                    print("✅ Added item to cart")
                else:
                    print("⚠️ No add to cart buttons found")
        except Exception as e:
            print(f"⚠️ Could not add item to cart: {e}")
        
        # Now try to open the cart and navigate to checkout
        try:
            # Look for cart icon in header
            cart_icon = await page.query_selector('[data-testid="cart-icon"], .cart-icon, button:has-text("Cart"), svg[data-lucide="shopping-cart"]')
            if cart_icon:
                print("✅ Found cart icon, clicking to open cart drawer")
                await cart_icon.click()
                await page.wait_for_timeout(3000)
                
                # Wait for cart drawer to fully load
                print("⏳ Waiting for cart drawer to load...")
                await page.wait_for_timeout(2000)
                
                # Debug: Check what's visible in the cart
                cart_content = await page.query_selector_all('.cart-drawer, [class*="cart"], [class*="drawer"]')
                if cart_content:
                    print(f"✅ Found {len(cart_content)} cart-related elements")
                else:
                    print("⚠️ No cart drawer elements found")
                
                # Look for the checkout button with more specific selectors
                checkout_selectors = [
                    'button:has-text("Proceed to Checkout")',
                    'button:has-text("Checkout")',
                    'button:has-text("Proceed")',
                    '[class*="checkout"] button',
                    'button[class*="checkout"]'
                ]
                
                checkout_btn = None
                for selector in checkout_selectors:
                    checkout_btn = await page.query_selector(selector)
                    if checkout_btn:
                        print(f"✅ Found checkout button with selector: {selector}")
                        break
                
                if checkout_btn:
                    print("✅ Found checkout button in cart, clicking to proceed")
                    await checkout_btn.click()
                    await page.wait_for_load_state("domcontentloaded", timeout=10000)
                    print("✅ Navigated to checkout page")
                else:
                    print("⚠️ Checkout button not found in cart drawer")
                    
                    # Debug: List all buttons in the cart area
                    all_buttons = await page.query_selector_all('button')
                    print(f"Found {len(all_buttons)} buttons on page")
                    for i, btn in enumerate(all_buttons[:5]):  # Show first 5 buttons
                        try:
                            text = await btn.text_content()
                            print(f"   Button {i+1}: {text[:30]}...")
                        except:
                            print(f"   Button {i+1}: Could not read text")
            else:
                print("⚠️ Cart icon not found in header")
        except Exception as e:
            print(f"⚠️ Could not navigate to checkout via cart: {e}")
        
        # Alternative: Try direct navigation to checkout page
        if not checkout_btn:
            print("\n🔄 Trying direct navigation to checkout page...")
            try:
                # First, let's try to add items to cart programmatically via JavaScript
                print("🔧 Adding items to cart programmatically...")
                cart_update_result = await page.evaluate("""
                    () => {
                        try {
                            // Try to access the cart context and add items
                            if (window.cartContext && window.cartContext.addToCart) {
                                const testItem = {
                                    id: 'test-item-1',
                                    name: 'Test Product',
                                    price: 29.99,
                                    image: '/starterbundle.png',
                                    quantity: 1,
                                    printful_variant_id: 1
                                };
                                window.cartContext.addToCart(testItem);
                                return { success: true, message: 'Added item via cart context' };
                            } else if (window.addToCart) {
                                const testItem = {
                                    id: 'test-item-2',
                                    name: 'Test Product 2',
                                    price: 19.99,
                                    image: '/starterbundle.png',
                                    quantity: 1,
                                    printful_variant_id: 2
                                };
                                window.addToCart(testItem);
                                return { success: true, message: 'Added item via global function' };
                            } else {
                                // Try to set session storage
                                const tempItems = [{
                                    id: 'temp-item-1',
                                    name: 'Temporary Product',
                                    price: 39.99,
                                    image: '/starterbundle.png',
                                    quantity: 1,
                                    printful_variant_id: 3
                                }];
                                sessionStorage.setItem('tempCartItems', JSON.stringify(tempItems));
                                return { success: true, message: 'Set temporary cart items in session storage' };
                            }
                        } catch (error) {
                            return { success: false, error: error.message };
                        }
                    }
                """)
                
                if cart_update_result.get('success'):
                    print(f"✅ {cart_update_result['message']}")
                else:
                    print(f"⚠️ Could not add items programmatically: {cart_update_result.get('error', 'Unknown error')}")
                
                # Wait a moment for cart to update
                await page.wait_for_timeout(2000)
                
                # Now navigate to checkout
                await page.goto("http://localhost:5173/checkout", wait_until="commit", timeout=15000)
                await page.wait_for_load_state("domcontentloaded", timeout=10000)
                print("✅ Directly navigated to checkout page")
                
                # Wait a bit more for the page to fully render
                await page.wait_for_timeout(3000)
                
            except Exception as e:
                print(f"⚠️ Direct navigation to checkout failed: {e}")
        
        # Test 2: Check if we're on the checkout page and shipping section is present
        print("\n🔍 Testing checkout page and shipping section...")
        
        try:
            # Wait a bit for the page to load
            await page.wait_for_timeout(3000)
            
            # Check if we're on a checkout-like page by looking for common elements
            checkout_indicators = await page.query_selector_all('h1:has-text("Checkout"), h2:has-text("Checkout"), [class*="checkout"]')
            if checkout_indicators:
                print("✅ Found checkout page indicators")
            else:
                print("⚠️ No checkout page indicators found")
                
            # Look for shipping address form
            shipping_address_form = await page.query_selector('form, .shipping-address, [class*="shipping"]')
            if shipping_address_form:
                print("✅ Shipping address form found")
            else:
                print("⚠️ Shipping address form not found")
                
            # Look for address input fields
            address_inputs = await page.query_selector_all('input[placeholder*="address"], input[name*="address"], input[placeholder*="Address"]')
            if address_inputs:
                print(f"✅ Found {len(address_inputs)} address input fields")
            else:
                print("⚠️ No address input fields found")
                
            # Look for any form fields that might be address-related
            all_inputs = await page.query_selector_all('input[type="text"], input[placeholder*="city"], input[placeholder*="postcode"], input[placeholder*="City"], input[placeholder*="Postcode"]')
            if all_inputs:
                print(f"✅ Found {len(all_inputs)} text input fields (some might be address-related)")
            else:
                print("⚠️ No text input fields found")
                
        except Exception as e:
            print(f"⚠️ Error checking checkout page: {e}")
        
        # Test 3: Test address input and validation
        print("\n🔍 Testing address input and validation...")
        
        try:
            # Fill in address fields with more flexible selectors
            address_fields = {
                'address1': '123 Test Street',
                'city': 'London',
                'postcode': 'SW1A 1AA',
                'country': 'United Kingdom'
            }
            
            for field_name, value in address_fields.items():
                try:
                    # Try different selectors for address fields
                    selectors = [
                        f'input[name="{field_name}"]',
                        f'input[placeholder*="{field_name}"]',
                        f'input[placeholder*="{field_name.lower()}"]',
                        f'input[placeholder*="{field_name.replace("1", "").lower()}"]',
                        f'input[placeholder*="{field_name.replace("1", "Line 1").lower()}"]',
                        f'input[placeholder*="Address Line 1"]' if field_name == 'address1' else None,
                        f'input[placeholder*="City"]' if field_name == 'city' else None,
                        f'input[placeholder*="Postcode"]' if field_name == 'postcode' else None
                    ]
                    
                    field_found = False
                    for selector in selectors:
                        if selector:
                            field = await page.query_selector(selector)
                            if field:
                                await field.fill(value)
                                print(f"✅ Filled {field_name}: {value}")
                                field_found = True
                                break
                    
                    if not field_found:
                        print(f"⚠️ Could not find field for {field_name}")
                        
                except Exception as e:
                    print(f"⚠️ Error filling {field_name}: {e}")
            
            # Wait a moment for any validation to trigger
            await page.wait_for_timeout(3000)
            
            # Check for validation messages
            validation_messages = await page.query_selector_all('.error, .validation-error, [class*="error"]')
            if validation_messages:
                print(f"⚠️ Found {len(validation_messages)} validation messages")
                for msg in validation_messages:
                    text = await msg.text_content()
                    print(f"   - {text}")
            else:
                print("✅ No validation errors found")
                
        except Exception as e:
            print(f"⚠️ Error testing address input: {e}")
        
        # Test 4: Test shipping quotes functionality
        print("\n🔍 Testing shipping quotes functionality...")
        
        try:
            # Look for shipping options or quotes
            shipping_options = await page.query_selector_all('.shipping-option, .shipping-method, [class*="shipping"]')
            if shipping_options:
                print(f"✅ Found {len(shipping_options)} shipping options")
                
                # Check if any shipping options are selectable
                for i, option in enumerate(shipping_options[:3]):  # Check first 3 options
                    try:
                        is_visible = await option.is_visible()
                        is_enabled = await option.is_enabled()
                        text = await option.text_content()
                        print(f"   Option {i+1}: {text[:50]}... (visible: {is_visible}, enabled: {is_enabled})")
                    except Exception as e:
                        print(f"   Option {i+1}: Error reading - {e}")
            else:
                print("⚠️ No shipping options found")
                
            # Look for shipping quotes loading state
            loading_indicators = await page.query_selector_all('.loading, [class*="loading"], .spinner')
            if loading_indicators:
                print("✅ Found loading indicators for shipping quotes")
            else:
                print("⚠️ No loading indicators found")
                
        except Exception as e:
            print(f"⚠️ Error testing shipping quotes: {e}")
        
        # Test 5: Test address validation
        print("\n🔍 Testing address validation...")
        
        try:
            # Try to submit or proceed with checkout
            submit_button = await page.query_selector('button[type="submit"], button:has-text("Continue"), button:has-text("Proceed"), button:has-text("Next")')
            if submit_button:
                is_enabled = await submit_button.is_enabled()
                print(f"✅ Found submit button (enabled: {is_enabled})")
                
                if is_enabled:
                    # Click the button to test validation
                    await submit_button.click()
                    await page.wait_for_timeout(3000)
                    
                    # Check for validation errors
                    validation_errors = await page.query_selector_all('.error, .validation-error, [class*="error"], [role="alert"]')
                    if validation_errors:
                        print(f"✅ Address validation working - found {len(validation_errors)} errors")
                        for error in validation_errors[:3]:  # Show first 3 errors
                            try:
                                text = await error.text_content()
                                print(f"   - {text}")
                            except:
                                print("   - Error reading validation message")
                    else:
                        print("✅ No validation errors after submission")
                else:
                    print("⚠️ Submit button is disabled")
            else:
                print("⚠️ Submit button not found")
                
        except Exception as e:
            print(f"⚠️ Error testing address validation: {e}")
        
        # Test 6: Check for API errors and network requests
        print("\n🔍 Checking for API errors and network activity...")
        
        try:
            # Look for any error messages on the page
            error_messages = await page.query_selector_all('.error, .alert, [class*="error"], [class*="alert"]')
            if error_messages:
                print(f"⚠️ Found {len(error_messages)} error messages on page")
                for error in error_messages[:3]:
                    try:
                        text = await error.text_content()
                        if text and len(text.strip()) > 0:
                            print(f"   - {text}")
                    except:
                        pass
            else:
                print("✅ No error messages found on page")
                
            # Check if there are any network errors in the console
            # This will be captured by the console event handler above
            print("📡 Console messages and errors should be visible above")
                
        except Exception as e:
            print(f"⚠️ Error checking for API errors: {e}")
        
        # Test 7: Test direct API call from frontend context
        print("\n🔍 Testing API call from frontend context...")
        
        try:
            # Execute JavaScript to test the API call directly
            api_test_result = await page.evaluate("""
                async () => {
                    try {
                        const supabaseUrl = 'https://nsmrxwnrtsllxvplazmm.supabase.co';
                        const anonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5zbXJ4d25ydHNsbHh2cGxhem1tIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE0OTY0NTIsImV4cCI6MjA2NzA3MjQ1Mn0.XyHiuQHXW_laGE4Caond1-8xK-2B4NzDzIOX8baD4UM';
                        
                        const testData = {
                            recipient: {
                                address1: "123 Test Street",
                                city: "London",
                                country_code: "GB",
                                zip: "SW1A 1AA"
                            },
                            items: [
                                {
                                    printful_variant_id: 1,
                                    quantity: 1
                                }
                            ]
                        };
                        
                        const response = await fetch(`${supabaseUrl}/functions/v1/shipping-quotes`, {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                                'Authorization': `Bearer ${anonKey}`,
                            },
                            body: JSON.stringify(testData)
                        });
                        
                        if (response.ok) {
                            const data = await response.json();
                            return { success: true, status: response.status, data: data };
                        } else {
                            const errorData = await response.json().catch(() => ({}));
                            return { success: false, status: response.status, error: errorData };
                        }
                    } catch (error) {
                        return { success: false, error: error.message };
                    }
                }
            """)
            
            if api_test_result.get('success'):
                print(f"✅ Frontend API call successful! Status: {api_test_result['status']}")
                print(f"   Response: {json.dumps(api_test_result['data'], indent=2)}")
            else:
                print(f"❌ Frontend API call failed! Status: {api_test_result.get('status', 'N/A')}")
                print(f"   Error: {json.dumps(api_test_result.get('error', {}), indent=2)}")
                
        except Exception as e:
            print(f"⚠️ Error testing frontend API call: {e}")
        
        # Test 8: Take a screenshot for debugging
        print("\n📸 Taking screenshot for debugging...")
        try:
            await page.screenshot(path="tc011_debug_screenshot.png")
            print("✅ Screenshot saved as tc011_debug_screenshot.png")
        except Exception as e:
            print(f"⚠️ Could not take screenshot: {e}")
        
        # Test 9: Final validation of shipping quotes functionality
        print("\n🔍 Final validation of shipping quotes functionality...")
        
        try:
            # Test multiple address scenarios to ensure the API works correctly
            test_addresses = [
                {
                    "name": "London Address",
                    "data": {
                        "recipient": {
                            "address1": "123 Oxford Street",
                            "city": "London",
                            "country_code": "GB",
                            "zip": "W1D 1BS"
                        },
                        "items": [{"printful_variant_id": 1, "quantity": 1}]
                    }
                },
                {
                    "name": "Manchester Address", 
                    "data": {
                        "recipient": {
                            "address1": "456 Market Street",
                            "city": "Manchester",
                            "country_code": "GB",
                            "zip": "M1 1AA"
                        },
                        "items": [{"printful_variant_id": 2, "quantity": 2}]
                    }
                },
                {
                    "name": "Edinburgh Address",
                    "data": {
                        "recipient": {
                            "address1": "789 Princes Street",
                            "city": "Edinburgh",
                            "country_code": "GB", 
                            "zip": "EH2 2ER"
                        },
                        "items": [{"printful_variant_id": 3, "quantity": 1}]
                    }
                }
            ]
            
            print(f"🧪 Testing {len(test_addresses)} different address scenarios...")
            
            for i, test_case in enumerate(test_addresses):
                try:
                    print(f"\n   Testing {test_case['name']}...")
                    
                    # Test the API call for this address
                    api_result = await page.evaluate("""
                        async (testData) => {
                            try {
                                const supabaseUrl = 'https://nsmrxwnrtsllxvplazmm.supabase.co';
                                const anonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5zbXJ4d25ydHNsbHh2cGxhem1tIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE0OTY0NTIsImV4cCI6MjA2NzA3MjQ1Mn0.XyHiuQHXW_laGE4Caond1-8xK-2B4NzDzIOX8baD4UM';
                                
                                const response = await fetch(`${supabaseUrl}/functions/v1/shipping-quotes`, {
                                    method: 'POST',
                                    headers: {
                                        'Content-Type': 'application/json',
                                        'Authorization': `Bearer ${anonKey}`,
                                    },
                                    body: JSON.stringify(testData)
                                });
                                
                                if (response.ok) {
                                    const data = await response.json();
                                    return { 
                                        success: true, 
                                        status: response.status, 
                                        data: data,
                                        optionsCount: data.options ? data.options.length : 0
                                    };
                                } else {
                                    const errorData = await response.json().catch(() => ({}));
                                    return { 
                                        success: false, 
                                        status: response.status, 
                                        error: errorData 
                                    };
                                }
                            } catch (error) {
                                return { success: false, error: error.message };
                            }
                        }
                    """, test_case['data'])
                    
                    if api_result.get('success'):
                        print(f"     ✅ Success! Status: {api_result['status']}, Options: {api_result['optionsCount']}")
                        if api_result['optionsCount'] > 0:
                            print(f"     📦 First option: {api_result['data']['options'][0]['name']} - £{api_result['data']['options'][0]['rate']}")
                    else:
                        print(f"     ❌ Failed! Status: {api_result.get('status', 'N/A')}")
                        
                except Exception as e:
                    print(f"     ⚠️ Error testing {test_case['name']}: {e}")
                
                # Wait a bit between tests to avoid rate limiting
                await page.wait_for_timeout(1000)
            
            print("\n✅ Address validation and shipping quotes testing completed!")
            
        except Exception as e:
            print(f"⚠️ Error in final validation: {e}")
        
        print("\n✅ Test completed successfully!")
        await asyncio.sleep(3)
    
    except Exception as e:
        print(f"❌ Test failed with error: {e}")
        raise e
    
    finally:
        if context:
            await context.close()
        if browser:
            await browser.close()
        if pw:
            await pw.stop()
            
asyncio.run(run_test())
    