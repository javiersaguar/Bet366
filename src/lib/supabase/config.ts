/**
 * La app necesita un proyecto de Supabase para funcionar, pero el diseño se
 * puede mirar sin nada montado. Esto permite distinguir "falta configurar"
 * de "algo se ha roto", en vez de soltar un 500.
 *
 * Las variables se leen escritas enteras, nunca con `process.env[nombre]`:
 * Next sustituye `process.env.NEXT_PUBLIC_X` por su valor al construir, y con
 * un acceso dinámico no puede, así que en el navegador saldría vacío.
 *
 * Solo valen nombres con `NEXT_PUBLIC_`. El resto de variables que pone la
 * integración de Supabase (`SUPABASE_URL`, `POSTGRES_*`, la clave de servicio)
 * se quedan en el servidor a propósito y no sirven aquí.
 */

/** Cómo llama Supabase a la clave pública, antes y ahora. */
const CLAVES = [
  ['NEXT_PUBLIC_SUPABASE_ANON_KEY', process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY],
  /* Supabase renombró la "anon key" a "publishable key", y su integración con
     Vercel ya pone esta. Sirve igual: es la misma clave pública. */
  ['NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY', process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY],
] as const;

const URLS = [['NEXT_PUBLIC_SUPABASE_URL', process.env.NEXT_PUBLIC_SUPABASE_URL]] as const;

function primera(pares: ReadonlyArray<readonly [string, string | undefined]>) {
  const encontrada = pares.find(([, valor]) => (valor ?? '').length > 0);
  return { nombre: encontrada?.[0] ?? null, valor: encontrada?.[1] ?? '' };
}

export const SUPABASE_URL = primera(URLS).valor;
export const SUPABASE_ANON_KEY = primera(CLAVES).valor;

export function isSupabaseConfigured(): boolean {
  return SUPABASE_URL.startsWith('http') && SUPABASE_ANON_KEY.length > 20;
}

export type EstadoVariable = {
  /** Todos los nombres que valen, para poder enseñarlos si no hay ninguno. */
  nombres: readonly string[];
  /** El que se ha usado, si hay alguno. */
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
  const url = primera(URLS);
  const clave = primera(CLAVES);

  return {
    url: {
      nombres: URLS.map(([n]) => n),
      usado: url.nombre,
      ...(!url.valor
        ? { estado: 'falta' as const, detalle: 'no llega a la app' }
        : url.valor.startsWith('http')
          ? { estado: 'bien' as const, detalle: url.valor }
          : { estado: 'rara' as const, detalle: 'no empieza por https://' }),
    },
    clave: {
      nombres: CLAVES.map(([n]) => n),
      usado: clave.nombre,
      ...(!clave.valor
        ? { estado: 'falta' as const, detalle: 'no llega a la app' }
        : clave.valor.length > 20
          ? { estado: 'bien' as const, detalle: `${clave.valor.length} caracteres` }
          : { estado: 'rara' as const, detalle: `solo ${clave.valor.length} caracteres` }),
    },
  };
}
