-- =====================================================================
--  Logica autoritativa. Todo lo que mueve puntos vive aqui para que
--  no se pueda manipular desde el cliente.
-- =====================================================================

-- ---------------------------------------------------------------- helpers
create or replace function public.is_member(p_group uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from public.group_members
    where group_id = p_group and user_id = auth.uid()
  );
$$;

create or replace function public.open_season(p_group uuid)
returns int language sql stable security definer set search_path = public as $$
  select number from public.seasons
  where group_id = p_group and closed_at is null
  order by number desc limit 1;
$$;

-- Aplica un movimiento de puntos y lo deja anotado en el libro.
create or replace function public.apply_points(
  p_group uuid, p_season int, p_user uuid, p_amount numeric,
  p_kind public.ledger_kind, p_market uuid default null,
  p_wager uuid default null, p_note text default null
) returns numeric language plpgsql security definer set search_path = public as $$
declare v_after numeric;
begin
  insert into public.balances (group_id, season_number, user_id, points)
  values (p_group, p_season, p_user, greatest(0, p_amount))
  on conflict (group_id, season_number, user_id)
  do update set points = public.balances.points + p_amount
  returning points into v_after;

  if v_after < 0 then
    raise exception 'Saldo insuficiente' using errcode = 'P0001';
  end if;

  insert into public.ledger (group_id, season_number, user_id, kind, amount,
                             balance_after, market_id, wager_id, note)
  values (p_group, p_season, p_user, p_kind, p_amount, v_after, p_market, p_wager, p_note);

  return v_after;
end; $$;

-- ---------------------------------------------------------------- motor de cuotas
-- Espejo exacto de src/lib/engine/odds.ts (computeCurrentOdds).
create or replace function public.recompute_odds(p_market uuid)
returns void language plpgsql security definer set search_path = public as $$
declare
  v_drift  double precision;
  v_liq    double precision;
  v_margin double precision;
  v_total  double precision;
  v_weight double precision;
begin
  select g.drift::double precision, g.liquidity::double precision
    into v_drift, v_liq
  from public.markets m
  join public.groups g on g.id = m.group_id
  where m.id = p_market;

  select sum(1.0 / o.opening_odds::double precision), coalesce(sum(o.pool::double precision), 0)
    into v_margin, v_total
  from public.market_options o
  where o.market_id = p_market;

  if v_margin is null or v_margin <= 0 then return; end if;

  v_weight := case
    when v_total > 0 then v_drift * (v_total / (v_total + greatest(v_liq, 1)))
    else 0
  end;

  with base as (
    select o.id,
           least(0.95, greatest(0.02,
             (1 - v_weight) * ((1.0 / o.opening_odds::double precision) / v_margin)
             + v_weight * (case when v_total > 0
                                then o.pool::double precision / v_total
                                else (1.0 / o.opening_odds::double precision) / v_margin end)
           )) as p
    from public.market_options o
    where o.market_id = p_market
  ),
  norm as (select id, p / nullif((select sum(p) from base), 0) as p from base)
  update public.market_options o
     set current_odds = round(least(50, greatest(1.01, 1.0 / (norm.p * v_margin)))::numeric, 2)
    from norm
   where norm.id = o.id;
end; $$;

-- ---------------------------------------------------------------- grupos
create or replace function public.create_group(
  p_name text,
  p_starting_points numeric default 1000,
  p_drift numeric default 0.5,
  p_liquidity numeric default 300,
  p_dispute_hours int default 24
) returns uuid language plpgsql security definer set search_path = public as $$
declare
  v_uid   uuid := auth.uid();
  v_group uuid;
  v_code  text;
begin
  if v_uid is null then raise exception 'No autenticado'; end if;

  loop
    v_code := upper(substr(replace(encode(gen_random_bytes(6), 'base64'), '/', ''), 1, 6));
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

create or replace function public.join_group(p_code text)
returns uuid language plpgsql security definer set search_path = public as $$
declare
  v_uid    uuid := auth.uid();
  v_group  uuid;
  v_season int;
  v_start  numeric;
begin
  if v_uid is null then raise exception 'No autenticado'; end if;

  select id, starting_points into v_group, v_start
  from public.groups where invite_code = upper(trim(p_code));
  if v_group is null then raise exception 'Ese codigo de invitacion no existe'; end if;

  if exists (select 1 from public.group_members where group_id = v_group and user_id = v_uid) then
    return v_group;
  end if;

  insert into public.group_members (group_id, user_id) values (v_group, v_uid);

  v_season := public.open_season(v_group);
  -- Quien entra a mitad de semana empieza con los mismos puntos que los demas.
  perform public.apply_points(v_group, v_season, v_uid, v_start, 'season_start', null, null, 'Puntos iniciales');
  return v_group;
end; $$;

-- ---------------------------------------------------------------- crear apuesta
create or replace function public.create_market(
  p_group uuid,
  p_title text,
  p_description text,
  p_closes_at timestamptz,
  p_stakes_public boolean,
  p_options jsonb   -- [{"label":"Si","odds":1.90}, ...]
) returns uuid language plpgsql security definer set search_path = public as $$
declare
  v_uid     uuid := auth.uid();
  v_market  uuid;
  v_season  int;
  v_ends    timestamptz;
  v_opt     jsonb;
  v_i       int := 0;
begin
  if not public.is_member(p_group) then raise exception 'No perteneces a este grupo'; end if;
  if jsonb_array_length(p_options) < 2 then raise exception 'Hacen falta al menos 2 opciones'; end if;
  if jsonb_array_length(p_options) > 8 then raise exception 'Maximo 8 opciones'; end if;
  if p_closes_at <= now() then raise exception 'La fecha de cierre tiene que ser futura'; end if;

  select number, ends_at into v_season, v_ends
  from public.seasons where group_id = p_group and closed_at is null;
  if v_season is null then raise exception 'El grupo no tiene ninguna semana abierta'; end if;
  if p_closes_at > v_ends then
    raise exception 'La apuesta debe cerrarse antes de que acabe la semana (%)', v_ends;
  end if;

  insert into public.markets (group_id, season_number, creator_id, title, description,
                              closes_at, stakes_public)
  values (p_group, v_season, v_uid, p_title, nullif(trim(coalesce(p_description, '')), ''),
          p_closes_at, coalesce(p_stakes_public, true))
  returning id into v_market;

  for v_opt in select * from jsonb_array_elements(p_options) loop
    v_i := v_i + 1;
    insert into public.market_options (market_id, label, position, opening_odds, current_odds)
    values (v_market, v_opt->>'label', v_i,
            round((v_opt->>'odds')::numeric, 2), round((v_opt->>'odds')::numeric, 2));
  end loop;

  return v_market;
end; $$;

-- ---------------------------------------------------------------- apostar
create or replace function public.place_wager(
  p_market uuid, p_option uuid, p_stake numeric
) returns uuid language plpgsql security definer set search_path = public as $$
declare
  v_uid     uuid := auth.uid();
  v_m       public.markets;
  v_odds    numeric;
  v_min     numeric;
  v_balance numeric;
  v_staked  numeric;
  v_worst   numeric;
  v_wager   uuid;
begin
  -- Se bloquea el mercado: dos apuestas simultaneas no pueden colarse
  -- saltandose el control de saldo ni el de arbitraje.
  select * into v_m from public.markets where id = p_market for update;
  if v_m.id is null then raise exception 'La apuesta no existe'; end if;
  if not public.is_member(v_m.group_id) then raise exception 'No perteneces a este grupo'; end if;
  if v_m.status <> 'open' then raise exception 'Esta apuesta ya no admite mas apostantes'; end if;
  if now() >= v_m.closes_at then raise exception 'Esta apuesta ya ha cerrado'; end if;

  select current_odds into v_odds
  from public.market_options where id = p_option and market_id = p_market;
  if v_odds is null then raise exception 'Opcion no valida'; end if;

  select min_stake into v_min from public.groups where id = v_m.group_id;
  p_stake := round(p_stake, 2);
  if p_stake < v_min then raise exception 'La apuesta minima es de % puntos', v_min; end if;

  select points into v_balance from public.balances
  where group_id = v_m.group_id and season_number = v_m.season_number and user_id = v_uid;
  if coalesce(v_balance, 0) < p_stake then raise exception 'No tienes puntos suficientes'; end if;

  -- ---- guardia anti-arbitraje (espejo de src/lib/engine/guard.ts) ----
  select coalesce(sum(stake), 0) into v_staked
  from public.wagers
  where market_id = p_market and user_id = v_uid and status = 'active';

  select min(ret) into v_worst from (
    select coalesce(sum(w.stake * w.locked_odds), 0)
           + case when o.id = p_option then p_stake * v_odds else 0 end as ret
    from public.market_options o
    left join public.wagers w
      on w.option_id = o.id and w.user_id = v_uid and w.status = 'active'
    where o.market_id = p_market
    group by o.id
  ) t;

  if v_worst > v_staked + p_stake + 0.000001 then
    raise exception 'Con esa cantidad ganarias pase lo que pase, y eso no vale. Baja la apuesta.'
      using errcode = 'P0002';
  end if;
  -- --------------------------------------------------------------------

  insert into public.wagers (market_id, option_id, user_id, stake, locked_odds, to_win)
  values (p_market, p_option, v_uid, p_stake, v_odds, round(p_stake * v_odds, 2))
  returning id into v_wager;

  update public.market_options set pool = pool + p_stake where id = p_option;

  perform public.apply_points(v_m.group_id, v_m.season_number, v_uid, -p_stake,
                              'wager_placed', p_market, v_wager, null);

  perform public.recompute_odds(p_market);
  return v_wager;
end; $$;

-- ---------------------------------------------------------------- anular apuesta fraudulenta
create or replace function public.void_wager(p_wager uuid, p_reason text)
returns void language plpgsql security definer set search_path = public as $$
declare
  v_uid uuid := auth.uid();
  v_w   public.wagers;
  v_m   public.markets;
begin
  select * into v_w from public.wagers where id = p_wager for update;
  if v_w.id is null then raise exception 'Esa apuesta no existe'; end if;

  select * into v_m from public.markets where id = v_w.market_id for update;
  if v_m.creator_id <> v_uid then
    raise exception 'Solo quien lanzo la apuesta puede anular apuestas de otros';
  end if;
  if v_w.status <> 'active' then raise exception 'Esa apuesta ya no esta activa'; end if;
  if v_m.status in ('resolved', 'cancelled') then
    raise exception 'La apuesta ya esta cerrada y pagada';
  end if;
  if coalesce(trim(p_reason), '') = '' then raise exception 'Hay que indicar el motivo'; end if;

  update public.wagers
     set status = 'voided', void_reason = p_reason, voided_by = v_uid, settled_at = now()
   where id = p_wager;

  update public.market_options set pool = greatest(0, pool - v_w.stake) where id = v_w.option_id;

  perform public.apply_points(v_m.group_id, v_m.season_number, v_w.user_id, v_w.stake,
                              'wager_void', v_m.id, v_w.id, p_reason);

  perform public.recompute_odds(v_m.id);
end; $$;
