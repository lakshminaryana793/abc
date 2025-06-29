import React from 'react';
import { Wallet, Loader, AlertCircle, CheckCircle } from 'lucide-react';
import { useWalletStore } from '../../store/wallet';
import toast from 'react-hot-toast';

export const WalletButton: React.FC = () => {
  const { address, isConnected, isConnecting, connect, disconnect } = useWalletStore();

  const handleConnect = async () => {
    try {
      await connect();
      toast.success('Wallet connected successfully!');
    } catch (error: any) {
      console.error('Wallet connection error:', error);
      
      // Provide specific error messages
      if (error.message.includes('MetaMask is not installed')) {
        toast.error('Please install MetaMask to connect your wallet');
      } else if (error.message.includes('User rejected')) {
        toast.error('Connection request was rejected');
      } else if (error.message.includes('network')) {
        toast.error('Failed to add Polygon Mumbai network. Please add it manually.');
      } else {
        toast.error(error.message || 'Failed to connect wallet');
      }
    }
  };

  const handleDisconnect = () => {
    disconnect();
    toast.success('Wallet disconnected');
  };

  const formatAddress = (addr: string) => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  const copyAddress = async () => {
    if (address) {
      try {
        await navigator.clipboard.writeText(address);
        toast.success('Address copied to clipboard');
      } catch (error) {
        toast.error('Failed to copy address');
      }
    }
  };

  if (isConnecting) {
    return (
      <button
        disabled
        className="flex items-center space-x-2 px-4 py-2 bg-gray-700 text-gray-300 rounded-lg cursor-not-allowed"
      >
        <Loader className="h-4 w-4 animate-spin" />
        <span>Connecting...</span>
      </button>
    );
  }

  if (isConnected && address) {
    return (
      <div className="flex items-center space-x-2">
        <div className="flex items-center space-x-2 px-3 py-2 bg-green-500/10 border border-green-500/20 rounded-lg">
          <CheckCircle className="w-4 h-4 text-green-500" />
          <button
            onClick={copyAddress}
            className="text-green-400 text-sm font-medium hover:text-green-300 transition-colors"
            title="Click to copy address"
          >
            {formatAddress(address)}
          </button>
        </div>
        <button
          onClick={handleDisconnect}
          className="px-3 py-2 text-sm text-gray-300 hover:text-white hover:bg-gray-800 rounded-lg transition-colors"
        >
          Disconnect
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={handleConnect}
      className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-lg transition-all duration-200 transform hover:scale-105"
    >
      <Wallet className="h-4 w-4" />
      <span>Connect Wallet</span>
    </button>
  );
};