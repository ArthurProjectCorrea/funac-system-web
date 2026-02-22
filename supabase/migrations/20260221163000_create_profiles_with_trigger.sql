-- migration: create profiles table and trigger/handlers

/*
Resposta curta
Crie uma função PL/pgSQL que insira um registro em public.profiles e um trigger AFTER INSERT na tabela auth.users para chamar essa função. Isso garante que sempre que um usuário for criado no Auth (auth.users) — seja por signup, admin.createUser ou provider — um perfil correspondente será criado.

Abaixo está um exemplo completo pronto para executar no SQL Editor do seu projeto Supabase.
*/

-- 1) Cria tabela de perfis (se ainda não existir)
create table if not exists public.profiles (
  id uuid not null references auth.users(id) on delete cascade,
  username text,
  full_name text,
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (id)
);

-- 2) Função para manter updated_at em updates
create or replace function public.profiles_set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists trg_profiles_set_updated_at on public.profiles;
create trigger trg_profiles_set_updated_at
  before update on public.profiles
  for each row execute procedure public.profiles_set_updated_at();

-- 3) Função que será chamada pelo trigger em auth.users
create or replace function public.handle_new_auth_user()
returns trigger as $$
begin
  -- evita erro se já existir (por exemplo, se trigger for reexecutado)
  if not exists (select 1 from public.profiles where id = new.id) then
    insert into public.profiles (id, username, full_name, avatar_url)
    values (
      new.id,
      (new.raw_user_meta_data ->> 'username')::text,
      (new.raw_user_meta_data ->> 'full_name')::text,
      (new.raw_user_meta_data ->> 'avatar_url')::text
    );
  end if;
  return new;
end;
$$ language plpgsql security definer set search_path = '';

-- 4) Trigger que dispara após inserção em auth.users
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_auth_user();

-- 5) Ajuste de permissões (opcional e recomendado)
-- Permitir execução pela infra do Auth (supabase_auth_admin) e revogar para anon/authenticated/public
grant execute on function public.handle_new_auth_user() to supabase_auth_admin;
revoke execute on function public.handle_new_auth_user() from authenticated, anon, public;

-- Também proteja a tabela de profiles
grant select, insert, update, delete on table public.profiles to supabase_auth_admin;
revoke all on table public.profiles from authenticated, anon, public;
