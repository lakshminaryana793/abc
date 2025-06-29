import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { WalletState } from '../types';
import { web3Service } from '../lib/web3';

interface WalletStore extends WalletState {
  connect: () => Promise<void>;
  disconnect: () => void;
  checkConnection: () => Promise<void>;
  getBalance: () => Promise<string>;
  networkInfo: {
    chainId: number | null;
    name: string | null;
    isTestnet: boolean;
  };
  updateNetworkInfo: () => Promise<void>;
}

export const useWalletStore = create<WalletStore>()(
  persist(
    (set, get) => ({
      address: null,
      isConnected: false,
      isConnecting: false,
      networkInfo: {
        chainId: null,
        name: null,
        isTestnet: false
      },

      connect: async () => {
        set({ isConnecting: true });
        
        try {
          const address = await web3Service.connectWallet();
          
          // Update network info after connection
          await get().updateNetworkInfo();
          
          set({ 
            address, 
            isConnected: true,
            isConnecting: false 
          });
        } catch (error) {
          console.error('Failed to connect wallet:', error);
          set({ isConnecting: false });
          throw error;
        }
      },

      disconnect: () => {
        set({ 
          address: null, 
          isConnected: false,
          isConnecting: false,
          networkInfo: {
            chainId: null,
            name: null,
            isTestnet: false
          }
        });
      },

      checkConnection: async () => {
        try {
          const address = await web3Service.getCurrentAccount();
          if (address) {
            await get().updateNetworkInfo();
            set({ 
              address, 
              isConnected: true 
            });
          } else {
            set({
              address: null,
              isConnected: false
            });
          }
        } catch (error) {
          console.error('Failed to check wallet connection:', error);
          set({
            address: null,
            isConnected: false
          });
        }
      },

      getBalance: async () => {
        const { address } = get();
        if (!address) throw new Error('Wallet not connected');
        
        return await web3Service.getBalance(address);
      },

      updateNetworkInfo: async () => {
        try {
          const networkInfo = await web3Service.getNetworkInfo();
          set({ networkInfo });
        } catch (error) {
          console.error('Failed to get network info:', error);
          set({
            networkInfo: {
              chainId: null,
              name: null,
              isTestnet: false
            }
          });
        }
      }
    }),
    {
      name: 'wallet-storage',
      partialize: (state) => ({
        address: state.address,
        isConnected: state.isConnected,
        // Don't persist network info as it can change
      }),
    }
  )
);

// Listen for account changes
if (typeof window !== 'undefined' && window.ethereum) {
  window.ethereum.on('accountsChanged', (accounts: string[]) => {
    const store = useWalletStore.getState();
    if (accounts.length === 0) {
      store.disconnect();
    } else if (accounts[0] !== store.address) {
      store.checkConnection();
    }
  });

  window.ethereum.on('chainChanged', () => {
    const store = useWalletStore.getState();
    if (store.isConnected) {
      store.updateNetworkInfo();
    }
  });
}