import type { Notification } from '@/lib/types';
import { NotificationRow } from '@/components/notification-row';
import { Empty, SectionTitle } from '@/components/ui';
import { BackLink } from '@/components/nav-row';
import { MarkAllRead } from '@/app/grupos/[groupId]/avisos/mark-read';

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

/** El diario de lo que ha pasado en el grupo, solo lo tuyo. */
export function NotificationsScreen({
  basePath,
  groupId,
  items,
}: {
  basePath: string;
  /** Necesario para marcar los avisos como leídos en la base. */
  groupId: string;
  items: Notification[];
}) {
  const unread = items.filter((n) => n.read_at === null).length;

  const days: { label: string; items: Notification[] }[] = [];
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
          <BackLink href={basePath}>El tablón</BackLink>
          <h1 className="mt-3 text-xl font-bold">Avisos</h1>
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
                  <NotificationRow key={n.id} notification={n} basePath={basePath} index={i} />
                ))}
              </ul>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}
