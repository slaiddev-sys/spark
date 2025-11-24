# Vercel Environment Variables Update

## 1. Add Service Role Key (Already Requested)

**Key:** `SUPABASE_SERVICE_ROLE_KEY`
**Value:** (From Supabase Dashboard)

## 2. Add Polar Webhook Secret (NEW)

To enable automatic plan upgrades and credit recharging, you must configure the Polar Webhook.

### Steps:

1. Go to your **Polar Dashboard** -> **Settings** -> **Webhooks**.
2. Create a new Endpoint:
   - **URL:** `https://your-project.vercel.app/api/webhook/polar` (Replace with your actual Vercel domain)
   - **Events:** Select `subscription.created` and `subscription.updated`.
3. Copy the **Secret** provided by Polar.
4. Go to **Vercel Dashboard** -> **Settings** -> **Environment Variables**.
5. Add:
   
   **Key:** `POLAR_WEBHOOK_SECRET`
   
   **Value:** (Paste the secret from Polar)

## Checklist

Make sure ALL of these are set in Vercel:

- ✅ `NEXT_PUBLIC_SUPABASE_URL`
- ✅ `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- ✅ `SUPABASE_SERVICE_ROLE_KEY`
- ✅ `GOOGLE_GEMINI_API_KEY`
- ✅ `POLAR_ACCESS_TOKEN`
- ✅ `POLAR_SUCCESS_URL`
- ⚠️ `POLAR_WEBHOOK_SECRET` **(NEW)**

Redeploy after adding variables.
