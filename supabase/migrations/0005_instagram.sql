-- =====================================================================
-- Instagram en el perfil.
--
-- Se guarda solo el nombre de usuario, sin arroba y sin URL: la app arma
-- el enlace. Asi no hay forma de colar una direccion cualquiera en algo
-- que los demas van a pulsar.
--
-- Ejecutar en el SQL Editor de Supabase despues de 0004_policies.sql.
-- =====================================================================

alter table public.profiles
  add column if not exists instagram text
  check (instagram is null or instagram ~ '^[A-Za-z0-9._]{1,30}$');

comment on column public.profiles.instagram is
  'Nombre de usuario de Instagram, sin arroba. La app construye el enlace.';

-- No hacen falta politicas nuevas: la columna vive en `profiles`, que ya
-- deja editar la fila propia y leer las de tus companeros de grupo.
