import Link from 'next/link';
import { loadGroup, loadMarkets, loadMyWagers } from '@/lib/data';
import { MarketCard } from '@/components/market-card';
import { Empty, SectionTitle } from '@/components/ui';
import { InviteCode } from '@/components/invite-code';

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

  return (
    <div className="space-y-8">
      <section className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-white">El tablón</h1>
          <p className="text-sm text-content-muted">
            {members.length} en el grupo · la semana acaba{' '}
            {new Date(season.ends_at).toLocaleDateString('es-ES', {
              weekday: 'long',
              day: 'numeric',
              month: 'long',
            })}
          </p>
        </div>
        <Link href={`/grupos/${groupId}/nueva`} className="btn-primary">
          + Lanzar apuesta
        </Link>
      </section>

      {markets.length === 0 && (
        <Empty
          icon="🎲"
          title="Aún no hay ninguna apuesta"
          hint="Lanza la primera: «¿a que fulanito se lía con menganito?»"
        />
      )}

      {live.length > 0 && (
        <Section title="Abiertas" count={live.length}>
          {live.map((m) => (
            <MarketCard key={m.id} market={m} groupId={groupId} myWagers={myWagers} />
          ))}
        </Section>
      )}

      {awaiting.length > 0 && (
        <Section title="Esperando resultado" count={awaiting.length}>
          {awaiting.map((m) => (
            <MarketCard key={m.id} market={m} groupId={groupId} myWagers={myWagers} />
          ))}
        </Section>
      )}

      {done.length > 0 && (
        <Section title="Historial" count={done.length}>
          {done.map((m) => (
            <MarketCard key={m.id} market={m} groupId={groupId} myWagers={myWagers} />
          ))}
        </Section>
      )}

      <InviteCode code={group.invite_code} />
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
      <div className="space-y-2.5">{children}</div>
    </section>
  );
}
