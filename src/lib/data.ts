import { notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import type { Group, MarketWithOptions, Profile, Season, Wager } from '@/lib/types';

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
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) notFound();

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
    .select('profiles(id, username, display_name, avatar_symbol, avatar_color)')
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
