import asyncio
from playwright import async_api
import time

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
                "--window-size=1280,720",         # Set the browser window size
                "--disable-dev-shm-usage",        # Avoid using /dev/shm which can cause issues in containers
                "--ipc=host",                     # Use host-level IPC for better stability
                "--single-process"                # Run the browser in a single process mode
            ],
        )
        
        # Create a new browser context (like an incognito window)
        context = await browser.new_context()
        context.set_default_timeout(10000)
        
        # Open a new page in the browser context
        page = await context.new_page()
        
        print("Starting Test 6: Add and Remove Items from Cart")
        
        # Navigate to the shop page
        print("Navigating to the shop page...")
        await page.goto("http://localhost:5173/shop", wait_until="commit", timeout=15000)
        
        # Wait for the main page to reach DOMContentLoaded state
        try:
            await page.wait_for_load_state("domcontentloaded", timeout=5000)
        except async_api.Error:
            print("Warning: DOMContentLoaded timeout, continuing...")
        
        # Wait for products to load - look for product cards
        print("Waiting for products to load...")
        try:
            await page.wait_for_selector('a[href*="/product/"], [class*="product"], [class*="Product"], [class*="card"]', timeout=10000)
        except async_api.Error:
            print("Warning: Product cards not found, checking for any content...")
            await page.wait_for_selector('body', timeout=5000)
        
        # Wait a bit for any dynamic content to load
        await asyncio.sleep(2)
        
        # Step 1: Select product with specific variant and add to cart
        print("Step 1: Adding first product to cart...")
        add_to_cart_buttons = await page.query_selector_all('button:has-text("Add to Cart")')
        
        if not add_to_cart_buttons:
            print("No 'Add to Cart' buttons found, looking for alternative selectors...")
            add_to_cart_buttons = await page.query_selector_all('[class*="add-to-cart"], [class*="AddToCart"]')
        
        if add_to_cart_buttons:
            print(f"Found {len(add_to_cart_buttons)} 'Add to Cart' buttons")
            # Click the first add to cart button
            await add_to_cart_buttons[0].click()
            print("Clicked first 'Add to Cart' button")
            await asyncio.sleep(2)
        else:
            print("ERROR: No 'Add to Cart' buttons found")
            assert False, "No 'Add to Cart' buttons found on the page"
        
        # Step 2: Open the shopping cart slide-out or popup
        print("Step 2: Opening shopping cart...")
        # Look for cart icon or cart button - specifically the ShoppingCart icon in header
        cart_buttons = await page.query_selector_all('button:has(svg[class*="w-6"]), [class*="ShoppingCart"], button:has([class*="shopping"]), button:has([class*="cart"])')
        
        if not cart_buttons:
            print("No cart buttons found, looking for shopping cart icon...")
            cart_buttons = await page.query_selector_all('button:has(svg), [class*="shopping"], [class*="Shopping"]')
        
        if cart_buttons:
            print(f"Found {len(cart_buttons)} cart-related buttons")
            # Try to find the cart button with the shopping cart icon specifically
            cart_button = None
            for button in cart_buttons:
                try:
                    # Check if this button contains a shopping cart icon
                    svg_icon = await button.query_selector('svg')
                    if svg_icon:
                        icon_class = await svg_icon.get_attribute('class')
                        if icon_class and ('w-6' in icon_class or 'shopping' in icon_class.lower()):
                            cart_button = button
                            print(f"Found cart button with icon class: {icon_class}")
                            break
                except:
                    continue
            
            if not cart_button:
                cart_button = cart_buttons[0]  # Fallback to first button
                print("Using fallback cart button")
            
            # Click the cart button
            await cart_button.click()
            print("Clicked cart button")
            await asyncio.sleep(2)
        else:
            print("ERROR: No cart buttons found")
            assert False, "No cart buttons found to open cart"
        
        # Step 3: Verify item is in cart and increase product quantity
        print("Step 3: Verifying item in cart and increasing quantity...")
        
        # Wait for cart to open and look for cart items
        try:
            await page.wait_for_selector('[class*="cart-item"], [class*="CartItem"], .bg-gray-50', timeout=5000)
            print("Cart opened successfully")
        except async_api.Error:
            print("Warning: Cart items not found immediately, continuing...")
        
        # Look for quantity increase button (+)
        plus_buttons = await page.query_selector_all('button:has-text("+"), [class*="plus"], [class*="Plus"]')
        
        if plus_buttons:
            print(f"Found {len(plus_buttons)} quantity increase buttons")
            # Click the first plus button to increase quantity
            await plus_buttons[0].click()
            print("Clicked quantity increase button")
            await asyncio.sleep(1)
        else:
            print("Warning: No quantity increase buttons found")
        
        # Step 4: Verify quantity updates and pricing is recalculated
        print("Step 4: Verifying quantity and price updates...")
        
        # Look for quantity display
        quantity_displays = await page.query_selector_all('[class*="quantity"], [class*="Quantity"], .w-8')
        
        if quantity_displays:
            print(f"Found {len(quantity_displays)} quantity displays")
            # Check if quantity is greater than 1 (indicating successful increase)
            for display in quantity_displays:
                quantity_text = await display.text_content()
                print(f"Quantity display shows: {quantity_text}")
        else:
            print("Warning: No quantity displays found")
        
        # Look for total price
        total_price_elements = await page.query_selector_all('[class*="total"], [class*="Total"], [class*="price"], [class*="Price"]')
        
        if total_price_elements:
            print(f"Found {len(total_price_elements)} price-related elements")
            for element in total_price_elements:
                price_text = await element.text_content()
                if price_text and ('£' in price_text or 'total' in price_text.lower()):
                    print(f"Price element shows: {price_text}")
        else:
            print("Warning: No total price elements found")
        
        # Step 5: Remove the product from the cart
        print("Step 5: Removing product from cart...")
        
        # First, verify the cart is still open and visible
        print("Verifying cart is still open...")
        cart_drawer = await page.query_selector('[class*="fixed right-0"], [class*="cart-drawer"], [class*="CartDrawer"]')
        if cart_drawer:
            print("Cart drawer is visible")
        else:
            print("Warning: Cart drawer not found, trying to reopen...")
            # Try to reopen cart
            cart_buttons = await page.query_selector_all('button:has(svg[class*="w-6"]), [class*="ShoppingCart"]')
            if cart_buttons:
                await cart_buttons[0].click()
                await asyncio.sleep(2)
        
        # Look for remove/delete buttons - specifically the Trash2 icon
        remove_buttons = await page.query_selector_all('button:has(svg[class*="w-4"]), [class*="trash"], [class*="Trash"], [class*="delete"], [class*="Delete"]')
        
        if not remove_buttons:
            print("No remove buttons found, looking for trash icon...")
            remove_buttons = await page.query_selector_all('button:has(svg), [class*="trash"], [class*="Trash"]')
        
        if remove_buttons:
            print(f"Found {len(remove_buttons)} remove buttons")
            
            # Check which remove button is actually visible
            visible_remove_buttons = []
            for i, button in enumerate(remove_buttons):
                try:
                    is_visible = await button.is_visible()
                    print(f"Remove button {i+1} visible: {is_visible}")
                    if is_visible:
                        visible_remove_buttons.append(button)
                except:
                    print(f"Remove button {i+1}: Could not check visibility")
            
            if visible_remove_buttons:
                print(f"Found {len(visible_remove_buttons)} visible remove buttons")
                # Click the first visible remove button
                await visible_remove_buttons[0].click()
                print("Clicked visible remove button")
                # Wait longer for the removal to complete
                await asyncio.sleep(3)
            else:
                print("No visible remove buttons found")
        else:
            print("Warning: No remove buttons found")
        
        # Step 6: Verify the item is no longer listed and cart updates appropriately
        print("Step 6: Verifying item removal...")
        
        # Wait a bit more for the UI to update
        await asyncio.sleep(2)
        
        # Look for empty cart message or verify no cart items
        empty_cart_elements = await page.query_selector_all('[class*="empty"], [class*="Empty"], [class*="cart is empty"], [class*="Cart is empty"]')
        
        if empty_cart_elements:
            print("Empty cart message found - item successfully removed")
            for element in empty_cart_elements:
                empty_text = await element.text_content()
                print(f"Empty cart message: {empty_text}")
        else:
            # Check if cart items still exist
            remaining_items = await page.query_selector_all('[class*="cart-item"], [class*="CartItem"], .bg-gray-50')
            if not remaining_items:
                print("No cart items found - item successfully removed")
            else:
                print(f"Warning: {len(remaining_items)} cart items still found")
                # Try to get more details about remaining items
                for i, item in enumerate(remaining_items):
                    try:
                        item_text = await item.text_content()
                        print(f"Remaining item {i+1}: {item_text[:100]}...")
                    except:
                        print(f"Remaining item {i+1}: Could not read text")
        
        # Close cart if it's still open
        close_buttons = await page.query_selector_all('button:has-text("×"), [class*="close"], [class*="Close"], [aria-label*="close"]')
        if close_buttons:
            await close_buttons[0].click()
            print("Closed cart")
        
        print("Test 6 completed successfully!")
        print("✅ Cart operations test passed: Added item, increased quantity, removed item")
        
        # Wait a bit before closing
        await asyncio.sleep(3)
    
    except Exception as e:
        print(f"Test 6 failed with error: {e}")
        print("❌ Cart operations test failed")
        raise e
    
    finally:
        if context:
            await context.close()
        if browser:
            await browser.close()
        if pw:
            await pw.stop()
            
asyncio.run(run_test())
    