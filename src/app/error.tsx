'use client';

import { useEffect } from 'react';
import { Warning } from '@phosphor-icons/react/dist/ssr';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="grid min-h-dvh place-items-center px-5 text-center">
      <div className="animate-rise space-y-5">
        <span className="mx-auto grid h-16 w-16 place-items-center rounded-2xl border border-lose/30 bg-lose/[.07] text-lose">
          <Warning size={28} />
        </span>
        <div className="space-y-1.5">
          <h1 className="text-display font-semibold">Se ha roto algo</h1>
          <p className="text-body text-content-muted">
            No es culpa tuya. Prueba otra vez y, si sigue igual, avisa.
          </p>
        </div>
        <button onClick={reset} className="btn-primary">
          Reintentar
        </button>

        {/* El código del fallo. En producción Next no manda el mensaje al
            navegador (con razón: puede llevar dentro nombres de tablas o
            trozos de consulta), pero sí este identificador, que es el mismo
            que sale en el registro del servidor. Sin él, «se ha roto algo»
            es lo único que hay para buscar, y con dos pantallas rotas a la
            vez no se sabe cuál es cuál. */}
        {error.digest && (
          <p className="tnum text-micro text-content-faint">
            Si lo cuentas, di este código: {error.digest}
          </p>
        )}
      </div>
    </main>
  );
}
