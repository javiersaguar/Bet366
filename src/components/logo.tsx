import { BRAND } from '@/lib/brand';

/**
 * Marca de Bet366.
 *
 * Cuadrado negro, aro verde abierto por abajo, el balón encajado en esa
 * abertura y el logotipo inclinado dentro: BET en blanco con la E en verde y
 * 366 debajo.
 *
 * Las letras son contornos, no texto: así el icono se ve igual en el favicon,
 * en la pantalla de inicio del móvil y en cualquier navegador, sin depender de
 * que la fuente esté cargada. Los trazados salen de Geist Black, la misma
 * familia que usa la interfaz, para que la marca y la app hablen igual.
 *
 * Dos versiones porque el detalle no sobrevive a cualquier tamaño:
 *
 *   full     -> BET + 366. A partir de unos 56px. Portada, icono, error 404.
 *   compact  -> solo BET, más grande. Para los 36px de la cabecera, donde el
 *               366 sería una mancha verde de cinco píxeles.
 */

/* Geometría generada a partir de los contornos reales de Geist Black. */
const FULL = {
  arc: 'M 55.37 140.01 A 66 66 0 1 1 136.63 140.01',
  b: 'M55.4 84.0V53.0H68.4Q74.4 53.0 77.6 55.0Q80.9 57.1 80.9 61.5Q80.9 67.1 74.5 67.9V68.0Q78.3 68.4 80.3 70.3Q82.2 72.2 82.2 75.4Q82.2 79.8 78.9 81.9Q75.7 84.0 69.7 84.0ZM64.0 65.4H68.1Q69.9 65.4 71.1 64.7Q72.3 64.0 72.3 62.5Q72.3 60.9 71.1 60.2Q70.0 59.5 68.1 59.5H64.0ZM64.0 77.5H69.2Q71.0 77.5 72.3 76.7Q73.6 75.9 73.6 74.3Q73.6 72.6 72.4 71.8Q71.1 71.0 69.2 71.0H64.0Z',
  e: 'M86.8 84.0V53.0H109.7V59.9H95.3V65.1H109.2V71.9H95.3V77.1H110.1V84.0Z',
  t: 'M121.2 84.0V59.9H112.2V53.0H138.9V59.9H129.8V84.0Z',
  n366:
    'M72.3 122.6Q67.1 122.6 64.3 120.3Q61.5 117.9 61.4 113.8L68.6 113.5Q69.0 116.8 72.3 116.8Q73.9 116.8 74.8 116.0Q75.7 115.3 75.7 114.0Q75.7 112.6 74.8 111.9Q73.8 111.1 72.0 111.1H69.5V106.3H72.0Q73.3 106.3 74.1 105.7Q75.0 105.1 75.0 103.8Q75.0 102.6 74.3 101.9Q73.7 101.2 72.1 101.2Q70.5 101.2 69.7 101.9Q68.9 102.6 68.8 103.5L61.6 103.2Q62.0 99.6 64.7 97.5Q67.5 95.4 72.1 95.4Q77.1 95.4 79.7 97.4Q82.3 99.4 82.3 102.9Q82.3 104.8 81.1 106.3Q79.9 107.7 77.8 108.4Q83.1 109.8 83.1 114.7Q83.1 118.3 80.2 120.5Q77.4 122.6 72.3 122.6Z ' +
    'M96.8 122.6Q91.3 122.6 88.7 119.3Q86.0 116.0 86.0 110.2Q86.0 105.9 87.4 102.5Q88.7 99.1 91.2 97.3Q93.8 95.4 97.5 95.4Q101.5 95.4 104.0 97.3Q106.4 99.3 107.1 102.7L100.7 103.1Q100.3 102.1 99.6 101.5Q98.9 101.0 97.5 101.0Q95.6 101.0 94.4 102.5Q93.3 103.9 92.9 107.1L92.9 107.2Q93.7 106.4 95.0 105.8Q96.4 105.2 98.3 105.2Q101.0 105.2 103.0 106.3Q105.0 107.3 106.1 109.1Q107.2 111.0 107.2 113.5Q107.2 116.4 105.9 118.5Q104.6 120.5 102.3 121.5Q99.9 122.6 96.8 122.6ZM96.7 117.2Q98.3 117.2 99.2 116.2Q100.2 115.2 100.2 113.6Q100.2 112.0 99.3 110.9Q98.3 109.8 96.7 109.8Q95.1 109.8 94.1 110.9Q93.1 111.9 93.1 113.6Q93.1 115.2 94.1 116.2Q95.0 117.2 96.7 117.2Z ' +
    'M120.5 122.6Q115.1 122.6 112.4 119.3Q109.8 116.0 109.8 110.2Q109.8 105.9 111.1 102.5Q112.4 99.1 115.0 97.3Q117.6 95.4 121.3 95.4Q125.3 95.4 127.7 97.3Q130.2 99.3 130.9 102.7L124.5 103.1Q124.1 102.1 123.4 101.5Q122.7 101.0 121.3 101.0Q119.4 101.0 118.2 102.5Q117.0 103.9 116.7 107.1L116.7 107.2Q117.5 106.4 118.8 105.8Q120.1 105.2 122.1 105.2Q124.8 105.2 126.8 106.3Q128.8 107.3 129.9 109.1Q131.0 111.0 131.0 113.5Q131.0 116.4 129.7 118.5Q128.4 120.5 126.0 121.5Q123.7 122.6 120.5 122.6ZM120.4 117.2Q122.0 117.2 123.0 116.2Q124.0 115.2 124.0 113.6Q124.0 112.0 123.0 110.9Q122.1 109.8 120.5 109.8Q118.9 109.8 117.8 110.9Q116.8 111.9 116.8 113.6Q116.8 115.2 117.8 116.2Q118.8 117.2 120.4 117.2Z',
  ballCx: 96,
  ballCy: 154,
  ballR: 17,
  pentagon: 'M 96.00 148.22 L 101.50 152.21 L 99.40 158.68 L 92.60 158.68 L 90.50 152.21 Z',
  seams:
    'M 96.00 148.22 L 96.00 137.51 M 101.50 152.21 L 111.68 148.90 M 99.40 158.68 L 105.69 167.34 M 92.60 158.68 L 86.31 167.34 M 90.50 152.21 L 80.32 148.90',
  arcWidth: 8,
  seamWidth: 2.6,
} as const;

const COMPACT = {
  arc: 'M 56.60 138.43 A 64 64 0 1 1 135.40 138.43',
  b: 'M50.2 100.0V65.0H64.9Q71.6 65.0 75.2 67.3Q78.9 69.6 78.9 74.6Q78.9 81.0 71.7 81.9V82.0Q76.1 82.4 78.2 84.5Q80.4 86.7 80.4 90.3Q80.4 95.3 76.8 97.6Q73.1 100.0 66.3 100.0ZM59.8 79.0H64.5Q66.5 79.0 67.9 78.2Q69.3 77.4 69.3 75.7Q69.3 74.0 67.9 73.2Q66.6 72.4 64.5 72.4H59.8ZM59.8 92.6H65.7Q67.8 92.6 69.3 91.7Q70.7 90.9 70.7 89.0Q70.7 87.1 69.3 86.2Q67.9 85.4 65.7 85.4H59.8Z',
  e: 'M85.6 100.0V65.0H111.5V72.7H95.2V78.6H110.9V86.3H95.2V92.3H111.9V100.0Z',
  t: 'M124.5 100.0V72.7H114.3V65.0H144.4V72.7H134.2V100.0Z',
  n366: '',
  ballCx: 96,
  ballCy: 152,
  ballR: 18,
  pentagon: 'M 96.00 145.88 L 101.82 150.11 L 99.60 156.95 L 92.40 156.95 L 90.18 150.11 Z',
  seams:
    'M 96.00 145.88 L 96.00 134.54 M 101.82 150.11 L 112.61 146.60 M 99.60 156.95 L 106.26 166.13 M 92.40 156.95 L 85.74 166.13 M 90.18 150.11 L 79.39 146.60',
  arcWidth: 9,
  seamWidth: 2.7,
} as const;

const INK = '#07080B';

export function Mark({
  className = 'h-9 w-9',
  variant = 'full',
  animated = false,
}: {
  className?: string;
  /** `compact` quita el 366 y agranda el BET: para 36px o menos. */
  variant?: 'full' | 'compact';
  animated?: boolean;
}) {
  const g = variant === 'compact' ? COMPACT : FULL;
  const uid = `${variant}-${animated ? 'on' : 'off'}`;

  /* El origen del rebote del balón cambia con la versión, así que va inline. */
  const ballOrigin = {
    transformBox: 'view-box' as const,
    transformOrigin: `${g.ballCx}px ${g.ballCy}px`,
  };

  return (
    <svg viewBox="0 0 192 192" className={className} role="img" aria-label={BRAND.name}>
      <defs>
        <linearGradient id={`mk-fondo-${uid}`} x1="0" y1="0" x2="0.35" y2="1">
          <stop offset="0%" stopColor="#14181F" />
          <stop offset="100%" stopColor="#080A0E" />
        </linearGradient>
        <linearGradient id={`mk-verde-${uid}`} x1="0.1" y1="0" x2="0.9" y2="1">
          <stop offset="0%" stopColor="#63F2B4" />
          <stop offset="52%" stopColor="#2BE08C" />
          <stop offset="100%" stopColor="#17B872" />
        </linearGradient>
      </defs>

      <rect width="192" height="192" rx="46" fill={`url(#mk-fondo-${uid})`} />
      <rect
        x="1.25"
        y="1.25"
        width="189.5"
        height="189.5"
        rx="44.75"
        fill="none"
        stroke="rgba(255,255,255,.08)"
        strokeWidth="2.5"
      />

      {/* Aro abierto por abajo. `pathLength` normaliza el trazo a 1 para que la
          misma animación sirva en las dos versiones. */}
      <path
        d={g.arc}
        fill="none"
        stroke={`url(#mk-verde-${uid})`}
        strokeWidth={g.arcWidth}
        strokeLinecap="round"
        pathLength={1}
        className={animated ? 'mark-arc' : undefined}
      />

      {/* Logotipo inclinado 9°, pivotando sobre el centro del aro. La
          inclinación vive en un grupo propio: un `transform` de CSS en el
          mismo elemento pisaría el atributo y perdería el sesgo. */}
      <g className={animated ? 'mark-word' : undefined}>
        <g transform="translate(96 88) skewX(-9) translate(-96 -88)">
          <path d={g.b} fill="#FFFFFF" />
          <path d={g.e} fill={`url(#mk-verde-${uid})`} />
          <path d={g.t} fill="#FFFFFF" />
          {g.n366 && <path d={g.n366} fill={`url(#mk-verde-${uid})`} />}
        </g>
      </g>

      {/* Balón encajado en la abertura del aro. */}
      <g className={animated ? 'mark-ball' : undefined} style={ballOrigin}>
        <circle cx={g.ballCx} cy={g.ballCy} r={g.ballR} fill={`url(#mk-verde-${uid})`} />
        <path d={g.pentagon} fill={INK} />
        <path
          d={g.seams}
          fill="none"
          stroke={INK}
          strokeWidth={g.seamWidth}
          strokeLinecap="round"
        />
      </g>
    </svg>
  );
}

/**
 * Logotipo en texto, para cabeceras donde el cuadrado negro sobra. Reparte los
 * dos tonos igual que la marca: "Bet" en blanco y "366" en verde.
 */
export function Wordmark({ className = 'text-title' }: { className?: string }) {
  const [head, tail] = BRAND.wordmark;
  return (
    <span className={`font-bold tracking-tightest text-white ${className}`}>
      {head}
      <span className="text-brand">{tail}</span>
    </span>
  );
}

/** Marca completa con su bajada, para portadas. */
export function Logo({
  subtitle,
  animated,
  size = 'md',
}: {
  subtitle?: string;
  animated?: boolean;
  size?: 'md' | 'lg';
}) {
  return (
    <div className="flex items-center gap-4">
      <Mark
        className={`${size === 'lg' ? 'h-[4.5rem] w-[4.5rem]' : 'h-16 w-16'} shrink-0 drop-shadow-[0_10px_30px_rgba(43,224,140,.16)]`}
        animated={animated}
      />
      <div>
        <Wordmark className={size === 'lg' ? 'text-display' : 'text-title-lg'} />
        {subtitle && <p className="mt-0.5 text-body text-content-muted">{subtitle}</p>}
      </div>
    </div>
  );
}
