/*
  # Fix Orders Table RLS Policy

  1. Security Changes
    - Drop existing restrictive RLS policies for orders table
    - Create new policies that allow:
      - Anonymous users to place orders (for guest checkout)
      - Authenticated users to place orders for themselves
      - Users to read/update only their own orders
    - Ensure guest users can place orders without authentication issues

  2. Policy Details
    - INSERT: Allow both anonymous and authenticated users
    - SELECT: Users can only see their own orders
    - UPDATE: Users can only update their own orders
*/

-- Drop existing policies that might be causing conflicts
DROP POLICY IF EXISTS "Anonymous users can place orders" ON orders;
DROP POLICY IF EXISTS "Users can insert own orders" ON orders;
DROP POLICY IF EXISTS "Users can read own orders" ON orders;
DROP POLICY IF EXISTS "Users can update own orders" ON orders;

-- Create new policies for orders table
-- Allow anyone (anonymous or authenticated) to insert orders
CREATE POLICY "Anyone can place orders"
  ON orders
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- Allow users to read their own orders (for authenticated users)
CREATE POLICY "Users can read own orders"
  ON orders
  FOR SELECT
  TO authenticated
  USING (auth.uid()::text = user_address);

-- Allow users to update their own orders (for authenticated users)
CREATE POLICY "Users can update own orders"
  ON orders
  FOR UPDATE
  TO authenticated
  USING (auth.uid()::text = user_address)
  WITH CHECK (auth.uid()::text = user_address);

-- Allow service role to read all orders (for admin purposes)
CREATE POLICY "Service role can read all orders"
  ON orders
  FOR SELECT
  TO service_role
  USING (true);

-- Allow service role to update all orders (for admin purposes)
CREATE POLICY "Service role can update all orders"
  ON orders
  FOR UPDATE
  TO service_role
  USING (true)
  WITH CHECK (true);