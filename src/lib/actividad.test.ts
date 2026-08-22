import { describe, expect, it } from 'vitest';
import { sello, ultimaActividad, type MercadoActivo } from '@/lib/actividad';

const h = (horas: number) => new Date(Date.now() + horas * 3600e3).toISOString();

function mercado(extra: Partial<MercadoActivo>): MercadoActivo {
  return {
    title: 'Una apuesta',
    status: 'open',
    created_at: h(-10),
    closes_at: h(10),
    ...extra,
  };
}

describe('ultimaActividad', () => {
  it('no inventa nada cuando el grupo está vacío', () => {
    expect(ultimaActividad([], [])).toBeNull();
  });

  it('se queda con lo más reciente de todo lo que ha pasado', () => {
    const a = ultimaActividad([
      mercado({ title: 'Vieja', created_at: h(-40) }),
      mercado({ title: 'Nueva', created_at: h(-2) }),
    ]);
    expect(a?.texto).toBe('Nueva: Nueva');
  });

  it('un aviso reciente gana a una apuesta más antigua', () => {
    const a = ultimaActividad(
      [mercado({ title: 'Vieja', created_at: h(-40) })],
      [{ kind: 'wager_won', title: 'Has ganado Vieja', created_at: h(-1), read_at: null }],
    );
    expect(a?.texto).toBe('Has ganado Vieja');
  });

  it('ignora lo que todavía no ha pasado', () => {
    /* Una apuesta creada hace un rato que cierra mañana: la única actividad
       real es haberla creado, no el cierre que aún no ha llegado. */
    const a = ultimaActividad([
      mercado({ title: 'Del domingo', created_at: h(-30), closes_at: h(20) }),
    ]);
    expect(a?.texto).toBe('Nueva: Del domingo');
    expect(new Date(a!.at).getTime()).toBeLessThanOrEqual(Date.now());
  });

  it('marca el grupo cuando una apuesta cierra sin resultado', () => {
    const a = ultimaActividad([
      mercado({ title: 'Sin resolver', status: 'closed', created_at: h(-30), closes_at: h(-1) }),
    ]);
    expect(a?.pendiente).toBe(true);
    expect(a?.texto).toBe('Falta el resultado de Sin resolver');
  });

  it('marca el grupo cuando hay una impugnación', () => {
    const a = ultimaActividad([
      mercado({
        title: 'Llueve el domingo',
        status: 'disputed',
        created_at: h(-30),
        closes_at: h(-6),
        result_set_at: h(-5),
      }),
    ]);
    expect(a?.pendiente).toBe(true);
    expect(a?.texto).toBe('Impugnada: Llueve el domingo');
  });

  it('una resuelta no pide nada de nadie', () => {
    const a = ultimaActividad([
      mercado({
        title: 'Ya pagada',
        status: 'resolved',
        created_at: h(-30),
        closes_at: h(-4),
        result_set_at: h(-3),
        resolved_at: h(-2),
      }),
    ]);
    expect(a?.pendiente).toBe(false);
    expect(a?.texto).toBe('Repartida: Ya pagada');
  });
});

describe('sello', () => {
  it('usa tramos relativos y nunca una hora del reloj', () => {
    expect(sello(h(-0.005))).toBe('ahora');
    expect(sello(h(-0.5))).toBe('30 min');
    expect(sello(h(-5))).toBe('5 h');
    expect(sello(h(-30))).toBe('ayer');
    expect(sello(h(-72))).toBe('3 d');
    expect(sello(h(-24 * 10))).toBe('1 sem');
    expect(sello(h(-24 * 90))).toBe('3 mes');
  });
});

describe('la marca de «hay algo parado» mira todo el grupo', () => {
  it('la frase sigue siendo la de lo último, pero el grupo queda marcado', () => {
    const a = ultimaActividad([
      mercado({ title: 'Sin resolver', status: 'closed', created_at: h(-30), closes_at: h(-3) }),
      mercado({ title: 'Recién lanzada', created_at: h(-1), closes_at: h(20) }),
    ]);
    expect(a?.texto).toBe('Nueva: Recién lanzada');
    expect(a?.pendiente).toBe(true);
  });

  it('un aviso más nuevo tampoco borra la marca', () => {
    const a = ultimaActividad(
      [mercado({ title: 'Sin resolver', status: 'closed', created_at: h(-30), closes_at: h(-3) })],
      [{ kind: 'wager_won', title: 'Has ganado otra cosa', created_at: h(-0.5), read_at: null }],
    );
    expect(a?.texto).toBe('Has ganado otra cosa');
    expect(a?.pendiente).toBe(true);
  });

  it('sin nada parado no hay marca', () => {
    const a = ultimaActividad(
      [mercado({ title: 'Abierta', created_at: h(-30), closes_at: h(20) })],
      [{ kind: 'wager_won', title: 'Has ganado otra cosa', created_at: h(-0.5), read_at: null }],
    );
    expect(a?.texto).toBe('Has ganado otra cosa');
    expect(a?.pendiente).toBe(false);
  });
});

describe('avisos sin frase propia', () => {
  it('«Apuesta nueva» no se usa de resumen: ya lo cuenta la apuesta', () => {
    const a = ultimaActividad(
      [mercado({ title: 'El derbi acaba en empate', created_at: h(-3), closes_at: h(20) })],
      [{ kind: 'market_opened', title: 'Apuesta nueva', created_at: h(-3), read_at: null }],
    );
    expect(a?.texto).toBe('Nueva: El derbi acaba en empate');
  });
});
