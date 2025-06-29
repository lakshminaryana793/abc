export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  image_url: string;
  sizes: string[];
  stock: Record<string, number>;
  category: string;
  created_at: string;
  max_edition?: number;
  serial_prefix?: string;
}

export interface CartItem {
  product: Product;
  size: string;
  quantity: number;
}

export interface Order {
  id: string;
  user_address: string;
  items: CartItem[];
  total_amount: number;
  payment_status: 'pending' | 'completed' | 'failed';
  delivery_status: 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'completed';
  delivered_at?: string;
  return_period_days: number;
  nft_claimable: boolean;
  nft_minted: boolean;
  created_at: string;
  stripe_payment_intent_id?: string;
  customer_info?: {
    name: string;
    email: string;
    phone: string;
    address: string;
    city: string;
    state: string;
    pincode: string;
  };
  payment_method?: 'card' | 'upi' | 'cod';
}

export interface NFT {
  id: string;
  token_id: string;
  owner_address: string;
  product_id: string;
  metadata_uri: string;
  serial_number: string;
  edition_number: number;
  created_at: string;
}

export interface User {
  id: string;
  wallet_address: string;
  email?: string;
  created_at: string;
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
  created_at: string;
}

export interface WalletState {
  address: string | null;
  isConnected: boolean;
  isConnecting: boolean;
}

export interface CartState {
  items: CartItem[];
  addItem: (product: Product, size: string, quantity: number) => void;
  removeItem: (productId: string, size: string) => void;
  updateQuantity: (productId: string, size: string, quantity: number) => void;
  clearCart: () => void;
  getTotalPrice: () => number;
  getTotalItems: () => number;
}