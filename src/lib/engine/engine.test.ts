import { describe, expect, it } from 'vitest';
import { computeCurrentOdds, impliedProbability, payoutFor } from './odds';
import { checkStake, isArbitrage, maxNonArbitrageStake } from './guard';

const dyn = { liquidity: 300, drift: 0.5 };

describe('computeCurrentOdds', () => {
  it('sin volumen devuelve exactamente las cuotas de apertura', () => {
    const odds = computeCurrentOdds(
      [
        { openingOdds: 1.9, pool: 0 },
        { openingOdds: 1.9, pool: 0 },
      ],
      dyn,
    );
    expect(odds).toEqual([1.9, 1.9]);
  });

  it('conserva cuotas de apertura asimetricas y con margen', () => {
    const odds = computeCurrentOdds(
      [
        { openingOdds: 1.35, pool: 0 },
        { openingOdds: 3.4, pool: 0 },
        { openingOdds: 7.5, pool: 0 },
      ],
      dyn,
    );
    expect(odds).toEqual([1.35, 3.4, 7.5]);
  });

  it('baja la cuota de la opcion que recibe dinero y sube la otra', () => {
    const [si, no] = computeCurrentOdds(
      [
        { openingOdds: 1.9, pool: 500 },
        { openingOdds: 1.9, pool: 50 },
      ],
      dyn,
    );
    expect(si).toBeLessThan(1.9);
    expect(no).toBeGreaterThan(1.9);
  });

  it('el movimiento es leve: mucho dinero de un lado no dispara la cuota', () => {
    const [si, no] = computeCurrentOdds(
      [
        { openingOdds: 1.9, pool: 10000 },
        { openingOdds: 1.9, pool: 0 },
      ],
      dyn,
    );
    expect(si).toBeGreaterThan(1.2);
    expect(no).toBeLessThan(6);
  });

  it('drift 0 congela las cuotas pase lo que pase', () => {
    const odds = computeCurrentOdds(
      [
        { openingOdds: 2.5, pool: 9999 },
        { openingOdds: 1.5, pool: 1 },
      ],
      { liquidity: 300, drift: 0 },
    );
    expect(odds).toEqual([2.5, 1.5]);
  });

  it('nunca devuelve cuotas fuera de rango', () => {
    const odds = computeCurrentOdds(
      [
        { openingOdds: 1.01, pool: 100000 },
        { openingOdds: 40, pool: 0 },
      ],
      { liquidity: 10, drift: 1 },
    );
    for (const o of odds) {
      expect(o).toBeGreaterThanOrEqual(1.01);
      expect(o).toBeLessThanOrEqual(50);
    }
  });
});

describe('payoutFor', () => {
  it('multiplica la apuesta por la cuota bloqueada', () => {
    expect(payoutFor(100, 1.9)).toBe(190);
    expect(payoutFor(33, 2.35)).toBe(77.55);
  });
});

describe('impliedProbability', () => {
  it('reparte el 100% entre las opciones', () => {
    const all = [1.9, 1.9];
    const total = all.reduce((acc, o) => acc + impliedProbability(o, all), 0);
    expect(total).toBeCloseTo(1, 6);
  });
});

describe('guardia anti-arbitraje', () => {
  const ctx = (existing: { optionId: string; stake: number; lockedOdds: number }[]) => ({
    optionIds: ['si', 'no'],
    existing,
  });

  it('permite apostar a una sola opcion sin limite', () => {
    expect(maxNonArbitrageStake(ctx([]), 'si', 1.9)).toBe(Infinity);
    expect(isArbitrage(ctx([]), { optionId: 'si', stake: 99999, lockedOdds: 1.9 })).toBe(false);
  });

  it('detecta el arbitraje clasico: 100 al Si a 1.90 y 80 al No a 2.50', () => {
    const c = ctx([{ optionId: 'si', stake: 100, lockedOdds: 1.9 }]);
    // 100@1.9 => 190 ; 80@2.5 => 200 ; total arriesgado 180 => gana siempre
    expect(isArbitrage(c, { optionId: 'no', stake: 80, lockedOdds: 2.5 })).toBe(true);
  });

  it('permite cubrirse mientras el peor caso sea perdida', () => {
    const c = ctx([{ optionId: 'si', stake: 100, lockedOdds: 1.9 }]);
    const max = maxNonArbitrageStake(c, 'no', 2.5);
    expect(max).toBe(66.66); // se redondea a la baja, nunca al alza
    expect(isArbitrage(c, { optionId: 'no', stake: max, lockedOdds: 2.5 })).toBe(false);
    expect(isArbitrage(c, { optionId: 'no', stake: max + 0.5, lockedOdds: 2.5 })).toBe(true);
  });

  it('el maximo permitido deja el peor caso justo en tablas, nunca en beneficio', () => {
    const c = ctx([{ optionId: 'si', stake: 250, lockedOdds: 1.75 }]);
    const max = maxNonArbitrageStake(c, 'no', 3.1);
    const staked = 250 + max;
    const retSi = 250 * 1.75;
    const retNo = max * 3.1;
    expect(Math.min(retSi, retNo)).toBeLessThanOrEqual(staked + 1e-9);
  });

  it('funciona con mercados de varias opciones', () => {
    const c = {
      optionIds: ['juan', 'pedro', 'maria'],
      existing: [
        { optionId: 'juan', stake: 100, lockedOdds: 4 },
        { optionId: 'pedro', stake: 100, lockedOdds: 4 },
      ],
    };
    // Cubriendo la tercera a 4.00 con 100 => 400 en los 3 casos vs 300 arriesgado.
    expect(isArbitrage(c, { optionId: 'maria', stake: 100, lockedOdds: 4 })).toBe(true);
    // Mientras quede una opcion descubierta, el peor caso es 0: sin limite.
    expect(maxNonArbitrageStake({ ...c, existing: [c.existing[0]] }, 'pedro', 4)).toBe(Infinity);
  });

  it('checkStake devuelve el motivo y el maximo permitido', () => {
    const c = ctx([{ optionId: 'si', stake: 100, lockedOdds: 1.9 }]);
    expect(checkStake(c, 'no', 2.5, 80, 1000)).toEqual({
      ok: false,
      reason: 'arbitrage',
      maxStake: 66.66,
    });
    expect(checkStake(c, 'no', 2.5, 50, 1000)).toEqual({ ok: true });
    expect(checkStake(c, 'no', 2.5, 50, 10).reason).toBe('insufficient_balance');
    expect(checkStake(c, 'no', 2.5, 0, 1000).reason).toBe('invalid_stake');
  });

  it('propiedad: ninguna secuencia aceptada de apuestas garantiza beneficio', () => {
    const optionIds = ['a', 'b', 'c'];
    let rng = 42;
    const rand = () => ((rng = (rng * 1103515245 + 12345) % 2147483648) / 2147483648);

    for (let run = 0; run < 300; run++) {
      const existing: { optionId: string; stake: number; lockedOdds: number }[] = [];
      for (let i = 0; i < 8; i++) {
        const optionId = optionIds[Math.floor(rand() * optionIds.length)];
        const odds = 1.05 + rand() * 8;
        const stake = Math.ceil(rand() * 400);
        const check = checkStake({ optionIds, existing }, optionId, odds, stake, 1e9);
        if (check.ok) existing.push({ optionId, stake, lockedOdds: odds });
      }
      const staked = existing.reduce((a, w) => a + w.stake, 0);
      const worst = Math.min(
        ...optionIds.map((id) =>
          existing.filter((w) => w.optionId === id).reduce((a, w) => a + w.stake * w.lockedOdds, 0),
        ),
      );
      expect(worst).toBeLessThanOrEqual(staked + 1e-6);
    }
  });
});
