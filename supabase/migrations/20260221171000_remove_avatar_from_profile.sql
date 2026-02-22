-- migration: drop avatar_url from profile and update trigger

/*
This migration removes the `avatar_url` column from public.profile and
updates the trigger function so it no longer attempts to write that
value.  Since we're simplifying further and only need `full_name`, the
trigger becomes straightforward.
*/

-- remove the column
alter table if exists public.profile
  drop column if exists avatar_url;

-- update trigger function accordingly
create or replace function public.handle_new_auth_user()
returns trigger as $$
begin
  if not exists (select 1 from public.profile where id = new.id) then
    insert into public.profile (id, full_name)
    values (
      new.id,
      (new.raw_user_meta_data ->> 'full_name')::text
    );
  end if;
  return new;
end;
$$ language plpgsql security definer set search_path = '';

-- permissions maintainance (optional)
grant execute on function public.handle_new_auth_user() to supabase_auth_admin;
revoke execute on function public.handle_new_auth_user() from authenticated, anon, public;
