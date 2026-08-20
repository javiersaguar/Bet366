/**
 * Guardia anti-arbitraje.
 *
 * Con cuota fija bloqueada y linea que se mueve, cubrir todas las opciones
 * podria dar beneficio garantizado (apuestas 100 al Si a 1.90 y, cuando el No
 * sube a 2.50, apuestas 80 al No: ganes lo que ganes, ganas).
 *
 * En vez de tocar la formula de cuotas, se corta en el momento de aceptar:
 *
 *      INVARIANTE: para cada usuario y cada apuesta,
 *      (retorno minimo garantizado) <= (total de puntos arriesgados)
 *
 * Cubrirse sigue permitido (reducir riesgo), pero el peor escenario nunca
 * puede ser una ganancia. Si solo apuestas a una opcion el minimo es 0, asi
 * que la regla solo llega a activarse cuando cubres TODAS las opciones.
 */

export type UserWager = {
  optionId: string;
  stake: number;
  lockedOdds: number;
};

export type GuardContext = {
  /** Ids de todas las opciones del mercado. */
  optionIds: string[];
  /** Apuestas activas que ya tiene el usuario en este mercado. */
  existing: UserWager[];
};

/** Retorno del usuario si gana cada opcion, y total arriesgado. */
function exposure(ctx: GuardContext, extra?: UserWager) {
  const wagers = extra ? [...ctx.existing, extra] : ctx.existing;
  const staked = wagers.reduce((acc, w) => acc + w.stake, 0);

  const returns = new Map<string, number>();
  for (const id of ctx.optionIds) returns.set(id, 0);
  for (const w of wagers) {
    returns.set(w.optionId, (returns.get(w.optionId) ?? 0) + w.stake * w.lockedOdds);
  }
  return { staked, returns };
}

/** true si la combinacion de apuestas garantiza beneficio pase lo que pase. */
export function isArbitrage(ctx: GuardContext, extra?: UserWager): boolean {
  const { staked, returns } = exposure(ctx, extra);
  if (ctx.optionIds.length === 0) return false;
  const worstCase = Math.min(...ctx.optionIds.map((id) => returns.get(id) ?? 0));
  // Se compara con tolerancia para no bloquear por decimales de redondeo.
  return worstCase > staked + 1e-9;
}

/**
 * Puntos maximos que el usuario puede poner en `optionId` sin generar
 * beneficio garantizado. `Infinity` = sin limite por esta regla
 * (el saldo sigue mandando).
 */
export function maxNonArbitrageStake(
  ctx: GuardContext,
  optionId: string,
  odds: number,
): number {
  if (odds <= 1) return Infinity;
  const { staked, returns } = exposure(ctx);

  // Peor caso entre las OTRAS opciones: no cambia por mucho que apueste aqui.
  const others = ctx.optionIds.filter((id) => id !== optionId);
  if (others.length === 0) return Infinity;
  const worstOther = Math.min(...others.map((id) => returns.get(id) ?? 0));

  // Si alguna otra opcion ya deja al usuario en perdida, no hay arbitraje posible.
  if (worstOther <= staked) return Infinity;

  // Si no, hay que mantener: returnAqui + x*odds <= staked + x
  const current = returns.get(optionId) ?? 0;
  const limit = (staked - current) / (odds - 1);
  return Math.max(0, Math.floor(limit * 100) / 100);
}

export type StakeCheck =
  | { ok: true }
  | { ok: false; reason: 'insufficient_balance' | 'arbitrage' | 'invalid_stake'; maxStake: number };

/** Validacion completa de una apuesta antes de aceptarla. */
export function checkStake(
  ctx: GuardContext,
  optionId: string,
  odds: number,
  stake: number,
  balance: number,
  minStake = 1,
): StakeCheck {
  if (!Number.isFinite(stake) || stake < minStake) {
    return { ok: false, reason: 'invalid_stake', maxStake: 0 };
  }
  if (stake > balance) {
    return { ok: false, reason: 'insufficient_balance', maxStake: balance };
  }
  if (isArbitrage(ctx, { optionId, stake, lockedOdds: odds })) {
    return {
      ok: false,
      reason: 'arbitrage',
      maxStake: Math.min(balance, maxNonArbitrageStake(ctx, optionId, odds)),
    };
  }
  return { ok: true };
}
