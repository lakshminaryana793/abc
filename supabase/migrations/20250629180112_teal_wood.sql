/*
  # Add customer information and payment method to orders

  1. Changes
    - Add `customer_info` column to `orders` table (JSONB type)
    - Add `payment_method` column to `orders` table (text type)
  
  2. Details
    - `customer_info` will store shipping address, contact details, etc.
    - `payment_method` will store the selected payment method (card, upi, cod)
    - Both columns are nullable to maintain compatibility with existing orders
*/

-- Add customer_info column to store shipping and contact information
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'orders' AND column_name = 'customer_info'
  ) THEN
    ALTER TABLE orders ADD COLUMN customer_info JSONB;
  END IF;
END $$;

-- Add payment_method column to store the payment method used
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'orders' AND column_name = 'payment_method'
  ) THEN
    ALTER TABLE orders ADD COLUMN payment_method TEXT DEFAULT 'card';
  END IF;
END $$;