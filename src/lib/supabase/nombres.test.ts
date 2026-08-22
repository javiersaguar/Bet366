import { describe, expect, it } from 'vitest';
import nombres from './nombres.json';

/**
 * Estos nombres deciden qué acaba dentro del JavaScript que descarga el
 * navegador. Añadir aquí por descuido una clave de servicio la publicaría a
 * cualquiera que abra la app, y esa clave se salta todas las políticas de fila.
 */
const PROHIBIDO = /SERVICE_ROLE|SECRET|PASSWORD|PRIVATE|JWT|POSTGRES|DATABASE_URL/i;

describe('nombres de variables que llegan al navegador', () => {
  const todos = [...nombres.url, ...nombres.clave];

  it('ninguno puede ser un secreto', () => {
    for (const n of todos) {
      expect(n, `${n} no puede llegar al navegador`).not.toMatch(PROHIBIDO);
    }
  });

  it('solo son variables de Supabase', () => {
    for (const n of todos) {
      expect(n, n).toMatch(/^(NEXT_PUBLIC_)?SUPABASE_/);
    }
  });

  it('las dos listas traen algo y sin repetidos', () => {
    expect(nombres.url.length).toBeGreaterThan(0);
    expect(nombres.clave.length).toBeGreaterThan(0);
    expect(new Set(todos).size).toBe(todos.length);
  });

  /* El orden importa: si alguien pone la variable con el prefijo a mano, esa
     gana sobre la que deje la integración. */
  it('las que empiezan por NEXT_PUBLIC_ van primero', () => {
    for (const lista of [nombres.url, nombres.clave]) {
      const conPrefijo = lista.map((n) => n.startsWith('NEXT_PUBLIC_'));
      const ordenada = [...conPrefijo].sort((a, b) => Number(b) - Number(a));
      expect(conPrefijo).toEqual(ordenada);
    }
  });
});
