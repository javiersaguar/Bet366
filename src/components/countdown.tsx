'use client';

import { useEffect, useState } from 'react';

function parts(ms: number) {
  const total = Math.max(0, Math.floor(ms / 1000));
  return {
    d: Math.floor(total / 86400),
    h: Math.floor((total % 86400) / 3600),
    m: Math.floor((total % 3600) / 60),
    s: total % 60,
  };
}

function label(left: number): string {
  const { d, h, m, s } = parts(left);
  if (d > 0) return `${d}d ${h}h`;
  if (h > 0) return `${h}h ${m}m`;
  if (m > 0) return `${m}m ${s}s`;
  return `${s}s`;
}

/**
 * Cuenta atrás que corre de verdad en el navegador.
 *
 * El servidor y el cliente calculan la hora en instantes distintos, así que el
 * texto se marca con `suppressHydrationWarning` y todo lo que cambia de forma
 * (el punto de "queda poco") espera a que el componente esté montado. Así no
 * hay desajuste de hidratación ni salto visible.
 */
export function Countdown({
  to,
  className = '',
  urgentUnder = 3600_000,
}: {
  to: string;
  className?: string;
  /** Por debajo de este margen se pone en rojo y late. */
  urgentUnder?: number;
}) {
  const target = new Date(to).getTime();
  const [left, setLeft] = useState(() => target - Date.now());
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const id = setInterval(() => setLeft(target - Date.now()), 1000);
    return () => clearInterval(id);
  }, [target]);

  const urgent = mounted && left > 0 && left < urgentUnder;

  return (
    <span className={`num inline-flex items-center gap-1.5 ${urgent ? 'text-lose' : ''} ${className}`}>
      {urgent && (
        <span className="relative flex h-1.5 w-1.5">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-lose" />
          <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-lose" />
        </span>
      )}
      <time dateTime={to} suppressHydrationWarning>
        {left <= 0 ? 'cerrada' : label(left)}
      </time>
    </span>
  );
}

/**
 * Anillo de progreso para el plazo de impugnación o de votación.
 * Se pinta solo tras montar (el hueco ya está reservado, así que no salta) para
 * no depender de la hora del servidor.
 */
export function DeadlineRing({
  from,
  to,
  size = 44,
  tone = 'info',
}: {
  from: string;
  to: string;
  size?: number;
  tone?: 'info' | 'vote';
}) {
  const [now, setNow] = useState<number | null>(null);

  useEffect(() => {
    setNow(Date.now());
    const id = setInterval(() => setNow(Date.now()), 30_000);
    return () => clearInterval(id);
  }, []);

  const start = new Date(from).getTime();
  const end = new Date(to).getTime();
  const r = size / 2 - 3;
  const c = 2 * Math.PI * r;
  const color = tone === 'vote' ? '#A78BFA' : '#5AA9FF';

  const total = Math.max(1, end - start);
  const left = now === null ? total : Math.max(0, end - now);
  const pct = Math.min(1, Math.max(0, left / total));

  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="rgba(255,255,255,.08)"
          strokeWidth="3"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={color}
          strokeWidth="3"
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={c * (1 - pct)}
          className="transition-[stroke-dashoffset] duration-1000 ease-smooth"
        />
      </svg>
      <span
        className="num absolute inset-0 grid place-items-center text-2xs font-bold transition-opacity duration-300"
        style={{ color, opacity: now === null ? 0 : 1 }}
      >
        {Math.ceil(left / 3600_000)}h
      </span>
    </div>
  );
}
