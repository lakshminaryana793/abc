# NFT Contract Deployment Guide

## Quick Setup (5 minutes)

### Step 1: Get Test MATIC
1. Visit: https://faucet.polygon.technology/
2. Select "Polygon Amoy" network
3. Enter your wallet address
4. Request test MATIC tokens

### Step 2: Configure Contract Deployment
1. Navigate to contracts folder:
   ```bash
   cd contracts
   ```

2. Copy environment file:
   ```bash
   cp .env.example .env
   ```

3. Edit `contracts/.env` and add:
   - Your wallet's private key (from MetaMask)
   - PolygonScan API key (free from https://polygonscan.com/apis)

### Step 3: Deploy Contract
```bash
npm install
npm run deploy:amoy
```

### Step 4: Update Main App
1. Copy the deployed contract address from the terminal
2. Open your main `.env` file
3. Update:
   ```
   VITE_NFT_CONTRACT_ADDRESS=0x_your_contract_address_here
   ```

### Step 5: Restart Development Server
The "Contract Setup Required" message will disappear and NFT claiming will work.

## What This Enables

✅ **Automatic NFT Minting** - After purchases are confirmed
✅ **Unique Metadata** - Each NFT has custom attributes  
✅ **Blockchain Verification** - Proof of ownership on Polygon
✅ **Marketplace Integration** - NFTs appear in OpenSea, etc.

## Troubleshooting

**"Insufficient funds"** → Get more test MATIC from faucet
**"Network error"** → Switch MetaMask to Polygon Amoy testnet
**"Contract not found"** → Check contract address in .env file

## Contract Details
- **Network**: Polygon Amoy Testnet (Chain ID: 80002)
- **Standard**: ERC-721 NFT
- **Gas Cost**: ~$0.01-0.05 per NFT mint
- **Features**: Edition tracking, serial numbers, metadata storage