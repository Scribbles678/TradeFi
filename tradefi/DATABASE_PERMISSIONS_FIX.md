# Fixing Database Permissions in Supabase

If your tables appear as "view-only" in Supabase, it's likely due to **Row Level Security (RLS)** being enabled without proper policies, or missing permissions.

## Quick Fix

1. **Open Supabase SQL Editor**
   - Go to your Supabase project dashboard
   - Click on "SQL Editor" in the left sidebar
   - Click "New Query"

2. **Run the Fix Script**
   - Copy and paste the contents of `database-fix-permissions.sql`
   - Click "Run" to execute

3. **Verify**
   - Go to "Table Editor" in Supabase
   - Try editing a row in the `trades` table
   - It should now be editable!

## What the Script Does

1. **Disables RLS** on `trades`, `positions`, and `strategies` tables
2. **Removes restrictive policies** that block edits
3. **Grants permissions** to `authenticated`, `anon`, and `service_role` users
4. **Verifies** the changes with queries

## Alternative: Enable RLS with Permissive Policies

If you want to keep RLS enabled but allow edits, uncomment the last section in the SQL file. This will:
- Enable RLS but with policies that allow all operations
- Give you better security while still allowing edits

## Troubleshooting

### Still Can't Edit?

1. **Check if it's actually a VIEW, not a TABLE**
   ```sql
   SELECT table_name, table_type 
   FROM information_schema.tables 
   WHERE table_schema = 'public' AND table_name = 'trades';
   ```
   - If `table_type` is `VIEW`, it's read-only by design
   - You'll need to edit the underlying `trades` table instead

2. **Check your user role**
   - Make sure you're logged in as a user with proper permissions
   - Service role has full access, authenticated users may have restrictions

3. **Check API settings**
   - Go to Settings → API
   - Make sure your `anon` and `service_role` keys are valid

### Why is RLS blocking edits?

RLS (Row Level Security) is a PostgreSQL feature that:
- Restricts access to rows based on policies
- If no policies exist, ALL operations are blocked
- If policies exist but are too restrictive, edits are blocked

By disabling RLS or adding permissive policies, we allow all operations.

## Security Note

⚠️ **Disabling RLS** makes your tables fully accessible. This is fine for:
- Personal projects
- Development environments
- Internal tools

For production applications with multiple users, consider enabling RLS with proper policies that restrict access based on user ID or roles.

