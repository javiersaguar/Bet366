import { ToastProvider } from '@/components/toast';

/**
 * Vista de demostración: las pantallas reales de la app con datos inventados.
 *
 * Está disponible siempre, también en producción. No hay nada que proteger
 * aquí: los datos son inventados y no tocan la base.
 *
 * Este envoltorio es a propósito lo más fino posible, porque debajo cuelgan
 * dos cosas distintas: la lista de grupos, que no lleva cabecera de grupo
 * ninguna, y todo lo demás, que sí. La cabecera vive en `(grupo)/layout.tsx`.
 *
 * Se pinta en cada petición porque el grupo que estás mirando se guarda en una
 * cookie, y una página estática no la vería.
 */
export const dynamic = 'force-dynamic';

export default function DemoLayout({ children }: { children: React.ReactNode }) {
  return (
    <ToastProvider>
      <div className="min-h-dvh">{children}</div>
    </ToastProvider>
  );
}
