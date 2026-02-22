-- migration: add icon column to department table

-- new column for department icons
alter table if exists department
  add column if not exists icon varchar;
