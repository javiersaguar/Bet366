-- =====================================================================
-- El codigo de invitacion deja de depender de pgcrypto.
--
-- `create_group` sacaba los seis caracteres de `gen_random_bytes`, que es
-- de la extension pgcrypto. En Supabase esa extension no vive en `public`
-- sino en el esquema `extensions`, y la funcion esta declarada con
-- `search_path = public`, asi que no la encontraba: crear un grupo moria
-- con «function gen_random_bytes(integer) does not exist».
--
-- Se podria ampliar el search_path, pero para un codigo de seis caracteres
-- entre amigos no hace falta azar criptografico: basta `random()`, que es
-- de serie. Una dependencia menos que puede faltar.
--
-- De paso se arregla un fallo que no habia dado la cara todavia. El codigo
-- salia de recortar un base64, que incluye `+` y `/`. El `/` se quitaba,
-- pero el `+` no, y la app filtra lo que escribes con `[A-Z0-9]`: un grupo
-- con un `+` en el codigo era un grupo en el que nadie podia entrar. Ahora
-- las letras salen de un alfabeto fijo, ademas sin las que se confunden al
-- dictarlas en voz alta (ni O ni 0, ni I ni 1).
--
-- Ejecutar en el SQL Editor de Supabase. Se puede pasar las veces que
-- haga falta: solo redefine la funcion.
-- =====================================================================

create or replace function public.create_group(
  p_name text,
  p_starting_points numeric default 1000,
  p_drift numeric default 0.5,
  p_liquidity numeric default 300,
  p_dispute_hours int default 24
) returns uuid language plpgsql security definer set search_path = public as $$
declare
  -- Sin O/0 ni I/1: estos codigos se dictan en voz alta.
  v_alfabeto constant text := 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  v_uid   uuid := auth.uid();
  v_group uuid;
  v_code  text;
  v_i     int;
begin
  if v_uid is null then raise exception 'No autenticado'; end if;

  loop
    v_code := '';
    for v_i in 1..6 loop
      v_code := v_code || substr(v_alfabeto, 1 + floor(random() * length(v_alfabeto))::int, 1);
    end loop;
    exit when not exists (select 1 from public.groups where invite_code = v_code);
  end loop;

  insert into public.groups (name, invite_code, created_by, starting_points, drift, liquidity, dispute_hours)
  values (p_name, v_code, v_uid, p_starting_points, p_drift, p_liquidity, p_dispute_hours)
  returning id into v_group;

  insert into public.group_members (group_id, user_id, role) values (v_group, v_uid, 'owner');

  -- Primera semana: arranca ya y termina el lunes que viene a las 00:00 UTC.
  insert into public.seasons (group_id, number, starts_at, ends_at)
  values (v_group, 1, now(), date_trunc('week', now()) + interval '1 week');

  perform public.apply_points(v_group, 1, v_uid, p_starting_points, 'season_start', null, null, 'Puntos iniciales');
  return v_group;
end; $$;
