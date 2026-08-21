import Link from 'next/link';
import { CaretRight } from '@phosphor-icons/react/dist/ssr';
import type { MarketWithOptions, Wager } from '@/lib/types';
import { points } from '@/lib/format';
import { MarketBadge } from '@/components/ui';
import { OddsFace } from '@/components/odds-button';
import { Countdown } from '@/components/countdown';
import { Avatar } from '@/components/avatar';

/**
 * Una apuesta en el tablón.
 *
 * Cada apuesta va dentro de su propio marco. El tablón mezcla apuestas de dos
 * y de tres opciones, con y sin resultado, y sin marco los bloques de cuotas
 * de una se leían como si fueran de la de abajo. El borde dice dónde acaba
 * cada una.
 *
 * Dentro, el orden sigue la decisión de quien apuesta: qué se apuesta, con qué
 * contexto, y por último a qué cuota, que es lo que se toca.
 */
export function MarketRow({
  market,
  basePath,
  myWagers,
  index = 0,
}: {
  market: MarketWithOptions;
  basePath: string;
  myWagers: Wager[];
  /** Posición en la lista: alimenta la entrada escalonada. */
  index?: number;
}) {
  const mine = myWagers.filter((w) => w.market_id === market.id && w.status === 'active');
  const myStake = mine.reduce((a, w) => a + Number(w.stake), 0);
  const totalPool = market.market_options.reduce((a, o) => a + Number(o.pool), 0);
  const winner = market.market_options.find((o) => o.id === market.winning_option);
  const settled = market.status === 'resolved' || market.status === 'cancelled';

  // En una sección que ya se llama "Abiertas", repetir "abierta" en cada fila
  // es ruido. La insignia solo aparece cuando el estado pide algo.
  const showBadge = market.status !== 'open';

  return (
    <li style={{ '--i': index } as React.CSSProperties}>
      <Link
        href={`${basePath}/apuesta/${market.id}`}
        className="card-interactive group block px-4 py-4 sm:px-5"
      >
        <div className="mb-1.5 flex items-start gap-3">
          <h3 className="min-w-0 flex-1 text-title font-medium text-white">{market.title}</h3>
          {showBadge ? (
            <MarketBadge status={market.status} />
          ) : (
            <CaretRight
              size={15}
              className="mt-0.5 shrink-0 text-content-faint/50 transition-transform
                         duration-press ease-out group-active:translate-x-0.5"
            />
          )}
        </div>

        <p className="mb-3 flex flex-wrap items-center gap-x-2 gap-y-1 text-caption text-content-faint">
          {market.creator && (
            <span className="flex items-center gap-1.5 text-content-muted">
              <Avatar profile={market.creator} size="xs" />
              {market.creator.display_name}
            </span>
          )}
          <Dot />
          {market.status === 'open' ? (
            <span className="num">
              cierra en <Countdown to={market.closes_at} className="text-content-muted" />
            </span>
          ) : winner ? (
            <span className="text-brand">salió {winner.label}</span>
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
              <span>a ciegas</span>
            </>
          )}
          {myStake > 0 && (
            <span className="num ml-auto text-info">tuyos {points(myStake)}</span>
          )}
        </p>

        <div className="grid gap-1.5 sm:grid-cols-2">
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
                  bet
                    ? { stake: Number(bet.stake), lockedOdds: Number(bet.locked_odds) }
                    : undefined
                }
                compact
              />
            );
          })}
        </div>

        {market.market_options.length > 4 && (
          <p className="mt-1.5 text-caption text-content-faint">
            {market.market_options.length - 4} opciones más
          </p>
        )}
      </Link>
    </li>
  );
}

function Dot() {
  return <span aria-hidden className="text-content-faint/35">·</span>;
}
