import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Wallet, CheckCircle, Gift, ArrowRight, Loader, Mail, Search, AlertCircle, ExternalLink, Settings, Image } from 'lucide-react';
import { useWalletStore } from '../store/wallet';
import { db } from '../lib/supabase';
import { web3Service } from '../lib/web3';
import toast from 'react-hot-toast';

interface ClaimableOrder {
  id: string;
  product_id: string;
  size: string;
  quantity: number;
  customer_wallet_address: string;
  status: string;
  has_custom_nft: boolean;
  nft_claimable: boolean;
  nft_minted: boolean;
  products: {
    name: string;
    image_url: string;
    max_edition: number;
    serial_prefix: string;
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
  metadata_json: any;
}

interface PendingOrder {
  id: string;
  product_id: string;
  size: string;
  quantity: number;
  status: string;
  customer_info: {
    email: string;
    name: string;
  };
  products: {
    name: string;
    image_url: string;
  };
}

export const NFTClaiming: React.FC = () => {
  const { address, isConnected, connect } = useWalletStore();
  const [claimableOrders, setClaimableOrders] = useState<ClaimableOrder[]>([]);
  const [nftTemplates, setNftTemplates] = useState<Record<string, NFTTemplate>>({});
  const [pendingOrders, setPendingOrders] = useState<PendingOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [claiming, setClaiming] = useState<string | null>(null);
  const [showEmailSearch, setShowEmailSearch] = useState(false);
  const [searchEmail, setSearchEmail] = useState('');
  const [searchLoading, setSearchLoading] = useState(false);
  const [addingWallet, setAddingWallet] = useState<string | null>(null);
  const [claimProgress, setClaimProgress] = useState<{
    orderId: string;
    step: string;
    progress: number;
  } | null>(null);

  const contractAddress = import.meta.env.VITE_NFT_CONTRACT_ADDRESS;
  const isContractConfigured = contractAddress && 
    contractAddress !== 'your_deployed_contract_address_here' && 
    contractAddress !== 'deployed_contract_address_placeholder' &&
    contractAddress.startsWith('0x');

  useEffect(() => {
    if (isConnected && address) {
      loadClaimableOrders();
    } else {
      setLoading(false);
    }
  }, [isConnected, address]);

  const loadClaimableOrders = async () => {
    if (!address) return;
    
    try {
      // Get orders that are claimable for this wallet address
      const { data: orders, error } = await db.supabase
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
        .eq('customer_wallet_address', address)
        .eq('nft_claimable', true)
        .eq('nft_minted', false)
        .in('status', ['confirmed', 'delivered']);

      if (error) {
        console.error('Error loading claimable orders:', error);
        throw error;
      }

      setClaimableOrders(orders || []);

      // Load NFT templates for orders with custom NFTs
      const templatesMap: Record<string, NFTTemplate> = {};
      for (const order of orders || []) {
        if (order.has_custom_nft) {
          const { data } = await db.supabase
            .from('nft_templates')
            .select('*')
            .eq('order_id', order.id)
            .eq('status', 'ready')
            .single();
          
          if (data) {
            templatesMap[order.id] = data;
          }
        }
      }
      setNftTemplates(templatesMap);
    } catch (error) {
      console.error('Error loading claimable orders:', error);
      toast.error('Failed to load claimable NFTs');
    } finally {
      setLoading(false);
    }
  };

  const handleSearchByEmail = async () => {
    if (!searchEmail) {
      toast.error('Please enter your email address');
      return;
    }

    if (!searchEmail.includes('@')) {
      toast.error('Please enter a valid email address');
      return;
    }

    setSearchLoading(true);
    try {
      // Search for orders by email in customer_info
      const { data: orders, error } = await db.supabase
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
        .contains('customer_info', { email: searchEmail })
        .in('status', ['confirmed', 'delivered'])
        .is('customer_wallet_address', null);

      if (error) {
        console.error('Error searching orders:', error);
        throw error;
      }

      setPendingOrders(orders || []);
      
      if (!orders || orders.length === 0) {
        toast.info('No confirmed orders found with this email that need wallet addresses.');
      } else {
        toast.success(`Found ${orders.length} order(s) ready for wallet address`);
      }
    } catch (error) {
      console.error('Error searching orders:', error);
      toast.error('Failed to search orders. Please try again.');
    } finally {
      setSearchLoading(false);
    }
  };

  const handleAddWalletAddress = async (orderId: string) => {
    if (!isConnected || !address) {
      toast.error('Please connect your wallet first');
      return;
    }

    setAddingWallet(orderId);
    try {
      const { error } = await db.supabase
        .from('orders')
        .update({ 
          customer_wallet_address: address,
          nft_claimable: true 
        })
        .eq('id', orderId);

      if (error) {
        console.error('Error updating order:', error);
        throw error;
      }

      toast.success('Wallet address added successfully! Your NFT is now available for claiming.');
      
      // Refresh the search results
      if (searchEmail) {
        await handleSearchByEmail();
      }
      
      // Refresh claimable orders
      await loadClaimableOrders();
    } catch (error) {
      console.error('Error adding wallet address:', error);
      toast.error('Failed to add wallet address. Please try again.');
    } finally {
      setAddingWallet(null);
    }
  };

  const handleConnectWallet = async () => {
    try {
      await connect();
      toast.success('Wallet connected successfully!');
    } catch (error: any) {
      console.error('Wallet connection error:', error);
      toast.error(error.message || 'Failed to connect wallet');
    }
  };

  const handleClaimNFT = async (order: ClaimableOrder) => {
    if (!address || !isConnected) {
      toast.error('Please connect your wallet first');
      return;
    }

    if (!isContractConfigured) {
      toast.error('NFT contract not deployed yet. Please follow the deployment guide to deploy the contract first.');
      return;
    }

    setClaiming(order.id);
    setClaimProgress({
      orderId: order.id,
      step: 'Preparing NFT metadata...',
      progress: 10
    });

    try {
      // Check wallet balance
      const balance = await web3Service.getBalance(address);
      if (parseFloat(balance) < 0.01) {
        throw new Error('Insufficient MATIC balance for gas fees. Please add MATIC to your wallet.');
      }

      let metadataUri: string;
      let serialNumber: string;
      let editionNumber = 1;

      if (order.has_custom_nft && nftTemplates[order.id]) {
        // Use custom NFT template
        const template = nftTemplates[order.id];
        
        setClaimProgress({
          orderId: order.id,
          step: 'Using custom NFT template...',
          progress: 30
        });

        metadataUri = `data:application/json;base64,${btoa(JSON.stringify(template.metadata_json))}`;
        serialNumber = template.serial_number;
        editionNumber = template.edition_number;

        setClaimProgress({
          orderId: order.id,
          step: 'Minting custom NFT on blockchain...',
          progress: 70
        });
      } else {
        // Generate standard NFT metadata
        setClaimProgress({
          orderId: order.id,
          step: 'Generating standard NFT metadata...',
          progress: 30
        });

        // Get current edition number for this product
        const { data: existingNFTs } = await db.supabase
          .from('nfts')
          .select('edition_number')
          .eq('product_id', order.product_id)
          .order('edition_number', { ascending: false })
          .limit(1);

        editionNumber = existingNFTs && existingNFTs.length > 0 
          ? existingNFTs[0].edition_number + 1 
          : 1;

        serialNumber = `${order.products.serial_prefix}-${editionNumber.toString().padStart(4, '0')}`;

        const metadata = {
          name: `${order.products.name} - Edition #${editionNumber}`,
          description: `Exclusive NFT for ${order.products.name} in size ${order.size}. This NFT serves as proof of authenticity and ownership.`,
          image: order.products.image_url,
          attributes: [
            { trait_type: 'Product Name', value: order.products.name },
            { trait_type: 'Size', value: order.size },
            { trait_type: 'Serial Number', value: serialNumber },
            { trait_type: 'Edition Number', value: editionNumber },
            { trait_type: 'Max Edition', value: order.products.max_edition }
          ]
        };

        metadataUri = `data:application/json;base64,${btoa(JSON.stringify(metadata))}`;

        setClaimProgress({
          orderId: order.id,
          step: 'Minting NFT on blockchain...',
          progress: 70
        });
      }

      // Mint NFT
      const tokenId = await web3Service.mintNFT(
        contractAddress,
        address,
        order.product_id,
        serialNumber,
        order.products.max_edition || 100,
        metadataUri
      );

      setClaimProgress({
        orderId: order.id,
        step: 'Saving NFT record...',
        progress: 90
      });

      // Save NFT record to database
      const { error: nftError } = await db.supabase
        .from('nfts')
        .insert({
          token_id: tokenId,
          owner_address: address,
          product_id: order.product_id,
          order_id: order.id,
          metadata_uri: metadataUri,
          edition_number: editionNumber,
          serial_code: serialNumber,
          custom_nft_id: order.has_custom_nft ? nftTemplates[order.id]?.id : null
        });

      if (nftError) {
        console.error('Error saving NFT record:', nftError);
        throw new Error('Failed to save NFT record to database');
      }

      // Update order to mark NFT as minted
      const { error: orderError } = await db.supabase
        .from('orders')
        .update({ nft_minted: true })
        .eq('id', order.id);

      if (orderError) {
        console.error('Error updating order:', orderError);
        // Don't throw here as the NFT was successfully minted
      }

      // Update NFT template status if custom NFT
      if (order.has_custom_nft && nftTemplates[order.id]) {
        await db.supabase
          .from('nft_templates')
          .update({ status: 'claimed' })
          .eq('id', nftTemplates[order.id].id);
      }

      setClaimProgress({
        orderId: order.id,
        step: 'Complete!',
        progress: 100
      });

      toast.success(
        `Successfully claimed your unique NFT! Token ID: ${tokenId}. Check your wallet or NFT marketplace to view it.`,
        { duration: 5000 }
      );
      
      // Reload claimable orders
      await loadClaimableOrders();

    } catch (error: any) {
      console.error('Error claiming NFT:', error);
      
      // Provide specific error messages
      if (error.message.includes('insufficient funds') || error.message.includes('MATIC balance')) {
        toast.error('Insufficient MATIC balance for gas fees. Please add MATIC to your wallet and try again.');
      } else if (error.message.includes('User rejected')) {
        toast.error('Transaction was rejected. Please try again and approve the transaction.');
      } else if (error.message.includes('sold out')) {
        toast.error('This NFT edition is sold out. Please contact support.');
      } else if (error.message.includes('network')) {
        toast.error('Network error. Please check your connection and try again.');
      } else if (error.message.includes('not deployed') || error.message.includes('contract not')) {
        toast.error('NFT contract not deployed yet. Please follow the deployment guide to deploy the contract.');
      } else {
        toast.error(error.message || 'Failed to claim NFT. Please try again.');
      }
    } finally {
      setClaiming(null);
      setClaimProgress(null);
    }
  };

  if (!isConnected && !showEmailSearch) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900/10 to-gray-900 flex items-center justify-center">
        <div className="text-center max-w-md mx-4">
          <div className="w-20 h-20 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-6">
            <Wallet className="h-10 w-10 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-4">Claim Your NFTs</h1>
          <p className="text-gray-300 mb-8">
            Connect your wallet or search by email to claim your exclusive NFT collectibles
          </p>
          
          <div className="space-y-4">
            <button
              onClick={handleConnectWallet}
              className="w-full inline-flex items-center justify-center space-x-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-8 py-4 rounded-full font-semibold text-lg transition-all duration-300 transform hover:scale-105"
            >
              <Wallet className="h-5 w-5" />
              <span>Connect Wallet</span>
            </button>
            
            <button
              onClick={() => setShowEmailSearch(true)}
              className="w-full inline-flex items-center justify-center space-x-2 bg-gray-700 hover:bg-gray-600 text-white px-8 py-4 rounded-full font-semibold text-lg transition-all duration-300"
            >
              <Mail className="h-5 w-5" />
              <span>Search by Email</span>
            </button>
          </div>

          {/* Contract Status */}
          {!isContractConfigured && (
            <div className="mt-8 p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-lg text-left">
              <div className="flex items-center space-x-2 mb-2">
                <Settings className="h-5 w-5 text-yellow-400" />
                <span className="text-yellow-300 font-semibold">Contract Setup Required</span>
              </div>
              <p className="text-yellow-200 text-sm mb-2">
                NFT contract needs to be deployed to enable claiming.
              </p>
              <Link
                to="/admin"
                className="text-yellow-300 hover:text-yellow-200 text-sm underline"
              >
                View deployment guide →
              </Link>
            </div>
          )}
        </div>
      </div>
    );
  }

  if (showEmailSearch && !isConnected) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900/10 to-gray-900 py-8">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-white mb-4">Find Your Orders</h1>
            <p className="text-xl text-gray-300">
              Enter your email to find confirmed orders ready for NFT claiming
            </p>
          </div>

          <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-6 mb-8">
            <div className="flex space-x-4">
              <input
                type="email"
                value={searchEmail}
                onChange={(e) => setSearchEmail(e.target.value)}
                placeholder="Enter your email address"
                className="flex-1 px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                onKeyPress={(e) => e.key === 'Enter' && handleSearchByEmail()}
              />
              <button
                onClick={handleSearchByEmail}
                disabled={searchLoading}
                className="flex items-center space-x-2 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
              >
                {searchLoading ? (
                  <Loader className="h-5 w-5 animate-spin" />
                ) : (
                  <Search className="h-5 w-5" />
                )}
                <span>Search</span>
              </button>
            </div>
          </div>

          {pendingOrders.length > 0 && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-white">Orders Ready for NFT Claiming</h2>
              <p className="text-gray-300 mb-6">
                These orders have been confirmed and are ready for NFT claiming. Connect your wallet to add your address.
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {pendingOrders.map((order) => (
                  <div
                    key={order.id}
                    className="bg-gray-800/50 border border-gray-700 rounded-xl p-6 hover:border-purple-500/50 transition-all duration-300"
                  >
                    <div className="aspect-square bg-gray-700 rounded-lg overflow-hidden mb-4">
                      <img
                        src={order.products.image_url}
                        alt={order.products.name}
                        className="w-full h-full object-cover"
                      />
                    </div>

                    <h3 className="text-xl font-semibold text-white mb-2">
                      {order.products.name}
                    </h3>
                    
                    <div className="text-gray-300 text-sm mb-4 space-y-1">
                      <p>Size: {order.size}</p>
                      <p>Quantity: {order.quantity} NFT{order.quantity > 1 ? 's' : ''}</p>
                      <p>Status: {order.status}</p>
                      <p>Customer: {order.customer_info.name}</p>
                    </div>

                    <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-3 mb-4">
                      <div className="flex items-center space-x-2">
                        <CheckCircle className="h-4 w-4 text-green-400" />
                        <span className="text-green-300 text-sm font-medium">Ready for NFT Claiming</span>
                      </div>
                      <p className="text-green-200 text-xs mt-1">
                        Order confirmed - NFT available after adding wallet
                      </p>
                    </div>

                    {!isConnected ? (
                      <button
                        onClick={handleConnectWallet}
                        className="w-full flex items-center justify-center space-x-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white py-3 px-4 rounded-lg font-semibold transition-all duration-200"
                      >
                        <Wallet className="h-5 w-5" />
                        <span>Connect Wallet to Add Address</span>
                      </button>
                    ) : (
                      <button
                        onClick={() => handleAddWalletAddress(order.id)}
                        disabled={addingWallet === order.id}
                        className="w-full flex items-center justify-center space-x-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 disabled:from-gray-600 disabled:to-gray-600 text-white py-3 px-4 rounded-lg font-semibold transition-all duration-200"
                      >
                        {addingWallet === order.id ? (
                          <>
                            <Loader className="h-5 w-5 animate-spin" />
                            <span>Adding Address...</span>
                          </>
                        ) : (
                          <>
                            <Wallet className="h-5 w-5" />
                            <span>Add Wallet Address</span>
                          </>
                        )}
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="mt-8 text-center">
            <button
              onClick={() => setShowEmailSearch(false)}
              className="text-purple-400 hover:text-purple-300 transition-colors"
            >
              ← Back to wallet connection
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900/10 to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto mb-4"></div>
          <p className="text-gray-300">Loading your claimable NFTs...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900/10 to-gray-900 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-4">Claim Your NFTs</h1>
          <p className="text-xl text-gray-300">
            Your exclusive NFT collectibles are ready to be claimed
          </p>
        </div>

        {/* Progress Modal */}
        {claimProgress && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-gray-800 border border-gray-700 rounded-xl p-8 max-w-md w-full mx-4">
              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Gift className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-white mb-4">Claiming Your NFT</h3>
                <p className="text-gray-300 mb-6">{claimProgress.step}</p>
                
                <div className="w-full bg-gray-700 rounded-full h-3 mb-4">
                  <div
                    className="bg-gradient-to-r from-purple-500 to-pink-500 h-3 rounded-full transition-all duration-300"
                    style={{ width: `${claimProgress.progress}%` }}
                  ></div>
                </div>
                
                <p className="text-sm text-gray-400">
                  {claimProgress.progress}% Complete
                </p>
                
                {claimProgress.progress < 100 && (
                  <p className="text-xs text-yellow-300 mt-2">
                    Please don't close this window or refresh the page
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Contract Status Warning */}
        {!isContractConfigured && (
          <div className="mb-8 bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-6">
            <div className="flex items-start space-x-4">
              <Settings className="h-6 w-6 text-yellow-400 mt-1 flex-shrink-0" />
              <div>
                <h3 className="text-lg font-semibold text-yellow-300 mb-2">Contract Deployment Required</h3>
                <div className="text-yellow-200 text-sm space-y-2">
                  <p>The NFT smart contract needs to be deployed before users can claim NFTs.</p>
                  <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-3 mt-3">
                    <p className="font-medium mb-2">To deploy the contract:</p>
                    <ol className="list-decimal list-inside space-y-1 text-xs">
                      <li>Navigate to the <code className="bg-yellow-500/20 px-1 rounded">contracts</code> folder</li>
                      <li>Follow the instructions in <code className="bg-yellow-500/20 px-1 rounded">deploy-contract-guide.md</code></li>
                      <li>Update the <code className="bg-yellow-500/20 px-1 rounded">.env</code> file with the deployed contract address</li>
                    </ol>
                  </div>
                  <Link
                    to="/admin"
                    className="inline-flex items-center space-x-1 text-yellow-300 hover:text-yellow-200 text-sm underline mt-2"
                  >
                    <span>View admin panel for deployment guide</span>
                    <ExternalLink className="h-3 w-3" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        )}

        {claimableOrders.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-20 h-20 bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-6">
              <Gift className="h-10 w-10 text-gray-400" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-4">No NFTs Ready to Claim</h2>
            <p className="text-gray-300 mb-8 max-w-2xl mx-auto">
              NFTs become available for claiming after your orders are confirmed and you've added your wallet address.
            </p>
            
            <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-6 max-w-md mx-auto mb-8">
              <h3 className="text-blue-300 font-semibold mb-3">NFT Claiming Process</h3>
              <div className="text-left space-y-2 text-blue-200 text-sm">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                  <span>Place and confirm your order</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
                  <span>Add your wallet address to the order</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                  <span>Claim your unique NFT!</span>
                </div>
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/products"
                className="inline-flex items-center space-x-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-8 py-3 rounded-full font-semibold transition-all duration-300"
              >
                <span>Shop More Items</span>
                <ArrowRight className="h-5 w-5" />
              </Link>
              <Link
                to="/orders"
                className="inline-flex items-center space-x-2 bg-gray-700 hover:bg-gray-600 text-white px-8 py-3 rounded-full font-semibold transition-all duration-300"
              >
                <span>Track Orders</span>
              </Link>
              <button
                onClick={() => setShowEmailSearch(true)}
                className="inline-flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-full font-semibold transition-all duration-300"
              >
                <Mail className="h-5 w-5" />
                <span>Search by Email</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Instructions */}
            <div className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-500/30 rounded-xl p-6">
              <div className="flex items-start space-x-4">
                <AlertCircle className="h-6 w-6 text-purple-400 mt-1 flex-shrink-0" />
                <div>
                  <h3 className="text-lg font-semibold text-purple-300 mb-2">Before You Claim</h3>
                  <div className="text-purple-200 text-sm space-y-1">
                    <p>• Ensure you have sufficient MATIC in your wallet for gas fees (~$0.01-0.05)</p>
                    <p>• Each NFT is unique and specially created for your order</p>
                    <p>• Custom NFTs are uploaded by our admin team for each order</p>
                    <p>• Once claimed, NFTs will appear in your wallet and on NFT marketplaces</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Claimable NFTs Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {claimableOrders.map((order) => {
                const customNFT = nftTemplates[order.id];
                
                return (
                  <div
                    key={order.id}
                    className="bg-gray-800/50 border border-gray-700 rounded-xl p-6 hover:border-purple-500/50 transition-all duration-300"
                  >
                    <div className="aspect-square bg-gray-700 rounded-lg overflow-hidden mb-4 relative">
                      <img
                        src={customNFT ? customNFT.image_url : order.products.image_url}
                        alt={customNFT ? customNFT.name : order.products.name}
                        className="w-full h-full object-cover"
                      />
                      {order.has_custom_nft && (
                        <div className="absolute top-2 right-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white px-2 py-1 rounded-full text-xs font-medium">
                          Custom NFT
                        </div>
                      )}
                    </div>

                    <h3 className="text-xl font-semibold text-white mb-2">
                      {customNFT ? customNFT.name : order.products.name}
                    </h3>
                    
                    {customNFT && (
                      <p className="text-gray-300 text-sm mb-3 line-clamp-2">
                        {customNFT.description}
                      </p>
                    )}
                    
                    <div className="text-gray-300 text-sm mb-4 space-y-1">
                      <p>Size: {order.size}</p>
                      <p>Quantity: {order.quantity} NFT{order.quantity > 1 ? 's' : ''}</p>
                      <p>Status: {order.status}</p>
                      {customNFT && (
                        <>
                          <p>Serial: {customNFT.serial_number}</p>
                          <p>Edition: #{customNFT.edition_number}</p>
                        </>
                      )}
                    </div>

                    <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-3 mb-4">
                      <div className="flex items-center space-x-2">
                        <CheckCircle className="h-4 w-4 text-green-400" />
                        <span className="text-green-300 text-sm font-medium">
                          {order.has_custom_nft ? 'Custom NFT Ready' : 'Ready to Claim'}
                        </span>
                      </div>
                      <p className="text-green-200 text-xs mt-1">
                        {order.has_custom_nft 
                          ? 'Unique NFT created by admin' 
                          : 'Standard NFT available immediately'
                        }
                      </p>
                    </div>

                    <button
                      onClick={() => handleClaimNFT(order)}
                      disabled={claiming === order.id || !isContractConfigured}
                      className="w-full flex items-center justify-center space-x-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 disabled:from-gray-600 disabled:to-gray-600 text-white py-3 px-4 rounded-lg font-semibold transition-all duration-200 transform hover:scale-105 disabled:hover:scale-100"
                    >
                      {claiming === order.id ? (
                        <>
                          <Loader className="h-5 w-5 animate-spin" />
                          <span>Claiming...</span>
                        </>
                      ) : !isContractConfigured ? (
                        <>
                          <Settings className="h-5 w-5" />
                          <span>Contract Setup Required</span>
                        </>
                      ) : (
                        <>
                          <Gift className="h-5 w-5" />
                          <span>Claim {order.has_custom_nft ? 'Custom ' : ''}NFT</span>
                        </>
                      )}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};