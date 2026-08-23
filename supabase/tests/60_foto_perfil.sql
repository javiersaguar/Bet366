-- =====================================================================
-- La foto de perfil.
--
-- En `profiles` no se guarda una direccion, se guarda la ruta dentro del
-- almacen. Esa diferencia es toda la seguridad de esta funcion: si ahi
-- cupiera una URL, cualquiera podria apuntar su foto al servidor que
-- quisiera y todo el grupo se la pediria al abrir la app.
--
-- La restriccion tiene ademas que la carpeta sea la del propio perfil, para
-- que nadie se ponga la foto de otro ni se salga con «../».
-- =====================================================================
\set ON_ERROR_STOP on
set client_min_messages = notice;

insert into auth.users (id, email) values
  ('d1111111-1111-1111-1111-111111111111', 'foto@bet366.test');

-- Devuelve true si la base rechaza esa ruta.
create or replace function test.rechaza_ruta(p_uid uuid, p_ruta text) returns boolean
language plpgsql as $$ begin
  update public.profiles set avatar_path = p_ruta where id = p_uid;
  return false;
exception when check_violation then return true;
end $$;

-- ============================== lo normal entra
update public.profiles
set avatar_path = 'd1111111-1111-1111-1111-111111111111/1787500000000-abc123.webp'
where id = 'd1111111-1111-1111-1111-111111111111';

select test.check('una ruta propia y con la forma buena se guarda', (
  select avatar_path is not null from public.profiles
  where id = 'd1111111-1111-1111-1111-111111111111'));

update public.profiles set avatar_path = null
where id = 'd1111111-1111-1111-1111-111111111111';

select test.check('y se puede quitar', (
  select avatar_path is null from public.profiles
  where id = 'd1111111-1111-1111-1111-111111111111'));

-- ============================== una direccion no es una ruta
select test.check('una URL entera no cabe en la columna',
  test.rechaza_ruta('d1111111-1111-1111-1111-111111111111',
                    'https://malo.example/pixel.gif'));

select test.check('ni un javascript:',
  test.rechaza_ruta('d1111111-1111-1111-1111-111111111111',
                    'javascript:alert(1)'));

-- ============================== ni la carpeta de otro
select test.check('la carpeta tiene que ser la tuya',
  test.rechaza_ruta('d1111111-1111-1111-1111-111111111111',
                    '11111111-1111-1111-1111-111111111111/1787500000000-abc123.webp'));

select test.check('no se puede salir de la carpeta con ../',
  test.rechaza_ruta('d1111111-1111-1111-1111-111111111111',
                    'd1111111-1111-1111-1111-111111111111/../otro/1787500000000-abc123.webp'));

-- ============================== ni cualquier extension
select test.check('un .svg no vale: es texto y puede llevar un script',
  test.rechaza_ruta('d1111111-1111-1111-1111-111111111111',
                    'd1111111-1111-1111-1111-111111111111/1787500000000-abc123.svg'));

select test.check('ni un .html disfrazado de imagen',
  test.rechaza_ruta('d1111111-1111-1111-1111-111111111111',
                    'd1111111-1111-1111-1111-111111111111/1787500000000-abc123.webp.html'));

-- ============================== el cubo esta como tiene que estar
select test.check('el cubo de avatares existe y es publico', (
  select public from storage.buckets where id = 'avatars'));

select test.check('el cubo no acepta mas de 256 KB', (
  select file_size_limit = 262144 from storage.buckets where id = 'avatars'));

select test.check('el cubo solo acepta webp y jpeg', (
  select allowed_mime_types @> array['image/webp','image/jpeg']
     and array_length(allowed_mime_types, 1) = 2
  from storage.buckets where id = 'avatars'));
