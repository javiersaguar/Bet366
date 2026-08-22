import Link from 'next/link';
import { ArrowRight, Eye } from '@phosphor-icons/react/dist/ssr';
import { BUILD_STAMP } from '@/lib/build';

/**
 * Aviso de que esto es la demostración, y salida a la app de verdad.
 *
 * Antes era un enlace subrayado dentro de una línea de texto pequeña, en la
 * franja que además se comía la isla dinámica del iPhone. Ahora la salida es
 * un botón con su propio peso, y va a /login directamente: desde la demo lo
 * que se quiere es entrar, no aterrizar en una lista de grupos vacía.
 */
export function DemoBanner() {
  return (
    <div className="border-b border-gold/25 bg-gold/[.07]">
      <div className="mx-auto flex w-full max-w-3xl items-center gap-3 px-5 py-2.5">
        <Eye size={16} weight="fill" className="shrink-0 text-gold" />
        <p className="min-w-0 flex-1 text-caption leading-snug text-gold">
          Estás viendo la demostración
          <span className="block text-micro text-gold/70">
            Gente y apuestas inventadas
            <span className="tnum ml-2 hidden opacity-60 sm:inline">{BUILD_STAMP}</span>
          </span>
        </p>
        <Link
          href="/login"
          className="btn shrink-0 border border-gold/40 bg-gold/15 !px-3 !py-1.5 text-caption
                     font-semibold text-gold hover:bg-gold/25"
        >
          Entrar
          <ArrowRight size={14} weight="bold" />
        </Link>
      </div>
    </div>
  );
}
