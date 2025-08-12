# Vercel Deployment Instructions

Since we're encountering issues with the CLI deployment, follow these steps to deploy your Next.js application through the Vercel web interface:

1. Visit [Vercel Dashboard](https://vercel.com/dashboard)

2. Click "Add New..." > "Project"

3. Import your GitHub repository or upload your project files directly

4. Configure the project with these settings:
   - Framework Preset: Next.js
   - Build Command: npm run build
   - Output Directory: .next
   - Install Command: npm install

5. Add these environment variables:
   - NEXT_PUBLIC_SUPABASE_URL: (your Supabase URL)
   - NEXT_PUBLIC_SUPABASE_ANON_KEY: (your Supabase anon key)
   - SUPABASE_SERVICE_ROLE_KEY: (your Supabase service role key)
   - ANTHROPIC_API_KEY: (your Anthropic API key)

6. Click "Deploy"

This approach will give you better visibility into any build errors and allow you to configure environment variables through the web interface.
