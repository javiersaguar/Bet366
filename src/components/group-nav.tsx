'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const TABS = [
  { href: '', label: 'Tablón' },
  { href: '/mias', label: 'Mis apuestas' },
  { href: '/ranking', label: 'Ranking' },
];

export function GroupNav({ groupId }: { groupId: string }) {
  const pathname = usePathname();
  const base = `/grupos/${groupId}`;
  const activeIndex = TABS.findIndex((t) =>
    t.href === '' ? pathname === base : pathname.startsWith(`${base}${t.href}`),
  );

  return (
    <nav className="mx-auto w-full max-w-3xl px-4">
      <ul className="relative flex gap-5">
        {TABS.map((tab, i) => (
          <li key={tab.href}>
            <Link
              href={`${base}${tab.href}`}
              className={`relative block py-2.5 text-sm font-semibold tracking-tight transition-colors duration-200 ${
                i === activeIndex ? 'text-white' : 'text-content-muted hover:text-content'
              }`}
            >
              {tab.label}
              {/* Subrayado que se desliza de una pestaña a otra. */}
              {i === activeIndex && (
                <span className="absolute inset-x-0 -bottom-px h-[2px] rounded-full bg-gradient-to-r from-brand-bright to-brand shadow-[0_0_12px_rgba(43,224,140,.55)]" />
              )}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
