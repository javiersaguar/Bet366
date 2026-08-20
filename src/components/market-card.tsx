import Link from 'next/link';
import type { MarketWithOptions, Wager } from '@/lib/types';
import { countdown, points } from '@/lib/format';
import { MarketBadge } from '@/components/ui';
import { OddsFace } from '@/components/odds-button';

export function MarketCard({
  market,
  groupId,
  myWagers,
}: {
  market: MarketWithOptions;
  groupId: string;
  myWagers: Wager[];
}) {
  const mine = myWagers.filter((w) => w.market_id === market.id && w.status === 'active');
  const totalPool = market.market_options.reduce((a, o) => a + Number(o.pool), 0);
  const winner = market.market_options.find((o) => o.id === market.winning_option);
  const settled = market.status === 'resolved' || market.status === 'cancelled';

  return (
    <Link
      href={`/grupos/${groupId}/apuesta/${market.id}`}
      className="card-interactive block p-4 sm:p-5"
    >
      <div className="mb-2 flex items-start justify-between gap-3">
        <h3 className="text-[0.975rem] font-semibold leading-snug text-white">{market.title}</h3>
        <MarketBadge status={market.status} />
      </div>

      <div className="mb-4 flex flex-wrap items-center gap-x-2 gap-y-1 text-2xs text-content-faint">
        <span className="text-content-muted">
          {market.creator?.avatar_emoji} {market.creator?.display_name}
        </span>
        <Dot />
        {market.status === 'open' ? (
          <span>
            cierra en <span className="num text-content-muted">{countdown(market.closes_at)}</span>
          </span>
        ) : winner ? (
          <span className="text-brand">ganó «{winner.label}»</span>
        ) : market.status === 'cancelled' ? (
          <span>anulada</span>
        ) : (
          <span>esperando resultado</span>
        )}
        {totalPool > 0 && (
          <>
            <Dot />
            <span className="num">{points(totalPool)} pts</span>
          </>
        )}
        {!market.stakes_public && (
          <>
            <Dot />
            <span title="No se ve quién ha apostado">a ciegas</span>
          </>
        )}
      </div>

      <div className="grid gap-2 sm:grid-cols-2">
        {market.market_options.slice(0, 4).map((option) => {
          const bet = mine.find((w) => w.option_id === option.id);
          const isWinner = option.id === market.winning_option;
          return (
            <OddsFace
              key={option.id}
              option={option}
              share={totalPool > 0 ? (Number(option.pool) / totalPool) * 100 : 0}
              state={isWinner ? 'winner' : settled ? 'muted' : 'idle'}
              mine={bet ? { stake: Number(bet.stake), lockedOdds: Number(bet.locked_odds) } : undefined}
              compact
            />
          );
        })}
      </div>

      {market.market_options.length > 4 && (
        <p className="mt-2 text-2xs text-content-faint">
          +{market.market_options.length - 4} opciones más
        </p>
      )}
    </Link>
  );
}

function Dot() {
  return <span className="text-content-faint/40">·</span>;
}
