import { InstagramLogo } from '@phosphor-icons/react/dist/ssr';
import { enlaceInstagram } from '@/lib/instagram';

/**
 * El Instagram de alguien del grupo, listo para pulsar.
 *
 * La dirección se arma aquí a partir del nombre guardado, nunca sale tal cual
 * de la base: lo que se escribe en el perfil es un usuario, no un enlace.
 *
 * Va con `stopPropagation` en el clic porque a menudo vive dentro de una fila
 * que a su vez lleva a otro sitio.
 */
export function InstagramLink({ usuario }: { usuario?: string | null }) {
  if (!usuario) return null;

  return (
    <a
      href={enlaceInstagram(usuario)}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={`Instagram de @${usuario}`}
      className="inline-flex items-center gap-1 rounded-md text-caption font-medium
                 text-content-muted transition-colors duration-press ease-out
                 hover:text-brand"
    >
      <InstagramLogo size={14} weight="bold" />
      <span className="truncate">@{usuario}</span>
    </a>
  );
}
