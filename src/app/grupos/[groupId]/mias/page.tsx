import { createClient } from '@/lib/supabase/server';
import { loadGroup, loadMarkets } from '@/lib/data';
import type { Wager } from '@/lib/types';
import { MyBetsScreen } from '@/screens/my-bets';

export const dynamic = 'force-dynamic';

const NO_MARKET = '00000000-0000-0000-0000-000000000000';

export default async function MyBetsPage({ params }: { params: Promise<{ groupId: string }> }) {
  const { groupId } = await params;
  const { season, me } = await loadGroup(groupId);
  const markets = await loadMarkets(groupId, season.number);
  const supabase = await createClient();

  const { data } = await supabase
    .from('wagers')
    .select('*')
    .eq('user_id', me.id)
    .in('market_id', markets.length ? markets.map((m) => m.id) : [NO_MARKET])
    .order('created_at', { ascending: false });

  return (
    <MyBetsScreen groupId={groupId} me={me} markets={markets} wagers={(data ?? []) as Wager[]} />
  );
}
