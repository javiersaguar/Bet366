import Link from 'next/link';
import { Plus } from '@phosphor-icons/react/dist/ssr';
import type { Group, MarketWithOptions, Profile, Season, Wager } from '@/lib/types';
import { MarketRow } from '@/components/market-row';
import { Empty } from '@/components/ui';
import { InviteCode } from '@/components/invite-code';
import { points } from '@/lib/format';
import { Countdown } from '@/components/countdown';
import { TodoCallout } from '@/components/todo-callout';

/**
 * El tablón.
 *
 * Las cifras de la semana van sueltas sobre el fondo, separadas por líneas:
 * son un dato, no un objeto. Las apuestas sí llevan marco, porque cada una es
 * una cosa con la que se interactúa y hay que ver dónde empieza y dónde acaba.
 */
export function BoardScreen({
  basePath,
  group,
  season,
  me,
  members,
  markets,
  myWagers,
}: {
  basePath: string;
  group: Group;
  season: Season;
  me: Profile;
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
    <div className="space-y-7">
      {/* Resumen de la semana: tres cifras sin contenedor, que no compiten con
          los marcos de las apuestas. */}
      <section>
        <h1 className="text-display font-semibold">El tablón</h1>
        <p className="mt-1 text-body text-content-muted">
          {members.length} {members.length === 1 ? 'persona' : 'personas'} · acaba en{' '}
          <Countdown to={season.ends_at} className="text-content" urgentUnder={7200_000} />
        </p>

        <dl className="mt-5 grid grid-cols-3 divide-x divide-line border-y border-line">
          <Figure label="Abiertas" value={String(live.length)} />
          <Figure label="En el bote" value={points(totalPool)} />
          <Figure label="En juego" value={points(inPlay)} tone={inPlay > 0 ? 'info' : 'plain'} />
        </dl>
      </section>

      <TodoCallout basePath={basePath} markets={markets} meId={me.id} />

      {markets.length === 0 ? (
        <Empty
          title="Aún no hay ninguna apuesta"
          hint="Lanza la primera: «¿a que fulanito se lía con menganito?»"
          action={
            <Link href={`${basePath}/nueva`} className="btn-primary">
              Lanzar la primera
            </Link>
          }
        />
      ) : (
        <>
          <Section title="Abiertas" count={live.length}>
            {live.map((m, i) => (
              <MarketRow key={m.id} market={m} basePath={basePath} myWagers={myWagers} index={i} />
            ))}
          </Section>

          <Section title="Esperando resultado" count={awaiting.length}>
            {awaiting.map((m, i) => (
              <MarketRow key={m.id} market={m} basePath={basePath} myWagers={myWagers} index={i} />
            ))}
          </Section>

          <Section title="Historial" count={done.length}>
            {done.map((m, i) => (
              <MarketRow key={m.id} market={m} basePath={basePath} myWagers={myWagers} index={i} />
            ))}
          </Section>
        </>
      )}

      {/* En escritorio el botón central de la barra queda lejos del cursor. */}
      <Link
        href={`${basePath}/nueva`}
        className="btn-primary hidden w-full sm:inline-flex"
      >
        <Plus size={17} weight="bold" />
        Lanzar apuesta
      </Link>

      <InviteCode code={group.invite_code} groupName={group.name} />
    </div>
  );
}

function Figure({
  label,
  value,
  tone = 'plain',
}: {
  label: string;
  value: string;
  tone?: 'plain' | 'info';
}) {
  return (
    <div className="px-3 py-3 first:pl-0">
      <dt className="field-label">{label}</dt>
      <dd
        className={`tnum mt-1 text-figure font-semibold ${
          tone === 'info' ? 'text-info' : 'text-white'
        }`}
      >
        {value}
      </dd>
    </div>
  );
}

/**
 * Encabezado de sección: título en caja normal con su recuento al lado. Sin
 * antetítulo en versalitas: repetirlo en cada sección es la marca de agua de
 * una plantilla, y aquí el título ya dice lo que hay.
 */
function Section({
  title,
  count,
  children,
}: {
  title: string;
  count: number;
  children: React.ReactNode;
}) {
  if (count === 0) return null;

  return (
    <section>
      <div className="mb-3 flex items-baseline gap-2">
        <h2 className="text-title-lg font-semibold">{title}</h2>
        <span className="tnum text-caption text-content-faint">{count}</span>
      </div>
      <ul className="stagger space-y-2.5">{children}</ul>
    </section>
  );
}
