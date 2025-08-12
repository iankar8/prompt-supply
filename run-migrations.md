# Database Migration Instructions

Your integrations are failing because the required database tables don't exist yet. You need to run these SQL migrations in your Supabase database.

## How to Run Migrations

### Option 1: Supabase Dashboard (Recommended)
1. Go to https://supabase.com/dashboard
2. Select your project
3. Go to "SQL Editor" in the left sidebar
4. Create a new query and copy-paste each SQL file below, one at a time
5. Click "Run" for each migration

### Option 2: Supabase CLI
```bash
# Install Supabase CLI if you haven't
npm install -g supabase

# Login to Supabase
supabase login

# Link your project (replace with your project reference)
supabase link --project-ref consawsztxxkoatbjrgx

# Run migrations
supabase db reset
```

## Migration Files (Run in Order)

### 1. MCP Connections Table
```sql
-- Copy and run: database-migrations/001_add_mcp_connections.sql
```

### 2. OAuth Connections Table  
```sql
-- Copy and run: database-migrations/002_add_oauth_connections.sql
```

### 3. Cloud Bridge Instances Table
```sql
-- Copy and run: database-migrations/003_add_cloud_bridge_instances.sql
```

## Verify Tables Created

After running migrations, verify the tables exist:

```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('mcp_connections', 'oauth_connections', 'cloud_bridge_instances');
```

You should see all 3 tables listed.

## Check Your user_profiles Table

Also verify your user_profiles table exists (required for foreign keys):

```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name = 'user_profiles';
```

If user_profiles doesn't exist, you may need to create it first or adjust the foreign key references.