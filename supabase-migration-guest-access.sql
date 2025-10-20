-- Migration: Add Guest Access and Public Link Sharing
-- Run this in your Supabase SQL Editor if you already have an existing database
-- Created: 2025-10-20

-- Step 1: Add new columns to programs table
alter table public.programs
  add column if not exists share_code text unique,
  add column if not exists share_token uuid default uuid_generate_v4() unique,
  add column if not exists public_access_enabled boolean default true not null,
  add column if not exists active_participants_count integer default 0 not null;

-- Step 2: Create participant_roles table
create table if not exists public.participant_roles (
  id uuid default uuid_generate_v4() primary key,
  role_name text not null,
  description text,
  display_order integer default 0 not null,
  is_active boolean default true not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Step 3: Create program_participants table
create table if not exists public.program_participants (
  id uuid default uuid_generate_v4() primary key,
  program_id uuid references public.programs(id) on delete cascade not null,
  user_id uuid references public.profiles(id) on delete cascade,
  full_name text not null,
  role text not null,
  expo_push_token text,
  is_guest boolean default true not null,
  device_id text,
  joined_at timestamp with time zone default timezone('utc'::text, now()) not null,
  last_active timestamp with time zone default timezone('utc'::text, now()) not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Step 4: Create indexes
create index if not exists programs_share_code_idx on public.programs(share_code);
create index if not exists programs_share_token_idx on public.programs(share_token);
create index if not exists program_participants_program_id_idx on public.program_participants(program_id);
create index if not exists program_participants_user_id_idx on public.program_participants(user_id);
create index if not exists program_participants_device_id_idx on public.program_participants(device_id);
create index if not exists program_participants_last_active_idx on public.program_participants(last_active);
create index if not exists participant_roles_display_order_idx on public.participant_roles(display_order);

-- Step 5: Enable RLS for new tables
alter table public.participant_roles enable row level security;
alter table public.program_participants enable row level security;

-- Step 6: Add RLS policies for participant_roles
create policy "Participant roles are viewable by everyone"
  on public.participant_roles for select
  using (is_active = true);

create policy "Admins can insert participant roles"
  on public.participant_roles for insert
  with check (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'admin'
    )
  );

create policy "Admins can update participant roles"
  on public.participant_roles for update
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'admin'
    )
  );

create policy "Admins can delete participant roles"
  on public.participant_roles for delete
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'admin'
    )
  );

-- Step 7: Add RLS policies for program_participants
create policy "Admins can view all program participants"
  on public.program_participants for select
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'admin'
    )
  );

create policy "Users can view participants of programs they joined"
  on public.program_participants for select
  using (
    user_id = auth.uid() or
    exists (
      select 1 from public.program_participants pp
      where pp.program_id = program_participants.program_id
      and pp.user_id = auth.uid()
    )
  );

create policy "Anyone can insert as guest participant"
  on public.program_participants for insert
  with check (is_guest = true or user_id = auth.uid());

create policy "Participants can update their own last_active"
  on public.program_participants for update
  using (
    (is_guest = true and device_id is not null) or
    user_id = auth.uid()
  );

create policy "Admins can update program participants"
  on public.program_participants for update
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'admin'
    )
  );

create policy "Admins can delete program participants"
  on public.program_participants for delete
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'admin'
    )
  );

-- Step 8: Add triggers for updated_at
create trigger handle_participant_roles_updated_at
  before update on public.participant_roles
  for each row
  execute procedure public.handle_updated_at();

create trigger handle_program_participants_updated_at
  before update on public.program_participants
  for each row
  execute procedure public.handle_updated_at();

-- Step 9: Create function to generate unique share code
create or replace function public.generate_share_code()
returns trigger as $$
declare
  chars text := 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  result text := '';
  i integer;
  code_exists boolean;
begin
  -- Only generate if share_code is null
  if new.share_code is null then
    loop
      result := '';
      -- Generate 6 character code
      for i in 1..6 loop
        result := result || substr(chars, floor(random() * length(chars) + 1)::int, 1);
      end loop;

      -- Check if code already exists
      select exists(select 1 from public.programs where share_code = result) into code_exists;

      exit when not code_exists;
    end loop;

    new.share_code := result;
  end if;

  return new;
end;
$$ language plpgsql;

-- Step 10: Create trigger to auto-generate share code on program creation
create trigger generate_program_share_code
  before insert on public.programs
  for each row
  execute procedure public.generate_share_code();

-- Step 11: Enable Realtime for new tables
alter publication supabase_realtime add table public.participant_roles;
alter publication supabase_realtime add table public.program_participants;

-- Step 12: Insert default participant roles
insert into public.participant_roles (role_name, description, display_order) values
  ('Usher', 'Welcomes attendees and assists with seating', 1),
  ('Worship Team', 'Leads worship and praise', 2),
  ('Tech Team', 'Handles audio, video, and lighting', 3),
  ('Children''s Ministry', 'Supervises children''s programs', 4),
  ('Greeter', 'Welcomes attendees at entrance', 5),
  ('Parking Team', 'Assists with parking coordination', 6),
  ('Prayer Team', 'Available for prayer ministry', 7),
  ('General Volunteer', 'Assists with various tasks as needed', 8)
on conflict do nothing;

-- Step 13: Generate share codes for existing programs
update public.programs
set share_token = uuid_generate_v4()
where share_token is null;

-- Migration complete!
-- New features added:
-- - Public link sharing with unique codes
-- - Guest participant tracking
-- - Predefined volunteer roles
-- - Real-time participant updates
