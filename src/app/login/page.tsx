import { redirect } from 'next/navigation';
import Link from 'next/link';
import { ArrowsClockwise, ArrowUpRight, ShieldCheck, Sliders } from '@phosphor-icons/react/dist/ssr';
import { createClient } from '@/lib/supabase/server';
import { isSupabaseConfigured } from '@/lib/supabase/config';
import { BRAND } from '@/lib/brand';
import { Mark, Wordmark } from '@/components/logo';
import { LoginForm } from './login-form';

/**
 * Portada.
 *
 * Es la única pantalla de la app donde la marca manda, así que aquí sí se le
 * da aire: el cuadrado grande, el trazo del aro al entrar y el logotipo a
 * tamaño de titular. A partir de ahí, lo mismo que en el resto de la app: sin
 * tarjeta alrededor del formulario, jerarquía por tamaño y espacio, y las tres
 * promesas en filas separadas por una línea de un píxel.
 */
export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  if (!isSupabaseConfigured()) redirect('/configurar');

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (user) redirect('/grupos');

  const { next } = await searchParams;

  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-sm flex-col justify-center px-5 py-12 pt-[max(3rem,env(safe-area-inset-top))]">
      <header className="animate-rise">
        <Mark
          className="h-[4.5rem] w-[4.5rem] drop-shadow-[0_14px_38px_rgba(43,224,140,.18)]"
          animated
        />
        <h1 className="mt-6 text-display-lg font-semibold">
          <Wordmark className="text-display-lg" />
        </h1>
        <p className="mt-1.5 text-body-lg leading-snug text-content-muted">{BRAND.tagline}</p>
      </header>

      <div className="animate-rise mt-9" style={{ animationDelay: '90ms' }}>
        <LoginForm next={next ?? '/grupos'} />
      </div>

      <ul
        className="animate-rise -mx-5 mt-10 divide-y divide-line border-y border-line"
        style={{ animationDelay: '180ms' }}
      >
        <Promesa icon={<Sliders size={18} weight="bold" />} title="Las cuotas las pones tú">
          Lanzas la apuesta con el precio que te dé la gana y el grupo decide si lo coge.
        </Promesa>
        <Promesa icon={<ShieldCheck size={18} weight="bold" />} title="Imposible ganar a todo">
          La app bloquea cualquier jugada que garantice beneficio apostando a las dos caras.
        </Promesa>
        <Promesa icon={<ArrowsClockwise size={18} weight="bold" />} title="Semana nueva, vida nueva">
          Cada lunes se cierra el ranking y todo el mundo vuelve a los mismos puntos.
        </Promesa>
      </ul>

      <div
        className="animate-rise mt-8 space-y-4 text-center"
        style={{ animationDelay: '260ms' }}
      >
        <Link
          href="/demo"
          className="btn-quiet inline-flex text-caption font-semibold text-content-muted"
        >
          Ver la app con datos de ejemplo
          <ArrowUpRight size={14} weight="bold" />
        </Link>
        <p className="text-micro leading-relaxed text-content-faint">
          Aquí no se juega con dinero real. Solo puntos, y encima se reinician cada semana.
        </p>
      </div>
    </main>
  );
}

function Promesa({
  icon,
  title,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <li className="flex gap-3.5 px-5 py-3.5">
      <span className="mt-0.5 shrink-0 text-brand">{icon}</span>
      <div>
        <p className="text-body font-medium text-white">{title}</p>
        <p className="mt-0.5 text-caption leading-relaxed text-content-muted">{children}</p>
      </div>
    </li>
  );
}
