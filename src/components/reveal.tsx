'use client';

import { useState } from 'react';
import { CaretDown } from '@phosphor-icons/react/dist/csr/CaretDown';

/**
 * Guarda la cola de una lista larga detrás de un botón.
 *
 * El historial del tablón crece toda la semana y acaba siendo la mitad del
 * scroll, tapando lo único que se puede tocar: las apuestas abiertas. Se
 * enseñan las últimas y el resto se pide.
 *
 * Lo de dentro se monta al abrir, así que entra con el escalonado que ya tiene
 * la lista y no hace falta animar la altura, que sí arrastraría layout.
 */
export function Reveal({
  children,
  label,
  count,
}: {
  children: React.ReactNode;
  label: string;
  count: number;
}) {
  const [abierto, setAbierto] = useState(false);

  if (count <= 0) return null;

  return (
    <>
      {abierto && children}

      <button
        type="button"
        onClick={() => setAbierto((v) => !v)}
        aria-expanded={abierto}
        className="mt-2.5 flex w-full items-center justify-center gap-1.5 rounded-xl border
                   border-line py-2.5 text-caption font-semibold text-content-muted
                   transition-[transform,border-color,color] duration-press ease-out
                   hover:border-line-strong hover:text-content active:scale-[0.99]"
      >
        {abierto ? 'Ver menos' : `${label} (${count})`}
        <CaretDown
          size={13}
          weight="bold"
          className="transition-transform duration-pop ease-out"
          style={{ transform: abierto ? 'rotate(180deg)' : 'none' }}
        />
      </button>
    </>
  );
}
