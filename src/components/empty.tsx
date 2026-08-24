import { Receipt } from '@phosphor-icons/react/dist/ssr';
import type { Icon } from '@phosphor-icons/react';

/**
 * Cuando no hay nada que enseñar.
 *
 * Sin tarjeta: un hueco vacío no es un objeto con el que se interactúe, así
 * que no lleva marco. Y el emblema lo pone quien lo usa, porque «no tienes
 * nada en juego» y «aquí no ha pasado nada» no son lo mismo.
 *
 * Vive aquí y no en `ui.tsx` por ese emblema. `ui.tsx` es `'use client'`, y
 * un componente de React es una función: pasarla de un componente de
 * servidor a uno de cliente revienta al serializar («Functions cannot be
 * passed directly to Client Components»). Esto no necesita nada del
 * navegador, así que se queda en el servidor y el icono viaja sin salir de
 * ahí.
 */
export function Empty({
  title,
  hint,
  action,
  icon: Glyph = Receipt,
}: {
  title: string;
  hint?: string;
  action?: React.ReactNode;
  icon?: Icon;
}) {
  return (
    <div className="grid place-items-center gap-4 px-6 py-14 text-center">
      <span
        className="grid h-14 w-14 place-items-center rounded-2xl border border-line
                   bg-surface-sunken text-content-faint"
      >
        <Glyph size={24} />
      </span>
      <div className="space-y-1.5">
        <p className="text-title font-semibold text-white">{title}</p>
        {hint && (
          <p className="mx-auto max-w-[30ch] text-body leading-relaxed text-content-muted">{hint}</p>
        )}
      </div>
      {action}
    </div>
  );
}
