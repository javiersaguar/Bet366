'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ChartBar, Plus, Receipt, SquaresFour } from '@phosphor-icons/react/dist/ssr';
import type { Profile } from '@/lib/types';
import { Avatar } from '@/components/avatar';

/**
 * Navegación inferior, al alcance del pulgar.
 *
 * Los iconos cambian de peso (regular a fill) en la pestaña activa: el cambio
 * de masa se lee antes que el de color, y funciona igual sin percibir color.
 * No hay animación en el cambio de pestaña: es la acción más repetida de la
 * app y animarla la haría sentir lenta.
 */
const TABS = [
  { href: '', label: 'Tablón', Icon: SquaresFour },
  { href: '/mias', label: 'Mis apuestas', Icon: Receipt },
] as const;

const TABS_RIGHT = [
  { href: '/ranking', label: 'Ranking', Icon: ChartBar },
] as const;

export function BottomNav({ groupId, me }: { groupId: string; me: Profile }) {
  const pathname = usePathname();
  // La vista de demostración usa las mismas pantallas bajo otra ruta base.
  const base = pathname.startsWith('/demo') ? '/demo' : `/grupos/${groupId}`;

  const isActive = (href: string) =>
    href === '' ? pathname === base : pathname.startsWith(`${base}${href}`);

  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-canvas/85 backdrop-blur-xl">
      <div className="mx-auto grid max-w-md grid-cols-5 items-end px-2 pb-[max(0.5rem,env(safe-area-inset-bottom))] pt-2">
        {TABS.map(({ href, label, Icon }) => (
          <Tab key={href} href={`${base}${href}`} active={isActive(href)} label={label}>
            <Icon size={23} weight={isActive(href) ? 'fill' : 'regular'} />
          </Tab>
        ))}

        {/* Acción principal, elevada. Es lo que más se repite después de mirar. */}
        <Link
          href={`${base}/nueva`}
          aria-label="Lanzar apuesta"
          className="group -mt-6 grid place-items-center gap-1"
        >
          <span
            className="grid h-14 w-14 place-items-center rounded-2xl bg-brand text-brand-ink
                       shadow-[0_10px_28px_-10px_rgba(43,224,140,.8)]
                       transition-transform duration-press ease-out
                       group-active:scale-[0.94]"
          >
            <Plus size={26} weight="bold" />
          </span>
          <span className="text-micro font-medium text-content-muted">Lanzar</span>
        </Link>

        {TABS_RIGHT.map(({ href, label, Icon }) => (
          <Tab key={href} href={`${base}${href}`} active={isActive(href)} label={label}>
            <Icon size={23} weight={isActive(href) ? 'fill' : 'regular'} />
          </Tab>
        ))}

        <Tab href={`${base}/perfil`} active={isActive('/perfil')} label="Perfil">
          <Avatar
            profile={me}
            size="xs"
            className={isActive('/perfil') ? '!border-brand/60' : 'opacity-70'}
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
      className={`flex flex-col items-center gap-1 rounded-xl py-1.5
                  transition-colors duration-press ease-out
                  ${active ? 'text-brand' : 'text-content-faint'}`}
    >
      {children}
      <span className="text-micro font-medium">{label}</span>
    </Link>
  );
}
