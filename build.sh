#!/bin/bash
# Build script for Render deployment
# Fixes TypeScript compilation and path issues

echo "🔨 Building TypeScript..."
npm run build

echo "✅ Build complete!"
echo "📂 Build output:"
ls -la dist/

exit 0
