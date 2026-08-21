import type { AvatarSymbol } from '@/lib/avatars';

/**
 * Los doce emblemas, dibujados en una rejilla de 24 para que sigan
 * leyéndose bien a 14 píxeles en las listas.
 */
const PATHS: Record<AvatarSymbol, React.ReactNode> = {
  bolt: <path d="M13.6 2 5.4 13.1h5.2L10.4 22l8.2-11.1h-5.2L13.6 2Z" />,
  crown: (
    <path d="M3 8.4 6.9 11 12 4.2 17.1 11 21 8.4l-1.7 10.4a1 1 0 0 1-1 .8H5.7a1 1 0 0 1-1-.8L3 8.4Z" />
  ),
  flame: (
    <>
      <path
        d="M12 2.2c3.5 3.7 6.3 6.5 6.3 10.4a6.3 6.3 0 0 1-12.6 0c0-3.9 2.8-6.7 6.3-10.4Z"
        fill="none"
        strokeWidth="2.2"
        strokeLinejoin="round"
      />
      <path d="M12 11.2c1.7 1.8 2.7 2.9 2.7 4.5a2.7 2.7 0 0 1-5.4 0c0-1.6 1-2.7 2.7-4.5Z" />
    </>
  ),
  star: <path d="m12 2.6 2.9 5.9 6.5.9-4.7 4.6 1.1 6.5L12 17.4l-5.8 3.1 1.1-6.5L2.6 9.4l6.5-.9L12 2.6Z" />,
  target: (
    <>
      <circle cx="12" cy="12" r="9.2" fill="none" strokeWidth="2.4" />
      <circle cx="12" cy="12" r="4.6" fill="none" strokeWidth="2.4" />
      <circle cx="12" cy="12" r="1.6" />
    </>
  ),
  diamond: (
    <>
      <path d="M12 2 22 12 12 22 2 12 12 2Z" fill="none" strokeWidth="2.6" strokeLinejoin="round" />
      <path d="M12 8 16 12 12 16 8 12 12 8Z" />
    </>
  ),
  shield: (
    <>
      <path
        d="M12 2.4 20.4 6v6.1c0 4.6-3.4 7.6-8.4 9.5-5-1.9-8.4-4.9-8.4-9.5V6L12 2.4Z"
        fill="none"
        strokeWidth="2.2"
        strokeLinejoin="round"
      />
      <path d="M12 7 14 11.2l4.4.5-3.3 3 .9 4.3L12 16.9 8 19l.9-4.3-3.3-3 4.4-.5L12 7Z" />
    </>
  ),
  wave: (
    <>
      <path
        d="M2 9.5c2.5-3 5-3 7.5 0s5 3 7.5 0 3.5-2 5-.6"
        fill="none"
        strokeWidth="2.6"
        strokeLinecap="round"
      />
      <path
        d="M2 16c2.5-3 5-3 7.5 0s5 3 7.5 0 3.5-2 5-.6"
        fill="none"
        strokeWidth="2.6"
        strokeLinecap="round"
        opacity=".55"
      />
    </>
  ),
  peak: (
    <>
      <path d="M1.6 20 9 6.4l4.2 7.2 2.6-3.7L22.4 20H1.6Z" />
      <path d="M9 6.4 6.2 11.6h5.6L9 6.4Z" fillOpacity=".35" />
    </>
  ),
  spade: (
    <path d="M12 2.4 5.4 9c-2.3 2.3-1.9 5.9.8 7.3 1.7.9 3.5.4 4.6-.8l-.9 5.2h4.2l-.9-5.2c1.1 1.2 2.9 1.7 4.6.8 2.7-1.4 3.1-5 .8-7.3L12 2.4Z" />
  ),
  horseshoe: (
    <>
      <path
        d="M6.4 20.4V13a5.6 5.6 0 0 1 11.2 0v7.4"
        fill="none"
        strokeWidth="3.4"
        strokeLinecap="round"
      />
      <circle cx="6.4" cy="20.4" r="1.9" />
      <circle cx="17.6" cy="20.4" r="1.9" />
    </>
  ),
  orbit: (
    <>
      <circle cx="12" cy="12" r="4.4" />
      <ellipse
        cx="12"
        cy="12"
        rx="10.4"
        ry="4.6"
        fill="none"
        strokeWidth="2.2"
        transform="rotate(-28 12 12)"
      />
    </>
  ),
};

export function SymbolGlyph({ symbol, className }: { symbol: AvatarSymbol; className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor" stroke="currentColor" aria-hidden>
      {PATHS[symbol]}
    </svg>
  );
}
