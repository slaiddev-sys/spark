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

