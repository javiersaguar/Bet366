-- Stub minimo de lo que aporta Supabase, para poder probar en local.
do $$ begin
  if not exists (select 1 from pg_roles where rolname='anon') then create role anon nologin; end if;
  if not exists (select 1 from pg_roles where rolname='authenticated') then create role authenticated nologin; end if;
end $$;

-- pgcrypto va en el esquema `extensions`, que es donde lo pone Supabase de
-- verdad. Antes se instalaba en `public` y por eso estas pruebas daban por
-- bueno un `create_group` que en produccion moria con «function
-- gen_random_bytes(integer) does not exist»: nuestras funciones llevan
-- `search_path = public` y ahi no estaba. Ver 0006_codigo_invitacion.sql.
create schema if not exists extensions;
create extension if not exists "pgcrypto" with schema extensions;
create schema if not exists auth;
create table if not exists auth.users (
  id uuid primary key default gen_random_uuid(),
  email text,
  raw_user_meta_data jsonb default '{}'::jsonb
);
create or replace function auth.uid() returns uuid language sql stable as $$
  select nullif(current_setting('test.uid', true), '')::uuid;
$$;
