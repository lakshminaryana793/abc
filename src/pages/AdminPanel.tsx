import React, { useEffect, useState } from 'react';
import { 
  Package, 
  Users, 
  ShoppingCart, 
  TrendingUp, 
  Plus, 
  Edit, 
  Trash2, 
  Upload,
  Image,
  CheckCircle,
  Clock,
  AlertCircle,
  Eye,
  Download
} from 'lucide-react';
import { db } from '../lib/supabase';
import toast from 'react-hot-toast';

interface Product {
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
  created_at: string;
}

interface Order {
  id: string;
  user_address: string;
  product_id: string;
  size: string;
  quantity: number;
  total_amount: number;
  status: string;
  delivery_status: string;
  has_custom_nft: boolean;
  nft_claimable: boolean;
  nft_minted: boolean;
  customer_wallet_address: string;
  created_at: string;
  customer_info: any;
  products: {
    name: string;
    image_url: string;
  };
}

interface NFTTemplate {
  id: string;
  order_id: string;
  name: string;
  description: string;
  image_url: string;
  serial_number: string;
  edition_number: number;
  status: string;
  created_at: string;
}

export const AdminPanel: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'overview' | 'products' | 'orders' | 'nfts'>('overview');
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [nftTemplates, setNftTemplates] = useState<NFTTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [showProductForm, setShowProductForm] = useState(false);
  const [showNFTUpload, setShowNFTUpload] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [uploadingNFT, setUploadingNFT] = useState(false);

  const [productForm, setProductForm] = useState({
    name: '',
    description: '',
    price: '',
    image_url: '',
    sizes: ['S', 'M', 'L', 'XL'],
    stock: { S: 10, M: 15, L: 20, XL: 8 },
    category: 'clothing',
    max_edition: 100,
    serial_prefix: 'NFT'
  });

  const [nftForm, setNftForm] = useState({
    name: '',
    description: '',
    image_url: '',
    serial_number: '',
    edition_number: 1
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [productsData, ordersData, nftData] = await Promise.all([
        db.getProducts(),
        db.getOrdersForAdmin(),
        db.getNFTTemplates()
      ]);
      
      setProducts(productsData);
      setOrders(ordersData);
      setNftTemplates(nftData);
    } catch (error) {
      console.error('Error loading admin data:', error);
      toast.error('Failed to load admin data');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const productData = {
        ...productForm,
        price: parseFloat(productForm.price),
        sizes: JSON.stringify(productForm.sizes),
        stock: JSON.stringify(productForm.stock)
      };

      if (editingProduct) {
        await db.updateProduct(editingProduct.id, productData);
        toast.success('Product updated successfully!');
      } else {
        await db.createProduct(productData);
        toast.success('Product created successfully!');
      }

      setShowProductForm(false);
      setEditingProduct(null);
      setProductForm({
        name: '',
        description: '',
        price: '',
        image_url: '',
        sizes: ['S', 'M', 'L', 'XL'],
        stock: { S: 10, M: 15, L: 20, XL: 8 },
        category: 'clothing',
        max_edition: 100,
        serial_prefix: 'NFT'
      });
      loadData();
    } catch (error) {
      console.error('Error saving product:', error);
      toast.error('Failed to save product');
    }
  };

  const handleDeleteProduct = async (id: string) => {
    if (!confirm('Are you sure you want to delete this product?')) return;
    
    try {
      await db.deleteProduct(id);
      toast.success('Product deleted successfully!');
      loadData();
    } catch (error) {
      console.error('Error deleting product:', error);
      toast.error('Failed to delete product');
    }
  };

  const handleUpdateOrderStatus = async (orderId: string, status: string) => {
    try {
      await db.updateOrder(orderId, { delivery_status: status });
      toast.success('Order status updated successfully!');
      loadData();
    } catch (error) {
      console.error('Error updating order status:', error);
      toast.error('Failed to update order status');
    }
  };

  const handleUploadNFT = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOrder) return;

    setUploadingNFT(true);

    try {
      // Validate form data
      if (!nftForm.name || !nftForm.description || !nftForm.image_url || !nftForm.serial_number) {
        throw new Error('Please fill in all required fields');
      }

      // Create metadata JSON
      const metadata = {
        name: nftForm.name,
        description: nftForm.description,
        image: nftForm.image_url,
        external_url: `${window.location.origin}/products/${selectedOrder.product_id}`,
        attributes: [
          { trait_type: 'Serial Number', value: nftForm.serial_number },
          { trait_type: 'Edition', value: nftForm.edition_number },
          { trait_type: 'Product', value: selectedOrder.products.name },
          { trait_type: 'Size', value: selectedOrder.size },
          { trait_type: 'Brand', value: 'Web3Store' },
          { trait_type: 'Collection', value: 'Web3 Fashion Collection' },
          { trait_type: 'Authenticity', value: 'Verified' }
        ]
      };

      // Create NFT template
      const templateData = {
        order_id: selectedOrder.id,
        name: nftForm.name,
        description: nftForm.description,
        image_url: nftForm.image_url,
        serial_number: nftForm.serial_number,
        edition_number: nftForm.edition_number,
        uploaded_by: 'admin',
        status: 'ready',
        metadata_json: metadata
      };

      console.log('Creating NFT template with data:', templateData);

      const nftTemplate = await db.createNFTTemplate(templateData);
      console.log('NFT template created:', nftTemplate);

      // Update order to mark it has custom NFT
      await db.updateOrder(selectedOrder.id, { has_custom_nft: true });
      console.log('Order updated with custom NFT flag');

      toast.success('NFT uploaded successfully!');
      setShowNFTUpload(false);
      setSelectedOrder(null);
      setNftForm({
        name: '',
        description: '',
        image_url: '',
        serial_number: '',
        edition_number: 1
      });
      loadData();
    } catch (error: any) {
      console.error('Error uploading NFT:', error);
      toast.error(error.message || 'Failed to upload NFT');
    } finally {
      setUploadingNFT(false);
    }
  };

  const getOrderStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'text-yellow-400 bg-yellow-400/10';
      case 'confirmed': return 'text-blue-400 bg-blue-400/10';
      case 'shipped': return 'text-purple-400 bg-purple-400/10';
      case 'delivered': return 'text-green-400 bg-green-400/10';
      default: return 'text-gray-400 bg-gray-400/10';
    }
  };

  const getNFTStatusIcon = (order: Order) => {
    if (order.nft_minted) {
      return <CheckCircle className="h-5 w-5 text-green-400" />;
    } else if (order.has_custom_nft) {
      return <Upload className="h-5 w-5 text-blue-400" />;
    } else {
      return <Clock className="h-5 w-5 text-yellow-400" />;
    }
  };

  const stats = {
    totalProducts: products.length,
    totalOrders: orders.length,
    pendingOrders: orders.filter(o => o.delivery_status === 'pending').length,
    nftsMinted: orders.filter(o => o.nft_minted).length,
    revenue: orders.reduce((sum, order) => sum + order.total_amount, 0)
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900/10 to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto mb-4"></div>
          <p className="text-gray-300">Loading admin panel...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900/10 to-gray-900 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-4">Admin Panel</h1>
          <p className="text-xl text-gray-300">Manage your Web3 store and NFT collections</p>
        </div>

        {/* Navigation Tabs */}
        <div className="flex space-x-1 mb-8 bg-gray-800/50 p-1 rounded-xl">
          {[
            { key: 'overview', label: 'Overview', icon: TrendingUp },
            { key: 'products', label: 'Products', icon: Package },
            { key: 'orders', label: 'Orders', icon: ShoppingCart },
            { key: 'nfts', label: 'NFT Management', icon: Image }
          ].map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => setActiveTab(key as any)}
              className={`flex items-center space-x-2 px-6 py-3 rounded-lg font-medium transition-all ${
                activeTab === key
                  ? 'bg-purple-600 text-white'
                  : 'text-gray-300 hover:text-white hover:bg-gray-700'
              }`}
            >
              <Icon className="h-5 w-5" />
              <span>{label}</span>
            </button>
          ))}
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-8">
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
              <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-400 text-sm">Total Products</p>
                    <p className="text-2xl font-bold text-white">{stats.totalProducts}</p>
                  </div>
                  <Package className="h-8 w-8 text-purple-400" />
                </div>
              </div>

              <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-400 text-sm">Total Orders</p>
                    <p className="text-2xl font-bold text-white">{stats.totalOrders}</p>
                  </div>
                  <ShoppingCart className="h-8 w-8 text-blue-400" />
                </div>
              </div>

              <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-400 text-sm">Pending Orders</p>
                    <p className="text-2xl font-bold text-white">{stats.pendingOrders}</p>
                  </div>
                  <Clock className="h-8 w-8 text-yellow-400" />
                </div>
              </div>

              <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-400 text-sm">NFTs Minted</p>
                    <p className="text-2xl font-bold text-white">{stats.nftsMinted}</p>
                  </div>
                  <CheckCircle className="h-8 w-8 text-green-400" />
                </div>
              </div>

              <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-400 text-sm">Total Revenue</p>
                    <p className="text-2xl font-bold text-white">${stats.revenue.toFixed(2)}</p>
                  </div>
                  <TrendingUp className="h-8 w-8 text-green-400" />
                </div>
              </div>
            </div>

            {/* Recent Orders */}
            <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-6">
              <h3 className="text-xl font-bold text-white mb-4">Recent Orders</h3>
              <div className="space-y-4">
                {orders.slice(0, 5).map((order) => (
                  <div key={order.id} className="flex items-center justify-between p-4 bg-gray-700/50 rounded-lg">
                    <div className="flex items-center space-x-4">
                      <img
                        src={order.products.image_url}
                        alt={order.products.name}
                        className="w-12 h-12 object-cover rounded-lg"
                      />
                      <div>
                        <p className="text-white font-medium">{order.products.name}</p>
                        <p className="text-gray-400 text-sm">
                          {order.id.slice(0, 8)}... • ${order.total_amount}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      {getNFTStatusIcon(order)}
                      <span className={`px-3 py-1 rounded-full text-sm ${getOrderStatusColor(order.delivery_status)}`}>
                        {order.delivery_status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Products Tab */}
        {activeTab === 'products' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-white">Products Management</h2>
              <button
                onClick={() => setShowProductForm(true)}
                className="flex items-center space-x-2 bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg transition-colors"
              >
                <Plus className="h-5 w-5" />
                <span>Add Product</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {products.map((product) => (
                <div key={product.id} className="bg-gray-800/50 border border-gray-700 rounded-xl p-6">
                  <img
                    src={product.image_url}
                    alt={product.name}
                    className="w-full h-48 object-cover rounded-lg mb-4"
                  />
                  <h3 className="text-lg font-semibold text-white mb-2">{product.name}</h3>
                  <p className="text-gray-400 text-sm mb-4 line-clamp-2">{product.description}</p>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-purple-400 font-bold">${product.price}</span>
                    <span className="text-gray-400 text-sm">{product.category}</span>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => {
                        setEditingProduct(product);
                        setProductForm({
                          name: product.name,
                          description: product.description,
                          price: product.price.toString(),
                          image_url: product.image_url,
                          sizes: product.sizes,
                          stock: product.stock,
                          category: product.category,
                          max_edition: product.max_edition,
                          serial_prefix: product.serial_prefix
                        });
                        setShowProductForm(true);
                      }}
                      className="flex-1 flex items-center justify-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg transition-colors"
                    >
                      <Edit className="h-4 w-4" />
                      <span>Edit</span>
                    </button>
                    <button
                      onClick={() => handleDeleteProduct(product.id)}
                      className="flex-1 flex items-center justify-center space-x-2 bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded-lg transition-colors"
                    >
                      <Trash2 className="h-4 w-4" />
                      <span>Delete</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Orders Tab */}
        {activeTab === 'orders' && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-white">Orders Management</h2>
            
            <div className="bg-gray-800/50 border border-gray-700 rounded-xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-700/50">
                    <tr>
                      <th className="text-left p-4 text-gray-300">Order</th>
                      <th className="text-left p-4 text-gray-300">Product</th>
                      <th className="text-left p-4 text-gray-300">Customer</th>
                      <th className="text-left p-4 text-gray-300">Amount</th>
                      <th className="text-left p-4 text-gray-300">Status</th>
                      <th className="text-left p-4 text-gray-300">NFT Status</th>
                      <th className="text-left p-4 text-gray-300">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.map((order) => (
                      <tr key={order.id} className="border-t border-gray-700">
                        <td className="p-4">
                          <div>
                            <p className="text-white font-medium">{order.id.slice(0, 8)}...</p>
                            <p className="text-gray-400 text-sm">
                              {new Date(order.created_at).toLocaleDateString()}
                            </p>
                          </div>
                        </td>
                        <td className="p-4">
                          <div className="flex items-center space-x-3">
                            <img
                              src={order.products.image_url}
                              alt={order.products.name}
                              className="w-10 h-10 object-cover rounded"
                            />
                            <div>
                              <p className="text-white">{order.products.name}</p>
                              <p className="text-gray-400 text-sm">Size: {order.size}</p>
                            </div>
                          </div>
                        </td>
                        <td className="p-4">
                          <p className="text-white">
                            {order.customer_wallet_address 
                              ? `${order.customer_wallet_address.slice(0, 6)}...${order.customer_wallet_address.slice(-4)}`
                              : 'Guest User'
                            }
                          </p>
                        </td>
                        <td className="p-4">
                          <p className="text-purple-400 font-semibold">${order.total_amount}</p>
                        </td>
                        <td className="p-4">
                          <select
                            value={order.delivery_status}
                            onChange={(e) => handleUpdateOrderStatus(order.id, e.target.value)}
                            className="bg-gray-700 border border-gray-600 rounded px-3 py-1 text-white text-sm"
                          >
                            <option value="pending">Pending</option>
                            <option value="confirmed">Confirmed</option>
                            <option value="shipped">Shipped</option>
                            <option value="delivered">Delivered</option>
                          </select>
                        </td>
                        <td className="p-4">
                          <div className="flex items-center space-x-2">
                            {getNFTStatusIcon(order)}
                            <span className="text-sm text-gray-300">
                              {order.nft_minted ? 'Minted' : 
                               order.has_custom_nft ? 'Ready' : 'Pending'}
                            </span>
                          </div>
                        </td>
                        <td className="p-4">
                          {!order.has_custom_nft && !order.nft_minted && (
                            <button
                              onClick={() => {
                                setSelectedOrder(order);
                                setNftForm({
                                  name: `${order.products.name} - Special Edition`,
                                  description: `Exclusive NFT for ${order.products.name} in size ${order.size}. This unique digital collectible serves as proof of authenticity and ownership.`,
                                  image_url: order.products.image_url,
                                  serial_number: `${order.products.name.substring(0, 3).toUpperCase()}-${Date.now().toString().slice(-6)}`,
                                  edition_number: 1
                                });
                                setShowNFTUpload(true);
                              }}
                              className="flex items-center space-x-2 bg-purple-600 hover:bg-purple-700 text-white px-3 py-1 rounded text-sm transition-colors"
                            >
                              <Upload className="h-4 w-4" />
                              <span>Upload NFT</span>
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* NFT Management Tab */}
        {activeTab === 'nfts' && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-white">NFT Templates Management</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {nftTemplates.map((nft) => (
                <div key={nft.id} className="bg-gray-800/50 border border-gray-700 rounded-xl p-6">
                  <img
                    src={nft.image_url}
                    alt={nft.name}
                    className="w-full h-48 object-cover rounded-lg mb-4"
                  />
                  <h3 className="text-lg font-semibold text-white mb-2">{nft.name}</h3>
                  <p className="text-gray-400 text-sm mb-4 line-clamp-2">{nft.description}</p>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Serial:</span>
                      <span className="text-white">{nft.serial_number}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Edition:</span>
                      <span className="text-white">#{nft.edition_number}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Status:</span>
                      <span className={`px-2 py-1 rounded text-xs ${
                        nft.status === 'ready' ? 'bg-green-500/20 text-green-400' :
                        nft.status === 'claimed' ? 'bg-blue-500/20 text-blue-400' :
                        'bg-yellow-500/20 text-yellow-400'
                      }`}>
                        {nft.status}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Product Form Modal */}
        {showProductForm && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-gray-800 border border-gray-700 rounded-xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <h3 className="text-xl font-bold text-white mb-6">
                {editingProduct ? 'Edit Product' : 'Add New Product'}
              </h3>
              
              <form onSubmit={handleCreateProduct} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Name</label>
                    <input
                      type="text"
                      value={productForm.name}
                      onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
                      className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Price</label>
                    <input
                      type="number"
                      step="0.01"
                      value={productForm.price}
                      onChange={(e) => setProductForm({ ...productForm, price: e.target.value })}
                      className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Description</label>
                  <textarea
                    value={productForm.description}
                    onChange={(e) => setProductForm({ ...productForm, description: e.target.value })}
                    rows={3}
                    className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Image URL</label>
                  <input
                    type="url"
                    value={productForm.image_url}
                    onChange={(e) => setProductForm({ ...productForm, image_url: e.target.value })}
                    className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Category</label>
                    <select
                      value={productForm.category}
                      onChange={(e) => setProductForm({ ...productForm, category: e.target.value })}
                      className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
                    >
                      <option value="clothing">Clothing</option>
                      <option value="hoodies">Hoodies</option>
                      <option value="tshirts">T-Shirts</option>
                      <option value="jackets">Jackets</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Max Edition</label>
                    <input
                      type="number"
                      value={productForm.max_edition}
                      onChange={(e) => setProductForm({ ...productForm, max_edition: parseInt(e.target.value) })}
                      className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Serial Prefix</label>
                    <input
                      type="text"
                      value={productForm.serial_prefix}
                      onChange={(e) => setProductForm({ ...productForm, serial_prefix: e.target.value })}
                      className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
                    />
                  </div>
                </div>

                <div className="flex space-x-4 pt-4">
                  <button
                    type="submit"
                    className="flex-1 bg-purple-600 hover:bg-purple-700 text-white py-3 px-6 rounded-lg font-semibold transition-colors"
                  >
                    {editingProduct ? 'Update Product' : 'Create Product'}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowProductForm(false);
                      setEditingProduct(null);
                    }}
                    className="flex-1 bg-gray-600 hover:bg-gray-700 text-white py-3 px-6 rounded-lg font-semibold transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* NFT Upload Modal */}
        {showNFTUpload && selectedOrder && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-gray-800 border border-gray-700 rounded-xl p-6 max-w-lg w-full max-h-[90vh] overflow-y-auto">
              <h3 className="text-xl font-bold text-white mb-6">Upload Custom NFT</h3>
              
              <div className="mb-4 p-4 bg-gray-700/50 rounded-lg">
                <p className="text-gray-300 text-sm">
                  <strong>Order:</strong> {selectedOrder.id.slice(0, 8)}...
                </p>
                <p className="text-gray-300 text-sm">
                  <strong>Product:</strong> {selectedOrder.products.name}
                </p>
                <p className="text-gray-300 text-sm">
                  <strong>Size:</strong> {selectedOrder.size}
                </p>
              </div>
              
              <form onSubmit={handleUploadNFT} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">NFT Name *</label>
                  <input
                    type="text"
                    value={nftForm.name}
                    onChange={(e) => setNftForm({ ...nftForm, name: e.target.value })}
                    className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
                    placeholder="e.g., Galaxy Hoodie Special Edition"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Description *</label>
                  <textarea
                    value={nftForm.description}
                    onChange={(e) => setNftForm({ ...nftForm, description: e.target.value })}
                    rows={3}
                    className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
                    placeholder="Describe this unique NFT..."
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">NFT Image URL *</label>
                  <input
                    type="url"
                    value={nftForm.image_url}
                    onChange={(e) => setNftForm({ ...nftForm, image_url: e.target.value })}
                    className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
                    placeholder="https://example.com/nft-image.jpg"
                    required
                  />
                  {nftForm.image_url && (
                    <div className="mt-2">
                      <img
                        src={nftForm.image_url}
                        alt="NFT Preview"
                        className="w-full h-32 object-cover rounded-lg"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                        }}
                      />
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Serial Number *</label>
                    <input
                      type="text"
                      value={nftForm.serial_number}
                      onChange={(e) => setNftForm({ ...nftForm, serial_number: e.target.value })}
                      className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
                      placeholder="GAL-001"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Edition Number</label>
                    <input
                      type="number"
                      value={nftForm.edition_number}
                      onChange={(e) => setNftForm({ ...nftForm, edition_number: parseInt(e.target.value) })}
                      className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
                      min="1"
                      required
                    />
                  </div>
                </div>

                <div className="flex space-x-4 pt-4">
                  <button
                    type="submit"
                    disabled={uploadingNFT}
                    className="flex-1 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 text-white py-3 px-6 rounded-lg font-semibold transition-colors flex items-center justify-center space-x-2"
                  >
                    {uploadingNFT ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        <span>Uploading...</span>
                      </>
                    ) : (
                      <>
                        <Upload className="h-4 w-4" />
                        <span>Upload NFT</span>
                      </>
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowNFTUpload(false);
                      setSelectedOrder(null);
                    }}
                    disabled={uploadingNFT}
                    className="flex-1 bg-gray-600 hover:bg-gray-700 disabled:bg-gray-700 text-white py-3 px-6 rounded-lg font-semibold transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};