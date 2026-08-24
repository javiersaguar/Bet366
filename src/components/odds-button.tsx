'use client';

import { useEffect, useRef, useState } from 'react';
import type { MarketOption } from '@/lib/types';
import { odds as fmtOdds, points } from '@/lib/format';

type State = 'idle' | 'selected' | 'winner' | 'muted';

/**
 * La pieza que más se repite en toda la app: etiqueta a la izquierda, cuota
 * grande a la derecha y una barra fina abajo con el reparto del bote. Se usa
 * igual en el tablón, en el boleto y en una apuesta ya cerrada, para que el
 * lenguaje visual sea siempre el mismo.
 */
export function OddsFace({
  option,
  share,
  state = 'idle',
  mine,
  compact,
}: {
  option: MarketOption;
  share: number;
  state?: State;
  mine?: { stake: number; lockedOdds: number };
  compact?: boolean;
}) {
  const current = Number(option.current_odds);
  const drift = current - Number(option.opening_odds);
  const moved = Math.abs(drift) >= 0.01;

  // Destello verde o rojo cuando la cuota cambia mientras miras la pantalla.
  const previous = useRef(current);
  const [flash, setFlash] = useState<'up' | 'down' | null>(null);

  useEffect(() => {
    if (previous.current !== current) {
      setFlash(current > previous.current ? 'up' : 'down');
      previous.current = current;
      const id = setTimeout(() => setFlash(null), 1100);
      return () => clearTimeout(id);
    }
  }, [current]);

  const frame = {
    idle: 'border-line bg-surface-sunken/60 hover:border-line-strong hover:bg-surface-raised/60',
    selected: 'border-brand/60 bg-brand/[.10] shadow-glow-brand',
    winner: 'border-brand/45 bg-brand/[.07]',
    muted: 'border-line bg-surface-sunken/40 opacity-55',
  }[state];

  const pill = {
    idle: 'border-line-strong bg-surface-high text-white',
    selected: 'border-brand bg-brand text-brand-ink',
    winner: 'border-brand/40 bg-brand/10 text-brand',
    muted: 'border-line bg-surface-raised text-content-muted',
  }[state];

  return (
    <div
      className={`group/odds relative overflow-hidden rounded-xl border transition-[transform,border-color,box-shadow] duration-panel ease-out ${frame} ${
        flash === 'up' ? 'animate-flash-up' : flash === 'down' ? 'animate-flash-down' : ''
      }`}
    >
      <div className="absolute inset-x-0 bottom-0 h-[2px] bg-white/[.04]">
        <div
          className={`h-full transition-[width] duration-panel ease-out ${
            state === 'selected' || state === 'winner' ? 'bg-brand/70' : 'bg-white/20'
          }`}
          style={{ width: `${Math.min(100, share)}%` }}
        />
      </div>

      <div
        className={`relative flex items-center justify-between gap-3 ${
          compact ? 'px-3 py-2.5' : 'px-4 py-3.5'
        }`}
      >
        <div className="min-w-0">
          <p
            className={`truncate font-semibold leading-tight ${
              state === 'muted' ? 'text-content-muted' : 'text-content'
            } ${compact ? 'text-body' : 'text-title'}`}
          >
            {state === 'winner' && <span className="text-brand">✓ </span>}
            {option.label}
          </p>
          <p className="num mt-0.5 flex items-center gap-1.5 text-micro text-content-faint">
            <span>{points(option.pool)} pts</span>
            {moved && (
              <span
                className={`inline-flex items-center gap-0.5 ${
                  drift < 0 ? 'text-lose/75' : 'text-brand/75'
                }`}
                title={`Salió a ${fmtOdds(option.opening_odds)}`}
              >
                {drift < 0 ? '▼' : '▲'} {fmtOdds(Math.abs(drift))}
              </span>
            )}
            {mine && (
              <span className="text-info">
                · tú {points(mine.stake)} a {fmtOdds(mine.lockedOdds)}
              </span>
            )}
          </p>
        </div>

        <span
          className={`odds shrink-0 rounded-lg border px-3 py-1.5 transition-[transform,border-color,color,background-color] duration-pop ease-out
            group-hover/odds:scale-[1.04] ${pill} ${compact ? 'text-odds' : 'text-odds-lg'}`}
        >
          {fmtOdds(current)}
        </span>
      </div>
    </div>
  );
}
