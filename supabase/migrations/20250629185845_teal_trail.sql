/*
  # Remove 7-Day Return Period Policy for Immediate NFT Claiming

  1. Changes
    - Remove return period dependency for NFT claiming
    - Allow immediate NFT claiming after order confirmation
    - Update NFT claimable logic to be based on order status only
    - Remove delivered_at and return_period_days dependencies

  2. Security
    - Maintain existing RLS policies
    - Keep order status validation
*/

-- Update the function to make NFTs claimable immediately after order confirmation
CREATE OR REPLACE FUNCTION update_nft_claimable_status()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Update orders to make NFTs claimable immediately after confirmation
  -- No longer dependent on delivery date or return period
  UPDATE orders 
  SET nft_claimable = true 
  WHERE status IN ('completed', 'confirmed') 
    AND nft_minted = false 
    AND customer_wallet_address IS NOT NULL;
END;
$$;

-- Update existing orders to be immediately claimable if they have wallet addresses
UPDATE orders 
SET nft_claimable = true 
WHERE status IN ('completed', 'confirmed') 
  AND nft_minted = false 
  AND customer_wallet_address IS NOT NULL;