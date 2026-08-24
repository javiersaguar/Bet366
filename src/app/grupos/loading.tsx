import { SkeletonRows } from '@/components/skeleton';

/**
 * Lo que se ve mientras cargan tus grupos.
 *
 * Esta es la primera pantalla al abrir la app y hace varias consultas antes
 * de poder pintar nada. Sin esto se quedaba en blanco y luego aparecía todo
 * de golpe; con el esqueleto, la forma de la pantalla ya está ahí y solo se
 * rellena. Las medidas son las de las filas de verdad, para que al llegar el
 * contenido nada se mueva de sitio.
 */
export default function Loading() {
  return (
    <main className="mx-auto w-full max-w-2xl px-5 py-7 pb-20 pt-[max(1.75rem,env(safe-area-inset-top))]">
      <div className="mb-8 flex items-center justify-between">
        <div className="skeleton h-5 w-24" />
        <div className="skeleton h-8 w-16 rounded-xl" />
      </div>

      <div className="flex items-center gap-3.5">
        <div className="skeleton h-14 w-14 rounded-2xl" />
        <div className="space-y-2">
          <div className="skeleton h-3 w-20" />
          <div className="skeleton h-7 w-40" />
        </div>
      </div>

      <div className="mt-5 grid grid-cols-3 divide-x divide-line border-y border-line">
        {[0, 1, 2].map((i) => (
          <div key={i} className="space-y-2 px-3 py-3 first:pl-0">
            <div className="skeleton h-2.5 w-16" />
            <div className="skeleton h-5 w-12" />
          </div>
        ))}
      </div>

      <div className="mt-8 space-y-5">
        <div className="skeleton h-11 w-full rounded-xl" />
        <SkeletonRows rows={3} />
      </div>
    </main>
  );
}
