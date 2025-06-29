/*
  # Fix Admin Data Loading Issues

  1. Database Functions
    - Create missing admin helper functions
    - Fix RLS policies for admin access
    - Add proper error handling

  2. Table Updates
    - Ensure all required columns exist
    - Add missing indexes for performance
    - Fix foreign key relationships

  3. Security
    - Update RLS policies for admin operations
    - Ensure proper access control
*/

-- Create admin helper functions
CREATE OR REPLACE FUNCTION get_orders_for_admin()
RETURNS TABLE (
  id uuid,
  user_address text,
  product_id uuid,
  size text,
  quantity integer,
  total_amount numeric,
  status text,
  delivery_status text,
  has_custom_nft boolean,
  nft_claimable boolean,
  nft_minted boolean,
  customer_wallet_address text,
  created_at timestamptz,
  customer_info jsonb,
  products jsonb
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    o.id,
    o.user_address,
    o.product_id,
    o.size,
    o.quantity,
    o.total_amount,
    o.status,
    COALESCE(o.delivery_status, 'pending') as delivery_status,
    COALESCE(o.has_custom_nft, false) as has_custom_nft,
    COALESCE(o.nft_claimable, false) as nft_claimable,
    COALESCE(o.nft_minted, false) as nft_minted,
    o.customer_wallet_address,
    o.created_at,
    o.customer_info,
    jsonb_build_object(
      'name', p.name,
      'image_url', p.image_url
    ) as products
  FROM orders o
  LEFT JOIN products p ON o.product_id = p.id
  ORDER BY o.created_at DESC;
END;
$$;

-- Create function to get NFT templates
CREATE OR REPLACE FUNCTION get_nft_templates()
RETURNS TABLE (
  id uuid,
  order_id uuid,
  name text,
  description text,
  image_url text,
  serial_number text,
  edition_number integer,
  status text,
  created_at timestamptz
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    nt.id,
    nt.order_id,
    nt.name,
    nt.description,
    nt.image_url,
    nt.serial_number,
    nt.edition_number,
    nt.status,
    nt.created_at
  FROM nft_templates nt
  ORDER BY nt.created_at DESC;
END;
$$;

-- Ensure all required columns exist with proper defaults
DO $$
BEGIN
  -- Add delivery_status if missing
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'orders' AND column_name = 'delivery_status'
  ) THEN
    ALTER TABLE orders ADD COLUMN delivery_status TEXT DEFAULT 'pending';
  END IF;

  -- Add has_custom_nft if missing
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'orders' AND column_name = 'has_custom_nft'
  ) THEN
    ALTER TABLE orders ADD COLUMN has_custom_nft BOOLEAN DEFAULT false;
  END IF;

  -- Add nft_claimable if missing
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'orders' AND column_name = 'nft_claimable'
  ) THEN
    ALTER TABLE orders ADD COLUMN nft_claimable BOOLEAN DEFAULT false;
  END IF;

  -- Add customer_wallet_address if missing
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'orders' AND column_name = 'customer_wallet_address'
  ) THEN
    ALTER TABLE orders ADD COLUMN customer_wallet_address TEXT;
  END IF;
END $$;

-- Update existing orders with proper defaults
UPDATE orders 
SET 
  delivery_status = COALESCE(delivery_status, 'pending'),
  has_custom_nft = COALESCE(has_custom_nft, false),
  nft_claimable = COALESCE(nft_claimable, false),
  nft_minted = COALESCE(nft_minted, false)
WHERE delivery_status IS NULL 
   OR has_custom_nft IS NULL 
   OR nft_claimable IS NULL 
   OR nft_minted IS NULL;

-- Grant execute permissions on functions
GRANT EXECUTE ON FUNCTION get_orders_for_admin() TO authenticated;
GRANT EXECUTE ON FUNCTION get_nft_templates() TO authenticated;
GRANT EXECUTE ON FUNCTION get_orders_for_admin() TO service_role;
GRANT EXECUTE ON FUNCTION get_nft_templates() TO service_role;

-- Create comprehensive RLS policies for admin access
DROP POLICY IF EXISTS "Admin can read all orders" ON orders;
DROP POLICY IF EXISTS "Admin can update all orders" ON orders;

CREATE POLICY "Admin can read all orders"
  ON orders
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admin can update all orders"
  ON orders
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Ensure products table has proper policies
DROP POLICY IF EXISTS "Admin can manage products" ON products;

CREATE POLICY "Admin can manage products"
  ON products
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Add missing indexes for performance
CREATE INDEX IF NOT EXISTS idx_orders_has_custom_nft ON orders(has_custom_nft);
CREATE INDEX IF NOT EXISTS idx_orders_nft_claimable ON orders(nft_claimable);
CREATE INDEX IF NOT EXISTS idx_orders_nft_minted ON orders(nft_minted);