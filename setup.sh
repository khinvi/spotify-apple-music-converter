#!/bin/bash

# Spotify to Apple Music Converter - Setup Script
# This script helps you set up the project quickly

echo "🎵 Spotify to Apple Music Converter Setup"
echo "========================================"
echo ""

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 14+ first."
    echo "   Visit: https://nodejs.org/"
    exit 1
fi

echo "✅ Node.js $(node --version) detected"

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed. Please install npm."
    exit 1
fi

echo "✅ npm $(npm --version) detected"
echo ""

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Create .env.local if it doesn't exist
if [ ! -f .env.local ]; then
    echo ""
    echo "🔧 Creating .env.local file..."
    cp .env.example .env.local
    echo "✅ Created .env.local from .env.example"
    echo ""
    echo "⚠️  IMPORTANT: You need to add your API credentials to .env.local"
    echo "   1. Get your Spotify Client ID from https://developer.spotify.com/dashboard"
    echo "   2. Generate your Apple Music token (see docs/API_SETUP.md)"
    echo "   3. Edit .env.local with your credentials"
else
    echo "✅ .env.local already exists"
fi

# Ask for GitHub username
echo ""
read -p "Enter your GitHub username (for deployment): " github_username

if [ ! -z "$github_username" ]; then
    # Update package.json homepage
    if [[ "$OSTYPE" == "darwin"* ]]; then
        # macOS
        sed -i '' "s/YOUR_USERNAME/$github_username/g" package.json
        sed -i '' "s/YOUR_USERNAME/$github_username/g" README.md
        sed -i '' "s/YOUR_USERNAME/$github_username/g" public/index.html
    else
        # Linux
        sed -i "s/YOUR_USERNAME/$github_username/g" package.json
        sed -i "s/YOUR_USERNAME/$github_username/g" README.md
        sed -i "s/YOUR_USERNAME/$github_username/g" public/index.html
    fi
    echo "✅ Updated configuration with GitHub username: $github_username"
fi

echo ""
echo "🎉 Setup complete!"
echo ""
echo "Next steps:"
echo "1. Add your API credentials to .env.local"
echo "2. Run 'npm start' to start development server"
echo "3. Visit http://localhost:3000"
echo ""
echo "For deployment:"
echo "1. Update Spotify redirect URI for production"
echo "2. Run 'npm run deploy' to deploy to GitHub Pages"
echo ""
echo "📚 See docs/API_SETUP.md for detailed API setup instructions"
echo "📚 See docs/DEPLOYMENT.md for deployment instructions"
echo ""
echo "Happy converting! 🎵"