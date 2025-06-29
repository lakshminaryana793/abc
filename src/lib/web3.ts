import { ethers } from 'ethers';

declare global {
  interface Window {
    ethereum?: any;
  }
}

export class Web3Service {
  private provider: ethers.BrowserProvider | null = null;
  private signer: ethers.JsonRpcSigner | null = null;

  private async ensureProviderInitialized(): Promise<void> {
    if (!this.provider && window.ethereum) {
      try {
        this.provider = new ethers.BrowserProvider(window.ethereum);
      } catch (error) {
        console.error('Failed to initialize provider:', error);
        throw new Error('Failed to initialize Web3 provider');
      }
    }
  }

  async connectWallet(): Promise<string> {
    if (!window.ethereum) {
      throw new Error('MetaMask is not installed. Please install MetaMask to continue.');
    }

    try {
      // Request account access
      const accounts = await window.ethereum.request({
        method: 'eth_requestAccounts',
      });

      this.provider = new ethers.BrowserProvider(window.ethereum);
      this.signer = await this.provider.getSigner();

      // Switch to Polygon Amoy (new testnet)
      await this.switchToPolygonAmoy();

      return accounts[0];
    } catch (error: any) {
      if (error.code === 4001) {
        throw new Error('User rejected the wallet connection request');
      }
      throw new Error(`Failed to connect wallet: ${error.message}`);
    }
  }

  async switchToPolygonAmoy() {
    if (!window.ethereum) return;

    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: '0x13882' }], // Polygon Amoy testnet
      });
    } catch (switchError: any) {
      // This error code indicates that the chain has not been added to MetaMask
      if (switchError.code === 4902) {
        try {
          // Use reliable RPC URLs for Polygon Amoy
          const rpcUrls = [
            'https://rpc-amoy.polygon.technology',
            'https://polygon-amoy-bor-rpc.publicnode.com',
            'https://polygon-amoy.drpc.org'
          ];

          await window.ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [
              {
                chainId: '0x13882',
                chainName: 'Polygon Amoy Testnet',
                nativeCurrency: {
                  name: 'MATIC',
                  symbol: 'MATIC',
                  decimals: 18,
                },
                rpcUrls,
                blockExplorerUrls: ['https://amoy.polygonscan.com/'],
              },
            ],
          });
        } catch (addError: any) {
          throw new Error(`Failed to add Polygon Amoy network: ${addError.message}`);
        }
      } else {
        throw new Error(`Failed to switch to Polygon Amoy: ${switchError.message}`);
      }
    }
  }

  async getCurrentAccount(): Promise<string | null> {
    if (!window.ethereum) return null;

    await this.ensureProviderInitialized();

    try {
      const accounts = await window.ethereum.request({
        method: 'eth_accounts',
      });
      return accounts[0] || null;
    } catch (error) {
      console.error('Error getting current account:', error);
      return null;
    }
  }

  async mintNFT(
    contractAddress: string,
    toAddress: string,
    productId: string,
    serialNumber: string,
    maxEdition: number,
    tokenUri: string
  ): Promise<string> {
    if (!this.signer) {
      throw new Error('Wallet not connected. Please connect your wallet first.');
    }

    // Check if contract address is configured
    if (!contractAddress || contractAddress === 'your_deployed_contract_address_here') {
      throw new Error('NFT contract not deployed yet. Please deploy the contract first or contact support.');
    }

    // Enhanced ERC-721 contract ABI for ClothingNFT
    const contractABI = [
      'function safeMint(address to, string memory productId, string memory serialNumber, uint256 maxEdition, string memory tokenURI) public returns (uint256)',
      'function tokenCounter() public view returns (uint256)',
      'function getProductInfo(uint256 tokenId) public view returns (tuple(string productId, string serialNumber, uint256 editionNumber, uint256 maxEdition, address originalOwner, uint256 mintTimestamp))',
      'function getCurrentEdition(string memory productId) public view returns (uint256)',
      'function isProductSoldOut(string memory productId, uint256 maxEdition) public view returns (bool)',
      'function owner() public view returns (address)'
    ];

    const contract = new ethers.Contract(contractAddress, contractABI, this.signer);

    try {
      // Verify contract exists and is accessible
      try {
        await contract.owner();
      } catch (contractError) {
        throw new Error('Invalid contract address or contract not deployed. Please check the contract configuration.');
      }

      // Check if product is sold out
      const isSoldOut = await contract.isProductSoldOut(productId, maxEdition);
      if (isSoldOut) {
        throw new Error('This product edition is sold out. No more NFTs can be minted.');
      }

      // Estimate gas before sending transaction
      const gasEstimate = await contract.safeMint.estimateGas(
        toAddress,
        productId,
        serialNumber,
        maxEdition,
        tokenUri
      );

      // Add 20% buffer to gas estimate
      const gasLimit = gasEstimate * 120n / 100n;

      // Send transaction with proper gas settings
      const tx = await contract.safeMint(
        toAddress,
        productId,
        serialNumber,
        maxEdition,
        tokenUri,
        {
          gasLimit,
          // Let the network determine gas price
        }
      );

      console.log('NFT minting transaction sent:', tx.hash);

      // Wait for transaction confirmation
      const receipt = await tx.wait();
      console.log('NFT minting confirmed:', receipt);

      if (!receipt || receipt.status !== 1) {
        throw new Error('Transaction failed. Please try again.');
      }

      // Get the token ID from the transaction receipt
      const tokenId = await contract.tokenCounter();
      
      return tokenId.toString();
    } catch (error: any) {
      console.error('Error minting NFT:', error);
      
      // Provide user-friendly error messages
      if (error.code === 'INSUFFICIENT_FUNDS') {
        throw new Error('Insufficient MATIC balance to pay for gas fees. Please add MATIC to your wallet.');
      } else if (error.code === 'USER_REJECTED') {
        throw new Error('Transaction was rejected by user.');
      } else if (error.message.includes('sold out')) {
        throw new Error('This product edition is sold out.');
      } else if (error.message.includes('gas')) {
        throw new Error('Transaction failed due to gas issues. Please try again with higher gas.');
      } else if (error.message.includes('Invalid contract') || error.message.includes('not deployed')) {
        throw new Error('NFT contract not deployed yet. Please contact support to deploy the contract.');
      } else {
        throw new Error(`Failed to mint NFT: ${error.message || 'Unknown error occurred'}`);
      }
    }
  }

  async getBalance(address: string): Promise<string> {
    await this.ensureProviderInitialized();
    
    if (!this.provider) {
      throw new Error('Provider not initialized');
    }

    const balance = await this.provider.getBalance(address);
    return ethers.formatEther(balance);
  }

  async getNetworkInfo() {
    await this.ensureProviderInitialized();
    
    if (!this.provider) {
      throw new Error('Provider not initialized');
    }

    const network = await this.provider.getNetwork();
    return {
      chainId: Number(network.chainId),
      name: network.name,
      isTestnet: network.chainId === 80002n // Polygon Amoy
    };
  }

  async waitForTransaction(txHash: string) {
    await this.ensureProviderInitialized();
    
    if (!this.provider) {
      throw new Error('Provider not initialized');
    }

    return await this.provider.waitForTransaction(txHash);
  }
}

export const web3Service = new Web3Service();