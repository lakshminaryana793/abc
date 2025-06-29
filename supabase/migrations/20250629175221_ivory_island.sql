/*
  # Web3 Clothing E-commerce Database Schema

  1. New Tables
    - `users`
      - `id` (uuid, primary key)
      - `wallet_address` (text, unique)
      - `email` (text, optional)
      - `created_at` (timestamp)
    - `products`
      - `id` (uuid, primary key)
      - `name` (text)
      - `description` (text)
      - `price` (decimal)
      - `image_url` (text)
      - `sizes` (jsonb array)
      - `stock` (jsonb object)
      - `category` (text)
      - `max_edition` (integer)
      - `serial_prefix` (text)
      - `created_at` (timestamp)
    - `orders`
      - `id` (uuid, primary key)
      - `user_address` (text)
      - `product_id` (uuid, foreign key)
      - `size` (text)
      - `quantity` (integer)
      - `total_amount` (decimal)
      - `stripe_payment_intent_id` (text)
      - `status` (text)
      - `nft_minted` (boolean)
      - `created_at` (timestamp)
    - `nfts`
      - `id` (uuid, primary key)
      - `token_id` (text)
      - `owner_address` (text)
      - `product_id` (uuid, foreign key)
      - `order_id` (uuid, foreign key)
      - `metadata_uri` (text)
      - `edition_number` (integer)
      - `serial_code` (text)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users to manage their own data
    - Add policies for public read access to products

  3. Sample Data
    - Insert sample products to populate the store
*/

-- Create users table
CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  wallet_address text UNIQUE NOT NULL,
  email text,
  created_at timestamptz DEFAULT now()
);

-- Create products table
CREATE TABLE IF NOT EXISTS products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text NOT NULL,
  price decimal(10,2) NOT NULL,
  image_url text NOT NULL,
  sizes jsonb NOT NULL DEFAULT '[]',
  stock jsonb NOT NULL DEFAULT '{}',
  category text NOT NULL DEFAULT 'clothing',
  max_edition integer NOT NULL DEFAULT 100,
  serial_prefix text NOT NULL DEFAULT 'NFT',
  created_at timestamptz DEFAULT now()
);

-- Create orders table
CREATE TABLE IF NOT EXISTS orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_address text NOT NULL,
  product_id uuid REFERENCES products(id) ON DELETE CASCADE,
  size text NOT NULL,
  quantity integer NOT NULL DEFAULT 1,
  total_amount decimal(10,2) NOT NULL,
  stripe_payment_intent_id text,
  status text NOT NULL DEFAULT 'pending',
  nft_minted boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- Create nfts table
CREATE TABLE IF NOT EXISTS nfts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  token_id text NOT NULL,
  owner_address text NOT NULL,
  product_id uuid REFERENCES products(id) ON DELETE CASCADE,
  order_id uuid REFERENCES orders(id) ON DELETE CASCADE,
  metadata_uri text NOT NULL,
  edition_number integer NOT NULL,
  serial_code text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE nfts ENABLE ROW LEVEL SECURITY;

-- Users policies
CREATE POLICY "Users can read own data"
  ON users
  FOR SELECT
  TO authenticated
  USING (auth.uid()::text = wallet_address);

CREATE POLICY "Users can insert own data"
  ON users
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid()::text = wallet_address);

CREATE POLICY "Users can update own data"
  ON users
  FOR UPDATE
  TO authenticated
  USING (auth.uid()::text = wallet_address);

-- Products policies (public read access)
CREATE POLICY "Anyone can read products"
  ON products
  FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert products"
  ON products
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update products"
  ON products
  FOR UPDATE
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can delete products"
  ON products
  FOR DELETE
  TO authenticated
  USING (true);

-- Orders policies
CREATE POLICY "Users can read own orders"
  ON orders
  FOR SELECT
  TO authenticated
  USING (auth.uid()::text = user_address);

CREATE POLICY "Users can insert own orders"
  ON orders
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid()::text = user_address);

CREATE POLICY "Users can update own orders"
  ON orders
  FOR UPDATE
  TO authenticated
  USING (auth.uid()::text = user_address);

-- NFTs policies
CREATE POLICY "Users can read own NFTs"
  ON nfts
  FOR SELECT
  TO authenticated
  USING (auth.uid()::text = owner_address);

CREATE POLICY "Anyone can read NFTs for display"
  ON nfts
  FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert NFTs"
  ON nfts
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
CREATE INDEX IF NOT EXISTS idx_products_created_at ON products(created_at);
CREATE INDEX IF NOT EXISTS idx_orders_user_address ON orders(user_address);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at);
CREATE INDEX IF NOT EXISTS idx_nfts_owner_address ON nfts(owner_address);
CREATE INDEX IF NOT EXISTS idx_nfts_product_id ON nfts(product_id);

-- Insert sample products
INSERT INTO products (name, description, price, image_url, sizes, stock, category, max_edition, serial_prefix) VALUES
(
  'Galaxy Hoodie',
  'Premium hoodie with galaxy-inspired design featuring cosmic patterns and stellar comfort. Made from high-quality cotton blend for ultimate comfort.',
  89.99,
  'https://images.pexels.com/photos/1040945/pexels-photo-1040945.jpeg',
  '["S", "M", "L", "XL"]',
  '{"S": 10, "M": 15, "L": 20, "XL": 8}',
  'hoodies',
  100,
  'GAL'
),
(
  'Cyber T-Shirt',
  'Futuristic cyberpunk style t-shirt with neon accents and digital aesthetics. Perfect for the tech-savvy fashion enthusiast.',
  39.99,
  'https://images.pexels.com/photos/1036622/pexels-photo-1036622.jpeg',
  '["S", "M", "L", "XL", "XXL"]',
  '{"S": 25, "M": 30, "L": 35, "XL": 20, "XXL": 10}',
  'tshirts',
  200,
  'CYB'
),
(
  'Neon Dreams Jacket',
  'Electric jacket with LED-inspired design elements. Stand out in the crowd with this eye-catching piece that bridges fashion and technology.',
  149.99,
  'https://images.pexels.com/photos/1183266/pexels-photo-1183266.jpeg',
  '["S", "M", "L", "XL"]',
  '{"S": 5, "M": 8, "L": 12, "XL": 6}',
  'jackets',
  50,
  'NDJ'
),
(
  'Digital Wave Sweatshirt',
  'Comfortable sweatshirt featuring abstract digital wave patterns. Perfect blend of comfort and cutting-edge design.',
  69.99,
  'https://images.pexels.com/photos/1040945/pexels-photo-1040945.jpeg',
  '["S", "M", "L", "XL", "XXL"]',
  '{"S": 15, "M": 20, "L": 25, "XL": 15, "XXL": 8}',
  'sweatshirts',
  150,
  'DWS'
),
(
  'Quantum Polo',
  'Sophisticated polo shirt with quantum-inspired geometric patterns. Elevate your casual wear with this unique design.',
  59.99,
  'https://images.pexels.com/photos/1036622/pexels-photo-1036622.jpeg',
  '["S", "M", "L", "XL"]',
  '{"S": 20, "M": 25, "L": 30, "XL": 18}',
  'polos',
  120,
  'QUA'
),
(
  'Matrix Tank Top',
  'Lightweight tank top with matrix-style digital rain pattern. Perfect for workouts or casual summer wear.',
  29.99,
  'https://images.pexels.com/photos/1183266/pexels-photo-1183266.jpeg',
  '["S", "M", "L", "XL", "XXL"]',
  '{"S": 30, "M": 35, "L": 40, "XL": 25, "XXL": 15}',
  'tanks',
  250,
  'MTX'
);