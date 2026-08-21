import Link from 'next/link';
import { CaretLeft } from '@phosphor-icons/react/dist/ssr';
import { NewGroupForm } from './form';

export const metadata = { title: 'Crear un grupo' };

export default function NewGroupPage() {
  return (
    <main className="mx-auto w-full max-w-xl px-5 py-7 pb-20">
      <Link
        href="/grupos"
        className="animate-rise -ml-1 inline-flex items-center gap-1 text-caption font-medium
                   text-content-muted transition-colors duration-press ease-out hover:text-content"
      >
        <CaretLeft size={14} weight="bold" />
        Tus grupos
      </Link>

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
