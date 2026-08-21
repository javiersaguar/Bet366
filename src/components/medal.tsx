/**
 * Medalla del podio. No es un icono: es un dato (la posición) con forma de
 * medalla, así que lleva el número dentro y no viene de la librería.
 */
const PODIUM = [
  { ring: '#F5C24B', fill: 'rgba(245,194,75,.16)' },
  { ring: '#C9D2E0', fill: 'rgba(201,210,224,.14)' },
  { ring: '#D08B54', fill: 'rgba(208,139,84,.14)' },
];

export function Medal({ position, className = 'h-7 w-7' }: { position: number; className?: string }) {
  const style = PODIUM[position - 1];
  if (!style) {
    return (
      <span className={`tnum grid place-items-center text-caption font-medium text-content-faint ${className}`}>
        {position}
      </span>
    );
  }
  return (
    <span
      className={`tnum grid place-items-center rounded-full border text-micro font-semibold ${className}`}
      style={{ borderColor: style.ring, background: style.fill, color: style.ring }}
    >
      {position}
    </span>
  );
}
