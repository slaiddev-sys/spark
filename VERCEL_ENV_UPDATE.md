# Vercel Environment Variables Update

## Important: Add Service Role Key

The account deletion feature requires the **SUPABASE_SERVICE_ROLE_KEY** to be added to your Vercel project.

### Steps to Add:

1. Go to your **Vercel Dashboard**
2. Select your **Spark** project
3. Click on **Settings** → **Environment Variables**
4. Add the following variable:

   **Key:** `SUPABASE_SERVICE_ROLE_KEY`
   
   **Value:** (Copy from your local `.env.local` file or from Supabase Dashboard → Settings → API → service_role key)
   
   ```
   eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1ndnlhend1cnR6YmVhanB1d3N2Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MzgxOTMzNCwiZXhwIjoyMDc5Mzk1MzM0fQ.UsaP_rKgwRt-hnrxBPYZW1ONA-6Y4b4V0Bz2_bST8F8
   ```

5. Make sure to apply it to **all environments** (Production, Preview, Development)
6. **Redeploy** your project for the changes to take effect

### Why is this needed?

The `SUPABASE_SERVICE_ROLE_KEY` is required to:
- Delete user records from the database
- Remove authentication users (including Google OAuth links)
- Bypass Row Level Security (RLS) policies for admin operations

⚠️ **Security Note:** The service role key has elevated permissions. Never expose it in client-side code. It's only used in the server-side API route (`/api/delete-account`).

## Current Vercel Environment Variables Checklist

Make sure ALL of these are set:

- ✅ `NEXT_PUBLIC_SUPABASE_URL`
- ✅ `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- ⚠️ `SUPABASE_SERVICE_ROLE_KEY` **(NEW - Required for account deletion)**
- ✅ `GOOGLE_GEMINI_API_KEY`
- ✅ `POLAR_ACCESS_TOKEN`
- ✅ `POLAR_SUCCESS_URL`

After adding the service role key, trigger a new deployment from your Vercel dashboard or by pushing a new commit.

