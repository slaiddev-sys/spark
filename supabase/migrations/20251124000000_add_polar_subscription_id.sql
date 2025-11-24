-- Add polar_subscription_id column to profiles table for subscription management

ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS polar_subscription_id TEXT;

-- Add index for faster lookups
CREATE INDEX IF NOT EXISTS idx_profiles_polar_subscription_id 
ON profiles(polar_subscription_id);

