# 🚀 Deploy Your NFT Contract - Step by Step

## Prerequisites Checklist
- [ ] MetaMask installed and set up
- [ ] Polygon Amoy testnet added to MetaMask
- [ ] Test MATIC tokens in your wallet
- [ ] PolygonScan API key

## Step 1: Add Polygon Amoy to MetaMask

If you haven't added Polygon Amoy testnet yet:

1. Open MetaMask
2. Click network dropdown → "Add Network"
3. Add these details:
   - **Network Name**: Polygon Amoy Testnet
   - **RPC URL**: https://rpc-amoy.polygon.technology
   - **Chain ID**: 80002
   - **Currency Symbol**: MATIC
   - **Block Explorer**: https://amoy.polygonscan.com

## Step 2: Get Test MATIC

1. Visit: https://faucet.polygon.technology/
2. Connect your MetaMask wallet
3. Select "Polygon Amoy" network
4. Request test MATIC (you need ~0.1 MATIC for deployment)

## Step 3: Get PolygonScan API Key

1. Go to: https://polygonscan.com/apis
2. Sign up for a free account
3. Create a new API key
4. Copy the API key

## Step 4: Get Your Private Key

⚠️ **SECURITY WARNING**: Never share your private key!

1. Open MetaMask
2. Click your account icon → Account details
3. Click "Export Private Key"
4. Enter your MetaMask password
5. Copy the private key (starts with 0x)

## Step 5: Configure Environment

1. Open `contracts/.env` file
2. Replace `your_private_key_here` with your actual private key
3. Replace `your_polygonscan_api_key_here` with your API key

## Step 6: Deploy Contract

Open terminal and run:

```bash
cd contracts
npm install
npm run deploy:amoy
```

You should see output like:
```
Deploying ClothingNFT contract to Polygon Amoy...
ClothingNFT deployed to: 0x1234567890abcdef...
Contract verified successfully
```

## Step 7: Update Main App

1. Copy the contract address from the deployment output
2. Open your main project's `.env` file
3. Update this line:
   ```
   VITE_NFT_CONTRACT_ADDRESS=0x_your_actual_contract_address_here
   ```

## Step 8: Restart Development Server

```bash
npm run dev
```

## ✅ Success Indicators

After successful deployment:
- "Contract Setup Required" warnings disappear
- Admin panel shows NFT upload functionality
- Users can claim NFTs after purchase
- Contract appears on https://amoy.polygonscan.com

## 🔧 Troubleshooting

### "Insufficient funds for gas"
- Get more test MATIC from the faucet
- Wait a few minutes and try again

### "Network error"
- Check MetaMask is connected to Polygon Amoy
- Verify RPC URL is correct

### "Invalid private key"
- Ensure private key starts with 0x
- Check for extra spaces or characters

### "API key error"
- Verify PolygonScan API key is correct
- Try creating a new API key

## 📞 Need Help?

If you encounter issues:
1. Check the terminal output for specific error messages
2. Verify all prerequisites are met
3. Try the deployment again after fixing any issues

The deployment typically takes 2-3 minutes and costs less than $0.10 in test MATIC.