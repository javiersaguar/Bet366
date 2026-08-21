import { loadGroup, loadNotifications } from '@/lib/data';
import { NotificationRow } from '@/components/notification-row';
import { Empty, SectionTitle } from '@/components/ui';
import { MarkAllRead } from './mark-read';

export const dynamic = 'force-dynamic';

/** Agrupa por día para que la lista se lea como un diario del grupo. */
function dayLabel(iso: string): string {
  const d = new Date(iso);
  const today = new Date();
  const yesterday = new Date(Date.now() - 86_400_000);
  const same = (a: Date, b: Date) => a.toDateString() === b.toDateString();
  if (same(d, today)) return 'Hoy';
  if (same(d, yesterday)) return 'Ayer';
  return d.toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' });
}

export default async function NotificationsPage({
  params,
}: {
  params: Promise<{ groupId: string }>;
}) {
  const { groupId } = await params;
  await loadGroup(groupId);
  const items = await loadNotifications(groupId);

  const unread = items.filter((n) => n.read_at === null).length;

  const days: { label: string; items: typeof items }[] = [];
  for (const n of items) {
    const label = dayLabel(n.created_at);
    const last = days[days.length - 1];
    if (last?.label === label) last.items.push(n);
    else days.push({ label, items: [n] });
  }

  return (
    <div className="space-y-8">
      <header className="flex items-end justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold">Avisos</h1>
          <p className="mt-0.5 text-sm text-content-muted">
            {unread > 0 ? `${unread} sin leer` : 'Todo al día'}
          </p>
        </div>
        {unread > 0 && <MarkAllRead groupId={groupId} />}
      </header>

      {items.length === 0 ? (
        <Empty
          title="Aquí no ha pasado nada todavía"
          hint="Cuando alguien lance una apuesta, publique un resultado o te toque resolver, aparecerá aquí."
        />
      ) : (
        <div className="space-y-6">
          {days.map((day) => (
            <section key={day.label}>
              <SectionTitle count={day.items.length}>{day.label}</SectionTitle>
              <ul className="stagger card hairline overflow-hidden">
                {day.items.map((n, i) => (
                  <NotificationRow key={n.id} notification={n} groupId={groupId} index={i} />
                ))}
              </ul>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}
