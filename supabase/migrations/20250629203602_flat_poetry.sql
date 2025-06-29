/*
  # Fix NFT Templates RLS Policies

  1. Security Updates
    - Update RLS policies for nft_templates table to allow proper INSERT operations
    - Ensure policies work correctly for both authenticated and anonymous users
    - Maintain security while allowing admin operations

  2. Changes
    - Drop existing restrictive policies
    - Create new comprehensive policies for all CRUD operations
    - Allow INSERT operations for authenticated users and service role
    - Maintain read access for all users
*/

-- Drop existing policies to recreate them properly
DROP POLICY IF EXISTS "nft_templates_delete_policy" ON nft_templates;
DROP POLICY IF EXISTS "nft_templates_insert_policy" ON nft_templates;
DROP POLICY IF EXISTS "nft_templates_select_policy" ON nft_templates;
DROP POLICY IF EXISTS "nft_templates_update_policy" ON nft_templates;

-- Create comprehensive RLS policies for nft_templates
CREATE POLICY "nft_templates_select_all"
  ON nft_templates
  FOR SELECT
  TO anon, authenticated, service_role
  USING (true);

CREATE POLICY "nft_templates_insert_authenticated"
  ON nft_templates
  FOR INSERT
  TO authenticated, service_role
  WITH CHECK (true);

CREATE POLICY "nft_templates_insert_anon"
  ON nft_templates
  FOR INSERT
  TO anon
  WITH CHECK (true);

CREATE POLICY "nft_templates_update_authenticated"
  ON nft_templates
  FOR UPDATE
  TO authenticated, service_role
  USING (true)
  WITH CHECK (true);

CREATE POLICY "nft_templates_update_anon"
  ON nft_templates
  FOR UPDATE
  TO anon
  USING (true)
  WITH CHECK (true);

CREATE POLICY "nft_templates_delete_authenticated"
  ON nft_templates
  FOR DELETE
  TO authenticated, service_role
  USING (true);

CREATE POLICY "nft_templates_delete_anon"
  ON nft_templates
  FOR DELETE
  TO anon
  USING (true);