import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Validate environment variables
if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables. Please check your .env file and ensure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are set.');
}

// Validate URL format
if (supabaseUrl === 'your_supabase_url' || !supabaseUrl.startsWith('https://')) {
  throw new Error(`Invalid Supabase URL: "${supabaseUrl}". Please set VITE_SUPABASE_URL to your actual Supabase project URL (e.g., https://your-project.supabase.co)`);
}

// Validate API key format
if (supabaseAnonKey === 'your_supabase_anon_key' || supabaseAnonKey.length < 100) {
  throw new Error(`Invalid Supabase API key. Please set VITE_SUPABASE_ANON_KEY to your actual Supabase anonymous key.`);
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Database operations
export const db = {
  // Add supabase client for direct access
  supabase,

  // Products
  async getProducts() {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data;
  },

  async getProduct(id: string) {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) throw error;
    return data;
  },

  async createProduct(product: Omit<any, 'id' | 'created_at'>) {
    const { data, error } = await supabase
      .from('products')
      .insert(product)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async updateProduct(id: string, updates: Partial<any>) {
    const { data, error } = await supabase
      .from('products')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async deleteProduct(id: string) {
    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  },

  // Orders
  async createOrder(order: Omit<any, 'id' | 'created_at'>) {
    const { data, error } = await supabase
      .from('orders')
      .insert(order)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async getOrders(userAddress?: string) {
    let query = supabase
      .from('orders')
      .select('*, products(*)')
      .order('created_at', { ascending: false });
    
    if (userAddress) {
      query = query.eq('user_address', userAddress);
    }
    
    const { data, error } = await query;
    if (error) throw error;
    return data;
  },

  async updateOrder(id: string, updates: Partial<any>) {
    console.log('Updating order:', { id, updates }); // Debug log
    
    const { data, error } = await supabase
      .from('orders')
      .update(updates)
      .eq('id', id)
      .select();
    
    if (error) {
      console.error('Supabase error:', error); // Debug log
      throw error;
    }
    
    console.log('Update result:', data); // Debug log
    
    if (!data || data.length === 0) {
      throw new Error('Order not found or could not be updated. Please check if the order exists and you have permission to update it.');
    }
    
    return data[0];
  },

  // Get orders by email for guest users
  async getOrdersByEmail(email: string) {
    const { data, error } = await supabase
      .from('orders')
      .select('*, products(*)')
      .eq('customer_info->email', email)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data;
  },

  // Update wallet address for NFT claiming
  async updateOrderWalletAddress(orderId: string, walletAddress: string) {
    const { data, error } = await supabase
      .from('orders')
      .update({ customer_wallet_address: walletAddress })
      .eq('id', orderId)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  // Get orders eligible for NFT claiming (immediate after confirmation)
  async getClaimableOrders(userAddress: string) {
    // First update NFT claimable status
    await supabase.rpc('update_nft_claimable_status');
    
    const { data, error } = await supabase
      .from('orders')
      .select('*, products(*)')
      .eq('customer_wallet_address', userAddress)
      .eq('nft_claimable', true)
      .eq('nft_minted', false)
      .in('status', ['completed', 'confirmed'])
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data;
  },

  // Get orders ready for wallet address (confirmed orders without wallet)
  async getOrdersReadyForWallet(email: string) {
    const { data, error } = await supabase
      .from('orders')
      .select('*, products(*)')
      .eq('customer_info->email', email)
      .in('status', ['completed', 'confirmed'])
      .is('customer_wallet_address', null)
      .neq('nft_minted', true)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data;
  },

  // Update delivery status
  async updateDeliveryStatus(orderId: string, status: string, deliveredAt?: string) {
    const updates: any = { delivery_status: status };
    if (status === 'delivered' && deliveredAt) {
      updates.delivered_at = deliveredAt;
    }
    
    console.log('Updating delivery status:', { orderId, updates }); // Debug log
    
    const { data, error } = await supabase
      .from('orders')
      .update(updates)
      .eq('id', orderId)
      .select();
    
    if (error) {
      console.error('Supabase error:', error); // Debug log
      throw error;
    }
    
    console.log('Update result:', data); // Debug log
    
    if (!data || data.length === 0) {
      throw new Error('Order not found or could not be updated. Please check if the order exists and you have permission to update it.');
    }
    
    return data[0];
  },

  // NFTs
  async createNFT(nft: Omit<any, 'id' | 'created_at'>) {
    const { data, error } = await supabase
      .from('nfts')
      .insert(nft)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async getNFTs(ownerAddress?: string) {
    let query = supabase
      .from('nfts')
      .select('*, products(*)')
      .order('created_at', { ascending: false });
    
    if (ownerAddress) {
      query = query.eq('owner_address', ownerAddress);
    }
    
    const { data, error } = await query;
    if (error) throw error;
    return data;
  },

  // Users
  async createUser(user: Omit<any, 'id' | 'created_at'>) {
    const { data, error } = await supabase
      .from('users')
      .insert(user)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async getUser(walletAddress: string) {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('wallet_address', walletAddress)
      .single();
    
    if (error && error.code !== 'PGRST116') throw error;
    return data;
  },

  // Reviews
  async getProductReviews(productId: string) {
    const { data, error } = await supabase
      .from('reviews')
      .select('*')
      .eq('product_id', productId)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data;
  },

  async createReview(review: Omit<any, 'id' | 'created_at'>) {
    const { data, error } = await supabase
      .from('reviews')
      .insert(review)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async updateReview(id: string, updates: Partial<any>) {
    const { data, error } = await supabase
      .from('reviews')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async deleteReview(id: string) {
    const { error } = await supabase
      .from('reviews')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  },

  async markReviewHelpful(reviewId: string, userAddress: string, isHelpful: boolean) {
    const { data, error } = await supabase
      .from('review_helpfulness')
      .upsert({
        review_id: reviewId,
        user_address: userAddress,
        is_helpful: isHelpful
      })
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async getReviewHelpfulness(reviewId: string, userAddress: string) {
    const { data, error } = await supabase
      .from('review_helpfulness')
      .select('*')
      .eq('review_id', reviewId)
      .eq('user_address', userAddress)
      .single();
    
    if (error && error.code !== 'PGRST116') throw error;
    return data;
  },

  // Admin functions with comprehensive error handling
  async getOrdersForAdmin() {
    try {
      // Try using the database function first
      const { data, error } = await supabase.rpc('get_orders_for_admin');
      
      if (error) {
        console.warn('Database function failed, falling back to direct query:', error);
        
        // Fallback to direct query
        const { data: fallbackData, error: fallbackError } = await supabase
          .from('orders')
          .select(`
            *,
            products (
              name,
              image_url
            )
          `)
          .order('created_at', { ascending: false });
        
        if (fallbackError) throw fallbackError;
        return fallbackData || [];
      }
      
      return data || [];
    } catch (error) {
      console.error('Error in getOrdersForAdmin:', error);
      throw error;
    }
  },

  async getProductStats() {
    const { data, error } = await supabase
      .from('products')
      .select('id, name, category, created_at');
    
    if (error) throw error;
    return data;
  },

  async getOrderStats() {
    const { data, error } = await supabase
      .from('orders')
      .select('id, total_amount, status, delivery_status, created_at');
    
    if (error) throw error;
    return data;
  },

  // NFT Templates with comprehensive error handling
  async createNFTTemplate(template: Omit<any, 'id' | 'created_at'>) {
    try {
      console.log('Creating NFT template with data:', template);
      
      // Validate required fields
      if (!template.order_id || !template.name || !template.description || !template.image_url || !template.serial_number) {
        throw new Error('Missing required fields for NFT template');
      }

      // Ensure metadata_json is properly formatted
      const templateData = {
        ...template,
        metadata_json: template.metadata_json || {},
        uploaded_by: template.uploaded_by || 'admin',
        status: template.status || 'ready',
        edition_number: template.edition_number || 1
      };
      
      console.log('Inserting template data:', templateData);
      
      const { data, error } = await supabase
        .from('nft_templates')
        .insert(templateData)
        .select()
        .single();
      
      if (error) {
        console.error('Error creating NFT template:', error);
        
        // Provide more specific error messages
        if (error.code === '23505') {
          throw new Error('An NFT template already exists for this order');
        } else if (error.code === '23503') {
          throw new Error('Invalid order ID - order not found');
        } else if (error.code === '42P01') {
          throw new Error('NFT templates table not found. Please check database setup.');
        } else {
          throw new Error(`Database error: ${error.message || 'Unknown database error'}`);
        }
      }
      
      console.log('NFT template created successfully:', data);
      return data;
    } catch (error: any) {
      console.error('Failed to create NFT template:', error);
      throw new Error(error.message || 'Failed to create NFT template');
    }
  },

  async getNFTTemplates() {
    try {
      // Try using the database function first
      const { data, error } = await supabase.rpc('get_nft_templates');
      
      if (error) {
        console.warn('Database function failed, falling back to direct query:', error);
        
        // Fallback to direct query
        const { data: fallbackData, error: fallbackError } = await supabase
          .from('nft_templates')
          .select('*')
          .order('created_at', { ascending: false });
        
        if (fallbackError) {
          console.error('Fallback query also failed:', fallbackError);
          return []; // Return empty array instead of throwing
        }
        return fallbackData || [];
      }
      
      return data || [];
    } catch (error) {
      console.error('Error in getNFTTemplates:', error);
      return []; // Return empty array instead of throwing
    }
  },

  async getNFTTemplateByOrderId(orderId: string) {
    try {
      const { data, error } = await supabase
        .from('nft_templates')
        .select('*')
        .eq('order_id', orderId)
        .eq('status', 'ready')
        .single();
      
      if (error && error.code !== 'PGRST116') {
        console.error('Error getting NFT template by order ID:', error);
        throw error;
      }
      return data;
    } catch (error) {
      console.error('Error in getNFTTemplateByOrderId:', error);
      return null;
    }
  },

  async updateNFTTemplate(id: string, updates: Partial<any>) {
    try {
      const { data, error } = await supabase
        .from('nft_templates')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      
      if (error) {
        console.error('Error updating NFT template:', error);
        throw error;
      }
      return data;
    } catch (error) {
      console.error('Error in updateNFTTemplate:', error);
      throw error;
    }
  }
};