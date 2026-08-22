import { cookies } from 'next/headers';
import {
  GRUPOS,
  GRUPOS_UNIDOS,
  GRUPO_POR_DEFECTO,
  type GrupoDemo,
} from '@/lib/fixtures';

/**
 * En qué grupo estás dentro de la demostración.
 *
 * Se guarda en una cookie y no en la dirección: así todas las pantallas de
 * ejemplo siguen viviendo en `/demo`, `/demo/ranking`… y cambiar de grupo se
 * siente como en la app de verdad, donde cambia el contenido entero y no solo
 * un trozo de la URL.
 *
 * No hay nada que proteger aquí: son datos inventados y no tocan la base.
 */
export const COOKIE_GRUPO = 'bet366-demo-grupo';

/** Los grupos a los que te has unido con un código durante la demostración. */
export const COOKIE_UNIDOS = 'bet366-demo-unidos';

export const COOKIE_OPCIONES = {
  path: '/',
  maxAge: 60 * 60 * 24 * 30,
  sameSite: 'lax',
} as const;

/** Ids de los grupos en los que estás: los de siempre más los que hayas añadido. */
export async function idsDeMisGrupos(): Promise<string[]> {
  const tarro = await cookies();
  const extra = (tarro.get(COOKIE_UNIDOS)?.value ?? '')
    .split(',')
    .map((s) => s.trim())
    .filter((id) => id in GRUPOS && !GRUPOS_UNIDOS.includes(id));

  return [...GRUPOS_UNIDOS, ...new Set(extra)];
}

export async function misGruposDemo(): Promise<GrupoDemo[]> {
  return (await idsDeMisGrupos()).map((id) => GRUPOS[id]);
}

/**
 * El grupo que se está mirando.
 *
 * Si la cookie apunta a uno en el que no estás (o a nada), se vuelve al de
 * siempre en vez de romper: una cookie vieja no puede dejar la demostración
 * en blanco.
 */
export async function grupoActual(): Promise<GrupoDemo> {
  const tarro = await cookies();
  const elegido = tarro.get(COOKIE_GRUPO)?.value ?? '';
  const mios = await idsDeMisGrupos();
  return GRUPOS[mios.includes(elegido) ? elegido : GRUPO_POR_DEFECTO];
}
