\set ON_ERROR_STOP on
set client_min_messages = notice;

-- Un quinto usuario que NO pertenece al grupo.
insert into auth.users (id, email) values ('55555555-5555-5555-5555-555555555555','extrano@fuera.test');

set test.uid = '11111111-1111-1111-1111-111111111111';
select id as gid from public.groups limit 1 \gset

-- Mercado con apostantes PRIVADOS
select public.create_market(:'gid', 'Apuesta con apostantes ocultos', null,
  now() + interval '5 hours', false,
  '[{"label":"Si","odds":2.0},{"label":"No","odds":2.0}]'::jsonb) as mp \gset
select id from public.market_options where market_id = :'mp' and position = 1 \gset op_si_

set test.uid = '22222222-2222-2222-2222-222222222222';
select public.place_wager(:'mp', :'op_si_id', 50);
set test.uid = '33333333-3333-3333-3333-333333333333';
select public.place_wager(:'mp', :'op_si_id', 60);

-- Mercado con apostantes PUBLICOS
set test.uid = '11111111-1111-1111-1111-111111111111';
select public.create_market(:'gid', 'Apuesta con apostantes a la vista', null,
  now() + interval '5 hours', true,
  '[{"label":"Si","odds":2.0},{"label":"No","odds":2.0}]'::jsonb) as mv \gset
select id from public.market_options where market_id = :'mv' and position = 1 \gset ov_si_
set test.uid = '22222222-2222-2222-2222-222222222222';
select public.place_wager(:'mv', :'ov_si_id', 50);
set test.uid = '33333333-3333-3333-3333-333333333333';
select public.place_wager(:'mv', :'ov_si_id', 60);

\set QUIET on
select set_config('test.mp', :'mp', false), set_config('test.mv', :'mv', false),
       set_config('test.gid', :'gid', false);
\set QUIET off

-- ================= ahora se mira todo como usuario normal (RLS activo) =================
set role authenticated;

set test.uid = '33333333-3333-3333-3333-333333333333';
select test.check('privada: un miembro solo ve SUS apuestas',
  (select count(*) from public.wagers where market_id = current_setting('test.mp')::uuid) = 1);
select test.check('publica: un miembro ve las de todos',
  (select count(*) from public.wagers where market_id = current_setting('test.mv')::uuid) = 2);
select test.check('el bote agregado se ve siempre',
  (select pool from public.market_options
    where market_id = current_setting('test.mp')::uuid and position = 1) = 110);

set test.uid = '11111111-1111-1111-1111-111111111111';
select test.check('privada: el creador si ve todas (para detectar fraude)',
  (select count(*) from public.wagers where market_id = current_setting('test.mp')::uuid) = 2);

set test.uid = '55555555-5555-5555-5555-555555555555';
select test.check('de fuera del grupo no se ve el grupo',
  (select count(*) from public.groups) = 0);
select test.check('de fuera del grupo no se ven las apuestas',
  (select count(*) from public.markets) = 0);
select test.check('de fuera del grupo no se ven saldos',
  (select count(*) from public.balances) = 0);
select test.check('de fuera del grupo no se ven perfiles ajenos',
  (select count(*) from public.profiles) = 1);

set test.uid = '22222222-2222-2222-2222-222222222222';
select test.check('mi historial de puntos es solo mio',
  (select count(distinct user_id) from public.ledger) <= 1);

-- Escritura directa: prohibida, aunque se intente saltar las funciones.
do $$ declare ok boolean := false; begin
  begin
    update public.balances set points = 999999
     where user_id = '22222222-2222-2222-2222-222222222222';
  exception when others then ok := true; end;
  perform test.check('no se puede regalar puntos escribiendo en la tabla', ok);
end $$;

do $$ declare ok boolean := false; begin
  begin
    insert into public.wagers (market_id, option_id, user_id, stake, locked_odds, to_win)
    values (current_setting('test.mv')::uuid, current_setting('test.mv')::uuid,
            '22222222-2222-2222-2222-222222222222', 1, 50, 50);
  exception when others then ok := true; end;
  perform test.check('no se pueden insertar apuestas a mano con cuota inventada', ok);
end $$;

do $$ declare ok boolean := false; begin
  begin perform public.settle_market(current_setting('test.mv')::uuid, null, 'hala');
  exception when others then ok := true; end;
  perform test.check('las funciones internas de pago no son invocables', ok);
end $$;

reset role;
