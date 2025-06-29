# NFT Contract Deployment Guide

## Prerequisites

1. **MetaMask Wallet** with Polygon Amoy testnet configured
2. **Test MATIC** tokens for gas fees
3. **PolygonScan API Key** (free from https://polygonscan.com/apis)

## Step 1: Get Test MATIC

1. Visit the Polygon Faucet: https://faucet.polygon.technology/
2. Select "Polygon Amoy" network
3. Enter your wallet address
4. Request test MATIC tokens

## Step 2: Configure Environment

1. Navigate to the `contracts` folder:
   ```bash
   cd contracts
   ```

2. Copy the environment template:
   ```bash
   cp .env.example .env
   ```

3. Edit the `.env` file and add:
   - Your wallet's private key (the one with test MATIC)
   - Your PolygonScan API key

## Step 3: Install Dependencies

```bash
npm install
```

## Step 4: Deploy the Contract

```bash
npm run deploy:amoy
```

This will:
- Deploy the ClothingNFT contract to Polygon Amoy
- Verify the contract on PolygonScan
- Display the contract address

## Step 5: Update Main Application

1. Copy the deployed contract address
2. Open your main project's `.env` file
3. Update the contract address:
   ```
   VITE_NFT_CONTRACT_ADDRESS=0x_your_deployed_contract_address_here
   ```

## Step 6: Verify Deployment

1. Restart your development server
2. The "Contract Setup Required" message should disappear
3. Users can now claim NFTs after purchase

## Troubleshooting

### "Insufficient funds" error
- Make sure your wallet has enough test MATIC
- Try requesting more from the faucet

### "Network error" 
- Ensure you're connected to Polygon Amoy testnet
- Check your internet connection

### "Verification failed"
- The contract is still deployed and functional
- Verification is optional for testnet

## Contract Details

- **Network**: Polygon Amoy Testnet
- **Contract Name**: ClothingNFT
- **Symbol**: W3SC
- **Standard**: ERC-721

## Next Steps

Once deployed, your Web3 store will be fully functional with:
- Automatic NFT minting after purchases
- Unique metadata for each NFT
- Blockchain verification of ownership
- Integration with NFT marketplaces