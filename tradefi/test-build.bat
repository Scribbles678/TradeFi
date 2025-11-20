@echo off
REM TradeFI Build Test Script for Windows
REM Run this before deploying to Netlify to catch issues early

echo.
echo 🚀 TradeFI Build Test Script
echo ============================
echo.

REM Check if we're in the right directory
if not exist "package.json" (
    echo ❌ Error: package.json not found
    echo    Please run this script from the tradefi directory
    exit /b 1
)

echo ✅ In correct directory
echo.

REM Check Node version
echo 📦 Checking Node.js version...
node --version
echo    Required: v22.12.0 or compatible
echo.

REM Check if .env file exists (for local testing)
if not exist ".env" (
    echo ⚠️  Warning: .env file not found
    echo    This is OK for Netlify deployment uses env vars
    echo    But local preview might fail without Supabase credentials
    echo.
)

REM Clean previous builds
echo 🧹 Cleaning previous builds...
if exist ".nuxt" rmdir /s /q ".nuxt"
if exist ".output" rmdir /s /q ".output"
if exist "node_modules\.cache" rmdir /s /q "node_modules\.cache"
echo    ✅ Cleaned
echo.

REM Install dependencies
echo 📥 Installing dependencies...
call npm install
if errorlevel 1 (
    echo ❌ npm install failed
    exit /b 1
)
echo    ✅ Dependencies installed
echo.

REM Run build
echo 🔨 Building production bundle...
call npm run build
if errorlevel 1 (
    echo.
    echo ❌ BUILD FAILED
    echo    Check the error messages above
    echo    Common issues:
    echo    - TypeScript errors
    echo    - Missing dependencies
    echo    - Syntax errors
    exit /b 1
)
echo    ✅ Build successful
echo.

REM Check if output directory was created
if not exist ".output" (
    echo ❌ Error: .output directory not created
    exit /b 1
)

echo ✅ All checks passed!
echo.
echo 🎯 Next steps:
echo    1. Test preview: npm run preview
echo    2. Visit: http://localhost:3000
echo    3. If it works, commit and push to deploy
echo.
echo    git add .
echo    git commit -m "Fix Netlify deployment"
echo    git push origin main
echo.
pause

