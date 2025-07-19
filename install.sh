#!/bin/bash

echo "🔍 Setting up 1inch Aggregator Inspector..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js first."
    echo "Visit: https://nodejs.org/"
    exit 1
fi

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed. Please install npm first."
    exit 1
fi

echo "✅ Node.js and npm found"

# Install Node.js dependencies
echo "📦 Installing Node.js dependencies..."
npm install

if [ $? -ne 0 ]; then
    echo "❌ Failed to install Node.js dependencies"
    exit 1
fi

echo "✅ Node.js dependencies installed"

# Check if Foundry is installed
if ! command -v forge &> /dev/null; then
    echo "🔧 Installing Foundry..."
    curl -L https://foundry.paradigm.xyz | bash
    source ~/.bashrc
    foundryup
else
    echo "✅ Foundry already installed"
fi

# Install Foundry dependencies
echo "📦 Installing Foundry dependencies..."
cd foundry
forge install foundry-rs/forge-std --no-commit

if [ $? -ne 0 ]; then
    echo "❌ Failed to install Foundry dependencies"
    exit 1
fi

cd ..

echo "✅ Foundry dependencies installed"

# Create .env file if it doesn't exist
if [ ! -f .env ]; then
    echo "📝 Creating .env file from template..."
    cp env.example .env
    echo "✅ .env file created"
    echo "⚠️  Please edit .env file with your API keys"
else
    echo "✅ .env file already exists"
fi

# Check if .env has been configured
if grep -q "your_etherscan_api_key_here" .env; then
    echo "⚠️  Warning: Please update your API keys in .env file"
    echo "   Required: ETHERSCAN_API_KEY, MAINNET_RPC_URL"
fi

echo ""
echo "🎉 Setup complete!"
echo ""
echo "Next steps:"
echo "1. Edit .env file with your API keys"
echo "2. Run 'npm run dev' to start the development server"
echo "3. Visit http://localhost:3000"
echo ""
echo "For more information, see README.md" 