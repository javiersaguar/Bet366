import { BRAND } from '@/lib/brand';

/** Marca gráfica: una "B" de ticket con los dos puntos del 66. */
export function Mark({ className = 'h-9 w-9' }: { className?: string }) {
  return (
    <svg viewBox="0 0 192 192" className={className} aria-hidden>
      <rect width="192" height="192" rx="44" fill="#101218" />
      <rect
        x="7"
        y="7"
        width="178"
        height="178"
        rx="39"
        fill="none"
        stroke="rgba(255,255,255,.09)"
        strokeWidth="2"
      />
      {/* B geometrica: asta + dos panzas, la de abajo un poco mayor. */}
      <g fill="#2BE08C">
        <rect x="52" y="50" width="15" height="92" rx="4" />
        <path d="M63 50h21a23 23 0 0 1 0 46H63V81h21a8 8 0 0 0 0-16H63z" />
        <path d="M63 96h25a23 23 0 0 1 0 46H63v-15h25a8 8 0 0 0 0-16H63z" />
      </g>
      <circle cx="139" cy="63" r="7" fill="#2BE08C" opacity=".9" />
      <circle cx="139" cy="129" r="7" fill="#2BE08C" opacity=".35" />
    </svg>
  );
}

export function Wordmark({ className = 'text-xl' }: { className?: string }) {
  const [head, tail] = BRAND.wordmark;
  return (
    <span className={`font-bold tracking-tightest text-white ${className}`}>
      {head}
      <span className="text-brand">{tail}</span>
    </span>
  );
}

export function Logo({ subtitle }: { subtitle?: string }) {
  return (
    <div className="flex items-center gap-3">
      <Mark className="h-11 w-11 shrink-0" />
      <div className="leading-tight">
        <Wordmark className="text-[1.35rem]" />
        {subtitle && <p className="text-sm text-content-muted">{subtitle}</p>}
      </div>
    </div>
  );
}
