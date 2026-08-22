import { notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { requireSession } from '@/lib/sesion';
import type { Group, MarketWithOptions, Notification, Profile, Season, Wager } from '@/lib/types';

export type GroupContext = {
  group: Group;
  season: Season;
  balance: number;
  me: Profile;
  members: Profile[];
};

/**
 * Contexto de un grupo. De paso ejecuta las tareas vencidas (cerrar apuestas
 * pasadas de fecha, pagar las que ya cumplieron el plazo de impugnacion y
 * reiniciar la semana), de forma que la app funciona sin necesidad de cron.
 */
export async function loadGroup(groupId: string): Promise<GroupContext> {
  const { supabase, user } = await requireSession(`/grupos/${groupId}`);

  await supabase.rpc('process_due', { p_group: groupId });

  const { data: group } = await supabase.from('groups').select('*').eq('id', groupId).single();
  if (!group) notFound();

  const { data: season } = await supabase
    .from('seasons')
    .select('*')
    .eq('group_id', groupId)
    .is('closed_at', null)
    .single();
  if (!season) notFound();

  const { data: balance } = await supabase
    .from('balances')
    .select('points')
    .eq('group_id', groupId)
    .eq('season_number', season.number)
    .eq('user_id', user.id)
    .maybeSingle();

  const { data: memberRows } = await supabase
    .from('group_members')
    /* La fila entera y no una lista de columnas: así la app sigue en pie en una
       base donde todavía no se haya pasado la migración de Instagram. */
    .select('profiles(*)')
    .eq('group_id', groupId);

  const members = (memberRows ?? [])
    .map((r) => r.profiles as unknown as Profile)
    .filter(Boolean);

  const me = members.find((m) => m.id === user.id);
  if (!me) notFound();

  return {
    group: group as Group,
    season: season as Season,
    balance: Number(balance?.points ?? 0),
    me,
    members,
  };
}

export async function loadMarkets(groupId: string, seasonNumber: number) {
  const supabase = await createClient();
  const { data } = await supabase
    .from('markets')
    .select('*, market_options(*), creator:profiles!markets_creator_id_fkey(*)')
    .eq('group_id', groupId)
    .eq('season_number', seasonNumber)
    .order('closes_at', { ascending: true });

  return ((data ?? []) as unknown as MarketWithOptions[]).map((m) => ({
    ...m,
    market_options: [...m.market_options].sort((a, b) => a.position - b.position),
  }));
}

export async function loadMyWagers(marketIds: string[], userId: string): Promise<Wager[]> {
  if (marketIds.length === 0) return [];
  const supabase = await createClient();
  const { data } = await supabase
    .from('wagers')
    .select('*')
    .in('market_id', marketIds)
    .eq('user_id', userId);
  return (data ?? []) as Wager[];
}

export type Standing = {
  profile: Profile;
  points: number;
  staked: number;
  won: number;
  settled: number;
};

export async function loadStandings(
  groupId: string,
  seasonNumber: number,
  members: Profile[],
): Promise<Standing[]> {
  const supabase = await createClient();

  const { data: balances } = await supabase
    .from('balances')
    .select('user_id, points')
    .eq('group_id', groupId)
    .eq('season_number', seasonNumber);

  const { data: marketIds } = await supabase
    .from('markets')
    .select('id')
    .eq('group_id', groupId)
    .eq('season_number', seasonNumber);

  const ids = (marketIds ?? []).map((m) => m.id);
  const { data: wagers } = ids.length
    ? await supabase.from('wagers').select('user_id, stake, status').in('market_id', ids)
    : { data: [] as { user_id: string; stake: number; status: string }[] };

  return members
    .map((profile) => {
      const mine = (wagers ?? []).filter((w) => w.user_id === profile.id);
      return {
        profile,
        points: Number((balances ?? []).find((b) => b.user_id === profile.id)?.points ?? 0),
        staked: mine
          .filter((w) => w.status === 'active')
          .reduce((a, w) => a + Number(w.stake), 0),
        won: mine.filter((w) => w.status === 'won').length,
        settled: mine.filter((w) => w.status === 'won' || w.status === 'lost').length,
      };
    })
    .sort((a, b) => b.points + b.staked - (a.points + a.staked));
}

export async function loadNotifications(groupId: string, limit = 60): Promise<Notification[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from('notifications')
    .select('*')
    .eq('group_id', groupId)
    .order('created_at', { ascending: false })
    .limit(limit);
  return (data ?? []) as Notification[];
}

/** Solo el contador, para la campana de la cabecera. */
export async function countUnread(groupId: string): Promise<number> {
  const supabase = await createClient();
  const { count } = await supabase
    .from('notifications')
    .select('id', { count: 'exact', head: true })
    .eq('group_id', groupId)
    .is('read_at', null);
  return count ?? 0;
}

// ------------------------------------------------------------------- el grupo

export type MemberSummary = {
  profile: Profile;
  role: string;
  joinedAt: string;
  /** Saldo de la semana en curso. */
  points: number;
  /** Semanas terminadas en primera posición. */
  weeksWon: number;
  /** Semanas terminadas entre las tres primeras. */
  podiums: number;
  /** Apuestas ganadas y jugadas, sumando todas las semanas cerradas. */
  wagersWon: number;
  wagersTotal: number;
};

export type SeasonSummary = {
  number: number;
  startsAt: string;
  endsAt: string;
  winner: Profile | null;
  winnerPoints: number;
};

export type GroupSummary = {
  members: MemberSummary[];
  /** Semanas cerradas, la más reciente primero. */
  history: SeasonSummary[];
  /** Apuestas lanzadas en el grupo desde el principio. */
  marketsTotal: number;
};

/**
 * Todo lo que hace falta para la ficha del grupo: quién está, cuánto lleva
 * cada uno esta semana y qué ha pasado en las semanas ya cerradas.
 *
 * El palmarés sale de `season_results`, que se rellena al cerrar cada semana.
 * Es la única foto fiable del pasado: los saldos se reinician cada lunes.
 */
export async function loadGroupSummary(
  groupId: string,
  seasonNumber: number,
  members: Profile[],
): Promise<GroupSummary> {
  const supabase = await createClient();
  const byId = new Map(members.map((m) => [m.id, m]));

  const [{ data: memberRows }, { data: balances }, { data: results }, { data: seasons }, { count }] =
    await Promise.all([
      supabase.from('group_members').select('user_id, role, joined_at').eq('group_id', groupId),
      supabase
        .from('balances')
        .select('user_id, points')
        .eq('group_id', groupId)
        .eq('season_number', seasonNumber),
      supabase
        .from('season_results')
        .select('season_number, user_id, position, points, wagers_won, wagers_total')
        .eq('group_id', groupId),
      supabase
        .from('seasons')
        .select('number, starts_at, ends_at')
        .eq('group_id', groupId)
        .not('closed_at', 'is', null)
        .order('number', { ascending: false }),
      supabase
        .from('markets')
        .select('id', { count: 'exact', head: true })
        .eq('group_id', groupId),
    ]);

  const rows = results ?? [];

  const summaries: MemberSummary[] = members.map((profile) => {
    const membership = (memberRows ?? []).find((r) => r.user_id === profile.id);
    const mine = rows.filter((r) => r.user_id === profile.id);
    return {
      profile,
      role: membership?.role ?? 'member',
      joinedAt: membership?.joined_at ?? '',
      points: Number((balances ?? []).find((b) => b.user_id === profile.id)?.points ?? 0),
      weeksWon: mine.filter((r) => r.position === 1).length,
      podiums: mine.filter((r) => r.position <= 3).length,
      wagersWon: mine.reduce((a, r) => a + Number(r.wagers_won), 0),
      wagersTotal: mine.reduce((a, r) => a + Number(r.wagers_total), 0),
    };
  });

  // Primero quien más semanas ha ganado; a igualdad, quien más puntos lleva ahora.
  summaries.sort((a, b) => b.weeksWon - a.weeksWon || b.points - a.points);

  const history: SeasonSummary[] = (seasons ?? []).map((s) => {
    const champ = rows.find((r) => r.season_number === s.number && r.position === 1);
    return {
      number: s.number,
      startsAt: s.starts_at,
      endsAt: s.ends_at,
      winner: champ ? (byId.get(champ.user_id) ?? null) : null,
      winnerPoints: champ ? Number(champ.points) : 0,
    };
  });

  return {
    members: summaries,
    history,
    marketsTotal: count ?? 0,
  };
}
