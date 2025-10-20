-- Migration: Add separate name fields to profiles table
-- Run this in your Supabase SQL Editor if you already have data

-- Step 1: Add new columns (allow null initially)
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS first_name text,
  ADD COLUMN IF NOT EXISTS middle_name text,
  ADD COLUMN IF NOT EXISTS last_name text;

-- Step 2: Migrate existing display_name to new fields
-- This attempts to split the display_name into parts
UPDATE public.profiles
SET
  first_name = COALESCE(
    SPLIT_PART(display_name, ' ', 1),
    ''
  ),
  middle_name = COALESCE(
    CASE
      WHEN array_length(string_to_array(display_name, ' '), 1) >= 2
      THEN SPLIT_PART(display_name, ' ', 2)
      ELSE ''
    END,
    ''
  ),
  last_name = CASE
    WHEN array_length(string_to_array(display_name, ' '), 1) >= 3
    THEN SPLIT_PART(display_name, ' ', 3)
    ELSE NULL
  END
WHERE first_name IS NULL;

-- Step 3: Make first_name and middle_name required
ALTER TABLE public.profiles
  ALTER COLUMN first_name SET NOT NULL,
  ALTER COLUMN middle_name SET NOT NULL;

-- Step 4: Update the handle_new_user function
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
DECLARE
  v_first_name text;
  v_middle_name text;
  v_last_name text;
  v_display_name text;
BEGIN
  -- Extract names from metadata
  v_first_name := new.raw_user_meta_data->>'first_name';
  v_middle_name := new.raw_user_meta_data->>'middle_name';
  v_last_name := new.raw_user_meta_data->>'last_name';
  v_display_name := new.raw_user_meta_data->>'display_name';

  -- Build display_name if not provided (for backward compatibility)
  IF v_display_name IS NULL THEN
    IF v_last_name IS NOT NULL AND v_last_name != '' THEN
      v_display_name := v_first_name || ' ' || v_middle_name || ' ' || v_last_name;
    ELSE
      v_display_name := v_first_name || ' ' || v_middle_name;
    END IF;
  END IF;

  INSERT INTO public.profiles (id, email, first_name, middle_name, last_name, display_name, role)
  VALUES (
    new.id,
    new.email,
    COALESCE(v_first_name, ''),
    COALESCE(v_middle_name, ''),
    v_last_name,
    v_display_name,
    COALESCE(new.raw_user_meta_data->>'role', 'volunteer')
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Migration complete!
-- Your existing data has been preserved and the schema is updated.
