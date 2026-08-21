/**
 * Iconos de la barra inferior.
 *
 * Cada uno tiene dos versiones: contorno cuando la pestaña está en reposo y
 * relleno cuando está activa. Ese cambio de peso es lo que hace que se vea al
 * instante dónde estás, mucho más que el color.
 */

type Props = { active?: boolean; className?: string };

function Base({ active, className = 'h-[22px] w-[22px]', children }: Props & { children: React.ReactNode }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth={active ? 2.1 : 1.7}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      {children}
    </svg>
  );
}

/** Tablón: un marcador con sus líneas de apuestas. */
export function NavBoard({ active, className }: Props) {
  return (
    <Base active={active} className={className}>
      <rect x="2.8" y="4.2" width="18.4" height="15.6" rx="3.4" fill={active ? 'currentColor' : 'none'} fillOpacity={active ? 0.16 : 0} />
      <path d="M2.8 9.2h18.4" />
      <path d="M6.6 13.4h5.2M6.6 16.4h8.4" strokeWidth={active ? 2.4 : 1.9} />
      <circle cx="17.6" cy="14.9" r={active ? 1.6 : 1.3} fill={active ? 'currentColor' : 'none'} />
    </Base>
  );
}

/** Mis apuestas: el boleto, con el borde inferior dentado. */
export function NavSlip({ active, className }: Props) {
  return (
    <Base active={active} className={className}>
      <path
        d="M4.6 5.4A1.6 1.6 0 0 1 6.2 3.8h11.6a1.6 1.6 0 0 1 1.6 1.6v14.8l-2.5-1.5-2.4 1.5-2.5-1.5-2.4 1.5-2.5-1.5-2.5 1.5V5.4Z"
        fill={active ? 'currentColor' : 'none'}
        fillOpacity={active ? 0.16 : 0}
      />
      <path d="M8.4 8.6h7.2M8.4 12.2h4.4" strokeWidth={active ? 2.4 : 1.9} />
    </Base>
  );
}

/** Ranking: el podio, con el primer puesto en el centro. */
export function NavPodium({ active, className }: Props) {
  return (
    <Base active={active} className={className}>
      <rect x="9.1" y="6.4" width="5.8" height="13.4" rx="1.5" fill={active ? 'currentColor' : 'none'} fillOpacity={active ? 0.22 : 0} />
      <rect x="2.9" y="11.6" width="5.6" height="8.2" rx="1.5" fill={active ? 'currentColor' : 'none'} fillOpacity={active ? 0.12 : 0} />
      <rect x="15.5" y="14.2" width="5.6" height="5.6" rx="1.5" fill={active ? 'currentColor' : 'none'} fillOpacity={active ? 0.12 : 0} />
      {active && <path d="M12 2.6 13 4.7l2.3.3-1.7 1.6.4 2.3L12 7.8 9.9 8.9l.4-2.3L8.6 5l2.3-.3L12 2.6Z" fill="currentColor" stroke="none" />}
    </Base>
  );
}

/** Lanzar: la cruz del botón central. */
export function NavPlus({ className = 'h-7 w-7' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" aria-hidden>
      <path d="M12 5.2v13.6M5.2 12h13.6" />
    </svg>
  );
}
