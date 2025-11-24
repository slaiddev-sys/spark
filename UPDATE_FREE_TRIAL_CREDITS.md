# Supabase Trigger Update

To update the free trial credits from 30 to 10 for newly signed-up users, you need to update the `handle_new_user` function in your Supabase database.

Please run the following SQL query in your Supabase SQL Editor:

```sql
-- Update the function that handles new user creation to assign 10 credits instead of 30
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, avatar_url, email, credits, tier)
  values (
    new.id,
    new.raw_user_meta_data->>'full_name',
    new.raw_user_meta_data->>'avatar_url',
    new.email,
    10, -- Changed from 30 to 10 credits for free trial
    'free'
  );
  return new;
end;
$$;
```

This will ensure that any new user who signs up will receive 10 credits initially. Existing users will retain their current credit balance unless manually updated.

