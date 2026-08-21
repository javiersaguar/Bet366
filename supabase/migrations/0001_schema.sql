-- =====================================================================
--  Bet366 - esquema base
--  Puntos ficticios, sin dinero real. Sin banca: los premios son
--  stake x cuota bloqueada.
-- =====================================================================

create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------- perfiles
-- Avatares: un simbolo vectorial sobre un color, en vez de emojis (que
-- cambian de aspecto en cada movil). Ver src/lib/avatars.ts.
create type public.avatar_symbol as enum (
  'bolt', 'crown', 'flame', 'star', 'target', 'diamond',
  'shield', 'wave', 'peak', 'spade', 'horseshoe', 'orbit'
);

create type public.avatar_color as enum (
  'mint', 'gold', 'sky', 'violet', 'rose', 'cyan', 'amber', 'lime'
);

create table public.profiles (
  id            uuid primary key references auth.users(id) on delete cascade,
  username      text not null unique check (username ~ '^[a-z0-9_]{3,20}$'),
  display_name  text not null check (char_length(display_name) between 2 and 40),
  avatar_symbol public.avatar_symbol not null default 'bolt',
  avatar_color  public.avatar_color  not null default 'mint',
  created_at    timestamptz not null default now()
);

-- ---------------------------------------------------------------- grupos
create table public.groups (
  id              uuid primary key default gen_random_uuid(),
  name            text not null check (char_length(name) between 2 and 50),
  invite_code     text not null unique,
  created_by      uuid not null references public.profiles(id) on delete restrict,
  -- puntos con los que arranca cada miembro al empezar una semana
  starting_points numeric(12,2) not null default 1000 check (starting_points > 0),
  -- movimiento de cuotas (ver src/lib/engine/odds.ts)
  liquidity       numeric(12,2) not null default 300 check (liquidity >= 1),
  drift           numeric(4,3)  not null default 0.5 check (drift between 0 and 1),
  -- horas que dura la ventana de impugnacion tras publicar un resultado
  dispute_hours   int not null default 24 check (dispute_hours between 1 and 168),
  min_stake       numeric(12,2) not null default 1 check (min_stake > 0),
  created_at      timestamptz not null default now()
);

create type public.member_role as enum ('owner', 'admin', 'member');

create table public.group_members (
  group_id  uuid not null references public.groups(id) on delete cascade,
  user_id   uuid not null references public.profiles(id) on delete cascade,
  role      public.member_role not null default 'member',
  joined_at timestamptz not null default now(),
  primary key (group_id, user_id)
);
create index on public.group_members (user_id);

-- ---------------------------------------------------------------- temporadas (semanas)
create table public.seasons (
  group_id   uuid not null references public.groups(id) on delete cascade,
  number     int  not null,
  starts_at  timestamptz not null default now(),
  ends_at    timestamptz not null,
  closed_at  timestamptz,
  primary key (group_id, number)
);
create unique index seasons_one_open_per_group
  on public.seasons (group_id) where closed_at is null;

create table public.balances (
  group_id      uuid not null references public.groups(id) on delete cascade,
  season_number int  not null,
  user_id       uuid not null references public.profiles(id) on delete cascade,
  points        numeric(12,2) not null default 0 check (points >= 0),
  primary key (group_id, season_number, user_id),
  foreign key (group_id, season_number) references public.seasons(group_id, number) on delete cascade
);

-- Ranking congelado al cerrar cada semana.
create table public.season_results (
  group_id      uuid not null references public.groups(id) on delete cascade,
  season_number int not null,
  user_id       uuid not null references public.profiles(id) on delete cascade,
  position      int not null,
  points        numeric(12,2) not null,
  wagers_won    int not null default 0,
  wagers_total  int not null default 0,
  primary key (group_id, season_number, user_id)
);

-- ---------------------------------------------------------------- mercados (apuestas lanzadas)
create type public.market_status as enum (
  'open',          -- admite apuestas
  'closed',        -- cerrada por fecha, esperando resultado del creador
  'pending',       -- resultado publicado, ventana de impugnacion abierta
  'disputed',      -- impugnada, votacion en curso
  'resolved',      -- pagada
  'cancelled'      -- anulada, apuestas devueltas
);

create table public.markets (
  id             uuid primary key default gen_random_uuid(),
  group_id       uuid not null references public.groups(id) on delete cascade,
  season_number  int not null,
  creator_id     uuid not null references public.profiles(id) on delete restrict,
  title          text not null check (char_length(title) between 5 and 140),
  description    text check (char_length(description) <= 500),
  status         public.market_status not null default 'open',
  closes_at      timestamptz not null,
  -- si es false, solo el creador y cada uno sus propias apuestas
  stakes_public  boolean not null default true,
  winning_option uuid,
  result_note    text check (char_length(result_note) <= 300),
  result_set_at  timestamptz,
  dispute_until  timestamptz,
  resolved_at    timestamptz,
  cancel_reason  text,
  created_at     timestamptz not null default now(),
  foreign key (group_id, season_number) references public.seasons(group_id, number) on delete cascade
);
create index on public.markets (group_id, status, closes_at);

create table public.market_options (
  id            uuid primary key default gen_random_uuid(),
  market_id     uuid not null references public.markets(id) on delete cascade,
  label         text not null check (char_length(label) between 1 and 60),
  position      int  not null,
  opening_odds  numeric(6,2) not null check (opening_odds between 1.01 and 50),
  current_odds  numeric(6,2) not null check (current_odds between 1.01 and 50),
  pool          numeric(12,2) not null default 0 check (pool >= 0),
  unique (market_id, position)
);
create index on public.market_options (market_id);

alter table public.markets
  add constraint markets_winning_option_fk
  foreign key (winning_option) references public.market_options(id) on delete set null;

-- ---------------------------------------------------------------- apuestas
create type public.wager_status as enum ('active', 'won', 'lost', 'refunded', 'voided');

create table public.wagers (
  id           uuid primary key default gen_random_uuid(),
  market_id    uuid not null references public.markets(id) on delete cascade,
  option_id    uuid not null references public.market_options(id) on delete cascade,
  user_id      uuid not null references public.profiles(id) on delete cascade,
  stake        numeric(12,2) not null check (stake > 0),
  locked_odds  numeric(6,2)  not null check (locked_odds >= 1.01),
  to_win       numeric(12,2) not null,
  status       public.wager_status not null default 'active',
  void_reason  text check (char_length(void_reason) <= 200),
  voided_by    uuid references public.profiles(id),
  created_at   timestamptz not null default now(),
  settled_at   timestamptz
);
create index on public.wagers (market_id, status);
create index on public.wagers (user_id, market_id);

-- ---------------------------------------------------------------- impugnaciones
create table public.disputes (
  market_id  uuid primary key references public.markets(id) on delete cascade,
  opened_by  uuid not null references public.profiles(id) on delete cascade,
  reason     text not null check (char_length(reason) between 3 and 300),
  opened_at  timestamptz not null default now(),
  closes_at  timestamptz not null
);

create table public.dispute_votes (
  market_id uuid not null references public.markets(id) on delete cascade,
  user_id   uuid not null references public.profiles(id) on delete cascade,
  option_id uuid references public.market_options(id) on delete cascade, -- null = anular
  voted_at  timestamptz not null default now(),
  primary key (market_id, user_id)
);

-- ---------------------------------------------------------------- libro de movimientos
create type public.ledger_kind as enum (
  'season_start', 'wager_placed', 'wager_won', 'wager_refund', 'wager_void', 'adjustment'
);

create table public.ledger (
  id            bigserial primary key,
  group_id      uuid not null references public.groups(id) on delete cascade,
  season_number int not null,
  user_id       uuid not null references public.profiles(id) on delete cascade,
  kind          public.ledger_kind not null,
  amount        numeric(12,2) not null,
  balance_after numeric(12,2) not null,
  market_id     uuid references public.markets(id) on delete set null,
  wager_id      uuid references public.wagers(id) on delete set null,
  note          text,
  created_at    timestamptz not null default now()
);
create index on public.ledger (group_id, season_number, user_id, created_at desc);
