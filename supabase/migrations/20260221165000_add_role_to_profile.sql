-- migration: add role column to profile with FK to position

/*
After renaming `profiles` to `profile`, we still need the
`role` column that originally existed on the legacy permission
profile table.  This migration adds the column back with the
correct foreign key relationship to `position(id)`.
*/

alter table if exists public.profile
  add column if not exists role integer references position(id) on delete cascade;

-- (optional) if you want to enforce NOT NULL once data has been
-- populated, you can add an alter afterwards, but leaving it
-- nullable preserves previous behavior where new profiles may
-- start with a NULL role.
