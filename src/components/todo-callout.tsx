import Link from 'next/link';
import { CaretRight, Gavel, Scales } from '@phosphor-icons/react/dist/ssr';
import type { MarketWithOptions } from '@/lib/types';

/**
 * Lo que está esperando por ti.
 *
 * En esta app los puntos no se mueven solos: hasta que quien lanzó la apuesta
 * no dice qué pasó, el dinero de todo el mundo se queda quieto. Ese aviso
 * vivía únicamente en la campana, que es justo donde nadie mira dos veces.
 * Aquí va arriba del tablón, con el tono de urgencia del estado que lo pide, y
 * desaparece solo cuando no hay nada pendiente.
 */
export function TodoCallout({
  basePath,
  markets,
  meId,
}: {
  basePath: string;
  markets: MarketWithOptions[];
  meId: string;
}) {
  const porResolver = markets.filter((m) => m.status === 'closed' && m.creator_id === meId);
  const porVotar = markets.filter((m) => m.status === 'disputed');

  if (porResolver.length === 0 && porVotar.length === 0) return null;

  return (
    <ul className="space-y-2.5">
      {porResolver.length > 0 && (
        <Aviso
          href={`${basePath}/apuesta/${porResolver[0].id}`}
          icon={<Gavel size={18} weight="fill" />}
          tono="gold"
          titulo={
            porResolver.length === 1
              ? 'Te toca decir qué pasó'
              : `Te toca decir qué pasó en ${porResolver.length} apuestas`
          }
          detalle={
            porResolver.length === 1
              ? porResolver[0].title
              : 'Hasta que no lo digas, nadie cobra'
          }
        />
      )}

      {porVotar.length > 0 && (
        <Aviso
          href={`${basePath}/apuesta/${porVotar[0].id}`}
          icon={<Scales size={18} weight="fill" />}
          tono="vote"
          titulo={
            porVotar.length === 1
              ? 'Hay un resultado impugnado'
              : `Hay ${porVotar.length} resultados impugnados`
          }
          detalle="Vota tú también, decide la mayoría"
        />
      )}
    </ul>
  );
}

const TONOS = {
  gold: {
    caja: 'border-gold/30 bg-gold/[.07]',
    emblema: 'border-gold/30 bg-gold/[.12] text-gold',
    titulo: 'text-gold',
  },
  vote: {
    caja: 'border-vote/30 bg-vote/[.07]',
    emblema: 'border-vote/30 bg-vote/[.12] text-vote',
    titulo: 'text-vote',
  },
} as const;

function Aviso({
  href,
  icon,
  tono,
  titulo,
  detalle,
}: {
  href: string;
  icon: React.ReactNode;
  tono: keyof typeof TONOS;
  titulo: string;
  detalle: string;
}) {
  const t = TONOS[tono];
  return (
    <li>
      <Link
        href={href}
        className={`group flex items-center gap-3.5 rounded-2xl border px-4 py-3.5
                    transition-[transform,border-color] duration-pop ease-out
                    active:scale-[0.995] ${t.caja}`}
      >
        <span
          className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl border
                      transition-transform duration-pop ease-out
                      motion-safe:group-hover:scale-105 ${t.emblema}`}
        >
          {icon}
        </span>
        <span className="min-w-0 flex-1">
          <span className={`block text-title font-semibold ${t.titulo}`}>{titulo}</span>
          <span className="mt-0.5 block truncate text-caption text-content-muted">{detalle}</span>
        </span>
        <CaretRight
          size={16}
          weight="bold"
          className="shrink-0 text-content-faint transition-transform duration-pop ease-out
                     motion-safe:group-hover:translate-x-0.5"
        />
      </Link>
    </li>
  );
}
