import Link from 'next/link';

/** Campana con contador de avisos sin leer. */
export function Bell({ groupId, unread }: { groupId: string; unread: number }) {
  return (
    <Link
      href={`/grupos/${groupId}/avisos`}
      aria-label={unread > 0 ? `${unread} avisos sin leer` : 'Avisos'}
      className="relative grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-line bg-surface text-content-muted transition-all duration-200 hover:border-line-strong hover:text-content"
    >
      <svg
        viewBox="0 0 24 24"
        className="h-[19px] w-[19px]"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden
      >
        <path d="M6 9a6 6 0 0 1 12 0c0 4.2 1.2 5.8 1.8 6.5.4.5 0 1.2-.6 1.2H4.8c-.7 0-1-.7-.6-1.2C4.8 14.8 6 13.2 6 9Z" />
        <path d="M10 20a2.2 2.2 0 0 0 4 0" />
      </svg>

      {unread > 0 && (
        <span className="absolute -right-1 -top-1 flex h-[18px] min-w-[18px] items-center justify-center rounded-full border-2 border-canvas bg-brand px-1">
          <span className="num text-[0.5625rem] font-bold leading-none text-brand-ink">
            {unread > 9 ? '9+' : unread}
          </span>
          <span className="absolute inset-0 animate-ping rounded-full bg-brand opacity-40" />
        </span>
      )}
    </Link>
  );
}
