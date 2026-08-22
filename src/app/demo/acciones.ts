'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { GRUPOS, grupoDemoPorCodigo } from '@/lib/fixtures';
import { COOKIE_GRUPO, COOKIE_OPCIONES, COOKIE_UNIDOS, idsDeMisGrupos } from '@/app/demo/estado';

/** Cambiar de grupo en la demostración: se guarda cuál y se vuelve al tablón. */
export async function cambiarGrupoDemo(formData: FormData) {
  const id = String(formData.get('grupo') ?? '');
  if (!(id in GRUPOS)) redirect('/demo/grupos');

  const tarro = await cookies();
  tarro.set(COOKIE_GRUPO, id, COOKIE_OPCIONES);
  redirect('/demo');
}

/**
 * Entrar en un grupo con su código, dentro de la demostración.
 *
 * No hay base de datos detrás, así que lo que se guarda es la lista de los que
 * has añadido. Sirve para enseñar el flujo entero: pegas el código, el grupo
 * aparece en tu lista y ya puedes entrar y salir de él como de los demás.
 */
export async function unirseDemoAction(
  _prev: { error?: string; ok?: true },
  formData: FormData,
): Promise<{ error?: string; ok?: true }> {
  const codigo = String(formData.get('code') ?? '').trim().toUpperCase();
  const grupo = grupoDemoPorCodigo(codigo);

  if (!grupo) {
    return { error: 'Ese código no es de ningún grupo. En la demostración solo vale PADEL7.' };
  }

  const tarro = await cookies();
  const mios = await idsDeMisGrupos();

  if (!mios.includes(grupo.id)) {
    tarro.set(COOKIE_UNIDOS, [...mios, grupo.id].join(','), COOKIE_OPCIONES);
  }
  tarro.set(COOKIE_GRUPO, grupo.id, COOKIE_OPCIONES);

  redirect('/demo');
}
