import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { loadGroup, loadMarkets } from '@/lib/data';
import type { Wager } from '@/lib/types';
import { countdown, dateTime, odds as fmtOdds, points, relative } from '@/lib/format';
import { Empty, MarketBadge, SectionTitle, WagerBadge } from '@/components/ui';

export const dynamic = 'force-dynamic';

export default async function MyBetsPage({ params }: { params: Promise<{ groupId: string }> }) {
  const { groupId } = await params;
  const { season, me } = await loadGroup(groupId);
  const markets = await loadMarkets(groupId, season.number);
  const supabase = await createClient();

  const { data: wagerRows } = await supabase
    .from('wagers')
    .select('*')
    .eq('user_id', me.id)
    .in('market_id', markets.length ? markets.map((m) => m.id) : ['00000000-0000-0000-0000-000000000000'])
    .order('created_at', { ascending: false });
  const wagers = (wagerRows ?? []) as Wager[];

  const launched = markets.filter((m) => m.creator_id === me.id);
  // Lo que pide acción del creador va primero: cerradas sin resultado.
  const needsResult = launched.filter((m) => m.status === 'closed');
  const restLaunched = launched.filter((m) => m.status !== 'closed');

  const staked = wagers.filter((w) => w.status === 'active').reduce((a, w) => a + Number(w.stake), 0);
  const settled = wagers.filter((w) => w.status === 'won' || w.status === 'lost');
  const wonCount = settled.filter((w) => w.status === 'won').length;

  return (
    <div className="space-y-8">
      <section className="stagger grid grid-cols-3 gap-3">
        <Stat label="En juego" value={points(staked)} accent />
        <Stat label="Acertadas" value={`${wonCount}/${settled.length}`} />
        <Stat label="Lanzadas" value={String(launched.length)} />
      </section>

      {needsResult.length > 0 && (
        <section>
          <SectionTitle count={needsResult.length} tone="warn">
            Te toca poner el resultado
          </SectionTitle>
          <div className="stagger space-y-3">
            {needsResult.map((m) => (
              <Link
                key={m.id}
                href={`/grupos/${groupId}/apuesta/${m.id}`}
                className="group card-interactive block border-gold/30 p-4 hover:border-gold/50"
              >
                <p className="font-semibold text-white">{m.title}</p>
                <p className="mt-1 text-xs text-content-muted">
                  Cerró {relative(m.closes_at)} · {m.market_options.length} opciones ·{' '}
                  <span className="num">
                    {points(m.market_options.reduce((a, o) => a + Number(o.pool), 0))} pts en juego
                  </span>
                </p>
                <p className="mt-2 text-xs font-semibold text-gold">
                  Dinos qué pasó para repartir →
                </p>
              </Link>
            ))}
          </div>
        </section>
      )}

      <section>
        <SectionTitle count={wagers.length}>Apuestas que he hecho</SectionTitle>
        {wagers.length === 0 ? (
          <Empty title="Todavía no has apostado nada" hint="Date una vuelta por el tablón y busca algo que te suene." />
        ) : (
          <ul className="card hairline overflow-hidden">
            {wagers.map((w) => {
              const market = markets.find((m) => m.id === w.market_id);
              const option = market?.market_options.find((o) => o.id === w.option_id);
              return (
                <li key={w.id}>
                  <Link
                    href={`/grupos/${groupId}/apuesta/${w.market_id}`}
                    className="block px-4 py-3.5 transition hover:bg-surface-raised"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-white">
                          {market?.title ?? 'Apuesta'}
                        </p>
                        <p className="num mt-0.5 text-xs text-content-muted">
                          {option?.label} · {points(w.stake)} pts a {fmtOdds(w.locked_odds)} →{' '}
                          <span className={w.status === 'won' ? 'text-brand' : ''}>
                            {points(w.to_win)}
                          </span>
                        </p>
                        {w.void_reason && (
                          <p className="mt-1 text-xs text-lose/80">Anulada: {w.void_reason}</p>
                        )}
                      </div>
                      <WagerBadge status={w.status} />
                    </div>
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      <section>
        <SectionTitle
          count={launched.length}
          action={
            <Link
              href={`/grupos/${groupId}/nueva`}
              className="text-2xs font-semibold uppercase tracking-[0.08em] text-brand hover:text-brand-bright"
            >
              + Nueva
            </Link>
          }
        >
          Apuestas que he lanzado
        </SectionTitle>
        {restLaunched.length === 0 && needsResult.length === 0 ? (
          <Empty
            title="No has lanzado ninguna"
            hint="Se te tiene que ocurrir algo bueno."
            action={
              <Link href={`/grupos/${groupId}/nueva`} className="btn-ghost !py-2 text-2xs">
                Lanzar la primera
              </Link>
            }
          />
        ) : (
          <ul className="card hairline overflow-hidden">
            {restLaunched.map((m) => (
              <li key={m.id}>
                <Link
                  href={`/grupos/${groupId}/apuesta/${m.id}`}
                  className="flex items-start justify-between gap-3 px-4 py-3.5 transition hover:bg-surface-raised"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-white">{m.title}</p>
                    <p className="num mt-0.5 text-xs text-content-muted">
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
        )}
      </section>
    </div>
  );
}

function Stat({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div className="card px-4 py-3.5">
      <p className="eyebrow !mb-1 !text-[0.625rem]">{label}</p>
      <p className={`num text-xl font-bold ${accent ? 'text-info' : 'text-white'}`}>{value}</p>
    </div>
  );
}
