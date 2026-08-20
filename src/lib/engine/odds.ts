/**
 * Motor de cuotas.
 *
 * Reglas del juego (sin banca, sin dinero real):
 *  - El creador fija las cuotas de apertura de cada opcion.
 *  - Cada apuesta BLOQUEA la cuota que se ve en ese momento (cuota fija).
 *  - La cuota mostrada se mueve *levemente* segun los puntos que van entrando:
 *    si entra mucho al "Si", el "Si" se paga menos y el "No" se paga mas.
 *  - No hay banca: los puntos ganados salen de la nada (stake x cuota).
 *    Por eso no hace falta que el mercado cuadre, solo que sea imposible
 *    garantizarse beneficio (de eso se encarga guard.ts).
 */

export const ODDS_MIN = 1.01;
export const ODDS_MAX = 50;

/** Probabilidad minima/maxima que puede alcanzar una opcion por el movimiento de mercado. */
const PROB_FLOOR = 0.02;
const PROB_CEIL = 0.95;

export type OddsInput = {
  /** Cuota de apertura fijada por el creador, p.ej. 1.90 */
  openingOdds: number;
  /** Puntos apostados a esta opcion (apuestas activas, sin anuladas) */
  pool: number;
};

export type MarketDynamics = {
  /**
   * Cuanto tarda el mercado en "hacer caso" al dinero que entra.
   * Con liquidity = 300, hacen falta 300 puntos en juego para que el
   * mercado pese lo mismo que la linea de apertura.
   */
  liquidity: number;
  /**
   * Escala global del movimiento, 0 = cuotas totalmente fijas,
   * 1 = el mercado manda del todo cuando hay volumen.
   */
  drift: number;
};

export const DEFAULT_DYNAMICS: MarketDynamics = { liquidity: 300, drift: 0.5 };

export function roundOdds(odds: number): number {
  return Math.round(odds * 100) / 100;
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

/**
 * Cuotas vigentes de un mercado dado el dinero que ha entrado en cada opcion.
 *
 * Propiedad clave: con volumen 0 devuelve EXACTAMENTE las cuotas de apertura,
 * porque el margen que haya metido el creador (p.ej. 1.90/1.90 => 105.3%)
 * se conserva como multiplicador constante.
 */
export function computeCurrentOdds(
  options: OddsInput[],
  dynamics: MarketDynamics = DEFAULT_DYNAMICS,
): number[] {
  if (options.length === 0) return [];

  const implied = options.map((o) => 1 / clamp(o.openingOdds, ODDS_MIN, ODDS_MAX));
  const margin = implied.reduce((a, b) => a + b, 0);
  if (margin <= 0) return options.map((o) => roundOdds(o.openingOdds));

  // Probabilidades de apertura normalizadas (suman 1, sin margen).
  const opening = implied.map((p) => p / margin);

  const pools = options.map((o) => Math.max(0, o.pool));
  const totalPool = pools.reduce((a, b) => a + b, 0);

  // Peso del mercado frente a la linea de apertura.
  const weight =
    totalPool > 0
      ? clamp(dynamics.drift, 0, 1) * (totalPool / (totalPool + Math.max(1, dynamics.liquidity)))
      : 0;

  let probs = opening.map((p, i) => {
    const share = totalPool > 0 ? pools[i] / totalPool : p;
    return (1 - weight) * p + weight * share;
  });

  // Topes para que ninguna opcion se vaya a cuotas absurdas, y renormalizado.
  probs = probs.map((p) => clamp(p, PROB_FLOOR, PROB_CEIL));
  const sum = probs.reduce((a, b) => a + b, 0);
  probs = probs.map((p) => p / sum);

  // Se devuelve el margen del creador al convertir de nuevo a cuota.
  return probs.map((p) => roundOdds(clamp(1 / (p * margin), ODDS_MIN, ODDS_MAX)));
}

/** Puntos que se cobran si acierta: la apuesta se multiplica por la cuota bloqueada. */
export function payoutFor(stake: number, lockedOdds: number): number {
  return Math.round(stake * lockedOdds * 100) / 100;
}

/** Probabilidad implicita que muestra la UI ("el mercado le da un 62%"). */
export function impliedProbability(odds: number, allOdds: number[]): number {
  const total = allOdds.reduce((acc, o) => acc + 1 / o, 0);
  if (total <= 0) return 0;
  return 1 / odds / total;
}
