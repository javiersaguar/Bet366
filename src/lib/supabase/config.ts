/**
 * La app necesita un proyecto de Supabase para funcionar, pero el diseño se
 * puede mirar sin nada montado. Esto permite distinguir "falta configurar"
 * de "algo se ha roto", en vez de soltar un 500.
 */

export const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? '';
export const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? '';

export function isSupabaseConfigured(): boolean {
  return SUPABASE_URL.startsWith('http') && SUPABASE_ANON_KEY.length > 20;
}

export type EstadoVariable =
  | { estado: 'falta' }
  | { estado: 'rara'; detalle: string }
  | { estado: 'bien'; detalle: string };

/**
 * Qué ve la app de cada variable, para poder enseñarlo en /configurar.
 *
 * Nunca devuelve el valor de la clave: solo si está, cuánto mide y cómo
 * empieza. Con eso se distingue "no está puesta" de "está mal escrita", que
 * es justo lo que no se sabe mirando el panel de Vercel.
 */
export function estadoDelEntorno(): { url: EstadoVariable; clave: EstadoVariable } {
  return {
    url: !SUPABASE_URL
      ? { estado: 'falta' }
      : SUPABASE_URL.startsWith('http')
        ? { estado: 'bien', detalle: SUPABASE_URL }
        : { estado: 'rara', detalle: 'no empieza por https://' },
    clave: !SUPABASE_ANON_KEY
      ? { estado: 'falta' }
      : SUPABASE_ANON_KEY.length > 20
        ? { estado: 'bien', detalle: `${SUPABASE_ANON_KEY.length} caracteres` }
        : { estado: 'rara', detalle: `solo ${SUPABASE_ANON_KEY.length} caracteres` },
  };
}
