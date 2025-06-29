/*
  # Add Reviews System and Admin Features

  1. New Tables
    - `reviews`
      - `id` (uuid, primary key)
      - `product_id` (uuid, foreign key)
      - `user_address` (text)
      - `order_id` (uuid, foreign key)
      - `rating` (integer, 1-5)
      - `title` (text)
      - `comment` (text)
      - `verified_purchase` (boolean)
      - `helpful_count` (integer)
      - `created_at` (timestamp)
    - `review_helpfulness`
      - `id` (uuid, primary key)
      - `review_id` (uuid, foreign key)
      - `user_address` (text)
      - `is_helpful` (boolean)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on reviews tables
    - Add policies for authenticated users to manage reviews
    - Add policies for public read access to reviews

  3. Indexes
    - Add indexes for efficient review queries
*/

-- Create reviews table
CREATE TABLE IF NOT EXISTS reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid REFERENCES products(id) ON DELETE CASCADE NOT NULL,
  user_address text NOT NULL,
  order_id uuid REFERENCES orders(id) ON DELETE CASCADE,
  rating integer NOT NULL CHECK (rating >= 1 AND rating <= 5),
  title text NOT NULL,
  comment text NOT NULL,
  verified_purchase boolean DEFAULT false,
  helpful_count integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- Create review helpfulness table
CREATE TABLE IF NOT EXISTS review_helpfulness (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  review_id uuid REFERENCES reviews(id) ON DELETE CASCADE NOT NULL,
  user_address text NOT NULL,
  is_helpful boolean NOT NULL,
  created_at timestamptz DEFAULT now(),
  UNIQUE(review_id, user_address)
);

-- Enable Row Level Security
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE review_helpfulness ENABLE ROW LEVEL SECURITY;

-- Reviews policies
CREATE POLICY "Anyone can read reviews"
  ON reviews
  FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert reviews"
  ON reviews
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid()::text = user_address);

CREATE POLICY "Users can update own reviews"
  ON reviews
  FOR UPDATE
  TO authenticated
  USING (auth.uid()::text = user_address)
  WITH CHECK (auth.uid()::text = user_address);

CREATE POLICY "Users can delete own reviews"
  ON reviews
  FOR DELETE
  TO authenticated
  USING (auth.uid()::text = user_address);

-- Review helpfulness policies
CREATE POLICY "Anyone can read review helpfulness"
  ON review_helpfulness
  FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Authenticated users can manage helpfulness"
  ON review_helpfulness
  FOR ALL
  TO authenticated
  USING (auth.uid()::text = user_address)
  WITH CHECK (auth.uid()::text = user_address);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_reviews_product_id ON reviews(product_id);
CREATE INDEX IF NOT EXISTS idx_reviews_user_address ON reviews(user_address);
CREATE INDEX IF NOT EXISTS idx_reviews_rating ON reviews(rating);
CREATE INDEX IF NOT EXISTS idx_reviews_created_at ON reviews(created_at);
CREATE INDEX IF NOT EXISTS idx_review_helpfulness_review_id ON review_helpfulness(review_id);

-- Function to update helpful count
CREATE OR REPLACE FUNCTION update_review_helpful_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE reviews 
    SET helpful_count = helpful_count + CASE WHEN NEW.is_helpful THEN 1 ELSE -1 END
    WHERE id = NEW.review_id;
    RETURN NEW;
  ELSIF TG_OP = 'UPDATE' THEN
    UPDATE reviews 
    SET helpful_count = helpful_count + CASE 
      WHEN NEW.is_helpful AND NOT OLD.is_helpful THEN 2
      WHEN NOT NEW.is_helpful AND OLD.is_helpful THEN -2
      ELSE 0
    END
    WHERE id = NEW.review_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE reviews 
    SET helpful_count = helpful_count + CASE WHEN OLD.is_helpful THEN -1 ELSE 1 END
    WHERE id = OLD.review_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for helpful count updates
DROP TRIGGER IF EXISTS trigger_update_helpful_count ON review_helpfulness;
CREATE TRIGGER trigger_update_helpful_count
  AFTER INSERT OR UPDATE OR DELETE ON review_helpfulness
  FOR EACH ROW EXECUTE FUNCTION update_review_helpful_count();