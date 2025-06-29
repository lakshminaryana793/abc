/*
  # Fix NFT Templates RLS Policy

  1. Security Updates
    - Update RLS policies for nft_templates table to allow proper admin access
    - Ensure INSERT operations work for authenticated users and service role
    - Add policy for anon role if needed for admin panel access

  2. Changes
    - Drop existing restrictive policies if they exist
    - Create comprehensive policies for all CRUD operations
    - Ensure admin panel can create NFT templates properly
*/

-- Drop existing policies to recreate them properly
DROP POLICY IF EXISTS "nft_templates_insert_policy" ON nft_templates;
DROP POLICY IF EXISTS "nft_templates_select_policy" ON nft_templates;
DROP POLICY IF EXISTS "nft_templates_update_policy" ON nft_templates;
DROP POLICY IF EXISTS "nft_templates_delete_policy" ON nft_templates;

-- Create comprehensive policies for nft_templates table

-- Allow SELECT for everyone (anon, authenticated, service_role)
CREATE POLICY "nft_templates_select_policy"
  ON nft_templates
  FOR SELECT
  TO anon, authenticated, service_role
  USING (true);

-- Allow INSERT for authenticated users and service_role
-- Also allow anon for admin panel functionality
CREATE POLICY "nft_templates_insert_policy"
  ON nft_templates
  FOR INSERT
  TO anon, authenticated, service_role
  WITH CHECK (true);

-- Allow UPDATE for authenticated users and service_role
-- Also allow anon for admin panel functionality
CREATE POLICY "nft_templates_update_policy"
  ON nft_templates
  FOR UPDATE
  TO anon, authenticated, service_role
  USING (true)
  WITH CHECK (true);

-- Allow DELETE for authenticated users and service_role
-- Also allow anon for admin panel functionality
CREATE POLICY "nft_templates_delete_policy"
  ON nft_templates
  FOR DELETE
  TO anon, authenticated, service_role
  USING (true);

-- Ensure RLS is enabled on the table
ALTER TABLE nft_templates ENABLE ROW LEVEL SECURITY;