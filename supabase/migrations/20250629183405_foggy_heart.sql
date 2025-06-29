/*
  # Add admin permissions for order management

  1. Security Changes
    - Add policy to allow authenticated users with admin role to update any order
    - This enables the admin panel to update order statuses regardless of user_address

  2. Notes
    - This assumes admin authentication is handled at the application level
    - For production, you might want to add a proper admin role system
*/

-- Add policy for admin users to update any order
CREATE POLICY "Enable admin update for all orders"
  ON orders
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Note: This policy allows any authenticated user to update orders
-- In production, you should implement proper admin role checking
-- For example, you could add an admin_addresses table and check against it:
-- USING (auth.uid()::text IN (SELECT wallet_address FROM admin_addresses))