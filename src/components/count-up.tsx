'use client';

import { useEffect, useRef, useState } from 'react';
import { points as fmt } from '@/lib/format';

/**
 * Number que se anima cuando cambia de valor: el saldo de la cabecera y el
 * "cobras" del boleto suben rodando en vez de dar un salto seco.
 */
export function CountUp({
  value,
  duration = 600,
  className = '',
  prefix = '',
}: {
  value: number;
  duration?: number;
  className?: string;
  prefix?: string;
}) {
  const [shown, setShown] = useState(value);
  const from = useRef(value);
  const raf = useRef<number>();

  useEffect(() => {
    const start = performance.now();
    const origin = from.current;
    const delta = value - origin;
    if (delta === 0) return;

    const step = (t: number) => {
      const p = Math.min(1, (t - start) / duration);
      // easeOutCubic: rápido al principio, frena al final.
      const eased = 1 - Math.pow(1 - p, 3);
      setShown(origin + delta * eased);
      if (p < 1) raf.current = requestAnimationFrame(step);
      else from.current = value;
    };

    raf.current = requestAnimationFrame(step);
    return () => {
      if (raf.current) cancelAnimationFrame(raf.current);
      from.current = value;
    };
  }, [value, duration]);

  return (
    <span className={`tnum ${className}`}>
      {prefix}
      {fmt(shown)}
    </span>
  );
}
