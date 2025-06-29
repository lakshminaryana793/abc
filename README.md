# Web3 Clothing E-commerce Platform

A modern, production-ready Web3 e-commerce platform that combines traditional online shopping with NFT technology. Every purchase automatically mints a unique NFT collectible on the Polygon blockchain.

## 🚀 Features

### Frontend
- **Modern React.js + TypeScript** with Tailwind CSS
- **Responsive Design** optimized for all devices
- **MetaMask Integration** for Web3 wallet connections
- **Real-time Cart Management** with persistent storage
- **Product Catalog** with search, filtering, and sorting
- **NFT Gallery** to view owned collectibles

### Web3 Integration
- **ERC-721 NFT Minting** on Polygon Amoy (testnet)
- **Automatic NFT Creation** after successful purchases
- **Unique Metadata Generation** with edition numbers and serial codes
- **IPFS Storage** for NFT metadata (via NFT.Storage)

### Backend
- **Supabase Integration** for data persistence
- **Real-time Database** operations
- **User Management** and order tracking
- **NFT Minting History** and analytics

### Payments
- **Stripe Integration** (test mode supported)
- **Secure Payment Processing** with webhooks
- **Order Confirmation** and email notifications

### Admin Panel
- **Product Management** (CRUD operations)
- **Order Tracking** and analytics
- **NFT Minting History** monitoring
- **Inventory Management** with size/stock tracking

## 🛠️ Technology Stack

- **Frontend**: React 18, TypeScript, Tailwind CSS, Vite
- **State Management**: Zustand
- **Web3**: Ethers.js, MetaMask
- **Backend**: Supabase (PostgreSQL)
- **Payments**: Stripe
- **Blockchain**: Polygon Amoy (testnet)
- **Smart Contracts**: Solidity, Hardhat, OpenZeppelin
- **Styling**: Tailwind CSS with custom gradients and animations

## 📦 Installation

### Prerequisites
- Node.js 18+ and npm
- MetaMask browser extension
- Supabase account
- Stripe account (test mode)

### 1. Clone and Install Dependencies

```bash
git clone <repository-url>
cd web3-clothing-store
npm install

# Install contract dependencies
cd contracts
npm install
cd ..
```

### 2. Environment Setup

Copy and configure environment variables:

```bash
cp .env.example .env
cp contracts/.env.example contracts/.env
```

Fill in your configuration values:

```env
# .env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_key
VITE_NFT_CONTRACT_ADDRESS=deployed_contract_address
```

### 3. Database Setup

The database schema will be automatically created when you connect to Supabase. Click the "Connect to Supabase" button in the top right of the application.

Required tables:
- `products` - Product catalog
- `orders` - Purchase orders
- `nfts` - Minted NFT records
- `users` - User accounts

### 4. Smart Contract Deployment

```bash
cd contracts

# Compile contracts
npm run compile

# Deploy to Polygon Amoy testnet
npm run deploy:amoy

# Return to root directory
cd ..

# Copy the deployed contract address to your .env file
```

### 5. Start Development Server

```bash
# Make sure you're in the root directory
npm run dev
```

Visit `http://localhost:5173` to see the application.

## 🎨 Sample Data

To populate the store with sample products, you can use the admin panel or directly insert into your Supabase database:

```sql
INSERT INTO products (name, description, price, image_url, sizes, stock, category, max_edition, serial_prefix) VALUES
('Galaxy Hoodie', 'Premium hoodie with galaxy-inspired design', 89.99, 'https://images.pexels.com/photos/1040945/pexels-photo-1040945.jpeg', '["S", "M", "L", "XL"]', '{"S": 10, "M": 15, "L": 20, "XL": 8}', 'hoodies', 100, 'GAL'),
('Cyber T-Shirt', 'Futuristic cyberpunk style t-shirt', 39.99, 'https://images.pexels.com/photos/1036622/pexels-photo-1036622.jpeg', '["S", "M", "L", "XL", "XXL"]', '{"S": 25, "M": 30, "L": 35, "XL": 20, "XXL": 10}', 'tshirts', 200, 'CYB');
```

## 🔧 Configuration

### Polygon Amoy Testnet Setup

1. Add Polygon Amoy to MetaMask:
   - Network Name: Polygon Amoy Testnet
   - RPC URL: https://rpc-amoy.polygon.technology
   - Chain ID: 80002
   - Currency Symbol: MATIC
   - Block Explorer: https://amoy.polygonscan.com/

2. Get test MATIC from faucet:
   - Visit: https://faucet.polygon.technology/
   - Enter your wallet address
   - Request test tokens

### Stripe Test Mode

1. Create a Stripe account
2. Get your test API keys from the dashboard
3. Use test card numbers for payments:
   - `4242424242424242` (Visa)
   - `5555555555554444` (Mastercard)

## 🏗️ Architecture

### File Structure
```
src/
├── components/          # Reusable React components
│   ├── Layout/         # Navigation and layout components
│   ├── Products/       # Product-related components
│   └── Web3/          # Web3 and wallet components
├── lib/               # Utility libraries and services
├── pages/             # Page components (routes)
├── store/             # Zustand state management
├── types/             # TypeScript type definitions
└── App.tsx           # Main application component

contracts/
├── contracts/         # Solidity smart contracts
├── scripts/          # Deployment scripts
└── hardhat.config.js # Hardhat configuration
```

### Key Components

1. **WalletButton**: MetaMask connection and management
2. **ProductCard**: Product display with NFT integration
3. **ProductGrid**: Responsive product listing
4. **Cart**: Shopping cart with NFT preview
5. **Web3Service**: Blockchain interaction layer

### Database Schema

- **Products**: Catalog with pricing, inventory, and NFT settings
- **Orders**: Purchase records with payment and NFT status
- **NFTs**: Minted token records with metadata
- **Users**: Customer profiles linked to wallet addresses

## 🚀 Deployment

### Frontend (Vercel)

```bash
npm run build
# Deploy the 'dist' folder to Vercel
```

### Smart Contracts (Polygon)

```bash
cd contracts
npm run deploy:polygon  # For mainnet
npm run verify:polygon  # Verify on Polygonscan
cd ..  # Return to root directory
```

### Database (Supabase)

Database is automatically managed through Supabase. Enable Row Level Security and configure policies for production.

## 🎯 Features Roadmap

- [ ] Advanced NFT traits and rarity system
- [ ] Secondary marketplace for NFT trading
- [ ] Loyalty rewards and staking
- [ ] Multi-chain support (Ethereum, BSC)
- [ ] Mobile app (React Native)
- [ ] Advanced analytics dashboard
- [ ] Social features and user profiles

## 🐛 Troubleshooting

### Common Issues

1. **MetaMask Connection Issues**
   - Ensure MetaMask is installed and unlocked
   - Check network configuration (Polygon Amoy)
   - Clear browser cache and cookies

2. **Transaction Failures**
   - Verify sufficient MATIC balance for gas
   - Check contract address configuration
   - Increase gas limit if needed

3. **NFT Minting Issues**
   - Confirm contract deployment and address
   - Check IPFS metadata upload
   - Verify wallet permissions

4. **"Missing script: dev" Error**
   - Make sure you're in the root directory when running `npm run dev`
   - If you're in the `contracts` folder, run `cd ..` first

### Support

For technical support or questions:
- Create an issue in the repository
- Check the documentation
- Join our community Discord

## 📄 License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

## 🤝 Contributing

Contributions are welcome! Please read our [Contributing Guidelines](CONTRIBUTING.md) before submitting pull requests.

---

Built with ❤️ for the Web3 community