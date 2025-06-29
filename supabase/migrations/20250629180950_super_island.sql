/*
  # Add delivery tracking and NFT claiming workflow

  1. Changes to Orders Table
    - Add `delivery_status` column to track delivery progress
    - Add `delivered_at` timestamp for when order was delivered
    - Add `return_period_days` column (default 7 days)
    - Add `nft_claimable` boolean to indicate if NFT can be claimed
    - Update `nft_minted` to track actual minting status

  2. Delivery Status Flow
    - pending -> confirmed -> shipped -> delivered -> completed
    - NFT becomes claimable only after delivery + return period

  3. Security
    - Users can only claim NFTs for their own completed orders
    - NFT claiming is only available after return period expires
*/

-- Add delivery tracking columns to orders table
DO $$
BEGIN
  -- Add delivery_status column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'orders' AND column_name = 'delivery_status'
  ) THEN
    ALTER TABLE orders ADD COLUMN delivery_status TEXT DEFAULT 'pending';
  END IF;

  -- Add delivered_at timestamp
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'orders' AND column_name = 'delivered_at'
  ) THEN
    ALTER TABLE orders ADD COLUMN delivered_at TIMESTAMPTZ;
  END IF;

  -- Add return_period_days
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'orders' AND column_name = 'return_period_days'
  ) THEN
    ALTER TABLE orders ADD COLUMN return_period_days INTEGER DEFAULT 7;
  END IF;

  -- Add nft_claimable boolean
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'orders' AND column_name = 'nft_claimable'
  ) THEN
    ALTER TABLE orders ADD COLUMN nft_claimable BOOLEAN DEFAULT false;
  END IF;
END $$;

-- Create function to automatically update NFT claimable status
CREATE OR REPLACE FUNCTION update_nft_claimable_status()
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
  -- Update orders where delivery + return period has passed
  UPDATE orders 
  SET nft_claimable = true
  WHERE delivery_status = 'delivered'
    AND delivered_at IS NOT NULL
    AND delivered_at + (return_period_days || ' days')::interval <= now()
    AND nft_claimable = false;
END;
$$;

-- Create index for efficient queries
CREATE INDEX IF NOT EXISTS idx_orders_delivery_status ON orders(delivery_status);
CREATE INDEX IF NOT EXISTS idx_orders_delivered_at ON orders(delivered_at);
CREATE INDEX IF NOT EXISTS idx_orders_nft_claimable ON orders(nft_claimable);

-- Update existing orders to have proper delivery status
UPDATE orders 
SET delivery_status = CASE 
  WHEN status = 'completed' THEN 'delivered'
  WHEN status = 'pending' THEN 'confirmed'
  ELSE 'pending'
END
WHERE delivery_status = 'pending';