import { redirect } from 'next/navigation';
import { isSupabaseConfigured } from '@/lib/supabase/config';

export default function Home() {
  redirect(isSupabaseConfigured() ? '/grupos' : '/configurar');
}
