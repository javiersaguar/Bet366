import Link from 'next/link';
import { loadGroup, loadMarkets, loadMyWagers } from '@/lib/data';
import { MarketCard } from '@/components/market-card';
import { Empty, SectionTitle } from '@/components/ui';
import { InviteCode } from '@/components/invite-code';
import { points } from '@/lib/format';
import { Countdown } from '@/components/countdown';

export const dynamic = 'force-dynamic';

export default async function BoardPage({ params }: { params: Promise<{ groupId: string }> }) {
  const { groupId } = await params;
  const { group, season, me, members } = await loadGroup(groupId);
  const markets = await loadMarkets(groupId, season.number);
  const myWagers = await loadMyWagers(
    markets.map((m) => m.id),
    me.id,
  );

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
      {/* --- cabecera con el pulso del grupo --- */}
      <section className="card animate-rise overflow-hidden">
        <div className="flex flex-wrap items-center justify-between gap-4 p-5">
          <div className="min-w-0">
            <h1 className="text-xl font-bold">El tablón</h1>
            <p className="mt-0.5 text-sm text-content-muted">
              {members.length} {members.length === 1 ? 'persona' : 'personas'} · la semana acaba en{' '}
              <Countdown to={season.ends_at} className="text-content" urgentUnder={7200_000} />
            </p>
          </div>
          <Link href={`/grupos/${groupId}/nueva`} className="btn-primary sheen">
            Lanzar apuesta
          </Link>
        </div>

        <div className="grid grid-cols-3 divide-x divide-line border-t border-line bg-surface-sunken/50">
          <Pulse label="Abiertas" value={String(live.length)} />
          <Pulse label="En el bote" value={points(totalPool)} />
          <Pulse label="Tuyo en juego" value={points(inPlay)} accent={inPlay > 0} />
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

function Pulse({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div className="px-4 py-3">
      <p className="eyebrow !mb-0.5 !text-[0.625rem]">{label}</p>
      <p className={`num text-lg font-bold ${accent ? 'text-info' : 'text-white'}`}>{value}</p>
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
