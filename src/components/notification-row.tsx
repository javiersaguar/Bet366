import Link from 'next/link';
import type { Notification, NotificationKind } from '@/lib/types';
import { points, relative } from '@/lib/format';

/**
 * Cada tipo de aviso tiene su color y su icono, para que se distingan de un
 * vistazo sin tener que leerlos todos.
 */
const STYLE: Record<NotificationKind, { tone: string; ring: string; icon: React.ReactNode }> = {
  market_opened: {
    tone: 'text-content-muted',
    ring: 'border-line bg-surface-sunken',
    icon: <path d="M12 5v14M5 12h14" />,
  },
  market_closed: {
    tone: 'text-gold',
    ring: 'border-gold/30 bg-gold/[.08]',
    icon: <><circle cx="12" cy="12" r="8.5" /><path d="M12 7.5V12l3 2" /></>,
  },
  result_published: {
    tone: 'text-info',
    ring: 'border-info/30 bg-info/[.08]',
    icon: <><path d="M5 4v16" /><path d="M5 5h11l-1.6 3.5L16 12H5" /></>,
  },
  dispute_opened: {
    tone: 'text-vote',
    ring: 'border-vote/30 bg-vote/[.08]',
    icon: <><path d="M12 3.6 22 20H2L12 3.6Z" /><path d="M12 10v4.4M12 17.4v.1" /></>,
  },
  wager_won: {
    tone: 'text-brand',
    ring: 'border-brand/30 bg-brand/[.08]',
    icon: <path d="m4.5 12.5 5 5 10-11" />,
  },
  wager_lost: {
    tone: 'text-content-faint',
    ring: 'border-line bg-surface-sunken',
    icon: <path d="m6.5 6.5 11 11M17.5 6.5l-11 11" />,
  },
  wager_voided: {
    tone: 'text-lose',
    ring: 'border-lose/30 bg-lose/[.08]',
    icon: <><circle cx="12" cy="12" r="8.5" /><path d="m6.5 6.5 11 11" /></>,
  },
  market_cancelled: {
    tone: 'text-content-muted',
    ring: 'border-line bg-surface-sunken',
    icon: <><path d="M4 9a6 6 0 0 1 6-6h5.5" /><path d="m13 1 2.8 2-2.8 2" /><path d="M20 15a6 6 0 0 1-6 6H8.5" /><path d="m11 23-2.8-2 2.8-2" /></>,
  },
  season_rolled: {
    tone: 'text-gold',
    ring: 'border-gold/30 bg-gold/[.08]',
    icon: <><path d="M7.5 4h9v5.5a4.5 4.5 0 0 1-9 0V4Z" /><path d="M12 14v3.5M9 20.5h6" /></>,
  },
};

export function NotificationRow({
  notification,
  groupId,
  index = 0,
}: {
  notification: Notification;
  groupId: string;
  index?: number;
}) {
  const s = STYLE[notification.kind];
  const unread = notification.read_at === null;

  const body = (
    <>
      <span className={`grid h-9 w-9 shrink-0 place-items-center rounded-xl border ${s.ring} ${s.tone}`}>
        <svg
          viewBox="0 0 24 24"
          className="h-[18px] w-[18px]"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.9"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden
        >
          {s.icon}
        </svg>
      </span>

      <span className="min-w-0 flex-1">
        {/* El título puede ocupar dos líneas: cortarlo deja frases sin sentido. */}
        <span className="line-clamp-2 text-sm font-semibold leading-snug text-white">
          {notification.title}
        </span>
        {notification.body && (
          <span className="mt-0.5 block text-2xs leading-relaxed text-content-muted">
            {notification.body}
          </span>
        )}
        <span className="mt-1 flex items-center gap-2 text-2xs text-content-faint">
          <span className="num">{relative(notification.created_at)}</span>
          {notification.amount !== null && (
            <>
              <span className="text-content-faint/40">·</span>
              <span className={`num font-semibold ${s.tone}`}>
                {notification.kind === 'wager_won' ? '+' : ''}
                {points(notification.amount)} pts
              </span>
            </>
          )}
        </span>
      </span>

      {unread && <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-brand" />}
    </>
  );

  const className = `flex gap-3 px-4 py-3.5 transition-colors ${
    unread ? 'bg-brand/[.035]' : ''
  } ${notification.market_id ? 'hover:bg-surface-raised' : ''}`;

  if (!notification.market_id) {
    return (
      <li style={{ '--i': index } as React.CSSProperties} className={className}>
        {body}
      </li>
    );
  }

  return (
    <li style={{ '--i': index } as React.CSSProperties}>
      <Link href={`/grupos/${groupId}/apuesta/${notification.market_id}`} className={className}>
        {body}
      </Link>
    </li>
  );
}
