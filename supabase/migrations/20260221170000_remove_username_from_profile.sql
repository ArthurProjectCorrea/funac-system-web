-- migration: drop username column from profile and simplify trigger

/*
Since we only need `full_name` on the profile table, remove the
`username` column and update the trigger function so it doesn't
try to write it anymore.  Avatar URL is left untouched but can
also be removed if you decide it's unnecessary.
*/

-- 1) drop username column if it exists
alter table if exists public.profile
  drop column if exists username;

-- 2) adjust trigger function to stop referencing username
create or replace function public.handle_new_auth_user()
returns trigger as $$
begin
  if not exists (select 1 from public.profile where id = new.id) then
    insert into public.profile (id, full_name, avatar_url)
    values (
      new.id,
      (new.raw_user_meta_data ->> 'full_name')::text,
      (new.raw_user_meta_data ->> 'avatar_url')::text
    );
  end if;
  return new;
end;
$$ language plpgsql security definer set search_path = '';

-- 3) update permissions note (not strictly necessary)
grant execute on function public.handle_new_auth_user() to supabase_auth_admin;
revoke execute on function public.handle_new_auth_user() from authenticated, anon, public;
