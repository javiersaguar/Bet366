/**
 * De un error de la base a una frase que se pueda leer.
 *
 * Las excepciones de nuestras funciones SQL están escritas en castellano y
 * pensadas para que las lea quien usa la app («Ese codigo de invitacion no
 * existe»), así que esas pasan tal cual. Lo que hay que filtrar es lo otro:
 * lo que dice PostgreSQL cuando el problema no es de quien pulsa el botón.
 *
 * No vive en `actions.ts` porque ese fichero es `'use server'` y de ahí solo
 * pueden salir funciones asíncronas. Aquí, además, se puede probar.
 */

/* Errores que hablan de la estructura de la base y no de lo que ha hecho la
   persona. Se reconocen por el inglés: los nuestros van en castellano. */
const SUENA_A_BASE_A_MEDIO_MONTAR =
  /(function|relation|column|type|schema)\s.*does not exist|permission denied for|undefined_function/i;

const FALTAN_MIGRACIONES =
  'A la base de datos le falta algo. Pasa las migraciones de supabase/migrations que tengas pendientes.';

const GENERICO = 'Algo ha fallado, prueba otra vez.';

export function mensajeDeError(error: { message: string; code?: string } | null): string {
  if (!error) return GENERICO;

  const clean = (error.message ?? '').replace(/^.*?(?:ERROR|error):\s*/i, '').trim();

  if (/duplicate key|unique constraint/i.test(clean)) return 'Eso ya existe.';
  if (/violates check constraint/i.test(clean)) return 'Hay algún dato fuera de rango.';

  /* Se vio en producción: crear un grupo contestaba «function
     gen_random_bytes(integer) does not exist». Eso no le dice nada a nadie y
     encima no sugiere qué hacer, que era pasar una migración. */
  if (SUENA_A_BASE_A_MEDIO_MONTAR.test(clean)) return FALTAN_MIGRACIONES;

  return clean || GENERICO;
}
