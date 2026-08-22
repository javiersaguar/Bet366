import { requireSession } from '@/lib/sesion';
import { BackLink } from '@/components/nav-row';
import { NewGroupForm } from './form';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Crear un grupo' };

export default async function NewGroupPage() {
  // Sin sesión el formulario no puede crear nada: mejor mandar a entrar antes
  // de que rellene el nombre.
  await requireSession('/grupos/nuevo');

  return (
    <main className="mx-auto w-full max-w-xl px-5 py-7 pb-20 pt-[max(1.75rem,env(safe-area-inset-top))]">
      <div className="animate-rise">
        <BackLink href="/grupos">Tus grupos</BackLink>
      </div>

      <header className="animate-rise mt-5" style={{ animationDelay: '60ms' }}>
        <h1 className="text-display font-semibold">Crear un grupo</h1>
        <p className="mt-1.5 max-w-[46ch] text-body-lg leading-relaxed text-content-muted">
          Solo hacen falta el nombre y los puntos de partida. Lo demás viene ya afinado y se puede
          cambiar más tarde.
        </p>
      </header>

      <div className="animate-rise mt-8" style={{ animationDelay: '120ms' }}>
        <NewGroupForm />
      </div>
    </main>
  );
}
