/*
  # Allow guest users to place orders

  1. Security Changes
    - Add RLS policy to allow anonymous (guest) users to insert orders
    - This enables guest checkout functionality while maintaining security
    - Guest users can only insert orders, not read or update existing ones

  2. Policy Details
    - Target: Anonymous users (anon role)
    - Operation: INSERT only
    - Condition: Always allow (true) since guest orders are temporary
*/

-- Allow anonymous users to insert orders (for guest checkout)
CREATE POLICY "Anonymous users can place orders"
  ON orders
  FOR INSERT
  TO anon
  WITH CHECK (true);