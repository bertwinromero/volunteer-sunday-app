-- Migration: Make middle_name optional and last_name required
-- Run this in your Supabase SQL Editor if you already have an existing database
-- Created: 2025-10-20

-- Step 1: Modify the profiles table structure
-- Make middle_name nullable
alter table public.profiles alter column middle_name drop not null;

-- Make last_name required (not null)
-- First, update any null last_name values to empty string
update public.profiles set last_name = '' where last_name is null;
-- Then add the not null constraint
alter table public.profiles alter column last_name set not null;

-- Step 2: Update the handle_new_user() function
create or replace function public.handle_new_user()
returns trigger as $$
declare
  v_first_name text;
  v_middle_name text;
  v_last_name text;
  v_display_name text;
begin
  -- Extract names from metadata
  v_first_name := new.raw_user_meta_data->>'first_name';
  v_middle_name := new.raw_user_meta_data->>'middle_name';
  v_last_name := new.raw_user_meta_data->>'last_name';
  v_display_name := new.raw_user_meta_data->>'display_name';

  -- Build display_name if not provided
  if v_display_name is null then
    if v_middle_name is not null and v_middle_name != '' then
      v_display_name := v_first_name || ' ' || v_middle_name || ' ' || v_last_name;
    else
      v_display_name := v_first_name || ' ' || v_last_name;
    end if;
  end if;

  insert into public.profiles (id, email, first_name, middle_name, last_name, display_name, role)
  values (
    new.id,
    new.email,
    coalesce(v_first_name, ''),
    v_middle_name,
    coalesce(v_last_name, ''),
    v_display_name,
    coalesce(new.raw_user_meta_data->>'role', 'volunteer')
  );
  return new;
end;
$$ language plpgsql security definer;

-- Migration complete
-- Changes:
-- - middle_name is now optional (nullable)
-- - last_name is now required (not null)
-- - display_name logic updated to check middle_name instead of last_name
