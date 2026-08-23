import { describe, expect, it } from 'vitest';
import { mensajeDeError } from '@/lib/errores';

describe('mensajeDeError', () => {
  it('deja pasar tal cual lo que escriben nuestras funciones SQL', () => {
    expect(mensajeDeError({ message: 'Ese codigo de invitacion no existe' })).toBe(
      'Ese codigo de invitacion no existe',
    );
    expect(mensajeDeError({ message: 'No te quedan puntos suficientes' })).toBe(
      'No te quedan puntos suficientes',
    );
  });

  it('quita el prefijo «ERROR:» que mete postgres', () => {
    expect(mensajeDeError({ message: 'ERROR: Esa apuesta ya ha cerrado' })).toBe(
      'Esa apuesta ya ha cerrado',
    );
  });

  it('traduce lo que le falta a la base en algo accionable', () => {
    /* Este es el que se vio en producción al crear un grupo. */
    const falta = mensajeDeError({ message: 'function gen_random_bytes(integer) does not exist' });
    expect(falta).toMatch(/migraciones/);
    expect(falta).not.toMatch(/gen_random_bytes/);

    expect(mensajeDeError({ message: 'column profiles.instagram does not exist' })).toBe(falta);
    expect(mensajeDeError({ message: 'relation "public.seasons" does not exist' })).toBe(falta);
    expect(mensajeDeError({ message: 'permission denied for table groups' })).toBe(falta);
  });

  it('resume los choques de clave y de restriccion', () => {
    expect(mensajeDeError({ message: 'duplicate key value violates unique constraint' })).toBe(
      'Eso ya existe.',
    );
    expect(mensajeDeError({ message: 'new row violates check constraint "odds_range"' })).toBe(
      'Hay algún dato fuera de rango.',
    );
  });

  it('siempre dice algo, aunque no llegue nada', () => {
    expect(mensajeDeError(null)).toBe('Algo ha fallado, prueba otra vez.');
    expect(mensajeDeError({ message: '' })).toBe('Algo ha fallado, prueba otra vez.');
    expect(mensajeDeError({ message: '   ' })).toBe('Algo ha fallado, prueba otra vez.');
  });

  it('no confunde una frase nuestra con un fallo de esquema', () => {
    /* «no existe» en castellano no puede disparar el aviso de migraciones. */
    expect(mensajeDeError({ message: 'Esa apuesta no existe o ya no esta' })).toBe(
      'Esa apuesta no existe o ya no esta',
    );
  });
});
