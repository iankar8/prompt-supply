# Prompt.Supply Setup Instructions

## 🚀 Quick Setup Guide

### 1. Database Setup

1. **Create a new Supabase project** at [supabase.com](https://supabase.com)
2. **Run the database schema**:
   - Open your Supabase project dashboard
   - Go to SQL Editor
   - Copy and paste the contents of `supabase-schema.sql`
   - Click "Run" to execute the schema

### 2. Environment Configuration

1. **Get your Supabase credentials**:
   - Go to Settings → API in your Supabase dashboard
   - Copy the Project URL and anon public key

2. **Get your Anthropic API key**:
   - Go to [Anthropic Console](https://console.anthropic.com/)
   - Create an API key for Claude access

3. **Configure environment variables**:
   - Open `.env.local` in your project root
   - Replace the placeholder values:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
   SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
   ANTHROPIC_API_KEY=your-anthropic-api-key-here
   ```

### 3. Install Dependencies & Run

```bash
npm install
npm run dev
```

### 4. Authentication Setup

The app includes:
- ✅ Sign up/Sign in pages
- ✅ Protected dashboard routes  
- ✅ Automatic user profile creation
- ✅ Row Level Security (RLS) enabled

### 5. Features Available

After setup, you'll have access to:
- 📁 **Folder Management** - Organize prompts in folders
- 🎭 **Personas** - Create AI personas with specific roles
- 📝 **Prompt Templates** - Create reusable prompt templates
- ⭐ **Favorites** - Mark frequently used prompts
- 🔍 **Search & Filter** - Find prompts quickly
- 📊 **Usage Analytics** - Track prompt usage

#### 🤖 **AI-Powered Features**
- ✨ **AI Prompt Generator** - Generate optimized prompts with Claude
- 🧠 **Smart Analysis** - Get detailed feedback and improvements
- 🧪 **Quality Testing** - Test prompts with real AI responses
- 💬 **AI Chat Assistant** - Chat with Claude about prompt engineering
- 📈 **Performance Scoring** - Quality metrics for clarity, relevance, creativity

### 6. Database Schema Features

- **Foreign Key Relationships**: Proper data integrity
- **Row Level Security**: Users can only access their own data
- **Automatic Timestamps**: Created/updated tracking
- **Usage Analytics**: Track how prompts are used
- **Full Text Search**: Search across titles, descriptions, and content

### 7. Troubleshooting

If you encounter issues:

1. **Database Connection Errors**: Check your Supabase URL and keys
2. **Auth Redirects**: Ensure your Supabase auth settings allow localhost:3000
3. **Type Errors**: Run `npm run type-check` to identify issues
4. **Build Errors**: Run `npm run build` to see detailed error messages

### 8. Next Steps

- Add your first prompt in the dashboard
- Create folders to organize your prompts
- Set up personas for different AI roles
- Explore the template system for reusable prompts

---

**Need help?** Check the troubleshooting section above or review the component documentation in `/src/components/`.