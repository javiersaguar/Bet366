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
