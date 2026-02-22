-- migration: create positions, departments, screens, permissions, access and profile tables

/*
This migration creates the following tables used for user permissions:

  department
  position
  screen
  permission
  access     (joins position, screen and permission)
  profile    (links an auth user to a position/role)

Each table includes the standard Supabase timestamps
(created_at, updated_at) with default values.  Foreign
keys point to the appropriate parent tables.  The auth
user reference uses the built-in auth.users table.
*/

-- department
create table if not exists department (
  id serial primary key,
  name varchar not null,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

-- position (role) belongs to a department
create table if not exists position (
  id serial primary key,
  department_id integer references department(id) on delete cascade,
  name varchar not null,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

-- screen (resource the user can access)
create table if not exists screen (
  id serial primary key,
  name varchar not null,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

-- permission (action that can be performed on a screen)
create table if not exists permission (
  id serial primary key,
  name varchar not null,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

-- access (joins position, screen and permission)
create table if not exists access (
  id serial primary key,
  position_id integer references position(id) on delete cascade,
  screen_id integer references screen(id) on delete cascade,
  permission_id integer references permission(id) on delete cascade,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

-- profile (links an auth user to a position/role)
create table if not exists profile (
  id serial primary key,
  user_id uuid references auth.users(id) on delete cascade,
  role integer references position(id) on delete cascade,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

