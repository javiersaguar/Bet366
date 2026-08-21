import Link from 'next/link';
import { CaretLeft, CaretRight } from '@phosphor-icons/react/dist/ssr';
import type { Icon } from '@phosphor-icons/react';

/**
 * Fila que lleva a otro sitio.
 *
 * La app se recorre a dedo, así que ninguna pantalla puede ser un callejón:
 * de todas se sale tocando algo, nunca escribiendo la URL. Este componente es
 * ese "algo", con la misma forma en todas partes para que se reconozca sin
 * pensar: emblema a la izquierda, qué es y qué hace debajo, y el ángulo de la
 * derecha que dice que se va a otra pantalla.
 */
export function NavRow({
  href,
  icon: Glyph,
  title,
  hint,
  tone = 'plain',
}: {
  href: string;
  icon: Icon;
  title: string;
  hint?: string;
  /** `brand` para la acción principal de la pantalla. */
  tone?: 'plain' | 'brand';
}) {
  const marco =
    tone === 'brand'
      ? 'border-brand/30 bg-brand/[.08] text-brand'
      : 'border-line bg-surface-sunken text-content-muted';

  return (
    <Link
      href={href}
      className="group flex items-center gap-4 px-4 py-3.5 transition-colors duration-press
                 ease-out active:bg-surface-raised/60 sm:px-5"
    >
      <span
        className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl border transition-transform
                    duration-pop ease-out motion-safe:group-hover:scale-105 ${marco}`}
      >
        <Glyph size={18} weight="bold" />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block truncate text-title font-semibold text-white">{title}</span>
        {hint && <span className="mt-0.5 block text-caption text-content-muted">{hint}</span>}
      </span>
      <CaretRight
        size={16}
        weight="bold"
        className="shrink-0 text-content-faint transition-transform duration-pop ease-out
                   motion-safe:group-hover:translate-x-0.5"
      />
    </Link>
  );
}

/** Vuelta atrás explícita. El gesto del navegador no se ve, y esto sí. */
export function BackLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className="group -ml-1 inline-flex items-center gap-1 text-caption font-medium
                 text-content-muted transition-colors duration-press ease-out hover:text-content"
    >
      <CaretLeft
        size={14}
        weight="bold"
        className="transition-transform duration-pop ease-out motion-safe:group-hover:-translate-x-0.5"
      />
      {children}
    </Link>
  );
}
