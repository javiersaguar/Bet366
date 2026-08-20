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

  return (
    <nav className="mx-auto w-full max-w-3xl px-4">
      <ul className="flex gap-5">
        {TABS.map((tab) => {
          const href = `${base}${tab.href}`;
          const active = tab.href === '' ? pathname === base : pathname.startsWith(href);
          return (
            <li key={tab.href}>
              <Link
                href={href}
                className={`relative block py-2.5 text-sm font-semibold tracking-tight transition ${
                  active ? 'text-white' : 'text-content-muted hover:text-content'
                }`}
              >
                {tab.label}
                <span
                  className={`absolute inset-x-0 -bottom-px h-[2px] rounded-full transition-all duration-300 ${
                    active ? 'bg-brand opacity-100' : 'bg-brand opacity-0'
                  }`}
                />
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
