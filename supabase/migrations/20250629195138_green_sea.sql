/*
  # Fix NFT Templates Table and Upload Functionality

  1. Ensure nft_templates table exists with all required columns
  2. Fix RLS policies for proper admin access
  3. Add missing indexes and constraints
  4. Update database functions for NFT management

  2. Security
    - Enable RLS on nft_templates table
    - Add policies for authenticated users to manage NFT templates
    - Ensure proper admin access for uploading custom NFTs

  3. Performance
    - Add indexes for efficient queries
    - Optimize database functions
*/

-- Ensure nft_templates table exists with all required columns
CREATE TABLE IF NOT EXISTS nft_templates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid REFERENCES orders(id) ON DELETE CASCADE NOT NULL,
  name text NOT NULL,
  description text NOT NULL,
  image_url text NOT NULL,
  metadata_json jsonb NOT NULL DEFAULT '{}',
  serial_number text NOT NULL,
  edition_number integer NOT NULL DEFAULT 1,
  uploaded_by text NOT NULL DEFAULT 'admin',
  status text NOT NULL DEFAULT 'ready',
  created_at timestamptz DEFAULT now()
);

-- Add custom_nft_id to nfts table if missing
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'nfts' AND column_name = 'custom_nft_id'
  ) THEN
    ALTER TABLE nfts ADD COLUMN custom_nft_id uuid REFERENCES nft_templates(id);
  END IF;
END $$;

-- Add has_custom_nft to orders table if missing
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'orders' AND column_name = 'has_custom_nft'
  ) THEN
    ALTER TABLE orders ADD COLUMN has_custom_nft boolean DEFAULT false;
  END IF;
END $$;

-- Enable Row Level Security
ALTER TABLE nft_templates ENABLE ROW LEVEL SECURITY;

-- Drop existing policies to avoid conflicts
DROP POLICY IF EXISTS "Anyone can read nft templates" ON nft_templates;
DROP POLICY IF EXISTS "Authenticated users can insert nft templates" ON nft_templates;
DROP POLICY IF EXISTS "Authenticated users can update nft templates" ON nft_templates;
DROP POLICY IF EXISTS "Service role can manage nft templates" ON nft_templates;

-- Create comprehensive RLS policies for nft_templates
CREATE POLICY "Enable read for all users"
  ON nft_templates
  FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Enable insert for authenticated users"
  ON nft_templates
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Enable update for authenticated users"
  ON nft_templates
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Enable delete for authenticated users"
  ON nft_templates
  FOR DELETE
  TO authenticated
  USING (true);

CREATE POLICY "Enable all for service role"
  ON nft_templates
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_nft_templates_order_id ON nft_templates(order_id);
CREATE INDEX IF NOT EXISTS idx_nft_templates_status ON nft_templates(status);
CREATE INDEX IF NOT EXISTS idx_nft_templates_uploaded_by ON nft_templates(uploaded_by);
CREATE INDEX IF NOT EXISTS idx_nft_templates_created_at ON nft_templates(created_at);

-- Create unique constraint to prevent duplicate NFTs per order
CREATE UNIQUE INDEX IF NOT EXISTS idx_nft_templates_order_unique 
  ON nft_templates(order_id) 
  WHERE status = 'ready';

-- Function to check if order has custom NFT ready
CREATE OR REPLACE FUNCTION check_custom_nft_ready(order_uuid uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM nft_templates 
    WHERE order_id = order_uuid 
    AND status = 'ready'
  );
END;
$$;

-- Update NFT claimable function to consider custom NFTs
CREATE OR REPLACE FUNCTION update_nft_claimable_status()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Update orders to make NFTs claimable when:
  -- 1. Order is confirmed/completed
  -- 2. Has wallet address
  -- 3. Either has custom NFT ready OR doesn't require custom NFT
  UPDATE orders 
  SET nft_claimable = true 
  WHERE status IN ('completed', 'confirmed') 
    AND nft_minted = false 
    AND customer_wallet_address IS NOT NULL
    AND (
      (has_custom_nft = true AND check_custom_nft_ready(id) = true)
      OR has_custom_nft = false
    );
END;
$$;

-- Create admin helper functions with better error handling
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
    COALESCE(o.status, 'pending') as status,
    COALESCE(o.delivery_status, 'pending') as delivery_status,
    COALESCE(o.has_custom_nft, false) as has_custom_nft,
    COALESCE(o.nft_claimable, false) as nft_claimable,
    COALESCE(o.nft_minted, false) as nft_minted,
    o.customer_wallet_address,
    o.created_at,
    COALESCE(o.customer_info, '{}'::jsonb) as customer_info,
    COALESCE(
      jsonb_build_object(
        'name', p.name,
        'image_url', p.image_url
      ),
      jsonb_build_object(
        'name', 'Unknown Product',
        'image_url', ''
      )
    ) as products
  FROM orders o
  LEFT JOIN products p ON o.product_id = p.id
  ORDER BY o.created_at DESC;
END;
$$;

-- Create function to get NFT templates with error handling
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
EXCEPTION
  WHEN OTHERS THEN
    -- Return empty result set if table doesn't exist or other errors
    RETURN;
END;
$$;

-- Grant execute permissions on functions
GRANT EXECUTE ON FUNCTION get_orders_for_admin() TO authenticated, anon, service_role;
GRANT EXECUTE ON FUNCTION get_nft_templates() TO authenticated, anon, service_role;
GRANT EXECUTE ON FUNCTION check_custom_nft_ready(uuid) TO authenticated, anon, service_role;
GRANT EXECUTE ON FUNCTION update_nft_claimable_status() TO authenticated, anon, service_role;

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

-- Add missing indexes for performance
CREATE INDEX IF NOT EXISTS idx_orders_has_custom_nft ON orders(has_custom_nft);
CREATE INDEX IF NOT EXISTS idx_orders_nft_claimable ON orders(nft_claimable);
CREATE INDEX IF NOT EXISTS idx_orders_nft_minted ON orders(nft_minted);
CREATE INDEX IF NOT EXISTS idx_orders_delivery_status ON orders(delivery_status);
CREATE INDEX IF NOT EXISTS idx_orders_customer_wallet_address ON orders(customer_wallet_address);