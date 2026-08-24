import Link from 'next/link';
import type { Notification, NotificationKind } from '@/lib/types';
import type { Icon } from '@phosphor-icons/react';
import {
  ArrowUUpLeft,
  CheckCircle,
  Clock,
  Flag,
  PlusCircle,
  Prohibit,
  Trophy,
  Warning,
  XCircle,
} from '@phosphor-icons/react/dist/ssr';
import { points, relative } from '@/lib/format';

/**
 * Cada tipo de aviso tiene su color y su icono, para que se distingan de un
 * vistazo sin tener que leerlos todos.
 */
const STYLE: Record<
  NotificationKind,
  { tone: string; ring: string; Icon: Icon; weight?: 'fill' | 'regular' }
> = {
  market_opened:    { tone: 'text-content-muted', ring: 'border-line bg-surface-sunken',   Icon: PlusCircle },
  market_closed:    { tone: 'text-gold',  ring: 'border-gold/30 bg-gold/[.08]',   Icon: Clock, weight: 'fill' },
  result_published: { tone: 'text-info',  ring: 'border-info/30 bg-info/[.08]',   Icon: Flag, weight: 'fill' },
  dispute_opened:   { tone: 'text-vote',  ring: 'border-vote/30 bg-vote/[.08]',   Icon: Warning, weight: 'fill' },
  wager_won:        { tone: 'text-brand', ring: 'border-brand/30 bg-brand/[.08]', Icon: CheckCircle, weight: 'fill' },
  wager_lost:       { tone: 'text-content-faint', ring: 'border-line bg-surface-sunken', Icon: XCircle },
  wager_voided:     { tone: 'text-lose',  ring: 'border-lose/30 bg-lose/[.08]',   Icon: Prohibit, weight: 'fill' },
  market_cancelled: { tone: 'text-content-muted', ring: 'border-line bg-surface-sunken', Icon: ArrowUUpLeft },
  season_rolled:    { tone: 'text-gold',  ring: 'border-gold/30 bg-gold/[.08]',   Icon: Trophy, weight: 'fill' },
};

export function NotificationRow({
  notification,
  basePath,
  index = 0,
}: {
  notification: Notification;
  basePath: string;
  index?: number;
}) {
  const s = STYLE[notification.kind];
  const unread = notification.read_at === null;

  const body = (
    <>
      <span className={`grid h-9 w-9 shrink-0 place-items-center rounded-xl border ${s.ring} ${s.tone}`}>
        <s.Icon size={18} weight={s.weight ?? 'regular'} />
      </span>

      <span className="min-w-0 flex-1">
        {/* El título puede ocupar dos líneas: cortarlo deja frases sin sentido. */}
        <span className="line-clamp-2 text-body font-semibold text-white">
          {notification.title}
        </span>
        {notification.body && (
          <span className="mt-0.5 block text-micro leading-relaxed text-content-muted">
            {notification.body}
          </span>
        )}
        <span className="mt-1 flex items-center gap-2 text-micro text-content-faint">
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

      {/* Siempre está, y lo que cambia es su opacidad. Así al pulsar «marcar
          todo leído» los puntos se apagan a la vez en lugar de esfumarse de
          golpe, que se lee como que la página ha cambiado y no como que se
          han marcado. De paso la fila no se reajusta al perderlo. */}
      <span
        aria-hidden
        className={`mt-1.5 h-2 w-2 shrink-0 rounded-full bg-brand transition-opacity
                    duration-panel ease-out ${unread ? 'opacity-100' : 'opacity-0'}`}
      />
    </>
  );

  const className = `flex gap-3 px-4 py-3.5 transition-colors duration-panel ease-out ${
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
      <Link href={`${basePath}/apuesta/${notification.market_id}`} className={className}>
        {body}
      </Link>
    </li>
  );
}
