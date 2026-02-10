#!/bin/bash

echo "🚀 SPX Mining Platform Setup"
echo "============================"

# Check Node.js
if ! command -v node &> /dev/null; then
    echo "❌ Node.js required. Install from nodejs.org"
    exit 1
fi

# Check MongoDB
if ! pgrep -x "mongod" > /dev/null; then
    echo "⚠️  Start MongoDB: brew services start mongodb/brew/mongodb-community"
fi

echo "📦 Installing dependencies..."

# Install root dependencies
npm install

# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
cd ..

echo "🔧 Setting up environment..."

# Backend .env
if [ ! -f "backend/.env" ]; then
    cat > backend/.env << EOL
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb://localhost:27017/spx-miner
JWT_SECRET=$(openssl rand -base64 32)
JWT_EXPIRE=7d
ADMIN_EMAIL=admin@spxminer.com
ADMIN_PASSWORD=admin123
USDT_WALLET_ADDRESS=TYourUSDTWalletAddressHere
KYC_USDT_AMOUNT=10
EOL
fi

# Frontend .env
if [ ! -f "frontend/.env" ]; then
    cat > frontend/.env << EOL
VITE_API_URL=http://localhost:5000/api
EOL
fi

echo "🗄️  Initializing database..."
npm run init-db

echo "✅ Setup complete!"
echo ""
echo "🚀 Start development:"
echo "   npm run dev"
echo ""
echo "🔐 Admin login:"
echo "   Email: admin@spxminer.com"
echo "   Password: admin123"
echo ""
echo "🌐 URLs:"
echo "   Frontend: http://localhost:5173"
echo "   Backend: http://localhost:5000"