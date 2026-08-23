-- =====================================================================
-- El codigo de invitacion.
--
-- Es la unica pieza del grupo que sale de la base y luego vuelve escrita a
-- mano por otra persona, asi que tiene que sobrevivir al viaje: el campo de
-- la app filtra lo que escribes con [A-Z0-9], de forma que un codigo con
-- cualquier otro caracter es un grupo en el que nadie puede entrar.
--
-- Estas pruebas corren con pgcrypto fuera de `public` (ver el stub), que es
-- como esta montado Supabase de verdad.
-- =====================================================================
\set ON_ERROR_STOP on
set client_min_messages = notice;

insert into auth.users (id, email) values
  ('c1111111-1111-1111-1111-111111111111', 'javi@bet366.test'),
  ('c2222222-2222-2222-2222-222222222222', 'lucia@bet366.test');

-- ============================== crear un grupo funciona sin depender de pgcrypto
set test.uid = 'c1111111-1111-1111-1111-111111111111';
select public.create_group('Codigos', 1000, 0.5, 300, 24) as g \gset
select test.check('se puede crear un grupo con pgcrypto fuera de public', :'g' is not null);

-- ============================== el codigo es escribible tal cual en la app
select invite_code as code from public.groups where id = :'g' \gset
select test.check(
  'el codigo son seis caracteres de [A-Z0-9]',
  :'code' ~ '^[A-Z0-9]{6}$');

-- ============================== y no trae letras que se confunden al dictarlo
select test.check(
  'el codigo no lleva O/0 ni I/1',
  :'code' !~ '[O0I1]');

-- ============================== doscientos mas, para ver que no es suerte
do $$
declare v_i int; begin
  for v_i in 1..200 loop
    perform public.create_group('Codigos ' || v_i, 1000, 0.5, 300, 24);
  end loop;
end $$;

select test.check(
  'ninguno de los 201 codigos se sale del alfabeto',
  (select count(*) from public.groups
    where name like 'Codigos%' and invite_code !~ '^[ABCDEFGHJKLMNPQRSTUVWXYZ23456789]{6}$') = 0);

select test.check(
  'no se repite ninguno',
  (select count(*) = count(distinct invite_code) from public.groups where name like 'Codigos%'));

-- ============================== y con ese codigo se entra de verdad
set test.uid = 'c2222222-2222-2222-2222-222222222222';
select public.join_group(:'code') as entrada \gset
select test.check('con el codigo tal cual sale se entra al grupo', :'entrada' = :'g');

select test.check(
  'quien entra recibe los puntos de partida',
  (select points from public.balances
    where group_id = :'g' and user_id = 'c2222222-2222-2222-2222-222222222222') = 1000);

-- ============================== y el codigo se puede teclear en minusculas
select test.check(
  'el codigo no distingue mayusculas al entrar',
  public.join_group(lower(:'code')) = :'g');
