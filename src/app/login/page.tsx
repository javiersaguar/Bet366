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
      <div className="w-full max-w-sm">
        <div className="animate-rise mb-8">
          <Logo subtitle={BRAND.tagline} animated />
        </div>

        <div className="animate-rise" style={{ animationDelay: '90ms' }}>
          <LoginForm next={next ?? '/grupos'} />
        </div>

        <ul
          className="animate-rise mt-8 space-y-2.5"
          style={{ animationDelay: '180ms' }}
        >
          <Perk icon="🎯">Tú pones las cuotas de tus apuestas</Perk>
          <Perk icon="🔒">Imposible ganar apostando a todo</Perk>
          <Perk icon="🔄">Ranking y puntos nuevos cada semana</Perk>
        </ul>

        <p
          className="animate-rise mt-8 text-center text-2xs leading-relaxed text-content-faint"
          style={{ animationDelay: '260ms' }}
        >
          Aquí no se juega con dinero real. Solo puntos, que además se reinician cada semana.
        </p>
      </div>
    </main>
  );
}

function Perk({ icon, children }: { icon: string; children: React.ReactNode }) {
  return (
    <li className="flex items-center gap-3 text-sm text-content-muted">
      <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg border border-line bg-surface text-sm">
        {icon}
      </span>
      {children}
    </li>
  );
}
