'use client';

import { useEffect, useState } from 'react';

const COLORS = ['#2BE08C', '#63F2B4', '#F5C24B', '#5AA9FF', '#A78BFA'];

/**
 * Confeti breve, una sola vez y sin librerías: 26 trozos con destino aleatorio
 * animados por CSS. Se dispara al abrir una apuesta que has ganado.
 */
export function Celebrate({ fire }: { fire: boolean }) {
  const [pieces, setPieces] = useState<
    { id: number; dx: number; dy: number; dr: number; dur: number; color: string; left: number }[]
  >([]);

  useEffect(() => {
    if (!fire) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    setPieces(
      Array.from({ length: 26 }, (_, id) => ({
        id,
        dx: (Math.random() - 0.5) * 320,
        dy: 120 + Math.random() * 260,
        dr: (Math.random() - 0.5) * 720,
        dur: 0.9 + Math.random() * 0.7,
        color: COLORS[id % COLORS.length],
        left: 10 + Math.random() * 80,
      })),
    );
    const id = setTimeout(() => setPieces([]), 2000);
    return () => clearTimeout(id);
  }, [fire]);

  if (pieces.length === 0) return null;

  return (
    <div className="pointer-events-none fixed inset-x-0 top-0 z-40 h-0 overflow-visible" aria-hidden>
      {pieces.map((p) => (
        <span
          key={p.id}
          className="absolute top-16 block h-2 w-1.5 animate-confetti rounded-[1px]"
          style={
            {
              left: `${p.left}%`,
              background: p.color,
              '--dx': `${p.dx}px`,
              '--dy': `${p.dy}px`,
              '--dr': `${p.dr}deg`,
              '--dur': `${p.dur}s`,
            } as React.CSSProperties
          }
        />
      ))}
    </div>
  );
}
