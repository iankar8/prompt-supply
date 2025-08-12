# Deployment Guide - Enhanced Prompt Supply

This guide covers deploying the enhanced Prompt Supply application with MCP integration support.

## Prerequisites

- Supabase project set up
- Vercel account (or your preferred hosting platform)
- Node.js 18+ installed locally

## Database Setup

### 1. Run Database Migrations

Execute the following SQL scripts in your Supabase SQL editor (in order):

```sql
-- 1. MCP Connections Table
-- File: database-migrations/001_add_mcp_connections.sql

-- 2. OAuth Connections Table  
-- File: database-migrations/002_add_oauth_connections.sql

-- 3. Cloud Bridge Instances Table
-- File: database-migrations/003_add_cloud_bridge_instances.sql
```

This will create the necessary tables for:
- `mcp_connections` - MCP server connections
- `oauth_connections` - OAuth authentication tokens
- `cloud_bridge_instances` - Cloud-hosted MCP servers

### 2. Verify Table Creation

Check that the following table exists in your Supabase dashboard:
- `mcp_connections` - Stores MCP server connections per user

## Environment Variables

Ensure these environment variables are set:

```env
# Existing variables
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
ANTHROPIC_API_KEY=your_anthropic_api_key
UPSTASH_REDIS_REST_URL=your_upstash_url
UPSTASH_REDIS_REST_TOKEN=your_upstash_token

# New variables (if needed for MCP servers)
# Add any MCP-specific environment variables here
```

## New Features Included

### 1. Enhanced Email Confirmation Flow
- Improved email confirmation page (`/auth/confirm-email`)
- Auto-polling for confirmation status
- Resend email functionality with rate limiting

### 2. MCP Integration System
- MCP server connection management (`/integrations`)
- Support for GitHub, File System, SQLite, and Brave Search MCP servers
- Real-time context pulling via `@context` command


### 4. Enhanced Chat Interface
- New `@context` command for pulling MCP server data
- Improved command suggestions and UI
- Better error handling and rate limiting display

## Deployment Steps

### 1. Install Dependencies
```bash
cd prompt-supply
npm install
```

### 2. Build and Test Locally
```bash
npm run build
npm run start
```

### 3. Deploy to Vercel
```bash
vercel deploy --prod
```

### 4. Configure Custom Email Templates (Optional)

In your Supabase dashboard:
1. Go to Authentication > Email Templates
2. Update the email confirmation template with your branding
3. Include clear call-to-action styling

## Testing the New Features

### 1. Email Confirmation Flow
1. Sign up for a new account
2. Verify you're redirected to `/auth/confirm-email`
3. Check email and confirm account
4. Verify auto-redirect to `/ai-studio`

### 2. MCP Integration
1. Visit `/integrations`
2. Try connecting to a test MCP server
3. Use `@context` command in chat to test context pulling


## MCP Server Setup

To use MCP integrations, users will need to install MCP servers. Common ones include:

```bash
# GitHub MCP Server
npm install -g @modelcontextprotocol/server-github

# File System MCP Server  
npm install -g @modelcontextprotocol/server-filesystem

# SQLite MCP Server
npm install -g @modelcontextprotocol/server-sqlite
```

## Troubleshooting

### Database Issues
- Verify migration ran successfully
- Check RLS policies are enabled
- Ensure user has proper permissions

### MCP Connection Issues
- Check MCP server is installed globally
- Verify environment variables
- Check server logs for connection errors

### Build Issues
- Clear next.js cache: `rm -rf .next`
- Reinstall dependencies: `rm -rf node_modules && npm install`
- Check TypeScript types are correct

## Performance Considerations

- MCP connections are managed client-side for security
- Context pulling is rate-limited per user
- Database queries use proper indexing
- RLS policies ensure data isolation

## Security Notes

- MCP servers run in isolated processes
- No sensitive tokens stored in database
- All user data properly isolated via RLS
- Rate limiting prevents API abuse

## Monitoring

Monitor these key metrics:
- Email confirmation success rate
- MCP connection establishment rate
- Context pulling success rate
- User engagement with personas/templates

## Future Enhancements

Planned improvements:
- More MCP server integrations (Jira, Figma, etc.)
- Advanced context caching
- Community template sharing
- Prompt collaboration features
- Advanced analytics