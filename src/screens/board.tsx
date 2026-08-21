import Link from 'next/link';
import type { Group, MarketWithOptions, Profile, Season, Wager } from '@/lib/types';
import { MarketCard } from '@/components/market-card';
import { Empty, SectionTitle } from '@/components/ui';
import { InviteCode } from '@/components/invite-code';
import { CountUp } from '@/components/count-up';
import { Countdown } from '@/components/countdown';

/**
 * El tablón. Recibe los datos ya cargados, así que la misma pantalla sirve
 * para la app real y para la vista de demostración.
 */
export function BoardScreen({
  groupId,
  group,
  season,
  members,
  markets,
  myWagers,
}: {
  groupId: string;
  group: Group;
  season: Season;
  members: Profile[];
  markets: MarketWithOptions[];
  myWagers: Wager[];
}) {
  const live = markets.filter((m) => m.status === 'open');
  const awaiting = markets.filter((m) => ['closed', 'pending', 'disputed'].includes(m.status));
  const done = markets.filter((m) => ['resolved', 'cancelled'].includes(m.status));

  const inPlay = myWagers
    .filter((w) => w.status === 'active')
    .reduce((a, w) => a + Number(w.stake), 0);
  const totalPool = markets.reduce(
    (a, m) => a + m.market_options.reduce((s, o) => s + Number(o.pool), 0),
    0,
  );

  return (
    <div className="space-y-8">
      <section className="card animate-rise overflow-hidden">
        <div className="flex items-start justify-between gap-4 p-5 pb-4">
          <div className="min-w-0">
            <h1 className="text-xl font-bold">El tablón</h1>
            <p className="mt-0.5 text-sm text-content-muted">
              {members.length} {members.length === 1 ? 'persona' : 'personas'} · acaba en{' '}
              <Countdown to={season.ends_at} className="text-content" urgentUnder={7200_000} />
            </p>
          </div>
          <Link
            href={`/grupos/${groupId}/nueva`}
            className="btn-primary sheen hidden shrink-0 sm:inline-flex"
          >
            Lanzar apuesta
          </Link>
        </div>

        {/* Las tres cifras que resumen la semana, con las etiquetas en una línea. */}
        <div className="grid grid-cols-3 divide-x divide-line border-t border-line bg-surface-sunken/60">
          <Pulse label="Abiertas" value={live.length} />
          <Pulse label="En el bote" value={totalPool} />
          <Pulse label="En juego" value={inPlay} accent={inPlay > 0} />
        </div>

        {/* En móvil el botón va abajo y a todo el ancho: se llega mejor con el pulgar. */}
        <div className="border-t border-line p-3 sm:hidden">
          <Link href={`/grupos/${groupId}/nueva`} className="btn-primary sheen w-full">
            Lanzar apuesta
          </Link>
        </div>
      </section>

      {markets.length === 0 && (
        <Empty
          title="Aún no hay ninguna apuesta"
          hint="Lanza la primera: «¿a que fulanito se lía con menganito?»"
          action={
            <Link href={`/grupos/${groupId}/nueva`} className="btn-primary !py-2 text-2xs">
              Lanzar la primera
            </Link>
          }
        />
      )}

      {live.length > 0 && (
        <Section title="Abiertas" count={live.length}>
          {live.map((m, i) => (
            <MarketCard key={m.id} market={m} groupId={groupId} myWagers={myWagers} index={i} />
          ))}
        </Section>
      )}

      {awaiting.length > 0 && (
        <Section title="Esperando resultado" count={awaiting.length}>
          {awaiting.map((m, i) => (
            <MarketCard key={m.id} market={m} groupId={groupId} myWagers={myWagers} index={i} />
          ))}
        </Section>
      )}

      {done.length > 0 && (
        <Section title="Historial" count={done.length}>
          {done.map((m, i) => (
            <MarketCard key={m.id} market={m} groupId={groupId} myWagers={myWagers} index={i} />
          ))}
        </Section>
      )}

      <InviteCode code={group.invite_code} groupName={group.name} />
    </div>
  );
}

function Pulse({ label, value, accent }: { label: string; value: number; accent?: boolean }) {
  return (
    <div className="px-3 py-3 text-center sm:px-4 sm:text-left">
      <p className="eyebrow !mb-1 !whitespace-nowrap !text-[0.625rem]">{label}</p>
      <CountUp
        value={value}
        duration={750}
        className={`block text-lg font-bold leading-none ${accent ? 'text-info' : 'text-white'}`}
      />
    </div>
  );
}

function Section({
  title,
  count,
  children,
}: {
  title: string;
  count: number;
  children: React.ReactNode;
}) {
  return (
    <section>
      <SectionTitle count={count}>{title}</SectionTitle>
      <div className="stagger space-y-2.5">{children}</div>
    </section>
  );
}
