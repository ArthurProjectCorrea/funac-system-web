-- migration: remove role from profile and add role_profile join table

/*
The previous design stored a single role directly on the
`profile` row. To allow a user to have multiple roles we
remove that column and introduce a dedicated join table.

The new table is called `role_profile` (singular per naming
convention) and links the auth user to one or more positions.
`user_id` references `auth.users(id)` since profiles are tied
one‑to‑one with auth users.
*/

-- drop role column from profile if it exists
alter table if exists public.profile
  drop column if exists role;

-- create role_profile table
create table if not exists public.role_profile (
  id serial primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  position integer not null references position(id) on delete cascade,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- trigger to keep updated_at in role_profile (optional)
create or replace function public.role_profile_set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists trg_role_profile_set_updated_at on public.role_profile;
create trigger trg_role_profile_set_updated_at
  before update on public.role_profile
  for each row execute procedure public.role_profile_set_updated_at();
