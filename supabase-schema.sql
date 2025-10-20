-- Sunday Program Volunteer App Database Schema
-- Run this in your Supabase SQL Editor

-- Enable necessary extensions
create extension if not exists "uuid-ossp";

-- Create profiles table
create table if not exists public.profiles (
  id uuid references auth.users on delete cascade primary key,
  email text not null unique,
  first_name text not null,
  middle_name text,
  last_name text not null,
  display_name text,
  role text not null check (role in ('admin', 'volunteer')) default 'volunteer',
  expo_push_token text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create programs table
create table if not exists public.programs (
  id uuid default uuid_generate_v4() primary key,
  title text not null,
  date date not null,
  status text not null check (status in ('draft', 'active', 'completed')) default 'draft',
  created_by uuid references public.profiles(id) on delete cascade not null,
  share_code text unique,
  share_token uuid default uuid_generate_v4() unique not null,
  public_access_enabled boolean default true not null,
  active_participants_count integer default 0 not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create program_items table
create table if not exists public.program_items (
  id uuid default uuid_generate_v4() primary key,
  program_id uuid references public.programs(id) on delete cascade not null,
  time time not null,
  title text not null,
  description text,
  duration_minutes integer not null,
  "order" integer not null,
  has_task boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create tasks table
create table if not exists public.tasks (
  id uuid default uuid_generate_v4() primary key,
  program_id uuid references public.programs(id) on delete cascade not null,
  program_item_id uuid references public.program_items(id) on delete cascade not null,
  assigned_to uuid references public.profiles(id) on delete cascade not null,
  status text not null check (status in ('pending', 'completed')) default 'pending',
  completed_at timestamp with time zone,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create participant_roles table (predefined roles per church/organization)
create table if not exists public.participant_roles (
  id uuid default uuid_generate_v4() primary key,
  role_name text not null,
  description text,
  display_order integer default 0 not null,
  is_active boolean default true not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create program_participants table (tracks both guest and registered participants)
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

-- Create indexes for better performance
create index if not exists profiles_email_idx on public.profiles(email);
create index if not exists programs_date_idx on public.programs(date);
create index if not exists programs_status_idx on public.programs(status);
create index if not exists programs_share_code_idx on public.programs(share_code);
create index if not exists programs_share_token_idx on public.programs(share_token);
create index if not exists program_items_program_id_idx on public.program_items(program_id);
create index if not exists tasks_assigned_to_idx on public.tasks(assigned_to);
create index if not exists tasks_program_id_idx on public.tasks(program_id);
create index if not exists program_participants_program_id_idx on public.program_participants(program_id);
create index if not exists program_participants_user_id_idx on public.program_participants(user_id);
create index if not exists program_participants_device_id_idx on public.program_participants(device_id);
create index if not exists program_participants_last_active_idx on public.program_participants(last_active);
create index if not exists participant_roles_display_order_idx on public.participant_roles(display_order);

-- Enable Row Level Security
alter table public.profiles enable row level security;
alter table public.programs enable row level security;
alter table public.program_items enable row level security;
alter table public.tasks enable row level security;
alter table public.participant_roles enable row level security;
alter table public.program_participants enable row level security;

-- Profiles RLS Policies
create policy "Public profiles are viewable by everyone"
  on public.profiles for select
  using (true);

create policy "Users can insert their own profile"
  on public.profiles for insert
  with check (auth.uid() = id);

create policy "Users can update their own profile"
  on public.profiles for update
  using (auth.uid() = id);

-- Programs RLS Policies
create policy "Programs are viewable by everyone"
  on public.programs for select
  using (true);

create policy "Admins can insert programs"
  on public.programs for insert
  with check (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'admin'
    )
  );

create policy "Admins can update programs"
  on public.programs for update
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'admin'
    )
  );

create policy "Admins can delete programs"
  on public.programs for delete
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'admin'
    )
  );

-- Program Items RLS Policies
create policy "Program items are viewable by everyone"
  on public.program_items for select
  using (true);

create policy "Admins can insert program items"
  on public.program_items for insert
  with check (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'admin'
    )
  );

create policy "Admins can update program items"
  on public.program_items for update
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'admin'
    )
  );

create policy "Admins can delete program items"
  on public.program_items for delete
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'admin'
    )
  );

-- Tasks RLS Policies
create policy "Users can view their own tasks and admins can view all"
  on public.tasks for select
  using (
    auth.uid() = assigned_to or
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'admin'
    )
  );

create policy "Admins can insert tasks"
  on public.tasks for insert
  with check (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'admin'
    )
  );

create policy "Admins can update tasks"
  on public.tasks for update
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'admin'
    )
  );

create policy "Users can update their own task status"
  on public.tasks for update
  using (auth.uid() = assigned_to);

create policy "Admins can delete tasks"
  on public.tasks for delete
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'admin'
    )
  );

-- Participant Roles RLS Policies
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

-- Program Participants RLS Policies
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

-- Create function to handle updated_at timestamp
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- Create triggers for updated_at
create trigger handle_profiles_updated_at
  before update on public.profiles
  for each row
  execute procedure public.handle_updated_at();

create trigger handle_programs_updated_at
  before update on public.programs
  for each row
  execute procedure public.handle_updated_at();

create trigger handle_program_items_updated_at
  before update on public.program_items
  for each row
  execute procedure public.handle_updated_at();

create trigger handle_tasks_updated_at
  before update on public.tasks
  for each row
  execute procedure public.handle_updated_at();

create trigger handle_participant_roles_updated_at
  before update on public.participant_roles
  for each row
  execute procedure public.handle_updated_at();

create trigger handle_program_participants_updated_at
  before update on public.program_participants
  for each row
  execute procedure public.handle_updated_at();

-- Create function to generate unique share code
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

-- Create trigger to auto-generate share code on program creation
create trigger generate_program_share_code
  before insert on public.programs
  for each row
  execute procedure public.generate_share_code();

-- Create function to handle new user profile creation
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

-- Create trigger for new user signup
create trigger on_auth_user_created
  after insert on auth.users
  for each row
  execute procedure public.handle_new_user();

-- Enable Realtime for all tables
alter publication supabase_realtime add table public.profiles;
alter publication supabase_realtime add table public.programs;
alter publication supabase_realtime add table public.program_items;
alter publication supabase_realtime add table public.tasks;
alter publication supabase_realtime add table public.participant_roles;
alter publication supabase_realtime add table public.program_participants;

-- Insert default participant roles
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
