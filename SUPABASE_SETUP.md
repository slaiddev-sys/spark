# Supabase Setup Instructions

## Environment Variables

Create a `.env.local` file in the root directory with the following content:

```env
NEXT_PUBLIC_SUPABASE_URL=https://mgvyazwurtzbeajpuwsv.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1ndnlhend1cnR6YmVhanB1d3N2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM4MTkzMzQsImV4cCI6MjA3OTM5NTMzNH0.jXHrJVhfyM1Wz0-TEUG4P5eirt1V3Wchwq-dVdDBEi4
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1ndnlhend1cnR6YmVhanB1d3N2Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MzgxOTMzNCwiZXhwIjoyMDc5Mzk1MzM0fQ.UsaP_rKgwRt-hnrxBPYZW1ONA-6Y4b4V0Bz2_bST8F8
```

## Supabase Dashboard Configuration

### 1. Enable Authentication Providers

Go to your Supabase Dashboard → Authentication → Providers and enable:

- **Email**: Already enabled by default
- **Google OAuth**: 
  1. Enable the provider
  2. Add your OAuth credentials
  3. Add authorized redirect URLs: `http://localhost:3000/auth/callback` and your production URL
  
- **GitHub OAuth**:
  1. Enable the provider
  2. Add your OAuth credentials
  3. Add authorized redirect URLs: `http://localhost:3000/auth/callback` and your production URL

### 2. Configure Email Templates (Optional)

Go to Authentication → Email Templates to customize:
- Confirm signup
- Magic Link
- Change email address
- Reset password

### 3. Site URL Configuration

Go to Authentication → URL Configuration:
- **Site URL**: `http://localhost:3000` (for development) or your production URL
- **Redirect URLs**: Add `http://localhost:3000/auth/callback`

## Authentication Features Implemented

✅ **Sign Up Page** (`/signup`):
- Google OAuth
- GitHub OAuth
- Magic Link (passwordless email)

✅ **Login Page** (`/login`):
- Google OAuth
- GitHub OAuth  
- Email/Password authentication

✅ **Callback Handler**: Handles OAuth redirects at `/auth/callback`

## How to Use

1. Create the `.env.local` file as shown above
2. Restart your development server: `npm run dev`
3. Visit `/signup` or `/login` to test authentication
4. Configure OAuth providers in Supabase Dashboard for social login

## Next Steps

- Set up protected routes
- Add user profile management
- Implement password reset functionality
- Add email confirmation flow

