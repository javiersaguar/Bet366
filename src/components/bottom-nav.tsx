'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import type { Profile } from '@/lib/types';
import { Avatar } from '@/components/avatar';

/** Iconos de la barra: trazo de 1,7 para que aguanten a 22px. */
const ICONS = {
  board: (
    <>
      <rect x="3" y="4" width="18" height="16" rx="3" />
      <path d="M7 9h6M7 13h10M7 17h4" />
    </>
  ),
  slips: (
    <>
      <path d="M4 5.5A1.5 1.5 0 0 1 5.5 4h13A1.5 1.5 0 0 1 20 5.5V20l-2.7-1.6L14.7 20 12 18.4 9.3 20l-2.6-1.6L4 20V5.5Z" />
      <path d="M8.5 9.5h7M8.5 13.5h4" />
    </>
  ),
  rank: (
    <>
      <path d="M4 20h4v-7H4zM10 20h4V4h-4zM16 20h4v-11h-4z" />
    </>
  ),
} as const;

function Icon({ name, active }: { name: keyof typeof ICONS; active: boolean }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-[22px] w-[22px]"
      fill="none"
      stroke="currentColor"
      strokeWidth={active ? 2 : 1.7}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      {ICONS[name]}
    </svg>
  );
}

/**
 * Navegación inferior, como en cualquier app de móvil: siempre al alcance del
 * pulgar. El botón central es la acción que más se repite, lanzar una apuesta.
 */
export function BottomNav({ groupId, me }: { groupId: string; me: Profile }) {
  const pathname = usePathname();
  const base = `/grupos/${groupId}`;

  const is = (href: string, exact = false) =>
    exact ? pathname === href : pathname.startsWith(href);

  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-canvas/85 backdrop-blur-xl">
      <div className="mx-auto grid max-w-md grid-cols-5 items-end px-2 pb-[max(0.5rem,env(safe-area-inset-bottom))] pt-2">
        <Tab href={base} active={is(base, true)} label="Tablón">
          <Icon name="board" active={is(base, true)} />
        </Tab>

        <Tab href={`${base}/mias`} active={is(`${base}/mias`)} label="Mis apuestas">
          <Icon name="slips" active={is(`${base}/mias`)} />
        </Tab>

        {/* Acción principal, elevada sobre la barra. */}
        <Link
          href={`${base}/nueva`}
          aria-label="Lanzar apuesta"
          className="group -mt-6 grid place-items-center gap-1"
        >
          <span className="grid h-14 w-14 place-items-center rounded-2xl border border-brand/40 bg-gradient-to-b from-brand-bright to-brand text-brand-ink shadow-[0_10px_28px_-10px_rgba(43,224,140,.8)] transition-transform duration-200 ease-snap group-hover:scale-105 group-active:scale-95">
            <svg
              viewBox="0 0 24 24"
              className="h-7 w-7"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.4"
              strokeLinecap="round"
            >
              <path d="M12 5v14M5 12h14" />
            </svg>
          </span>
          <span className="text-[0.625rem] font-semibold tracking-tight text-content-muted transition-colors group-hover:text-brand">
            Lanzar
          </span>
        </Link>

        <Tab href={`${base}/ranking`} active={is(`${base}/ranking`)} label="Ranking">
          <Icon name="rank" active={is(`${base}/ranking`)} />
        </Tab>

        <Tab href={`${base}/perfil`} active={is(`${base}/perfil`)} label="Perfil">
          <Avatar
            profile={me}
            size="xs"
            className={is(`${base}/perfil`) ? '!border-brand/60' : 'opacity-80'}
          />
        </Tab>
      </div>
    </nav>
  );
}

function Tab({
  href,
  active,
  label,
  children,
}: {
  href: string;
  active: boolean;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      aria-current={active ? 'page' : undefined}
      className={`relative flex flex-col items-center gap-1 rounded-xl py-1.5 transition-colors duration-200 ${
        active ? 'text-brand' : 'text-content-faint hover:text-content-muted'
      }`}
    >
      {children}
      <span className="text-[0.625rem] font-semibold tracking-tight">{label}</span>
      {active && (
        <span className="absolute -top-0.5 h-0.5 w-6 rounded-full bg-brand shadow-[0_0_10px_rgba(43,224,140,.7)]" />
      )}
    </Link>
  );
}
