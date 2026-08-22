import Link from 'next/link';
import { redirect } from 'next/navigation';
import { ArrowUpRight, Check, Warning, X } from '@phosphor-icons/react/dist/ssr';
import { estadoDelEntorno, isSupabaseConfigured, type EstadoVariable } from '@/lib/supabase/config';
import { Logo } from '@/components/logo';

export const dynamic = 'force-dynamic';

/**
 * Falta la base de datos.
 *
 * Se llega aquí siempre por lo mismo: la app no ve
 * `NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_ANON_KEY`. Antes esta
 * pantalla daba por hecho que no había proyecto de Supabase y mandaba a
 * crearlo, que es justo el paso que ya está hecho cuando aparece en un
 * despliegue de Vercel. Ahora separa los dos casos, porque el arreglo es
 * distinto en cada uno.
 *
 * El detalle que se come a todo el mundo en Vercel: estas variables se
 * incrustan al construir, no se leen al arrancar. Añadirlas no basta, hay que
 * volver a desplegar.
 */
export default function SetupPage() {
  if (isSupabaseConfigured()) redirect('/grupos');

  const visto = estadoDelEntorno();
  const ningunaPuesta = visto.url.estado === 'falta' && visto.clave.estado === 'falta';

  return (
    <main className="mx-auto w-full max-w-xl px-5 py-12 pb-20 pt-[max(3rem,env(safe-area-inset-top))]">
      <div className="animate-rise">
        <Logo subtitle="La app no encuentra su base de datos" />
      </div>

      <p
        className="animate-rise mt-8 flex gap-3 rounded-2xl border border-gold/25 bg-gold/[.07]
                   px-4 py-3.5 text-body leading-relaxed text-content-muted"
        style={{ animationDelay: '60ms' }}
      >
        <Warning size={18} weight="fill" className="mt-0.5 shrink-0 text-gold" />
        <span>
          {ningunaPuesta
            ? 'La app no ve ninguna de las dos variables de Supabase. Sin ellas no hay grupos, ni apuestas, ni cuentas.'
            : 'Una de las dos variables de Supabase no llega bien. Sin las dos no hay grupos, ni apuestas, ni cuentas.'}
        </span>
      </p>

      {/* Lo que la app ve de verdad. Es lo que no se puede saber mirando el
          panel de Vercel: si la variable no está o si está mal escrita. */}
      <section className="animate-rise mt-7" style={{ animationDelay: '90ms' }}>
        <h2 className="field-label">Lo que ve esta página</h2>
        <dl className="-mx-4 mt-2 divide-y divide-line border-y border-line sm:-mx-5">
          <Visto nombre="NEXT_PUBLIC_SUPABASE_URL" v={visto.url} />
          <Visto nombre="NEXT_PUBLIC_SUPABASE_ANON_KEY" v={visto.clave} />
        </dl>
        <p className="mt-2 text-caption leading-relaxed text-content-faint">
          {ningunaPuesta
            ? 'Las dos vacías suele ser que no se ha vuelto a desplegar después de añadirlas, o que están puestas solo para otro entorno.'
            : 'Si una está y la otra no, casi siempre es una errata en el nombre.'}
        </p>
      </section>

      <section className="animate-rise mt-9" style={{ animationDelay: '120ms' }}>
        <h2 className="text-title-lg font-semibold">Si la app está en Vercel</h2>
        <p className="mt-1 text-body text-content-muted">
          Es el caso normal cuando el proyecto de Supabase ya existe.
        </p>

        <ol className="mt-4 space-y-4">
          <Paso n={1}>
            En Vercel, <b>Settings → Environment Variables</b>, comprueba que están las dos y que
            los nombres coinciden exactamente:
            <Vars />
          </Paso>
          <Paso n={2}>
            Comprueba que están marcadas para <b>todos</b> los entornos: Production, Preview y
            Development. Si solo están en Production, cualquier despliegue de vista previa cae
            aquí.
          </Paso>
          <Paso n={3}>
            <b>Vuelve a desplegar.</b> Es el paso que se salta todo el mundo: estas variables se
            incrustan al construir, así que un despliegue anterior no se entera de que las has
            añadido. En <b>Deployments</b>, el menú del último → <b>Redeploy</b>.
          </Paso>
        </ol>
      </section>

      <section className="animate-rise mt-9" style={{ animationDelay: '180ms' }}>
        <h2 className="text-title-lg font-semibold">Si es tu ordenador</h2>
        <ol className="mt-4 space-y-4">
          <Paso n={1}>
            Copia la URL y la <i>anon key</i> desde Supabase, en{' '}
            <b>Project Settings → API</b>, a un fichero <Code>.env.local</Code> en la raíz del
            proyecto:
            <Vars />
          </Paso>
          <Paso n={2}>
            Reinicia el servidor. <Code>.env.local</Code> solo se lee al arrancar.
          </Paso>
        </ol>
      </section>

      <section className="animate-rise mt-9" style={{ animationDelay: '240ms' }}>
        <h2 className="text-title-lg font-semibold">Y una vez dentro</h2>
        <p className="mt-1 text-body leading-relaxed text-content-muted">
          En el <b>SQL Editor</b> de Supabase, ejecuta en orden los ficheros de{' '}
          <Code>supabase/migrations/</Code>. Son las tablas, las funciones y los permisos.
        </p>
        <a
          href="https://supabase.com/dashboard"
          target="_blank"
          rel="noopener noreferrer"
          className="btn-ghost mt-4 w-full"
        >
          Abrir Supabase
          <ArrowUpRight size={15} weight="bold" />
        </a>
      </section>

      <div className="animate-rise mt-10 border-t border-line pt-6" style={{ animationDelay: '300ms' }}>
        <p className="text-body text-content-muted">Mientras tanto:</p>
        <Link href="/demo" className="btn-primary mt-3 w-full">
          Ver la app con datos de ejemplo
        </Link>
      </div>
    </main>
  );
}

function Visto({ nombre, v }: { nombre: string; v: EstadoVariable }) {
  const bien = v.estado === 'bien';
  return (
    <div className="flex items-start gap-3 px-4 py-3 sm:px-5">
      <span
        className={`mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full border ${
          bien ? 'border-brand/40 bg-brand/[.10] text-brand' : 'border-lose/40 bg-lose/[.10] text-lose'
        }`}
      >
        {bien ? <Check size={11} weight="bold" /> : <X size={11} weight="bold" />}
      </span>
      <div className="min-w-0 flex-1">
        <p className="tnum break-all text-micro text-content">{nombre}</p>
        <p
          className={`mt-0.5 break-all text-caption ${bien ? 'text-content-muted' : 'text-lose'}`}
        >
          {v.estado === 'falta' ? 'no llega a la app' : v.detalle}
        </p>
      </div>
    </div>
  );
}

function Vars() {
  return (
    <pre className="tnum mt-2.5 overflow-x-auto rounded-xl border border-line bg-surface-sunken px-4 py-3 text-micro leading-relaxed text-content">
      {`NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOi...`}
    </pre>
  );
}

function Paso({ n, children }: { n: number; children: React.ReactNode }) {
  return (
    <li className="flex gap-3.5">
      <span className="tnum grid h-7 w-7 shrink-0 place-items-center rounded-full border border-line-strong text-caption font-bold text-content-muted">
        {n}
      </span>
      <div className="min-w-0 flex-1 text-body leading-relaxed text-content-muted">{children}</div>
    </li>
  );
}

function Code({ children }: { children: React.ReactNode }) {
  return (
    <code className="tnum rounded border border-line bg-surface-raised px-1.5 py-0.5 text-micro">
      {children}
    </code>
  );
}
