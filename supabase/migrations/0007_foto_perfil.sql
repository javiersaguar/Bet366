-- =====================================================================
-- Foto de perfil.
--
-- Hasta ahora cada uno era un emblema vectorial sobre un color. Se queda
-- como opcion y como respaldo, pero quien quiera puede poner una foto suya.
--
-- Lo que se guarda en `profiles` es la RUTA dentro del almacen, nunca una
-- direccion. Si aqui cupiera una URL, cualquiera podria apuntar su foto a un
-- servidor suyo y usar a todo el grupo para contar visitas o algo peor. La
-- direccion publica la arma la app a partir de la ruta.
--
-- La forma de la ruta esta atada por una restriccion, y ademas tiene que
-- empezar por el id de la propia fila: nadie puede ponerse de foto la de
-- otro ni salirse de su carpeta con «../».
--
-- Ejecutar en el SQL Editor de Supabase, despues de 0006.
-- =====================================================================

alter table public.profiles
  add column if not exists avatar_path text;

comment on column public.profiles.avatar_path is
  'Ruta de la foto dentro del cubo `avatars`, con la forma <uid>/<epoch>-<azar>.webp. Nunca una URL.';

do $$ begin
  if not exists (
    select 1 from pg_constraint where conname = 'profiles_avatar_path_propio'
  ) then
    alter table public.profiles
      add constraint profiles_avatar_path_propio check (
        avatar_path is null
        or (
          avatar_path ~ '^[0-9a-f-]{36}/[0-9]{10,14}-[a-z0-9]{6}\.(webp|jpg)$'
          and split_part(avatar_path, '/', 1) = id::text
        )
      );
  end if;
end $$;

-- ------------------------------------------------------------ el almacen
--
-- El cubo es publico: las fotos se pintan en listas y cabeceras, y firmar
-- una direccion distinta por cada avatar y cada carga seria mucho jaleo para
-- una foto de perfil que ya ven los del grupo. A cambio, la ruta no se puede
-- adivinar (id + milisegundo + seis caracteres al azar) y solo la conocen
-- quienes pueden leer tu fila de `profiles`, que son los de tus grupos.
--
-- Los dos topes de aqui abajo los aplica el propio Storage, del lado del
-- servidor, asi que valen aunque alguien hable con la API por su cuenta sin
-- pasar por la app.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('avatars', 'avatars', true, 262144, array['image/webp', 'image/jpeg'])
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

-- Ver: cualquiera. Es lo que hace que la foto se pinte sin firmar nada.
drop policy if exists "avatares: los ve cualquiera" on storage.objects;
create policy "avatares: los ve cualquiera" on storage.objects
  for select using (bucket_id = 'avatars');

-- Escribir: solo en tu propia carpeta, y la carpeta es tu id de usuario.
-- Esta es la linea que impide que nadie toque la foto de otro, por mucho que
-- se salte la app y hable con la API directamente.
drop policy if exists "avatares: cada uno en su carpeta" on storage.objects;
create policy "avatares: cada uno en su carpeta" on storage.objects
  for insert to authenticated
  with check (
    bucket_id = 'avatars'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists "avatares: cada uno reemplaza el suyo" on storage.objects;
create policy "avatares: cada uno reemplaza el suyo" on storage.objects
  for update to authenticated
  using (
    bucket_id = 'avatars'
    and (storage.foldername(name))[1] = auth.uid()::text
  )
  with check (
    bucket_id = 'avatars'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists "avatares: cada uno borra el suyo" on storage.objects;
create policy "avatares: cada uno borra el suyo" on storage.objects
  for delete to authenticated
  using (
    bucket_id = 'avatars'
    and (storage.foldername(name))[1] = auth.uid()::text
  );
