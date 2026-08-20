import Link from 'next/link';
import { Mark } from '@/components/logo';

export default function NotFound() {
  return (
    <main className="grid min-h-dvh place-items-center px-5 text-center">
      <div className="animate-rise space-y-5">
        <Mark className="mx-auto h-16 w-16 opacity-60" />
        <div className="space-y-1.5">
          <h1 className="text-2xl font-bold">Por aquí no hay nada</h1>
          <p className="text-sm text-content-muted">
            O el enlace está mal, o esa apuesta ya no existe.
          </p>
        </div>
        <Link href="/grupos" className="btn-primary">
          Volver a tus grupos
        </Link>
      </div>
    </main>
  );
}
