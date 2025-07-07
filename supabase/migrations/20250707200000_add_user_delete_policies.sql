-- Add DELETE policies for user account deletion
-- This migration adds policies that allow users to delete their own orders

-- up

-- Add DELETE policy for users to delete their own orders
CREATE POLICY "Users can delete their own orders"
ON public.orders
AS PERMISSIVE
FOR DELETE
TO authenticated
USING (auth.uid() = user_id OR auth.email() = customer_email);

-- Add DELETE policy for service role to delete orders (for account deletion)
CREATE POLICY "Service role can delete orders"
ON public.orders
AS PERMISSIVE
FOR DELETE
TO service_role
USING (true);

-- Grant DELETE permission to authenticated users
GRANT DELETE ON public.orders TO authenticated;

-- down

-- Remove DELETE policies
DROP POLICY IF EXISTS "Users can delete their own orders" ON public.orders;
DROP POLICY IF EXISTS "Service role can delete orders" ON public.orders;

-- Revoke DELETE permission
REVOKE DELETE ON public.orders FROM authenticated; 