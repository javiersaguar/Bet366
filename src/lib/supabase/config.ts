/**
 * La app necesita un proyecto de Supabase para funcionar, pero el diseño se
 * puede mirar sin nada montado. Esto permite distinguir "falta configurar"
 * de "algo se ha roto", en vez de soltar un 500.
 *
 * Los nombres de variable que valen y el orden en que se buscan están en
 * `next.config.mjs`, que es el único sitio donde se puede leer una variable
 * sin el prefijo `NEXT_PUBLIC_` y aun así incrustarla en el paquete del
 * navegador. Aquí solo llega ya resuelto, junto con el nombre de dónde salió.
 *
 * Se escriben enteras y nunca con `process.env[nombre]`: Next sustituye
 * `process.env.X` por su valor al construir, y con un acceso dinámico no
 * puede, así que en el navegador saldría vacío.
 */
/* La misma lista que usa `next.config.mjs` para resolverlas, para poder
   enseñar qué nombres valen cuando no llega ninguno. */
import NOMBRES from './nombres.json';

export const SUPABASE_URL = process.env.BET366_SUPABASE_URL ?? '';
export const SUPABASE_ANON_KEY = process.env.BET366_SUPABASE_CLAVE ?? '';

const URL_ORIGEN = process.env.BET366_SUPABASE_URL_ORIGEN ?? '';
const CLAVE_ORIGEN = process.env.BET366_SUPABASE_CLAVE_ORIGEN ?? '';

export function isSupabaseConfigured(): boolean {
  return SUPABASE_URL.startsWith('http') && SUPABASE_ANON_KEY.length > 20;
}

export type EstadoVariable = {
  /** Todos los nombres que valen, para poder enseñarlos si no llega ninguno. */
  nombres: readonly string[];
  /** El que ha traído el valor, si hay alguno. */
  usado: string | null;
  estado: 'falta' | 'rara' | 'bien';
  detalle: string;
};

/**
 * Qué ve la app, para poder enseñarlo en /configurar.
 *
 * De la clave nunca sale el valor: solo si está y cuánto mide. Con eso se
 * distingue "no está puesta" de "está mal escrita", que es justo lo que no se
 * sabe mirando el panel de Vercel.
 */
export function estadoDelEntorno(): { url: EstadoVariable; clave: EstadoVariable } {
  return {
    url: {
      nombres: NOMBRES.url,
      usado: URL_ORIGEN || null,
      ...(!SUPABASE_URL
        ? { estado: 'falta' as const, detalle: 'no llega a la app' }
        : SUPABASE_URL.startsWith('http')
          ? { estado: 'bien' as const, detalle: SUPABASE_URL }
          : { estado: 'rara' as const, detalle: 'no empieza por https://' }),
    },
    clave: {
      nombres: NOMBRES.clave,
      usado: CLAVE_ORIGEN || null,
      ...(!SUPABASE_ANON_KEY
        ? { estado: 'falta' as const, detalle: 'no llega a la app' }
        : SUPABASE_ANON_KEY.length > 20
          ? { estado: 'bien' as const, detalle: `${SUPABASE_ANON_KEY.length} caracteres` }
          : { estado: 'rara' as const, detalle: `solo ${SUPABASE_ANON_KEY.length} caracteres` }),
    },
  };
}
