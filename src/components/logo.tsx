import { BRAND } from '@/lib/brand';

/**
 * Marca gráfica: una B geométrica con degradado de marca y dos puntos que
 * hacen de "66". El aro exterior y el brillo superior le dan volumen para que
 * aguante bien tanto a 28px en la cabecera como a 96px en la portada.
 */
export function Mark({
  className = 'h-9 w-9',
  animated = false,
}: {
  className?: string;
  animated?: boolean;
}) {
  const uid = animated ? 'a' : 'b';
  return (
    <svg viewBox="0 0 192 192" className={className} aria-hidden>
      <defs>
        <linearGradient id={`bg-${uid}`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#1B2029" />
          <stop offset="100%" stopColor="#0C0E13" />
        </linearGradient>
        <linearGradient id={`fg-${uid}`} x1="0" y1="0" x2="0.6" y2="1">
          <stop offset="0%" stopColor="#63F2B4" />
          <stop offset="55%" stopColor="#2BE08C" />
          <stop offset="100%" stopColor="#149E60" />
        </linearGradient>
        <linearGradient id={`shine-${uid}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="rgba(255,255,255,.16)" />
          <stop offset="100%" stopColor="rgba(255,255,255,0)" />
        </linearGradient>
      </defs>

      <rect width="192" height="192" rx="44" fill={`url(#bg-${uid})`} />
      <rect width="192" height="96" rx="44" fill={`url(#shine-${uid})`} />
      <rect
        x="6.5"
        y="6.5"
        width="179"
        height="179"
        rx="39.5"
        fill="none"
        stroke="rgba(255,255,255,.10)"
        strokeWidth="2.5"
      />

      <g fill={`url(#fg-${uid})`}>
        <rect x="52" y="50" width="15" height="92" rx="4" />
        <path d="M63 50h21a23 23 0 0 1 0 46H63V81h21a8 8 0 0 0 0-16H63z" />
        <path d="M63 96h25a23 23 0 0 1 0 46H63v-15h25a8 8 0 0 0 0-16H63z" />
      </g>

      <circle cx="139" cy="63" r="7.5" fill="#2BE08C" />
      <circle cx="139" cy="129" r="7.5" fill="#2BE08C" opacity=".35" />

      {/* Trazo que se dibuja al cargar la portada. */}
      {animated && (
        <path
          d="M52 142V50h32a23 23 0 0 1 0 46H63h25a23 23 0 0 1 0 46z"
          fill="none"
          stroke="#63F2B4"
          strokeWidth="3"
          strokeLinejoin="round"
          strokeDasharray="340"
          className="animate-draw opacity-70"
        />
      )}
    </svg>
  );
}

export function Wordmark({ className = 'text-xl' }: { className?: string }) {
  const [head, tail] = BRAND.wordmark;
  return (
    <span className={`font-bold tracking-tightest text-white ${className}`}>
      {head}
      <span className="bg-gradient-to-br from-brand-bright to-brand-deep bg-clip-text text-transparent">
        {tail}
      </span>
    </span>
  );
}

export function Logo({ subtitle, animated }: { subtitle?: string; animated?: boolean }) {
  return (
    <div className="flex items-center gap-3.5">
      <Mark className="h-14 w-14 shrink-0 drop-shadow-[0_8px_24px_rgba(43,224,140,.18)]" animated={animated} />
      <div className="leading-tight">
        <Wordmark className="text-[1.6rem]" />
        {subtitle && <p className="text-sm text-content-muted">{subtitle}</p>}
      </div>
    </div>
  );
}
