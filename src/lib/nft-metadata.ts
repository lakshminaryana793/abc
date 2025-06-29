import { Product, CartItem } from '../types';

export interface NFTMetadata {
  name: string;
  description: string;
  image: string;
  external_url?: string;
  attributes: Array<{
    trait_type: string;
    value: string | number;
  }>;
  serial_number: string;
  edition_number: number;
  max_edition: number;
  product_id: string;
  minted_at: string;
}

export class NFTMetadataService {
  static generateMetadata(
    product: Product,
    cartItem: CartItem,
    editionNumber: number,
    serialNumber: string
  ): NFTMetadata {
    const rarity = this.calculateRarity(editionNumber, product.max_edition || 100);
    
    return {
      name: `${product.name} - Edition #${editionNumber}`,
      description: `${product.description}\n\nThis is a limited edition NFT representing authentic ownership of ${product.name} in size ${cartItem.size}. This is edition ${editionNumber} of ${product.max_edition || 100} total pieces.\n\nEach NFT serves as a certificate of authenticity and proof of purchase for this exclusive Web3Store item.`,
      image: product.image_url,
      external_url: `${window.location.origin}/products/${product.id}`,
      attributes: [
        {
          trait_type: 'Product Name',
          value: product.name,
        },
        {
          trait_type: 'Size',
          value: cartItem.size,
        },
        {
          trait_type: 'Category',
          value: product.category.charAt(0).toUpperCase() + product.category.slice(1),
        },
        {
          trait_type: 'Edition Number',
          value: editionNumber,
        },
        {
          trait_type: 'Max Edition',
          value: product.max_edition || 100,
        },
        {
          trait_type: 'Serial Number',
          value: serialNumber,
        },
        {
          trait_type: 'Rarity',
          value: rarity,
        },
        {
          trait_type: 'Brand',
          value: 'Web3Store',
        },
        {
          trait_type: 'Collection',
          value: 'Web3 Fashion Collection',
        },
        {
          trait_type: 'Authenticity',
          value: 'Verified',
        }
      ],
      serial_number: serialNumber,
      edition_number: editionNumber,
      max_edition: product.max_edition || 100,
      product_id: product.id,
      minted_at: new Date().toISOString()
    };
  }

  static calculateRarity(editionNumber: number, maxEdition: number): string {
    const percentage = (editionNumber / maxEdition) * 100;
    
    if (percentage <= 5) return 'Legendary';
    if (percentage <= 15) return 'Ultra Rare';
    if (percentage <= 30) return 'Rare';
    if (percentage <= 60) return 'Uncommon';
    return 'Common';
  }

  static generateSerialNumber(
    product: Product,
    size: string,
    editionNumber: number
  ): string {
    const prefix = product.serial_prefix || product.name.substring(0, 3).toUpperCase();
    const sizeCode = size.substring(0, 1).toUpperCase();
    const edition = editionNumber.toString().padStart(4, '0');
    const timestamp = Date.now().toString().slice(-4);
    
    return `${prefix}-${sizeCode}${edition}-${timestamp}`;
  }

  // Enhanced IPFS upload simulation with better error handling
  static async uploadToIPFS(metadata: NFTMetadata): Promise<string> {
    try {
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 1500 + Math.random() * 1000));
      
      // Validate metadata
      if (!metadata.name || !metadata.description || !metadata.image) {
        throw new Error('Invalid metadata: missing required fields');
      }

      // In production, you would use a service like NFT.Storage, Pinata, or IPFS
      // Example with NFT.Storage:
      /*
      const client = new NFTStorage({ token: process.env.NFT_STORAGE_TOKEN });
      const metadata_blob = new Blob([JSON.stringify(metadata)], { type: 'application/json' });
      const cid = await client.storeBlob(metadata_blob);
      return `https://ipfs.io/ipfs/${cid}`;
      */

      // For demo purposes, generate a realistic IPFS hash
      const mockHash = this.generateMockIPFSHash(metadata);
      const ipfsUrl = `https://ipfs.io/ipfs/${mockHash}`;
      
      console.log('Metadata uploaded to IPFS:', ipfsUrl);
      return ipfsUrl;
      
    } catch (error) {
      console.error('IPFS upload failed:', error);
      throw new Error('Failed to upload metadata to IPFS. Please try again.');
    }
  }

  private static generateMockIPFSHash(metadata: NFTMetadata): string {
    // Generate a realistic-looking IPFS hash based on metadata
    const data = JSON.stringify(metadata);
    let hash = 'Qm';
    
    // Simple hash generation for demo
    for (let i = 0; i < data.length; i++) {
      hash += data.charCodeAt(i).toString(36);
    }
    
    // Ensure consistent length and format
    hash = hash.substring(0, 46);
    while (hash.length < 46) {
      hash += Math.random().toString(36).substring(2, 3);
    }
    
    return hash;
  }

  // Validate NFT metadata before minting
  static validateMetadata(metadata: NFTMetadata): boolean {
    const required = ['name', 'description', 'image', 'serial_number', 'edition_number'];
    
    for (const field of required) {
      if (!metadata[field as keyof NFTMetadata]) {
        console.error(`Missing required field: ${field}`);
        return false;
      }
    }

    if (metadata.attributes.length === 0) {
      console.error('Metadata must include attributes');
      return false;
    }

    return true;
  }

  // Get metadata from IPFS URL (for display purposes)
  static async getMetadataFromIPFS(ipfsUrl: string): Promise<NFTMetadata | null> {
    try {
      const response = await fetch(ipfsUrl);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Failed to fetch metadata from IPFS:', error);
      return null;
    }
  }
}