-- =====================================================================
--  Cierre, resultado, impugnaciones, pago y reinicio semanal.
-- =====================================================================

-- ---------------------------------------------------------------- pago
-- Reparte los puntos de un mercado. p_option null = anular y devolver.
create or replace function public.settle_market(
  p_market uuid, p_option uuid, p_reason text default null
) returns void language plpgsql security definer set search_path = public as $$
declare
  v_m public.markets;
  v_w public.wagers;
begin
  select * into v_m from public.markets where id = p_market for update;
  if v_m.status in ('resolved', 'cancelled') then return; end if;

  if p_option is null then
    -- Anulada: cada uno recupera lo suyo.
    for v_w in select * from public.wagers where market_id = p_market and status = 'active' loop
      update public.wagers set status = 'refunded', settled_at = now() where id = v_w.id;
      perform public.apply_points(v_m.group_id, v_m.season_number, v_w.user_id, v_w.stake,
                                  'wager_refund', p_market, v_w.id, p_reason);
    end loop;
    update public.markets
       set status = 'cancelled', resolved_at = now(),
           cancel_reason = p_reason, winning_option = null
     where id = p_market;
    return;
  end if;

  for v_w in select * from public.wagers where market_id = p_market and status = 'active' loop
    if v_w.option_id = p_option then
      update public.wagers set status = 'won', settled_at = now() where id = v_w.id;
      -- Sin banca: se cobra apuesta x cuota bloqueada.
      perform public.apply_points(v_m.group_id, v_m.season_number, v_w.user_id, v_w.to_win,
                                  'wager_won', p_market, v_w.id, null);
    else
      update public.wagers set status = 'lost', settled_at = now() where id = v_w.id;
    end if;
  end loop;

  update public.markets
     set status = 'resolved', winning_option = p_option, resolved_at = now()
   where id = p_market;
end; $$;

-- ---------------------------------------------------------------- cerrar a mano
create or replace function public.close_market(p_market uuid)
returns void language plpgsql security definer set search_path = public as $$
declare v_m public.markets;
begin
  select * into v_m from public.markets where id = p_market for update;
  if v_m.creator_id <> auth.uid() then raise exception 'Solo el creador puede cerrar la apuesta'; end if;
  if v_m.status <> 'open' then raise exception 'La apuesta ya no esta abierta'; end if;
  update public.markets set status = 'closed', closes_at = least(closes_at, now()) where id = p_market;
end; $$;

create or replace function public.cancel_market(p_market uuid, p_reason text)
returns void language plpgsql security definer set search_path = public as $$
declare v_m public.markets;
begin
  select * into v_m from public.markets where id = p_market;
  if v_m.creator_id <> auth.uid() then raise exception 'Solo el creador puede anular la apuesta'; end if;
  if v_m.status in ('resolved', 'cancelled') then raise exception 'La apuesta ya esta cerrada'; end if;
  perform public.settle_market(p_market, null, coalesce(nullif(trim(p_reason), ''), 'Anulada por el creador'));
end; $$;

-- ---------------------------------------------------------------- publicar resultado
create or replace function public.set_result(p_market uuid, p_option uuid, p_note text default null)
returns void language plpgsql security definer set search_path = public as $$
declare
  v_m     public.markets;
  v_hours int;
  v_bets  int;
begin
  select * into v_m from public.markets where id = p_market for update;
  if v_m.id is null then raise exception 'La apuesta no existe'; end if;
  if v_m.creator_id <> auth.uid() then raise exception 'Solo el creador publica el resultado'; end if;
  if v_m.status not in ('closed', 'pending') then
    raise exception 'Todavia no se puede publicar el resultado';
  end if;
  if not exists (select 1 from public.market_options where id = p_option and market_id = p_market) then
    raise exception 'Opcion no valida';
  end if;

  select dispute_hours into v_hours from public.groups where id = v_m.group_id;
  select count(*) into v_bets from public.wagers where market_id = p_market and status = 'active';

  update public.markets
     set winning_option = p_option,
         result_note    = nullif(trim(coalesce(p_note, '')), ''),
         result_set_at  = now(),
         status         = 'pending',
         dispute_until  = now() + make_interval(hours => v_hours)
   where id = p_market;

  -- Si no ha apostado nadie no hay nada que impugnar: se cierra en el acto.
  if v_bets = 0 then
    perform public.settle_market(p_market, p_option, null);
  end if;
end; $$;

-- ---------------------------------------------------------------- impugnar
create or replace function public.open_dispute(p_market uuid, p_reason text)
returns void language plpgsql security definer set search_path = public as $$
declare
  v_m     public.markets;
  v_uid   uuid := auth.uid();
  v_hours int;
begin
  select * into v_m from public.markets where id = p_market for update;
  if v_m.status <> 'pending' then raise exception 'Ahora mismo no se puede impugnar'; end if;
  if now() > v_m.dispute_until then raise exception 'El plazo para impugnar ya ha pasado'; end if;
  if not exists (select 1 from public.wagers
                 where market_id = p_market and user_id = v_uid and status = 'active') then
    raise exception 'Solo puede impugnar quien tenga puntos en juego';
  end if;

  select dispute_hours into v_hours from public.groups where id = v_m.group_id;

  insert into public.disputes (market_id, opened_by, reason, closes_at)
  values (p_market, v_uid, p_reason, now() + make_interval(hours => v_hours))
  on conflict (market_id) do nothing;

  update public.markets set status = 'disputed' where id = p_market;

  -- El creador mantiene su version como primer voto.
  insert into public.dispute_votes (market_id, user_id, option_id)
  values (p_market, v_m.creator_id, v_m.winning_option)
  on conflict (market_id, user_id) do nothing;
end; $$;

-- Vota cualquier miembro del grupo. option_id null = anular y devolver puntos.
create or replace function public.cast_dispute_vote(p_market uuid, p_option uuid)
returns void language plpgsql security definer set search_path = public as $$
declare v_m public.markets;
begin
  select * into v_m from public.markets where id = p_market;
  if v_m.status <> 'disputed' then raise exception 'Esta apuesta no esta en votacion'; end if;
  if not public.is_member(v_m.group_id) then raise exception 'No perteneces a este grupo'; end if;
  if p_option is not null and not exists (
       select 1 from public.market_options where id = p_option and market_id = p_market) then
    raise exception 'Opcion no valida';
  end if;

  insert into public.dispute_votes (market_id, user_id, option_id, voted_at)
  values (p_market, auth.uid(), p_option, now())
  on conflict (market_id, user_id)
  do update set option_id = excluded.option_id, voted_at = now();
end; $$;

-- Cuenta los votos y cierra. Empate o mayoria de "anular" => se devuelve todo.
create or replace function public.resolve_dispute(p_market uuid)
returns void language plpgsql security definer set search_path = public as $$
declare
  v_top_option uuid;
  v_top_votes  int;
  v_ties       int;
  v_void_votes int;
begin
  select option_id, cnt into v_top_option, v_top_votes
  from (
    select option_id, count(*) as cnt
    from public.dispute_votes
    where market_id = p_market and option_id is not null
    group by option_id
  ) t
  order by cnt desc limit 1;

  select count(*) into v_void_votes
  from public.dispute_votes where market_id = p_market and option_id is null;

  if v_top_option is null or v_void_votes >= coalesce(v_top_votes, 0) then
    perform public.settle_market(p_market, null, 'Anulada por votacion del grupo');
    return;
  end if;

  select count(*) into v_ties from (
    select count(*) as cnt from public.dispute_votes
    where market_id = p_market and option_id is not null
    group by option_id having count(*) = v_top_votes
  ) t;

  if v_ties > 1 then
    perform public.settle_market(p_market, null, 'Empate en la votacion: puntos devueltos');
  else
    perform public.settle_market(p_market, v_top_option, null);
  end if;
end; $$;

-- ---------------------------------------------------------------- reinicio semanal
create or replace function public.roll_season(p_group uuid)
returns void language plpgsql security definer set search_path = public as $$
declare
  v_season int;
  v_ends   timestamptz;
  v_start  numeric;
  v_m      uuid;
  v_member record;
begin
  select number, ends_at into v_season, v_ends
  from public.seasons where group_id = p_group and closed_at is null for update;
  if v_season is null or now() < v_ends then return; end if;

  select starting_points into v_start from public.groups where id = p_group;

  -- Lo que quede sin resolver se anula y se devuelve.
  for v_m in select id from public.markets
             where group_id = p_group and season_number = v_season
               and status not in ('resolved', 'cancelled') loop
    perform public.settle_market(v_m, null, 'La semana termino sin resultado: puntos devueltos');
  end loop;

  -- Foto del ranking de la semana.
  insert into public.season_results (group_id, season_number, user_id, position, points, wagers_won, wagers_total)
  select p_group, v_season, b.user_id,
         rank() over (order by b.points desc),
         b.points,
         (select count(*) from public.wagers w join public.markets m on m.id = w.market_id
           where m.group_id = p_group and m.season_number = v_season
             and w.user_id = b.user_id and w.status = 'won'),
         (select count(*) from public.wagers w join public.markets m on m.id = w.market_id
           where m.group_id = p_group and m.season_number = v_season
             and w.user_id = b.user_id and w.status in ('won', 'lost'))
  from public.balances b
  where b.group_id = p_group and b.season_number = v_season
  on conflict do nothing;

  update public.seasons set closed_at = now() where group_id = p_group and number = v_season;

  -- Semana nueva: todos vuelven a empezar con los mismos puntos.
  insert into public.seasons (group_id, number, starts_at, ends_at)
  values (p_group, v_season + 1, v_ends, v_ends + interval '1 week');

  for v_member in select user_id from public.group_members where group_id = p_group loop
    perform public.apply_points(p_group, v_season + 1, v_member.user_id, v_start,
                                'season_start', null, null, 'Puntos iniciales de la semana');
  end loop;
end; $$;

-- ---------------------------------------------------------------- tareas pendientes
-- Se llama al abrir el grupo (y opcionalmente desde pg_cron): cierra lo que
-- toque por fecha, paga lo que ya ha pasado su plazo y reinicia la semana.
create or replace function public.process_due(p_group uuid)
returns void language plpgsql security definer set search_path = public as $$
declare r record;
begin
  update public.markets
     set status = 'closed'
   where group_id = p_group and status = 'open' and now() >= closes_at;

  for r in select id, winning_option from public.markets
           where group_id = p_group and status = 'pending' and now() >= dispute_until loop
    perform public.settle_market(r.id, r.winning_option, null);
  end loop;

  for r in select m.id from public.markets m
           join public.disputes d on d.market_id = m.id
           where m.group_id = p_group and m.status = 'disputed' and now() >= d.closes_at loop
    perform public.resolve_dispute(r.id);
  end loop;

  perform public.roll_season(p_group);
end; $$;

-- Para todos los grupos (util con pg_cron: select cron.schedule('*/5 * * * *', 'select public.process_all_due()'))
create or replace function public.process_all_due()
returns void language plpgsql security definer set search_path = public as $$
declare g uuid;
begin
  for g in select id from public.groups loop
    perform public.process_due(g);
  end loop;
end; $$;
