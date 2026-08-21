import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { isSupabaseConfigured } from '@/lib/supabase/config';

/**
 * Puerta de entrada a cualquier pantalla que necesite sesión.
 *
 * Antes cada página llamaba a `createClient()` a pelo y daba por hecho que el
 * middleware ya había garantizado un usuario. Las dos suposiciones fallan:
 *
 *   - Sin proyecto de Supabase configurado, `createClient()` lanza
 *     "Your project's URL and Key are required". El middleware no redirige en
 *     ese caso (deja pasar a propósito para que la demo siga viva), así que la
 *     página reventaba con la pantalla de "Se ha roto algo". Pasa en cuanto
 *     las variables de entorno no están visibles en ese despliegue.
 *   - Si la sesión caduca entre el middleware y el render, `user` es null y
 *     el `user!.id` de después peta.
 *
 * Con esto, lo peor que puede pasar es acabar en /configurar o en /login, que
 * es lo que el usuario necesita ver en cada caso.
 */
export async function requireSession(next?: string) {
  if (!isSupabaseConfigured()) redirect('/configurar');

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect(next ? `/login?next=${encodeURIComponent(next)}` : '/login');

  return { supabase, user };
}
