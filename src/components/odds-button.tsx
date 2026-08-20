import type { MarketOption } from '@/lib/types';
import { odds as fmtOdds, points } from '@/lib/format';

type State = 'idle' | 'selected' | 'winner' | 'muted';

/**
 * La pieza visual que más se repite en toda la app: etiqueta pequeña arriba,
 * cuota grande a la derecha y una barra de fondo con el reparto del bote.
 * Se usa igual en el tablón, en el boleto y en el resumen de una apuesta ya
 * cerrada para que el lenguaje visual sea siempre el mismo.
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
  const drift = Number(option.current_odds) - Number(option.opening_odds);
  const moved = Math.abs(drift) >= 0.01;

  const frame = {
    idle: 'border-line bg-surface-sunken/70',
    selected: 'border-brand/60 bg-brand/[.09]',
    winner: 'border-brand/45 bg-brand/[.07]',
    muted: 'border-line bg-surface-sunken/40 opacity-60',
  }[state];

  const oddsPill = {
    idle: 'border-line-strong bg-surface-raised text-white',
    selected: 'border-brand bg-brand text-canvas',
    winner: 'border-brand/40 bg-brand/10 text-brand',
    muted: 'border-line bg-surface-raised text-content-muted',
  }[state];

  return (
    <div className={`relative overflow-hidden rounded-xl border transition duration-200 ${frame}`}>
      {/* Reparto del bote: una barra fina abajo, para no ensuciar la ficha. */}
      <div className="absolute inset-x-0 bottom-0 h-[2px] bg-white/[.04]">
        <div
          className={`h-full transition-[width] duration-700 ease-out ${
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
              state === 'winner' || state === 'selected' ? 'text-white' : 'text-content'
            } ${compact ? 'text-sm' : ''}`}
          >
            {state === 'winner' && <span className="text-brand">✓ </span>}
            {option.label}
          </p>
          <p className="num mt-0.5 flex items-center gap-1.5 text-2xs text-content-faint">
            <span>{points(option.pool)} pts</span>
            {moved && (
              <span className={drift < 0 ? 'text-lose/70' : 'text-brand/70'}>
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
          className={`odds shrink-0 rounded-lg border px-3 py-1.5 transition ${oddsPill} ${
            compact ? 'text-base' : 'text-lg'
          }`}
        >
          {fmtOdds(option.current_odds)}
        </span>
      </div>
    </div>
  );
}
