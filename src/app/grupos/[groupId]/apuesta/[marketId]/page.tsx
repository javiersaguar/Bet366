import Link from 'next/link';
import { notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { loadGroup } from '@/lib/data';
import type { MarketWithOptions, Profile, Wager } from '@/lib/types';
import { dateTime, countdown, points } from '@/lib/format';
import { MarketBadge } from '@/components/ui';
import { OddsFace } from '@/components/odds-button';
import { BetSlip } from '@/components/bet-slip';
import { BettorList } from '@/components/bettor-list';
import { DisputePanel } from '@/components/dispute-panel';
import { CreatorPanel } from '@/components/creator-panel';

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

  // RLS decide aqui: si el mercado es "a ciegas" solo llegan las propias
  // (y todas si eres el creador).
  const { data: wagerRows } = await supabase
    .from('wagers')
    .select('*')
    .eq('market_id', marketId)
    .order('created_at', { ascending: false });
  const wagers = (wagerRows ?? []) as Wager[];

  const myWagers = wagers.filter((w) => w.user_id === me.id && w.status === 'active');
  const isCreator = market.creator_id === me.id;
  const totalPool = market.market_options.reduce((a, o) => a + Number(o.pool), 0);
  const winner = market.market_options.find((o) => o.id === market.winning_option);

  const { data: dispute } = await supabase
    .from('disputes')
    .select('*')
    .eq('market_id', marketId)
    .maybeSingle();
  const { data: votes } = await supabase
    .from('dispute_votes')
    .select('*')
    .eq('market_id', marketId);

  const profilesById = new Map<string, Profile>(members.map((m) => [m.id, m]));

  return (
    <div className="space-y-6">
      <Link
        href={`/grupos/${groupId}`}
        className="inline-block text-sm text-content-muted hover:text-content"
      >
        ← El tablón
      </Link>

      <header className="space-y-3">
        <div className="flex items-start justify-between gap-3">
          <h1 className="text-[1.6rem] font-bold leading-[1.15] text-white">{market.title}</h1>
          <MarketBadge status={market.status} />
        </div>
        {market.description && (
          <p className="rounded-xl border border-line bg-surface-sunken px-4 py-3 text-sm leading-relaxed text-content-muted">
            {market.description}
          </p>
        )}
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-content-muted">
          <span>
            La lanzó {market.creator?.avatar_emoji} {market.creator?.display_name}
          </span>
          <span className="text-content-faint/40">·</span>
          <span>
            {market.status === 'open'
              ? `cierra en ${countdown(market.closes_at)} (${dateTime(market.closes_at)})`
              : `cerró el ${dateTime(market.closes_at)}`}
          </span>
          {totalPool > 0 && (
            <>
              <span className="text-content-faint/40">·</span>
              <span className="num">{points(totalPool)} pts en juego</span>
            </>
          )}
          <span className="text-content-faint/40">·</span>
          <span>{market.stakes_public ? '👀 apostantes a la vista' : '🔒 apuestas a ciegas'}</span>
        </div>
      </header>

      {winner && market.status === 'resolved' && (
        <div className="card border-brand/40 bg-brand/[.08] px-5 py-4">
          <p className="eyebrow !text-brand/70">Resultado</p>
          <p className="text-lg font-bold text-brand">{winner.label}</p>
          {market.result_note && <p className="mt-1 text-sm text-brand/80">{market.result_note}</p>}
        </div>
      )}

      {market.status === 'cancelled' && (
        <div className="card px-5 py-4">
          <p className="eyebrow">Anulada</p>
          <p className="text-sm text-content-muted">
            {market.cancel_reason ?? 'Se anuló y cada uno recuperó sus puntos.'}
          </p>
        </div>
      )}

      {market.status === 'open' && (
        <BetSlip
          groupId={groupId}
          market={market}
          myWagers={myWagers}
          balance={balance}
          minStake={Number(group.min_stake)}
          totalPool={totalPool}
        />
      )}

      {market.status !== 'open' && (
        <OddsBoard market={market} totalPool={totalPool} />
      )}

      {(market.status === 'pending' || market.status === 'disputed') && (
        <DisputePanel
          groupId={groupId}
          market={market}
          dispute={dispute}
          votes={votes ?? []}
          myWagers={myWagers}
          me={me}
          profilesById={Object.fromEntries(profilesById)}
          memberCount={members.length}
        />
      )}

      {isCreator && <CreatorPanel groupId={groupId} market={market} wagers={wagers} />}

      <BettorList
        market={market}
        wagers={wagers}
        profilesById={Object.fromEntries(profilesById)}
        meId={me.id}
        isCreator={isCreator}
        groupId={groupId}
      />
    </div>
  );
}

function OddsBoard({ market, totalPool }: { market: MarketWithOptions; totalPool: number }) {
  const settled = market.status === 'resolved' || market.status === 'cancelled';
  return (
    <div className="grid gap-2 sm:grid-cols-2">
      {market.market_options.map((option) => (
        <OddsFace
          key={option.id}
          option={option}
          share={totalPool > 0 ? (Number(option.pool) / totalPool) * 100 : 0}
          state={
            option.id === market.winning_option ? 'winner' : settled ? 'muted' : 'idle'
          }
        />
      ))}
    </div>
  );
}
