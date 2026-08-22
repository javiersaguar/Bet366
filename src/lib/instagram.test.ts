import { describe, expect, it } from 'vitest';
import { enlaceInstagram, limpiarInstagram } from './instagram';

describe('limpiarInstagram', () => {
  it('acepta lo que la gente pega de verdad', () => {
    for (const bruto of [
      'javi',
      '@javi',
      '@@javi',
      '  javi  ',
      'instagram.com/javi',
      'www.instagram.com/javi',
      'https://instagram.com/javi',
      'https://www.instagram.com/javi/',
      'https://www.instagram.com/javi?igsh=abc123',
      'https://instagram.com/javi#algo',
    ]) {
      expect(limpiarInstagram(bruto), bruto).toBe('javi');
    }
  });

  it('deja pasar los caracteres que Instagram permite', () => {
    expect(limpiarInstagram('lucia.mp')).toBe('lucia.mp');
    expect(limpiarInstagram('ana_gr')).toBe('ana_gr');
    expect(limpiarInstagram('_0.9_')).toBe('_0.9_');
  });

  it('un campo vacío no es un error, es no tener Instagram', () => {
    expect(limpiarInstagram('')).toBeNull();
    expect(limpiarInstagram('   ')).toBeNull();
  });

  it('rechaza lo que no puede ser un usuario', () => {
    expect(limpiarInstagram('con espacio')).toBe(false);
    expect(limpiarInstagram('acento-ñ')).toBe(false);
    expect(limpiarInstagram('a'.repeat(31))).toBe(false);
    expect(limpiarInstagram('https://otrositio.com/javi')).toBe(false);
  });

  /* Lo que se guarda no puede ser jamás una dirección: si lo fuera, cualquiera
     podría dejar un enlace a donde quisiera en algo que el grupo va a pulsar. */
  it('nunca devuelve algo que sirva como URL a otro sitio', () => {
    for (const ataque of [
      'javascript:alert(1)',
      'https://instagram.com.malo.es/javi',
      '//malo.es',
      'instagram.com/javi/../../malo',
    ]) {
      const salida = limpiarInstagram(ataque);
      if (salida === false || salida === null) continue;
      expect(salida, ataque).toMatch(/^[A-Za-z0-9._]{1,30}$/);
      expect(enlaceInstagram(salida), ataque).toBe(`https://instagram.com/${salida}`);
    }
  });
});
