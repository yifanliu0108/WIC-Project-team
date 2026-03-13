#!/bin/bash

# In Tune Frontend Setup Script
echo "🎵 Setting up In Tune Frontend..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 16+ first."
    exit 1
fi

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed. Please install npm first."
    exit 1
fi

# Install dependencies
echo "📥 Installing dependencies..."
npm install

echo ""
echo "✅ Frontend setup complete!"
echo ""
echo "Next steps:"
echo "1. Run: npm run dev (to start the development server)"
echo "2. The app will be available at http://localhost:3000"
echo ""
