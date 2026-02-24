-- initial_schema migration: create core tables and profile trigger

-- departments
create table if not exists public.departments (
  id serial primary key,
  icon varchar,
  name varchar not null,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

-- positions
create table if not exists public.positions (
  id serial primary key,
  department_id integer not null references public.departments(id) on delete cascade,
  name varchar not null,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

-- permissions
create table if not exists public.permissions (
  id serial primary key,
  name varchar not null,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

-- screen_group
create table if not exists public.screen_group (
  id serial primary key,
  name varchar not null,
  icon varchar,
  open boolean default false not null,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

-- screens
create table if not exists public.screens (
  id serial primary key,
  name varchar not null,
  url varchar,
  icon varchar,
  sidebar boolean default false not null,
  screen_group_id integer references public.screen_group(id) on delete set null,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

-- accesses
create table if not exists public.accesses (
  id serial primary key,
  position_id integer not null references public.positions(id) on delete cascade,
  screen_id integer not null references public.screens(id) on delete cascade,
  permission_id integer not null references public.permissions(id) on delete cascade,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

-- profiles
-- user_id will mirror auth.users.id; primary key on user_id
create table if not exists public.profiles (
  user_id uuid not null references auth.users(id) on delete cascade,
  name varchar,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null,
  primary key (user_id)
);

-- profile_positions
create table if not exists public.profile_positions (
  id serial primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  position_id integer not null references public.positions(id) on delete cascade,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

-- trigger function to populate profiles when a new auth user is created
create or replace function public.handle_new_auth_user()
returns trigger as $$
begin
  if not exists (select 1 from public.profiles where user_id = new.id) then
    insert into public.profiles (user_id, name)
      values (new.id, (new.raw_user_meta_data ->> 'name')::text);
  end if;
  return new;
end;
$$ language plpgsql security definer set search_path = '';

-- trigger itself

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_auth_user();

-- adjust permissions on function and profiles table
grant execute on function public.handle_new_auth_user() to supabase_auth_admin;
revoke execute on function public.handle_new_auth_user() from authenticated, anon, public;

grant select, insert, update, delete on table public.profiles to supabase_auth_admin;
revoke all on table public.profiles from authenticated, anon, public;


