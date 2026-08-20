export function points(value: number | string | null | undefined): string {
  const n = Number(value ?? 0);
  const rounded = Math.round(n * 100) / 100;
  return rounded.toLocaleString('es-ES', {
    minimumFractionDigits: Number.isInteger(rounded) ? 0 : 2,
    maximumFractionDigits: 2,
  });
}

export function odds(value: number | string): string {
  return Number(value).toFixed(2).replace('.', ',');
}

const RTF = new Intl.RelativeTimeFormat('es', { numeric: 'auto' });

/** "en 3 días", "hace 2 horas" */
export function relative(iso: string): string {
  const diff = new Date(iso).getTime() - Date.now();
  const abs = Math.abs(diff);
  const units: [Intl.RelativeTimeFormatUnit, number][] = [
    ['day', 86_400_000],
    ['hour', 3_600_000],
    ['minute', 60_000],
  ];
  for (const [unit, ms] of units) {
    if (abs >= ms) return RTF.format(Math.round(diff / ms), unit);
  }
  return diff > 0 ? 'en menos de un minuto' : 'ahora mismo';
}

export function dateTime(iso: string): string {
  return new Date(iso).toLocaleString('es-ES', {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  });
}

/** Etiqueta corta para el countdown de una apuesta abierta. */
export function countdown(iso: string): string {
  const diff = new Date(iso).getTime() - Date.now();
  if (diff <= 0) return 'cerrada';
  const d = Math.floor(diff / 86_400_000);
  const h = Math.floor((diff % 86_400_000) / 3_600_000);
  const m = Math.floor((diff % 3_600_000) / 60_000);
  if (d > 0) return `${d}d ${h}h`;
  if (h > 0) return `${h}h ${m}m`;
  return `${m}m`;
}
