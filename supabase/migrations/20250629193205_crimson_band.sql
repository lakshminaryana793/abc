/*
  # Add Unique NFT Management System

  1. New Tables
    - `nft_templates`
      - `id` (uuid, primary key)
      - `order_id` (uuid, foreign key)
      - `name` (text)
      - `description` (text)
      - `image_url` (text)
      - `metadata_json` (jsonb)
      - `serial_number` (text)
      - `edition_number` (integer)
      - `uploaded_by` (text)
      - `status` (text) - 'pending', 'ready', 'claimed'
      - `created_at` (timestamp)

  2. Changes to existing tables
    - Add `custom_nft_id` to nfts table to link to custom NFT templates
    - Add `has_custom_nft` to orders table

  3. Security
    - Enable RLS on nft_templates
    - Add policies for admin management and customer viewing
*/

-- Create nft_templates table for admin-uploaded unique NFTs
CREATE TABLE IF NOT EXISTS nft_templates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid REFERENCES orders(id) ON DELETE CASCADE NOT NULL,
  name text NOT NULL,
  description text NOT NULL,
  image_url text NOT NULL,
  metadata_json jsonb NOT NULL DEFAULT '{}',
  serial_number text NOT NULL,
  edition_number integer NOT NULL DEFAULT 1,
  uploaded_by text NOT NULL,
  status text NOT NULL DEFAULT 'ready',
  created_at timestamptz DEFAULT now()
);

-- Add custom_nft_id to nfts table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'nfts' AND column_name = 'custom_nft_id'
  ) THEN
    ALTER TABLE nfts ADD COLUMN custom_nft_id uuid REFERENCES nft_templates(id);
  END IF;
END $$;

-- Add has_custom_nft to orders table
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

-- NFT Templates policies
CREATE POLICY "Anyone can read nft templates"
  ON nft_templates
  FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert nft templates"
  ON nft_templates
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update nft templates"
  ON nft_templates
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Service role can manage nft templates"
  ON nft_templates
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_nft_templates_order_id ON nft_templates(order_id);
CREATE INDEX IF NOT EXISTS idx_nft_templates_status ON nft_templates(status);
CREATE INDEX IF NOT EXISTS idx_nft_templates_uploaded_by ON nft_templates(uploaded_by);

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