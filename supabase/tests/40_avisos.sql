\set ON_ERROR_STOP on
set client_min_messages = notice;

-- Los avisos se comprueban sobre un grupo nuevo, para poder contarlos limpio.
insert into auth.users (id, email) values
  ('a1111111-1111-1111-1111-111111111111', 'ana@bet366.test'),
  ('a2222222-2222-2222-2222-222222222222', 'bruno@bet366.test'),
  ('a3333333-3333-3333-3333-333333333333', 'clara@bet366.test');

set test.uid = 'a1111111-1111-1111-1111-111111111111';
select public.create_group('Avisos', 1000, 0.5, 300, 24) as g \gset
select invite_code from public.groups where id = :'g' \gset
set test.uid = 'a2222222-2222-2222-2222-222222222222'; select public.join_group(:'invite_code');
set test.uid = 'a3333333-3333-3333-3333-333333333333'; select public.join_group(:'invite_code');
\set QUIET on
select set_config('test.g', :'g', false);
\set QUIET off

-- ================= lanzar apuesta: se entera el grupo, menos quien la lanza
set test.uid = 'a1111111-1111-1111-1111-111111111111';
select public.create_market(:'g', 'Ana se cae de la bici', null,
  now() + interval '3 hours', true,
  '[{"label":"Si","odds":2.0},{"label":"No","odds":2.0}]'::jsonb) as m \gset
select id from public.market_options where market_id = :'m' and position = 1 \gset o_si_
select id from public.market_options where market_id = :'m' and position = 2 \gset o_no_

select test.check('lanzar apuesta avisa a los demas, no a quien la lanza', (
  select count(*) = 2 and bool_and(user_id <> 'a1111111-1111-1111-1111-111111111111')
  from public.notifications where kind = 'market_opened' and market_id = :'m'));

-- ================= anular apuesta fraudulenta
set test.uid = 'a2222222-2222-2222-2222-222222222222';
select public.place_wager(:'m', :'o_si_id', 100) as w \gset
set test.uid = 'a3333333-3333-3333-3333-333333333333';
select public.place_wager(:'m', :'o_no_id', 80);

set test.uid = 'a1111111-1111-1111-1111-111111111111';
select public.void_wager(:'w', 'Apostado tarde');
select test.check('anular una apuesta avisa solo al afectado', (
  select count(*) = 1 and min(user_id::text) = 'a2222222-2222-2222-2222-222222222222'
  from public.notifications where kind = 'wager_voided' and market_id = :'m'));

-- ================= cierre por fecha: avisa al creador
update public.markets set closes_at = now() - interval '1 minute' where id = :'m';
select public.process_due(:'g');
select test.check('al cerrar por fecha se avisa al creador', (
  select count(*) = 1 and min(user_id::text) = 'a1111111-1111-1111-1111-111111111111'
  from public.notifications where kind = 'market_closed' and market_id = :'m'));

-- ================= resultado: avisa a quien tiene puntos en juego
select public.set_result(:'m', :'o_no_id', 'No se cayo');
select test.check('publicar resultado avisa a los apostantes', (
  select count(*) = 1 and min(user_id::text) = 'a3333333-3333-3333-3333-333333333333'
  from public.notifications where kind = 'result_published' and market_id = :'m'));

-- ================= impugnacion
set test.uid = 'a3333333-3333-3333-3333-333333333333';
select public.open_dispute(:'m', 'Si que se cayo, hay video');
select test.check('impugnar avisa al creador y no a quien impugna', (
  select count(*) = 1 and min(user_id::text) = 'a1111111-1111-1111-1111-111111111111'
  from public.notifications where kind = 'dispute_opened' and market_id = :'m'));

-- ================= pago
set test.uid = 'a1111111-1111-1111-1111-111111111111';
select public.cast_dispute_vote(:'m', :'o_no_id');
update public.disputes set closes_at = now() - interval '1 minute' where market_id = :'m';
select public.process_due(:'g');

select test.check('la apuesta queda resuelta', (
  select status from public.markets where id = :'m') = 'resolved');
select test.check('quien acierta recibe su aviso con la cantidad', (
  select count(*) = 1 and min(amount) > 0
  from public.notifications where kind = 'wager_won' and market_id = :'m'));
select test.check('no se avisa de una apuesta anulada como si se hubiera perdido', (
  select count(*) = 0 from public.notifications
  where kind = 'wager_lost' and market_id = :'m'
    and user_id = 'a2222222-2222-2222-2222-222222222222'));

-- ================= semana nueva
update public.seasons set ends_at = now() - interval '1 minute'
  where group_id = :'g' and closed_at is null;
select public.process_due(:'g');
select test.check('el reinicio semanal avisa a todo el grupo', (
  select count(*) = 3 from public.notifications where kind = 'season_rolled' and group_id = :'g'));

-- ================= privacidad y marcar leidos
set role authenticated;
set test.uid = 'a2222222-2222-2222-2222-222222222222';
select test.check('cada uno solo ve sus avisos', (
  select count(distinct user_id) <= 1 from public.notifications));
select test.check('hay avisos sin leer', (
  select count(*) > 0 from public.notifications where read_at is null));
select public.mark_notifications_read(current_setting('test.g')::uuid);
select test.check('marcar como leidos funciona', (
  select count(*) = 0 from public.notifications where read_at is null));

do $$ declare ok boolean := false; begin
  begin
    insert into public.notifications (group_id, user_id, kind, title)
    values (current_setting('test.g')::uuid, auth.uid(), 'wager_won', 'me invento un premio');
  exception when others then ok := true; end;
  perform test.check('no se pueden inventar avisos a mano', ok);
end $$;
reset role;
