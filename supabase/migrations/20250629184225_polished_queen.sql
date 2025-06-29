/*
  # Add wallet address field to orders for NFT claiming

  1. Changes
    - Add `customer_wallet_address` column to orders table
    - This allows customers to add their wallet address after purchase for NFT claiming
    - Update the NFT claimable logic to consider wallet address

  2. Details
    - `customer_wallet_address` stores the wallet address provided by customer for NFT claiming
    - This is separate from `user_address` which is used for order identification
    - Allows guest users to add wallet address later for NFT claiming
*/

-- Add customer_wallet_address column for NFT claiming
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'orders' AND column_name = 'customer_wallet_address'
  ) THEN
    ALTER TABLE orders ADD COLUMN customer_wallet_address TEXT;
  END IF;
END $$;

-- Create index for efficient wallet address queries
CREATE INDEX IF NOT EXISTS idx_orders_customer_wallet_address ON orders(customer_wallet_address);

-- Update the NFT claimable function to also check for wallet address
CREATE OR REPLACE FUNCTION update_nft_claimable_status()
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
  -- Update orders where delivery + return period has passed AND wallet address is provided
  UPDATE orders 
  SET nft_claimable = true
  WHERE delivery_status = 'delivered'
    AND delivered_at IS NOT NULL
    AND delivered_at + (return_period_days || ' days')::interval <= now()
    AND customer_wallet_address IS NOT NULL
    AND customer_wallet_address != ''
    AND nft_claimable = false;
END;
$$;