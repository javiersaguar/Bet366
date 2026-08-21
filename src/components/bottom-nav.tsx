'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import type { Profile } from '@/lib/types';
import { Avatar } from '@/components/avatar';
import { NavBoard, NavPlus, NavPodium, NavSlip } from '@/components/nav-icons';

/**
 * Navegación inferior, como en cualquier app de móvil: siempre al alcance del
 * pulgar. El botón central es la acción que más se repite, lanzar una apuesta.
 */
export function BottomNav({ groupId, me }: { groupId: string; me: Profile }) {
  const pathname = usePathname();
  // La vista de demostración vive en /demo con las mismas pantallas.
  const base = pathname.startsWith('/demo') ? '/demo' : `/grupos/${groupId}`;

  const is = (href: string, exact = false) =>
    exact ? pathname === href : pathname.startsWith(href);

  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-canvas/85 backdrop-blur-xl">
      <div className="mx-auto grid max-w-md grid-cols-5 items-end px-2 pb-[max(0.5rem,env(safe-area-inset-bottom))] pt-2">
        <Tab href={base} active={is(base, true)} label="Tablón">
          <NavBoard active={is(base, true)} />
        </Tab>

        <Tab href={`${base}/mias`} active={is(`${base}/mias`)} label="Mis apuestas">
          <NavSlip active={is(`${base}/mias`)} />
        </Tab>

        {/* Acción principal, elevada sobre la barra. */}
        <Link
          href={`${base}/nueva`}
          aria-label="Lanzar apuesta"
          className="group -mt-6 grid place-items-center gap-1"
        >
          <span className="grid h-14 w-14 place-items-center rounded-2xl border border-brand/40 bg-gradient-to-b from-brand-bright to-brand text-brand-ink shadow-[0_10px_28px_-10px_rgba(43,224,140,.8)] transition-transform duration-200 ease-snap group-hover:scale-105 group-active:scale-95">
            <NavPlus />
          </span>
          <span className="text-[0.625rem] font-semibold tracking-tight text-content-muted transition-colors group-hover:text-brand">
            Lanzar
          </span>
        </Link>

        <Tab href={`${base}/ranking`} active={is(`${base}/ranking`)} label="Ranking">
          <NavPodium active={is(`${base}/ranking`)} />
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
