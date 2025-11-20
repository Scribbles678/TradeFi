#!/bin/bash

# TradeFI Build Test Script
# Run this before deploying to Netlify to catch issues early

echo "🚀 TradeFI Build Test Script"
echo "============================"
echo ""

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: package.json not found"
    echo "   Please run this script from the tradefi directory"
    exit 1
fi

echo "✅ In correct directory"
echo ""

# Check Node version
echo "📦 Checking Node.js version..."
NODE_VERSION=$(node --version)
echo "   Current version: $NODE_VERSION"
echo "   Required: v22.12.0 (or compatible)"
echo ""

# Check if .env file exists (for local testing)
if [ ! -f ".env" ]; then
    echo "⚠️  Warning: .env file not found"
    echo "   This is OK for Netlify deployment (uses env vars)"
    echo "   But local preview might fail without Supabase credentials"
    echo ""
fi

# Clean previous builds
echo "🧹 Cleaning previous builds..."
rm -rf .nuxt .output node_modules/.cache
echo "   ✅ Cleaned"
echo ""

# Install dependencies
echo "📥 Installing dependencies..."
npm install
if [ $? -ne 0 ]; then
    echo "❌ npm install failed"
    exit 1
fi
echo "   ✅ Dependencies installed"
echo ""

# Run build
echo "🔨 Building production bundle..."
npm run build
if [ $? -ne 0 ]; then
    echo ""
    echo "❌ BUILD FAILED"
    echo "   Check the error messages above"
    echo "   Common issues:"
    echo "   - TypeScript errors"
    echo "   - Missing dependencies"
    echo "   - Syntax errors"
    exit 1
fi
echo "   ✅ Build successful"
echo ""

# Check if output directory was created
if [ ! -d ".output" ]; then
    echo "❌ Error: .output directory not created"
    exit 1
fi

echo "📊 Build output size:"
du -sh .output
echo ""

echo "✅ All checks passed!"
echo ""
echo "🎯 Next steps:"
echo "   1. Test preview: npm run preview"
echo "   2. Visit: http://localhost:3000"
echo "   3. If it works, commit and push to deploy"
echo ""
echo "   git add ."
echo "   git commit -m \"Fix Netlify deployment\""
echo "   git push origin main"
echo ""

