-- =====================================================================
--  Row Level Security.
--  Regla general: leer solo lo de tus grupos; escribir solo por funcion.
-- =====================================================================

alter table public.profiles       enable row level security;
alter table public.groups         enable row level security;
alter table public.group_members  enable row level security;
alter table public.seasons        enable row level security;
alter table public.balances       enable row level security;
alter table public.season_results enable row level security;
alter table public.markets        enable row level security;
alter table public.market_options enable row level security;
alter table public.wagers         enable row level security;
alter table public.disputes       enable row level security;
alter table public.dispute_votes  enable row level security;
alter table public.ledger         enable row level security;

-- ---------------------------------------------------------------- perfiles
create policy "perfil propio: editar" on public.profiles
  for update using (id = auth.uid()) with check (id = auth.uid());
create policy "perfil propio: crear" on public.profiles
  for insert with check (id = auth.uid());
create policy "perfiles visibles a companeros de grupo" on public.profiles
  for select using (
    id = auth.uid()
    or exists (
      select 1
      from public.group_members mine
      join public.group_members theirs on theirs.group_id = mine.group_id
      where mine.user_id = auth.uid() and theirs.user_id = public.profiles.id
    )
  );

-- ---------------------------------------------------------------- grupos
create policy "ver mis grupos" on public.groups
  for select using (public.is_member(id));
create policy "ver miembros de mis grupos" on public.group_members
  for select using (public.is_member(group_id));
create policy "salirme de un grupo" on public.group_members
  for delete using (user_id = auth.uid());

-- ---------------------------------------------------------------- semanas y saldos
create policy "ver semanas de mis grupos" on public.seasons
  for select using (public.is_member(group_id));
create policy "ver saldos de mis grupos" on public.balances
  for select using (public.is_member(group_id));
create policy "ver rankings de mis grupos" on public.season_results
  for select using (public.is_member(group_id));
create policy "ver mi historial de puntos" on public.ledger
  for select using (user_id = auth.uid() and public.is_member(group_id));

-- ---------------------------------------------------------------- apuestas
create policy "ver apuestas de mis grupos" on public.markets
  for select using (public.is_member(group_id));

create policy "ver opciones de mis grupos" on public.market_options
  for select using (
    exists (select 1 from public.markets m
            where m.id = market_id and public.is_member(m.group_id))
  );

-- Aqui entra la opcion "apostantes publicos o privados":
-- si el creador la marco privada, cada uno solo ve las suyas (y el creador todas).
create policy "ver apostantes segun visibilidad" on public.wagers
  for select using (
    user_id = auth.uid()
    or exists (
      select 1 from public.markets m
      where m.id = market_id
        and public.is_member(m.group_id)
        and (m.stakes_public or m.creator_id = auth.uid())
    )
  );

create policy "ver impugnaciones de mis grupos" on public.disputes
  for select using (
    exists (select 1 from public.markets m
            where m.id = market_id and public.is_member(m.group_id))
  );
create policy "ver votos de mis grupos" on public.dispute_votes
  for select using (
    exists (select 1 from public.markets m
            where m.id = market_id and public.is_member(m.group_id))
  );

-- ---------------------------------------------------------------- permisos
grant usage on schema public to anon, authenticated;
grant select on all tables in schema public to authenticated;

-- Ninguna tabla que mueva puntos acepta INSERT/UPDATE directo: todo pasa por
-- las funciones security definer, que son las que validan saldo y arbitraje.
revoke insert, update, delete on
  public.groups, public.seasons, public.balances, public.season_results,
  public.markets, public.market_options, public.wagers,
  public.disputes, public.dispute_votes, public.ledger
from anon, authenticated;

revoke insert, update, delete on public.group_members from anon, authenticated;
grant delete on public.group_members to authenticated; -- salirse del grupo

grant execute on function
  public.create_group(text, numeric, numeric, numeric, int),
  public.join_group(text),
  public.create_market(uuid, text, text, timestamptz, boolean, jsonb),
  public.place_wager(uuid, uuid, numeric),
  public.void_wager(uuid, text),
  public.close_market(uuid),
  public.cancel_market(uuid, text),
  public.set_result(uuid, uuid, text),
  public.open_dispute(uuid, text),
  public.cast_dispute_vote(uuid, uuid),
  public.process_due(uuid),
  public.is_member(uuid),
  public.open_season(uuid)
to authenticated;

-- Estas no las puede llamar nadie desde fuera: solo se usan internamente.
-- Ojo: en Postgres toda funcion nace ejecutable por PUBLIC, asi que hay que
-- revocar de PUBLIC y no solo de anon/authenticated.
revoke execute on function
  public.apply_points(uuid, int, uuid, numeric, public.ledger_kind, uuid, uuid, text),
  public.settle_market(uuid, uuid, text),
  public.resolve_dispute(uuid),
  public.roll_season(uuid),
  public.recompute_odds(uuid),
  public.process_all_due()
from public, anon, authenticated;

-- ---------------------------------------------------------------- alta de perfil
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
declare v_base text; v_name text; v_try int := 0;
begin
  v_base := lower(regexp_replace(split_part(new.email, '@', 1), '[^a-z0-9_]', '', 'g'));
  if char_length(v_base) < 3 then v_base := 'user' || v_base; end if;
  v_base := substr(v_base, 1, 16);
  v_name := v_base;
  while exists (select 1 from public.profiles where username = v_name) loop
    v_try := v_try + 1;
    v_name := substr(v_base, 1, 16) || v_try::text;
  end loop;

  -- Se reparte un emblema al azar para que dos recien llegados no se
  -- confundan entre si; cada uno puede cambiarlo luego en su perfil.
  insert into public.profiles (id, username, display_name, avatar_symbol, avatar_color)
  values (
    new.id,
    v_name,
    coalesce(nullif(new.raw_user_meta_data->>'display_name', ''), v_name),
    (enum_range(null::public.avatar_symbol))[1 + floor(random() * 12)::int],
    (enum_range(null::public.avatar_color))[1 + floor(random() * 8)::int]
  );
  return new;
end; $$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
