\set ON_ERROR_STOP on
\pset pager off
set client_min_messages = notice;

grant usage on schema test to authenticated;
create or replace function test.check(p_label text, p_cond boolean) returns void
language plpgsql as $$ begin
  if p_cond then raise notice 'OK   %', p_label;
  else raise exception 'FALLO: %', p_label; end if;
end $$;

-- Devuelve true si place_wager rechaza la apuesta por arbitraje.
create or replace function test.rejects_arbitrage(m uuid, o uuid, s numeric) returns boolean
language plpgsql as $$ begin
  perform public.place_wager(m, o, s);
  return false;
exception when sqlstate 'P0002' then return true;
end $$;

insert into auth.users (id, email) values
  ('11111111-1111-1111-1111-111111111111', 'javi@bet366.test'),
  ('22222222-2222-2222-2222-222222222222', 'lucia@bet366.test'),
  ('33333333-3333-3333-3333-333333333333', 'marcos@bet366.test'),
  ('44444444-4444-4444-4444-444444444444', 'tramposo@bet366.test');
select test.check('el alta de usuario crea perfil solo', (select count(*) from public.profiles) = 4);
select test.check('a cada perfil se le reparte un emblema valido', (
  select bool_and(avatar_symbol is not null and avatar_color is not null) from public.profiles));

-- ======================================================= grupo y miembros
set test.uid = '11111111-1111-1111-1111-111111111111';
select public.create_group('Los de siempre', 1000, 0.5, 300, 24) as gid \gset
select invite_code from public.groups where id = :'gid' \gset

set test.uid = '22222222-2222-2222-2222-222222222222'; select public.join_group(:'invite_code');
set test.uid = '33333333-3333-3333-3333-333333333333'; select public.join_group(:'invite_code');
set test.uid = '44444444-4444-4444-4444-444444444444'; select public.join_group(:'invite_code');

select test.check('todos arrancan con los mismos puntos',
  (select count(*) from public.balances where group_id = :'gid' and points = 1000) = 4);
select test.check('el codigo de invitacion no repetido es rechazado',
  (select count(*) from public.group_members where group_id = :'gid') = 4);

-- La semana que abre `create_group` acaba el lunes que viene, asi que en
-- domingo dura horas. Las apuestas de mas abajo cierran a dias vista y
-- chocaban con eso: la suite fallaba entera un dia de cada siete. Aqui se
-- estira la semana para que estas pruebas no dependan de que dia se corran;
-- el reinicio semanal tiene su propia prueba en 20_, que la acorta a mano.
update public.seasons set ends_at = now() + interval '30 days'
where group_id = :'gid' and closed_at is null;

-- ======================================================= crear apuesta
set test.uid = '11111111-1111-1111-1111-111111111111';
select public.create_market(:'gid', 'Fulanito se lia con Menganito', 'Antes de que acabe la fiesta',
  now() + interval '2 days', true,
  '[{"label":"Si","odds":1.90},{"label":"No","odds":1.90}]'::jsonb) as mid \gset
select id from public.market_options where market_id = :'mid' and position = 1 \gset opt_si_
select id from public.market_options where market_id = :'mid' and position = 2 \gset opt_no_

select test.check('sin volumen, las cuotas son exactamente las del creador',
  (select count(*) from public.market_options where market_id = :'mid' and current_odds = 1.90) = 2);

-- ======================================================= apostar
set test.uid = '22222222-2222-2222-2222-222222222222';
select public.place_wager(:'mid', :'opt_si_id', 300) as w_lucia_si \gset
set test.uid = '33333333-3333-3333-3333-333333333333';
select public.place_wager(:'mid', :'opt_si_id', 200) as w_marcos_si \gset

select test.check('el saldo baja al apostar',
  (select points from public.balances where user_id = '22222222-2222-2222-2222-222222222222'
     and group_id = :'gid') = 700);
select test.check('cada apuesta bloquea la cuota del momento',
  (select locked_odds from public.wagers where id = :'w_lucia_si') = 1.90
  and (select locked_odds from public.wagers where id = :'w_marcos_si') < 1.90);
select test.check('la cuota del Si baja al entrar dinero',
  (select current_odds from public.market_options where id = :'opt_si_id') < 1.90);
select test.check('la cuota del No sube en compensacion',
  (select current_odds from public.market_options where id = :'opt_no_id') > 1.90);

-- ======================================================= guardia anti-arbitraje
-- Lucia tiene 300 al Si a 1.90 (retorno 570). El No esta ahora a ~2.76.
-- Cubrir con ~171..269 al No le daria beneficio pase lo que pase.
set test.uid = '22222222-2222-2222-2222-222222222222';
select test.check('rechaza el arbitraje clasico (200 al No)',
  test.rejects_arbitrage(:'mid', :'opt_no_id', 200));
select test.check('rechaza tambien el borde superior del rango (269)',
  test.rejects_arbitrage(:'mid', :'opt_no_id', 269));
select test.check('permite cubrirse por debajo del rango (100)',
  not test.rejects_arbitrage(:'mid', :'opt_no_id', 100));

-- Comprobacion directa del invariante para todos los usuarios del mercado.
select test.check('invariante: peor escenario <= puntos arriesgados', not exists (
  select 1 from (
    select w.user_id,
           sum(w.stake) as staked,
           min(ret.total) as worst
    from public.wagers w
    join lateral (
      select o.id, coalesce((select sum(w2.stake * w2.locked_odds) from public.wagers w2
                             where w2.option_id = o.id and w2.user_id = w.user_id and w2.status='active'), 0) as total
      from public.market_options o where o.market_id = w.market_id
    ) ret on true
    where w.market_id = :'mid' and w.status = 'active'
    group by w.user_id
  ) x where x.worst > x.staked + 0.000001
));

-- ======================================================= anular apuesta fraudulenta
set test.uid = '44444444-4444-4444-4444-444444444444';
select public.place_wager(:'mid', :'opt_si_id', 500) as fraude \gset
set test.uid = '33333333-3333-3333-3333-333333333333';
do $$ declare ok boolean := false; begin
  begin perform public.void_wager(current_setting('test.fraude')::uuid, 'me da la gana');
  exception when others then ok := true; end;
  perform test.check('un miembro cualquiera no puede anular apuestas ajenas', ok);
end $$;
\set QUIET on
select set_config('test.fraude', :'fraude', false);
\set QUIET off

set test.uid = '11111111-1111-1111-1111-111111111111';
select public.void_wager(:'fraude', 'Apostado 30 segundos despues de que ya hubiera pasado');
select test.check('al anular se devuelven los puntos',
  (select points from public.balances where user_id = '44444444-4444-4444-4444-444444444444'
     and group_id = :'gid') = 1000);
select test.check('la apuesta anulada queda marcada con motivo',
  (select status = 'voided' and void_reason is not null from public.wagers where id = :'fraude'));
select test.check('el bote descuenta la apuesta anulada',
  (select pool from public.market_options where id = :'opt_si_id') = 500);

-- ======================================================= cierre y resultado
set test.uid = '11111111-1111-1111-1111-111111111111';
select public.close_market(:'mid');
select test.check('la apuesta pasa a cerrada', (select status from public.markets where id = :'mid') = 'closed');

set test.uid = '22222222-2222-2222-2222-222222222222';
do $$ declare ok boolean := false; begin
  begin perform public.set_result(current_setting('test.mid')::uuid,
                                  current_setting('test.opt_si')::uuid, 'yo lo digo');
  exception when others then ok := true; end;
  perform test.check('solo el creador publica el resultado', ok);
end $$;
\set QUIET on
select set_config('test.mid', :'mid', false), set_config('test.opt_si', :'opt_si_id', false);
\set QUIET off

set test.uid = '11111111-1111-1111-1111-111111111111';
select public.set_result(:'mid', :'opt_si_id', 'Lo vio todo el mundo');
select test.check('el resultado abre la ventana de impugnacion',
  (select status = 'pending' and dispute_until > now() from public.markets where id = :'mid'));
select test.check('todavia no se ha pagado nada',
  (select count(*) from public.wagers where market_id = :'mid' and status = 'won') = 0);

-- ======================================================= pago automatico
select points as bal_marcos_pre from public.balances
  where user_id = '33333333-3333-3333-3333-333333333333' and group_id = :'gid' \gset
select to_win as marcos_to_win from public.wagers where id = :'w_marcos_si' \gset

update public.markets set dispute_until = now() - interval '1 minute' where id = :'mid';
select public.process_due(:'gid');

select test.check('pasado el plazo sin impugnar, se resuelve sola',
  (select status from public.markets where id = :'mid') = 'resolved');
select test.check('el ganador cobra apuesta x cuota bloqueada',
  (select points from public.balances where user_id = '33333333-3333-3333-3333-333333333333'
     and group_id = :'gid') = :bal_marcos_pre + :marcos_to_win);
select test.check('el que fallo no recupera nada', (select status from public.wagers
  where market_id = :'mid' and user_id = '22222222-2222-2222-2222-222222222222'
    and option_id = :'opt_no_id') = 'lost');
select test.check('cada movimiento queda en el libro',
  (select count(*) from public.ledger where market_id = :'mid' and kind = 'wager_won') = 2);
grant execute on all functions in schema test to authenticated;
