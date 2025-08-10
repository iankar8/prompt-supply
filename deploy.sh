#!/bin/bash

# Exit on error
set -e

echo "🚀 Preparing for Vercel deployment..."

# Install dependencies if needed
if [ ! -d "node_modules" ]; then
  echo "📦 Installing dependencies..."
  npm install
fi

# Create production build
echo "🔨 Creating production build..."
npm run build

# Deploy to Vercel with environment variables
echo "🚀 Deploying to Vercel..."
vercel --prod \
  -e NEXT_PUBLIC_SUPABASE_URL="$NEXT_PUBLIC_SUPABASE_URL" \
  -e NEXT_PUBLIC_SUPABASE_ANON_KEY="$NEXT_PUBLIC_SUPABASE_ANON_KEY" \
  -e SUPABASE_SERVICE_ROLE_KEY="$SUPABASE_SERVICE_ROLE_KEY" \
  -e ANTHROPIC_API_KEY="$ANTHROPIC_API_KEY"

echo "✅ Deployment complete!"
