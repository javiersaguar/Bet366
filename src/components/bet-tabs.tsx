'use client';

import { useState } from 'react';

export type Pestana = { clave: string; titulo: string; cuenta: number };

/**
 * Sub-pestañas dentro de una pantalla.
 *
 * El contenido de las tres llega ya pintado desde el servidor y aquí solo se
 * enseña una: cambiar de pestaña no vuelve al servidor y se siente inmediato,
 * que es lo que se espera de algo que se toca varias veces seguidas.
 *
 * La barra que marca la activa se desliza en 180ms. Es lo único que se mueve:
 * el contenido aparece y desaparece sin animación a propósito, porque animar
 * lo que se cambia a menudo lo hace sentir lento.
 */
export function BetTabs({
  pestanas,
  children,
}: {
  pestanas: Pestana[];
  /** Un hijo por pestaña, en el mismo orden. */
  children: React.ReactNode[];
}) {
  const [activa, setActiva] = useState(0);

  return (
    <div>
      <div
        role="tablist"
        aria-label="Qué apuestas ver"
        className="relative flex rounded-xl border border-line bg-surface-sunken p-1"
      >
        {/* Barra de la pestaña activa.

            Va dentro de una rejilla que ocupa exactamente el hueco de los
            botones (`inset-1` = el relleno del contenedor). Así una celda mide
            justo una pestaña y basta con desplazarla el 100% de su propio
            ancho: con porcentajes sobre el contenedor no cuadraba, porque el
            borde entra en la cuenta y la última se salía un par de píxeles. */}
        <span
          aria-hidden
          className="pointer-events-none absolute inset-1 grid"
          style={{ gridTemplateColumns: `repeat(${pestanas.length}, 1fr)` }}
        >
          <span
            className="rounded-[9px] border border-line-strong bg-surface-high
                       transition-transform duration-pop ease-out"
            style={{ transform: `translateX(${activa * 100}%)` }}
          />
        </span>

        {pestanas.map((p, i) => (
          <button
            key={p.clave}
            role="tab"
            type="button"
            aria-selected={activa === i}
            onClick={() => setActiva(i)}
            className={`relative z-10 flex flex-1 items-center justify-center gap-1.5 rounded-[9px]
                        py-2 text-caption font-semibold transition-colors duration-press ease-out
                        ${activa === i ? 'text-white' : 'text-content-muted hover:text-content'}`}
          >
            {p.titulo}
            <span
              className={`tnum text-micro ${activa === i ? 'text-content-muted' : 'text-content-faint'}`}
            >
              {p.cuenta}
            </span>
          </button>
        ))}
      </div>

      <div className="mt-6">{children[activa]}</div>
    </div>
  );
}
