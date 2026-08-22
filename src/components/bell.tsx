import Link from 'next/link';
import { Bell as BellIcon } from '@phosphor-icons/react/dist/ssr';

/** Campana con contador de avisos sin leer. */
export function Bell({
  groupId,
  unread,
  demo = false,
}: {
  groupId: string;
  unread: number;
  /* La demostración tiene varios grupos, pero todos viven bajo `/demo`. */
  demo?: boolean;
}) {
  const href = demo ? '/demo/avisos' : `/grupos/${groupId}/avisos`;

  return (
    <Link
      href={href}
      aria-label={unread > 0 ? `${unread} avisos sin leer` : 'Avisos'}
      className="relative grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-line
                 bg-surface text-content-muted transition-colors duration-pop ease-out
                 hover:text-content"
    >
      <BellIcon size={19} weight={unread > 0 ? 'fill' : 'regular'} />

      {unread > 0 && (
        <span className="absolute -right-1 -top-1 grid h-[18px] min-w-[18px] place-items-center rounded-full border-2 border-canvas bg-brand px-1">
          <span className="num text-[0.5625rem] font-semibold leading-none text-brand-ink">
            {unread > 9 ? '9+' : unread}
          </span>
        </span>
      )}
    </Link>
  );
}
