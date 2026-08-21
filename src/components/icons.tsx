/**
 * Iconos de interfaz. Vectoriales y con el mismo grosor de trazo, para que la
 * app no dependa de cómo dibuje los emojis cada sistema operativo.
 */

type Props = { className?: string };

function Stroke({ className = 'h-4 w-4', children }: Props & { children: React.ReactNode }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      {children}
    </svg>
  );
}

export function IconTarget(p: Props) {
  return (
    <Stroke {...p}>
      <circle cx="12" cy="12" r="9" />
      <circle cx="12" cy="12" r="4.5" />
      <circle cx="12" cy="12" r="1" fill="currentColor" />
    </Stroke>
  );
}

export function IconLock(p: Props) {
  return (
    <Stroke {...p}>
      <rect x="4.5" y="10.5" width="15" height="10" rx="2.5" />
      <path d="M8 10.5V8a4 4 0 0 1 8 0v2.5" />
    </Stroke>
  );
}

export function IconRepeat(p: Props) {
  return (
    <Stroke {...p}>
      <path d="M4 9a6 6 0 0 1 6-6h5.5" />
      <path d="m13 1 2.8 2-2.8 2" />
      <path d="M20 15a6 6 0 0 1-6 6H8.5" />
      <path d="m11 23-2.8-2 2.8-2" />
    </Stroke>
  );
}

export function IconEye(p: Props) {
  return (
    <Stroke {...p}>
      <path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12Z" />
      <circle cx="12" cy="12" r="2.8" />
    </Stroke>
  );
}

export function IconEyeOff(p: Props) {
  return (
    <Stroke {...p}>
      <path d="M9.6 6a9.5 9.5 0 0 1 2.4-.3c6 0 9.5 6.3 9.5 6.3a15 15 0 0 1-3 3.6" />
      <path d="M6.4 7.9A15 15 0 0 0 2.5 12S6 18.3 12 18.3c1.3 0 2.5-.3 3.5-.7" />
      <path d="M3.5 3.5 20.5 20.5" />
    </Stroke>
  );
}

export function IconTrophy(p: Props) {
  return (
    <Stroke {...p}>
      <path d="M7.5 4h9v5.5a4.5 4.5 0 0 1-9 0V4Z" />
      <path d="M7.5 5.5H5a2.5 2.5 0 0 0 2.5 4.5M16.5 5.5H19a2.5 2.5 0 0 1-2.5 4.5" />
      <path d="M12 14v3.5M9 20.5h6" />
    </Stroke>
  );
}

export function IconWarning(p: Props) {
  return (
    <Stroke {...p}>
      <path d="M12 3.6 22 20H2L12 3.6Z" />
      <path d="M12 10v4.4M12 17.4v.1" />
    </Stroke>
  );
}

export function IconSpark(p: Props) {
  return (
    <svg viewBox="0 0 24 24" className={p.className ?? 'h-4 w-4'} fill="currentColor" aria-hidden>
      <path d="M12 2.5 13.9 9l6.6 1.9-6.6 1.9L12 19.4l-1.9-6.6L3.5 11 10.1 9 12 2.5Z" />
      <path d="M19.5 15.5 20.4 18l2.6.9-2.6.9-.9 2.6-.9-2.6-2.6-.9 2.6-.9.9-2.5Z" opacity=".6" />
    </svg>
  );
}

/** Medalla del podio, con el número dentro. Sustituye a los emojis 🥇🥈🥉. */
const PODIUM = [
  { ring: '#F5C24B', fill: 'rgba(245,194,75,.16)' },
  { ring: '#C9D2E0', fill: 'rgba(201,210,224,.14)' },
  { ring: '#D08B54', fill: 'rgba(208,139,84,.14)' },
];

export function Medal({ position, className = 'h-7 w-7' }: { position: number; className?: string }) {
  const style = PODIUM[position - 1];
  if (!style) {
    return (
      <span className={`num grid place-items-center text-sm font-bold text-content-faint ${className}`}>
        {position}
      </span>
    );
  }
  return (
    <span
      className={`num grid place-items-center rounded-full border text-2xs font-bold ${className}`}
      style={{ borderColor: style.ring, background: style.fill, color: style.ring }}
    >
      {position}
    </span>
  );
}
