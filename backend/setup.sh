#!/bin/bash

# In Tune Backend Setup Script
echo "🎵 Setting up In Tune Backend..."

# Check if Python is installed
if ! command -v python3 &> /dev/null; then
    echo "❌ Python 3 is not installed. Please install Python 3.9+ first."
    exit 1
fi

# Check if virtual environment exists
if [ ! -d "venv" ]; then
    echo "📦 Creating virtual environment..."
    python3 -m venv venv
fi

# Activate virtual environment
echo "🔌 Activating virtual environment..."
source venv/bin/activate

# Install dependencies
echo "📥 Installing dependencies..."
pip install --upgrade pip
pip install -r requirements.txt

# Check if .env file exists
if [ ! -f ".env" ]; then
    echo "⚙️  Creating .env file from template..."
    cat > .env << EOF
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/intune_db

# Security
SECRET_KEY=$(python3 -c 'import secrets; print(secrets.token_urlsafe(32))')
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30

# CORS Origins (comma-separated)
CORS_ORIGINS=http://localhost:3000,http://localhost:5173

# Spotify API (optional, for future integration)
SPOTIFY_CLIENT_ID=
SPOTIFY_CLIENT_SECRET=
EOF
    echo "✅ .env file created. Please update DATABASE_URL with your PostgreSQL credentials."
else
    echo "✅ .env file already exists."
fi

echo ""
echo "✅ Backend setup complete!"
echo ""
echo "Next steps:"
echo "1. Make sure PostgreSQL is running"
echo "2. Update DATABASE_URL in .env with your database credentials"
echo "3. Run: python init_db.py (to create database tables)"
echo "4. Run: python run.py (to start the server)"
echo ""
