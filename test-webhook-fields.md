# Webhook Field Capture Test

## ✅ **Verified Fields Being Captured:**

### 1. **Order Info in Webhook:**
- ✅ `stripe_session_id` - Captured as `session.id`
- ✅ `customer_email` - Captured from `session.customer_details?.email` or `session.customer_email`
- ✅ `amount_total` - **NEW** - Captured as `session.amount_total` (amount in cents)
- ✅ `user_id` - **NEW** - Captured from `session.metadata?.user_id` if provided
- ✅ `created_at` - Automatically set by database trigger
- ✅ `items` - Captured from `session.line_items.data` (sanitized)
- ✅ `customer_details` - Captured from `session.customer_details`

### 2. **Database Schema Updated:**
- ✅ Added `amount_total` field (integer, amount in cents)
- ✅ Added `user_id` field (uuid, links to Supabase user)
- ✅ Migration applied successfully

### 3. **User Linking:**
- ✅ `user_id` extracted from session metadata
- ✅ Only included when user is authenticated
- ✅ Links order to correct Supabase user

### 4. **Email Confirmation:**
- ✅ **No live session skipping** - Processes both test and live sessions
- ✅ Uses direct `order_id` lookup for reliable email sending
- ✅ Includes test mode detection for debugging

## 🧪 **Test Steps:**

1. **Create authenticated checkout session:**
   - User signs in
   - Creates checkout session
   - `user_id` included in session metadata

2. **Create guest checkout session:**
   - No authentication
   - Creates checkout session
   - No `user_id` in metadata

3. **Webhook processes both:**
   - Captures all available fields
   - Saves to orders table with proper linking
   - Triggers email confirmation

## 📊 **Expected Database Records:**

### Authenticated User Order:
```sql
{
  id: uuid,
  stripe_session_id: "cs_live_...",
  customer_email: "user@example.com",
  amount_total: 3499, -- £34.99 in cents
  user_id: "user-uuid", -- Links to Supabase user
  items: [...],
  customer_details: {...},
  readable_order_id: "REFORM-2025-0001",
  created_at: timestamp
}
```

### Guest User Order:
```sql
{
  id: uuid,
  stripe_session_id: "cs_live_...",
  customer_email: "guest@example.com",
  amount_total: 3499, -- £34.99 in cents
  user_id: null, -- No user linking
  items: [...],
  customer_details: {...},
  readable_order_id: "REFORM-2025-0002",
  created_at: timestamp
}
```

## ✅ **Status: COMPLETE**

All required fields are now being captured and saved to the database. The webhook properly handles both authenticated and guest users, and the email confirmation works for both test and live sessions. 