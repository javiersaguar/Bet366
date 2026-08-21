import Link from 'next/link';
import { ArrowsLeftRight } from '@phosphor-icons/react/dist/ssr';

/**
 * Salir a la lista de grupos.
 *
 * Vive en la cabecera, junto a la campana, porque cambiar de grupo es
 * navegación de primer nivel: quien está en dos porras a la vez lo hace
 * varias veces al día y no debería tener que retroceder a ciegas.
 */
export function GroupSwitch() {
  return (
    <Link
      href="/grupos"
      aria-label="Cambiar de grupo"
      title="Cambiar de grupo"
      className="grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-line
                 bg-surface text-content-muted transition-colors duration-pop ease-out
                 hover:text-content"
    >
      <ArrowsLeftRight size={18} weight="bold" />
    </Link>
  );
}
