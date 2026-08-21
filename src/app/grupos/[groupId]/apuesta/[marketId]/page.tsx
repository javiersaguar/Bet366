import { notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { loadGroup } from '@/lib/data';
import type { MarketWithOptions, Wager } from '@/lib/types';
import { MarketScreen } from '@/screens/market';

export const dynamic = 'force-dynamic';

export default async function MarketPage({
  params,
}: {
  params: Promise<{ groupId: string; marketId: string }>;
}) {
  const { groupId, marketId } = await params;
  const { group, me, balance, members } = await loadGroup(groupId);
  const supabase = await createClient();

  const { data } = await supabase
    .from('markets')
    .select('*, market_options(*), creator:profiles!markets_creator_id_fkey(*)')
    .eq('id', marketId)
    .single();
  if (!data) notFound();

  const market = data as unknown as MarketWithOptions;
  market.market_options.sort((a, b) => a.position - b.position);

  // RLS decide aquí: si el mercado es "a ciegas" solo llegan las propias
  // (y todas si eres el creador).
  const { data: wagerRows } = await supabase
    .from('wagers')
    .select('*')
    .eq('market_id', marketId)
    .order('created_at', { ascending: false });

  const { data: dispute } = await supabase
    .from('disputes')
    .select('*')
    .eq('market_id', marketId)
    .maybeSingle();

  const { data: votes } = await supabase
    .from('dispute_votes')
    .select('*')
    .eq('market_id', marketId);

  return (
    <MarketScreen
      basePath={`/grupos/${groupId}`}
      groupId={groupId}
      group={group}
      market={market}
      wagers={(wagerRows ?? []) as Wager[]}
      me={me}
      balance={balance}
      members={members}
      dispute={dispute}
      votes={votes ?? []}
    />
  );
}
