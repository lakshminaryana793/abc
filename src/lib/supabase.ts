import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  image_url: string;
  sizes: string[];
  stock: Record<string, number>;
  category: string;
  max_edition: number;
  serial_prefix: string;
  created_at?: string;
}

export interface Order {
  id: string;
  user_address: string;
  product_id: string;
  size: string;
  quantity: number;
  total_amount: number;
  stripe_payment_intent_id?: string;
  status: string;
  nft_minted: boolean;
  nft_claimable: boolean;
  customer_wallet_address?: string;
  has_custom_nft: boolean;
  created_at?: string;
  customer_info?: {
    name: string;
    email: string;
    address: string;
    city: string;
    postalCode: string;
    country: string;
  };
  payment_method?: string;
  delivery_status?: string;
  delivered_at?: string;
  return_period_days?: number;
}

export interface NFT {
  id: string;
  token_id: string;
  owner_address: string;
  product_id: string;
  order_id: string;
  metadata_uri: string;
  edition_number: number;
  serial_code: string;
  custom_nft_id?: string;
  created_at?: string;
}

export interface Review {
  id: string;
  product_id: string;
  user_address: string;
  order_id?: string;
  rating: number;
  title: string;
  comment: string;
  verified_purchase: boolean;
  helpful_count: number;
  created_at?: string;
}

export interface NFTTemplate {
  id: string;
  order_id: string;
  name: string;
  description: string;
  image_url: string;
  metadata_json: any;
  serial_number: string;
  edition_number: number;
  uploaded_by: string;
  status: string;
  created_at?: string;
}

class DatabaseService {
  supabase = supabase;

  // Products
  async getProducts(): Promise<Product[]> {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data || [];
  }

  async getProduct(id: string): Promise<Product | null> {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) {
      if (error.code === 'PGRST116') return null;
      throw error;
    }
    return data;
  }

  async createProduct(product: Omit<Product, 'id' | 'created_at'>): Promise<Product> {
    const { data, error } = await supabase
      .from('products')
      .insert(product)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  async updateProduct(id: string, updates: Partial<Product>): Promise<Product> {
    const { data, error } = await supabase
      .from('products')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  async deleteProduct(id: string): Promise<void> {
    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  }

  // Orders
  async createOrder(order: Omit<Order, 'id' | 'created_at'>): Promise<Order> {
    const { data, error } = await supabase
      .from('orders')
      .insert(order)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  async getOrder(id: string): Promise<Order | null> {
    const { data, error } = await supabase
      .from('orders')
      .select(`
        *,
        products (
          name,
          image_url,
          price
        )
      `)
      .eq('id', id)
      .single();
    
    if (error) {
      if (error.code === 'PGRST116') return null;
      throw error;
    }
    return data;
  }

  async updateOrder(id: string, updates: Partial<Order>): Promise<Order> {
    const { data, error } = await supabase
      .from('orders')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  async getOrdersByUser(userAddress: string): Promise<Order[]> {
    const { data, error } = await supabase
      .from('orders')
      .select(`
        *,
        products (
          name,
          image_url,
          price
        )
      `)
      .or(`user_address.eq.${userAddress},customer_wallet_address.eq.${userAddress}`)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data || [];
  }

  async getAllOrders(): Promise<Order[]> {
    const { data, error } = await supabase
      .from('orders')
      .select(`
        *,
        products (
          name,
          image_url,
          price
        )
      `)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data || [];
  }

  async getClaimableOrders(walletAddress: string): Promise<any[]> {
    const { data, error } = await supabase
      .from('orders')
      .select(`
        id,
        product_id,
        size,
        quantity,
        customer_wallet_address,
        status,
        has_custom_nft,
        nft_claimable,
        nft_minted,
        products (
          name,
          image_url,
          max_edition,
          serial_prefix
        )
      `)
      .eq('customer_wallet_address', walletAddress)
      .eq('nft_claimable', true)
      .eq('nft_minted', false)
      .in('status', ['confirmed', 'delivered']);

    if (error) throw error;
    return data || [];
  }

  async getOrdersReadyForWallet(email: string): Promise<any[]> {
    const { data, error } = await supabase
      .from('orders')
      .select(`
        id,
        product_id,
        size,
        quantity,
        status,
        customer_info,
        customer_wallet_address,
        products (
          name,
          image_url
        )
      `)
      .contains('customer_info', { email })
      .in('status', ['confirmed', 'delivered'])
      .is('customer_wallet_address', null);

    if (error) throw error;
    return data || [];
  }

  async updateOrderWalletAddress(orderId: string, walletAddress: string): Promise<void> {
    const { error } = await supabase
      .from('orders')
      .update({ 
        customer_wallet_address: walletAddress,
        nft_claimable: true 
      })
      .eq('id', orderId);

    if (error) throw error;
  }

  // NFTs
  async createNFT(nft: Omit<NFT, 'id' | 'created_at'>): Promise<NFT> {
    const { data, error } = await supabase
      .from('nfts')
      .insert(nft)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  async getNFTsByOwner(ownerAddress: string): Promise<NFT[]> {
    const { data, error } = await supabase
      .from('nfts')
      .select(`
        *,
        products (
          name,
          image_url
        )
      `)
      .eq('owner_address', ownerAddress)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data || [];
  }

  // Reviews
  async getProductReviews(productId: string): Promise<Review[]> {
    const { data, error } = await supabase
      .from('reviews')
      .select('*')
      .eq('product_id', productId)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data || [];
  }

  async createReview(review: Omit<Review, 'id' | 'created_at'>): Promise<Review> {
    const { data, error } = await supabase
      .from('reviews')
      .insert(review)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  async updateReview(id: string, updates: Partial<Review>): Promise<Review> {
    const { data, error } = await supabase
      .from('reviews')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  async deleteReview(id: string): Promise<void> {
    const { error } = await supabase
      .from('reviews')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  }

  // Review Helpfulness
  async markReviewHelpful(reviewId: string, userAddress: string, isHelpful: boolean): Promise<void> {
    const { error } = await supabase
      .from('review_helpfulness')
      .upsert({
        review_id: reviewId,
        user_address: userAddress,
        is_helpful: isHelpful
      });
    
    if (error) throw error;
  }

  async getReviewHelpfulness(reviewId: string, userAddress: string): Promise<boolean | null> {
    const { data, error } = await supabase
      .from('review_helpfulness')
      .select('is_helpful')
      .eq('review_id', reviewId)
      .eq('user_address', userAddress)
      .single();
    
    if (error) {
      if (error.code === 'PGRST116') return null;
      throw error;
    }
    return data.is_helpful;
  }

  // NFT Templates
  async createNFTTemplate(template: Omit<NFTTemplate, 'id' | 'created_at'>): Promise<NFTTemplate> {
    const { data, error } = await supabase
      .from('nft_templates')
      .insert(template)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  async getNFTTemplate(orderId: string): Promise<NFTTemplate | null> {
    const { data, error } = await supabase
      .from('nft_templates')
      .select('*')
      .eq('order_id', orderId)
      .single();
    
    if (error) {
      if (error.code === 'PGRST116') return null;
      throw error;
    }
    return data;
  }

  async updateNFTTemplate(id: string, updates: Partial<NFTTemplate>): Promise<NFTTemplate> {
    const { data, error } = await supabase
      .from('nft_templates')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  async deleteNFTTemplate(id: string): Promise<void> {
    const { error } = await supabase
      .from('nft_templates')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  }

  async getAllNFTTemplates(): Promise<NFTTemplate[]> {
    const { data, error } = await supabase
      .from('nft_templates')
      .select(`
        *,
        orders (
          id,
          customer_info,
          status,
          products (
            name
          )
        )
      `)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data || [];
  }
}

export const db = new DatabaseService();