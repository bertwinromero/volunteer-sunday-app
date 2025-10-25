-- Fix: Add trigger to regenerate share code on UPDATE as well
-- This allows the regenerate function to work properly

-- Drop the old trigger (only fires on INSERT)
drop trigger if exists generate_program_share_code on public.programs;

-- Create new trigger that fires on both INSERT and UPDATE
create trigger generate_program_share_code
  before insert or update on public.programs
  for each row
  execute procedure public.generate_share_code();
