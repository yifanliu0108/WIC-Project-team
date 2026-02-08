#!/bin/bash

# In Tune Full Project Setup Script
echo "🎵 Setting up In Tune Project..."
echo ""

# Setup Backend
echo "📦 Setting up Backend..."
cd backend
chmod +x setup.sh
./setup.sh
cd ..

echo ""
echo "📦 Setting up Frontend..."
cd frontend
chmod +x setup.sh
./setup.sh
cd ..

echo ""
echo "✅ Project setup complete!"
echo ""
echo "To start development:"
echo "1. Backend: cd backend && source venv/bin/activate && python run.py"
echo "2. Frontend: cd frontend && npm run dev"
echo ""
