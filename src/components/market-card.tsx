import Link from 'next/link';
import type { MarketWithOptions, Wager } from '@/lib/types';
import { points } from '@/lib/format';
import { MarketBadge } from '@/components/ui';
import { OddsFace } from '@/components/odds-button';
import { Countdown } from '@/components/countdown';
import { Avatar } from '@/components/avatar';
import { Sparkle } from '@phosphor-icons/react/dist/ssr';

export function MarketCard({
  market,
  basePath,
  myWagers,
  index = 0,
}: {
  market: MarketWithOptions;
  /** `/grupos/<id>` en la app, `/demo` en la demostración. */
  basePath: string;
  myWagers: Wager[];
  index?: number;
}) {
  const mine = myWagers.filter((w) => w.market_id === market.id && w.status === 'active');
  const myStake = mine.reduce((a, w) => a + Number(w.stake), 0);
  const totalPool = market.market_options.reduce((a, o) => a + Number(o.pool), 0);
  const winner = market.market_options.find((o) => o.id === market.winning_option);
  const settled = market.status === 'resolved' || market.status === 'cancelled';
  const iWon = mine.length === 0 && myWagers.some((w) => w.market_id === market.id && w.status === 'won');

  return (
    <Link
      href={`${basePath}/apuesta/${market.id}`}
      style={{ '--i': index } as React.CSSProperties}
      className={`card-interactive block p-4 sm:p-5 ${
        myStake > 0 ? 'ring-1 ring-inset ring-info/20' : ''
      }`}
    >
      <div className="mb-2 flex items-start justify-between gap-3">
        <h3 className="text-[0.975rem] font-semibold leading-snug text-white">{market.title}</h3>
        <MarketBadge status={market.status} />
      </div>

      <div className="mb-4 flex flex-wrap items-center gap-x-2 gap-y-1 text-micro text-content-faint">
        {market.creator && (
          <span className="flex items-center gap-1.5 text-content-muted">
            <Avatar profile={market.creator} size="sm" />
            {market.creator.display_name}
          </span>
        )}
        <Dot />
        {market.status === 'open' ? (
          <span className="flex items-center gap-1">
            cierra en <Countdown to={market.closes_at} className="text-content-muted" />
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
        {iWon && (
          <span className="chip ml-auto border-brand/25 bg-brand/[.08] text-brand">
            <Sparkle size={12} weight="fill" /> la ganaste
          </span>
        )}
      </div>

      <div className="grid gap-2 sm:grid-cols-2">
        {market.market_options.slice(0, 4).map((option) => {
          const bet = mine.find((w) => w.option_id === option.id);
          return (
            <OddsFace
              key={option.id}
              option={option}
              share={totalPool > 0 ? (Number(option.pool) / totalPool) * 100 : 0}
              state={
                option.id === market.winning_option ? 'winner' : settled ? 'muted' : 'idle'
              }
              mine={
                bet ? { stake: Number(bet.stake), lockedOdds: Number(bet.locked_odds) } : undefined
              }
              compact
            />
          );
        })}
      </div>

      {market.market_options.length > 4 && (
        <p className="mt-2 text-micro text-content-faint">
          +{market.market_options.length - 4} opciones más
        </p>
      )}
    </Link>
  );
}

function Dot() {
  return <span className="text-content-faint/40">·</span>;
}
