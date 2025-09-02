#!/bin/bash

# Reform UK Frontend Testing Script
# This script sets up and runs comprehensive Playwright tests

echo "🎯 Reform UK Frontend Testing Suite"
echo "===================================="
echo ""

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+ first."
    exit 1
fi

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed. Please install npm first."
    exit 1
fi

# Check Node.js version
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo "❌ Node.js version 18+ is required. Current version: $(node -v)"
    exit 1
fi

echo "✅ Node.js $(node -v) detected"
echo "✅ npm $(npm -v) detected"
echo ""

# Install dependencies if needed
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
    echo ""
fi

# Check if Playwright is installed
if [ ! -d "node_modules/@playwright" ]; then
    echo "📦 Installing Playwright..."
    npm install @playwright/test
    echo ""
fi

# Install Playwright browsers
echo "🌐 Installing Playwright browsers..."
npx playwright install
echo ""

# Create test results directory
mkdir -p test-results/screenshots
mkdir -p test-results/videos
mkdir -p test-results/traces

echo "🚀 Starting comprehensive frontend testing..."
echo ""

# Run the comprehensive test suite
npm run test:frontend:all

echo ""
echo "📊 Testing completed! Check the test-results/ directory for detailed reports."
echo ""

# Show available test commands
echo "🔧 Available test commands:"
echo "  npm run test:playwright        - Run all Playwright tests"
echo "  npm run test:playwright:ui     - Run tests with UI mode"
echo "  npm run test:playwright:headed - Run tests in headed mode"
echo "  npm run test:playwright:debug  - Run tests in debug mode"
echo "  npm run test:playwright:report - Show HTML report"
echo "  npm run test:frontend:all      - Run comprehensive test suite"
echo ""

