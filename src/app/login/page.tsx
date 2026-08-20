import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { BRAND } from '@/lib/brand';
import { Logo } from '@/components/logo';
import { LoginForm } from './login-form';

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (user) redirect('/grupos');

  const { next } = await searchParams;

  return (
    <main className="grid min-h-dvh place-items-center px-5 py-12">
      <div className="w-full max-w-sm animate-rise">
        <div className="mb-9">
          <Logo subtitle={BRAND.tagline} />
        </div>

        <LoginForm next={next ?? '/grupos'} />

        <div className="mt-8 space-y-2 text-center">
          <p className="text-2xs leading-relaxed text-content-faint">
            Aquí no se juega con dinero real. Solo puntos, que además se reinician cada semana.
          </p>
        </div>
      </div>
    </main>
  );
}
