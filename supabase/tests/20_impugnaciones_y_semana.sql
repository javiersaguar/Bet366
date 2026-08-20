\set ON_ERROR_STOP on
set client_min_messages = notice;

-- ======================================================= impugnacion y votacion
set test.uid = '11111111-1111-1111-1111-111111111111';
select id as gid from public.groups limit 1 \gset
\set QUIET on
select set_config('test.gid', :'gid', false);
\set QUIET off

select public.create_market(:'gid', 'Quien cae primero en la piscina', null,
  now() + interval '1 day', true,
  '[{"label":"Juan","odds":3.0},{"label":"Pedro","odds":3.0},{"label":"Maria","odds":3.0}]'::jsonb) as m2 \gset
select id from public.market_options where market_id = :'m2' and position = 1 \gset o_juan_
select id from public.market_options where market_id = :'m2' and position = 2 \gset o_pedro_

set test.uid = '22222222-2222-2222-2222-222222222222';
select public.place_wager(:'m2', :'o_juan_id', 100);
set test.uid = '33333333-3333-3333-3333-333333333333';
select public.place_wager(:'m2', :'o_pedro_id', 100);
set test.uid = '44444444-4444-4444-4444-444444444444';
select public.place_wager(:'m2', :'o_pedro_id', 150);

set test.uid = '11111111-1111-1111-1111-111111111111';
select public.close_market(:'m2');
select public.set_result(:'m2', :'o_juan_id', 'Cayo Juan');

-- alguien sin puntos en juego no puede impugnar
set test.uid = '11111111-1111-1111-1111-111111111111';
do $$ declare ok boolean := false; begin
  begin perform public.open_dispute(current_setting('test.m2')::uuid, 'no me cuadra');
  exception when others then ok := true; end;
  perform test.check('sin puntos en juego no se puede impugnar', ok);
end $$;
\set QUIET on
select set_config('test.m2', :'m2', false);
\set QUIET off

set test.uid = '33333333-3333-3333-3333-333333333333';
select public.open_dispute(:'m2', 'Que va, el primero fue Pedro, hay video');
select test.check('la impugnacion pasa la apuesta a votacion',
  (select status from public.markets where id = :'m2') = 'disputed');
select test.check('el creador mantiene su version como primer voto',
  (select option_id from public.dispute_votes where market_id = :'m2'
     and user_id = '11111111-1111-1111-1111-111111111111') = :'o_juan_id');

set test.uid = '33333333-3333-3333-3333-333333333333'; select public.cast_dispute_vote(:'m2', :'o_pedro_id');
set test.uid = '44444444-4444-4444-4444-444444444444'; select public.cast_dispute_vote(:'m2', :'o_pedro_id');
set test.uid = '22222222-2222-2222-2222-222222222222'; select public.cast_dispute_vote(:'m2', :'o_juan_id');
-- Lucia se lo repiensa: el voto se puede cambiar mientras dure la votacion
select public.cast_dispute_vote(:'m2', :'o_pedro_id');
select test.check('se puede cambiar el voto',
  (select count(*) from public.dispute_votes where market_id = :'m2') = 4
  and (select option_id from public.dispute_votes where market_id = :'m2'
        and user_id = '22222222-2222-2222-2222-222222222222') = :'o_pedro_id');

update public.disputes set closes_at = now() - interval '1 minute' where market_id = :'m2';
select public.process_due(:'gid');

select test.check('la votacion vuelca el resultado del creador',
  (select winning_option from public.markets where id = :'m2') = :'o_pedro_id');
select test.check('cobran los que votaron... digo, los que acertaron',
  (select count(*) from public.wagers where market_id = :'m2' and status = 'won') = 2);
select test.check('el que fallo lo pierde',
  (select count(*) from public.wagers where market_id = :'m2' and status = 'lost') = 1);

-- ======================================================= empate => devolucion
set test.uid = '11111111-1111-1111-1111-111111111111';
select public.create_market(:'gid', 'Llueve el sabado por la noche', null,
  now() + interval '1 day', true,
  '[{"label":"Si","odds":2.0},{"label":"No","odds":2.0}]'::jsonb) as m3 \gset
select id from public.market_options where market_id = :'m3' and position = 1 \gset o3_si_
select id from public.market_options where market_id = :'m3' and position = 2 \gset o3_no_

set test.uid = '22222222-2222-2222-2222-222222222222';
select points as bal_pre from public.balances
  where user_id = '22222222-2222-2222-2222-222222222222' and group_id = :'gid' \gset
select public.place_wager(:'m3', :'o3_si_id', 100);

set test.uid = '11111111-1111-1111-1111-111111111111';
select public.close_market(:'m3');
select public.set_result(:'m3', :'o3_si_id', null);
set test.uid = '22222222-2222-2222-2222-222222222222';
select public.open_dispute(:'m3', 'no llovio');
select public.cast_dispute_vote(:'m3', :'o3_no_id');   -- 1 voto No
-- creador ya tiene 1 voto Si => empate
update public.disputes set closes_at = now() - interval '1 minute' where market_id = :'m3';
select public.process_due(:'gid');

select test.check('empate en la votacion => apuesta anulada',
  (select status from public.markets where id = :'m3') = 'cancelled');
select test.check('empate => todos recuperan sus puntos',
  (select points from public.balances where user_id = '22222222-2222-2222-2222-222222222222'
     and group_id = :'gid') = :bal_pre);

-- ======================================================= reinicio semanal
set test.uid = '11111111-1111-1111-1111-111111111111';
select public.create_market(:'gid', 'Apuesta que se queda sin resolver', null,
  now() + interval '1 hour', true,
  '[{"label":"Si","odds":2.0},{"label":"No","odds":2.0}]'::jsonb) as m4 \gset
select id from public.market_options where market_id = :'m4' and position = 1 \gset o4_si_
set test.uid = '33333333-3333-3333-3333-333333333333';
select points as marcos_pre_roll from public.balances
  where user_id = '33333333-3333-3333-3333-333333333333' and group_id = :'gid' \gset
select public.place_wager(:'m4', :'o4_si_id', 77);

update public.seasons set ends_at = now() - interval '1 minute'
  where group_id = :'gid' and closed_at is null;
select public.process_due(:'gid');

select test.check('la semana se cierra y se abre la siguiente',
  (select count(*) from public.seasons where group_id = :'gid') = 2
  and (select number from public.seasons where group_id = :'gid' and closed_at is null) = 2);
select test.check('lo que quedo sin resolver se anula',
  (select status from public.markets where id = :'m4') = 'cancelled');
select test.check('el ranking de la semana queda guardado',
  (select count(*) from public.season_results where group_id = :'gid' and season_number = 1) = 4);
select test.check('el ranking respeta el orden de puntos', (select bool_and(ok) from (
  select (lag(points) over (order by position) >= points) is not false as ok
  from public.season_results where group_id = :'gid' and season_number = 1) t));
select test.check('todos vuelven a empezar con los mismos puntos',
  (select count(*) from public.balances where group_id = :'gid' and season_number = 2 and points = 1000) = 4);
set test.uid = '11111111-1111-1111-1111-111111111111';
do $$ declare ok boolean := false; v_ends timestamptz; begin
  select ends_at into v_ends from public.seasons
   where group_id = current_setting('test.gid')::uuid and closed_at is null;
  begin
    perform public.create_market(current_setting('test.gid')::uuid, 'Apuesta que se pasa de semana',
      null, v_ends + interval '1 day', true,
      '[{"label":"Si","odds":2.0},{"label":"No","odds":2.0}]'::jsonb);
  exception when others then ok := true; end;
  perform test.check('no se puede lanzar una apuesta que cierre despues de la semana', ok);
end $$;

-- doble llamada a process_due no debe pagar dos veces
select public.process_due(:'gid');
select public.process_due(:'gid');
select test.check('process_due es idempotente: no paga dos veces',
  (select count(*) from public.ledger where kind = 'wager_won') =
  (select count(*) from public.wagers where status = 'won'));
