import Link from 'next/link';
import {
  CaretRight,
  ClockCounterClockwise,
  Megaphone,
  Plus,
  Receipt,
} from '@phosphor-icons/react/dist/ssr';
import type { MarketWithOptions, Profile, Wager } from '@/lib/types';
import { countdown, dateTime, odds as fmtOdds, points } from '@/lib/format';
import { Empty, MarketBadge } from '@/components/ui';
import { BetTabs } from '@/components/bet-tabs';
import { TodoCallout } from '@/components/todo-callout';

/**
 * Mis apuestas.
 *
 * Tres listas que antes iban una debajo de otra y obligaban a hacer scroll
 * para llegar a lo de siempre. Ahora son sub-pestañas: lo que está en juego,
 * el historial de lo ya resuelto y lo que has lanzado tú.
 *
 * El historial va de todas las semanas, no solo de la que está en curso. Los
 * puntos se reinician cada lunes, así que se agrupa por semana: es la única
 * forma de que un «+240» de hace tres semanas signifique algo.
 */
export function MyBetsScreen({
  basePath,
  me,
  markets,
  wagers,
}: {
  basePath: string;
  me: Profile;
  markets: MarketWithOptions[];
  wagers: Wager[];
}) {
  const porMercado = new Map(markets.map((m) => [m.id, m]));

  const enJuego = wagers.filter((w) => w.status === 'active');
  const resueltas = wagers.filter((w) => w.status !== 'active');
  const lanzadas = markets.filter((m) => m.creator_id === me.id);

  const ganadas = resueltas.filter((w) => w.status === 'won');
  const perdidas = resueltas.filter((w) => w.status === 'lost');
  const acertables = ganadas.length + perdidas.length;

  const arriesgado = enJuego.reduce((a, w) => a + Number(w.stake), 0);
  /* El saldo se mueve en dos momentos: al apostar se descuenta lo puesto y al
     ganar entra lo que pagaba la cuota. El neto de una ganada es la diferencia. */
  const balance =
    ganadas.reduce((a, w) => a + (Number(w.to_win) - Number(w.stake)), 0) -
    perdidas.reduce((a, w) => a + Number(w.stake), 0);

  return (
    <div className="space-y-7">
      <section className="animate-rise">
        <h1 className="text-display font-semibold">Mis apuestas</h1>
        <p className="mt-1 text-body text-content-muted">
          {resueltas.length > 0
            ? `${resueltas.length} resueltas desde que empezaste`
            : 'Aquí se irá guardando todo lo que juegues'}
        </p>

        <dl className="mt-5 grid grid-cols-3 divide-x divide-line border-y border-line">
          <Figure
            label="Acierto"
            value={acertables > 0 ? `${Math.round((ganadas.length / acertables) * 100)}%` : '—'}
            tone={
              acertables === 0
                ? 'text-white'
                : ganadas.length / acertables >= 0.5
                  ? 'text-brand'
                  : 'text-white'
            }
          />
          <Figure
            label="En juego"
            value={points(arriesgado)}
            tone={arriesgado > 0 ? 'text-info' : 'text-white'}
          />
          <Figure
            label="Balance"
            value={`${balance > 0 ? '+' : ''}${points(balance)}`}
            tone={balance > 0 ? 'text-brand' : balance < 0 ? 'text-lose' : 'text-white'}
          />
        </dl>
      </section>

      <div className="animate-rise" style={{ animationDelay: '60ms' }}>
        <TodoCallout basePath={basePath} markets={markets} meId={me.id} />
      </div>

      <div className="animate-rise" style={{ animationDelay: '120ms' }}>
        <BetTabs
          pestanas={[
            { clave: 'juego', titulo: 'En juego', cuenta: enJuego.length },
            { clave: 'historial', titulo: 'Historial', cuenta: resueltas.length },
            { clave: 'lanzadas', titulo: 'Lanzadas', cuenta: lanzadas.length },
          ]}
        >
          <EnJuego basePath={basePath} wagers={enJuego} porMercado={porMercado} />
          <Historial basePath={basePath} wagers={resueltas} porMercado={porMercado} />
          <Lanzadas basePath={basePath} markets={lanzadas} />
        </BetTabs>
      </div>
    </div>
  );
}

// ------------------------------------------------------------------ en juego

function EnJuego({
  basePath,
  wagers,
  porMercado,
}: {
  basePath: string;
  wagers: Wager[];
  porMercado: Map<string, MarketWithOptions>;
}) {
  if (wagers.length === 0) {
    return (
      <Empty
        icon={Receipt}
        title="No tienes nada en juego"
        hint="Date una vuelta por el tablón y busca algo que te suene."
      />
    );
  }

  return (
    <ul className="stagger space-y-2.5">
      {wagers.map((w, i) => {
        const market = porMercado.get(w.market_id);
        const option = market?.market_options.find((o) => o.id === w.option_id);
        return (
          <li key={w.id} style={{ '--i': i } as React.CSSProperties}>
            <Link
              href={`${basePath}/apuesta/${w.market_id}`}
              className="card-interactive group flex items-center gap-4 px-4 py-3.5 sm:px-5"
            >
              <div className="min-w-0 flex-1">
                <p className="line-clamp-2 text-title font-medium leading-snug text-white">
                  {market?.title ?? 'Apuesta'}
                </p>
                <p className="mt-1 text-caption text-content-muted">
                  <span className="text-content">{option?.label}</span>{' '}
                  <span className="num">
                    · {points(w.stake)} pts a {fmtOdds(w.locked_odds)}
                  </span>
                  {market?.status === 'open' && (
                    <span className="num text-content-faint">
                      {' '}
                      · cierra en {countdown(market.closes_at)}
                    </span>
                  )}
                </p>
              </div>
              <div className="shrink-0 text-right">
                <p className="tnum text-figure font-semibold text-info">{points(w.to_win)}</p>
                <p className="field-label mt-0.5">si aciertas</p>
              </div>
              <CaretRight
                size={16}
                weight="bold"
                className="shrink-0 text-content-faint transition-transform duration-pop ease-out
                           motion-safe:group-hover:translate-x-0.5"
              />
            </Link>
          </li>
        );
      })}
    </ul>
  );
}

// ----------------------------------------------------------------- historial

/** Qué pinta tiene cada desenlace y cuánto movió el saldo. */
function desenlace(w: Wager) {
  const stake = Number(w.stake);
  switch (w.status) {
    case 'won':
      return {
        etiqueta: 'Ganada',
        tono: 'text-brand',
        marco: 'border-brand/25 bg-brand/[.06]',
        delta: Number(w.to_win) - stake,
      };
    case 'lost':
      return { etiqueta: 'Perdida', tono: 'text-lose', marco: 'border-line', delta: -stake };
    case 'refunded':
      return { etiqueta: 'Devuelta', tono: 'text-content-muted', marco: 'border-line', delta: 0 };
    default:
      return { etiqueta: 'Anulada', tono: 'text-lose', marco: 'border-lose/25', delta: 0 };
  }
}

function Historial({
  basePath,
  wagers,
  porMercado,
}: {
  basePath: string;
  wagers: Wager[];
  porMercado: Map<string, MarketWithOptions>;
}) {
  if (wagers.length === 0) {
    return (
      <Empty
        icon={ClockCounterClockwise}
        title="Todavía no se ha resuelto ninguna"
        hint="Cuando alguien publique un resultado, tus apuestas de esa semana aparecerán aquí."
      />
    );
  }

  /* Por semanas: los puntos se reinician cada lunes, así que una cifra sin su
     semana al lado no dice nada. */
  const semanas = new Map<number, Wager[]>();
  for (const w of wagers) {
    const n = porMercado.get(w.market_id)?.season_number ?? 0;
    const lista = semanas.get(n);
    if (lista) lista.push(w);
    else semanas.set(n, [w]);
  }
  const ordenadas = [...semanas.entries()].sort((a, b) => b[0] - a[0]);

  return (
    <div className="space-y-7">
      {ordenadas.map(([numero, deLaSemana]) => {
        const neto = deLaSemana.reduce((a, w) => a + desenlace(w).delta, 0);
        return (
          <section key={numero}>
            <div className="mb-3 flex items-baseline justify-between gap-3">
              <h2 className="text-title font-semibold">
                {numero > 0 ? `Semana ${numero}` : 'Sin semana'}
              </h2>
              <span
                className={`tnum text-body font-semibold ${
                  neto > 0 ? 'text-brand' : neto < 0 ? 'text-lose' : 'text-content-muted'
                }`}
              >
                {neto > 0 ? '+' : ''}
                {points(neto)}
              </span>
            </div>

            <ul className="stagger space-y-2.5">
              {deLaSemana.map((w, i) => {
                const market = porMercado.get(w.market_id);
                const option = market?.market_options.find((o) => o.id === w.option_id);
                const d = desenlace(w);
                return (
                  <li key={w.id} style={{ '--i': i } as React.CSSProperties}>
                    <Link
                      href={`${basePath}/apuesta/${w.market_id}`}
                      className={`card-interactive group flex items-center gap-4 px-4 py-3.5 sm:px-5 ${d.marco}`}
                    >
                      <div className="min-w-0 flex-1">
                        <p className="line-clamp-2 text-title font-medium leading-snug text-white">
                          {market?.title ?? 'Apuesta'}
                        </p>
                        <p className="mt-1 flex flex-wrap items-center gap-x-2 text-caption text-content-muted">
                          <span className={`font-semibold ${d.tono}`}>{d.etiqueta}</span>
                          <span className="text-content-faint/40">·</span>
                          <span className="text-content">{option?.label}</span>
                          <span className="num text-content-faint">
                            {points(w.stake)} pts a {fmtOdds(w.locked_odds)}
                          </span>
                        </p>
                        {w.void_reason && (
                          <p className="mt-1 text-caption text-lose/80">{w.void_reason}</p>
                        )}
                      </div>
                      <p className={`tnum shrink-0 text-figure font-semibold ${d.tono}`}>
                        {d.delta > 0 ? '+' : ''}
                        {points(d.delta)}
                      </p>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </section>
        );
      })}
    </div>
  );
}

// ------------------------------------------------------------------ lanzadas

function Lanzadas({ basePath, markets }: { basePath: string; markets: MarketWithOptions[] }) {
  if (markets.length === 0) {
    return (
      <Empty
        icon={Megaphone}
        title="No has lanzado ninguna"
        hint="Se te tiene que ocurrir algo bueno."
        action={
          <Link href={`${basePath}/nueva`} className="btn-ghost">
            <Plus size={15} weight="bold" />
            Lanzar la primera
          </Link>
        }
      />
    );
  }

  return (
    <div className="space-y-4">
      <ul className="stagger space-y-2.5">
        {markets.map((m, i) => (
          <li key={m.id} style={{ '--i': i } as React.CSSProperties}>
            <Link
              href={`${basePath}/apuesta/${m.id}`}
              className="card-interactive group flex items-center gap-4 px-4 py-3.5 sm:px-5"
            >
              <div className="min-w-0 flex-1">
                <p className="line-clamp-2 text-title font-medium leading-snug text-white">
                  {m.title}
                </p>
                <p className="num mt-1 text-caption text-content-muted">
                  {m.status === 'open'
                    ? `cierra en ${countdown(m.closes_at)}`
                    : dateTime(m.closes_at)}{' '}
                  · {points(m.market_options.reduce((a, o) => a + Number(o.pool), 0))} pts
                </p>
              </div>
              <MarketBadge status={m.status} />
            </Link>
          </li>
        ))}
      </ul>

      <Link href={`${basePath}/nueva`} className="btn-ghost w-full">
        <Plus size={16} weight="bold" />
        Lanzar otra
      </Link>
    </div>
  );
}

function Figure({ label, value, tone }: { label: string; value: string; tone: string }) {
  return (
    <div className="px-3 py-3 first:pl-0">
      <dt className="field-label">{label}</dt>
      <dd className={`tnum mt-1 text-figure font-semibold ${tone}`}>{value}</dd>
    </div>
  );
}
