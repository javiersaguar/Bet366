import { redirect } from 'next/navigation';
import { isSupabaseConfigured } from '@/lib/supabase/config';
import { Logo } from '@/components/logo';

/** Aviso claro cuando falta el proyecto de Supabase, en lugar de un 500. */
export default function SetupPage() {
  if (isSupabaseConfigured()) redirect('/grupos');

  return (
    <main className="mx-auto w-full max-w-xl px-5 py-14">
      <div className="animate-rise mb-8">
        <Logo subtitle="Falta un paso para poder entrar" />
      </div>

      <div className="card space-y-5 p-6">
        <p className="text-sm leading-relaxed text-content-muted">
          La aplicación necesita un proyecto de Supabase para guardar los grupos, las apuestas y
          los puntos. Todavía no hay ninguno configurado.
        </p>

        <ol className="space-y-4 text-sm">
          <Step n={1}>
            Crea un proyecto gratuito en{' '}
            <a href="https://supabase.com" target="_blank" rel="noopener noreferrer" className="link">
              supabase.com
            </a>
            .
          </Step>
          <Step n={2}>
            En el <b>SQL Editor</b>, ejecuta los cuatro ficheros de <Code>supabase/migrations/</Code>{' '}
            en orden.
          </Step>
          <Step n={3}>
            Copia la URL y la <i>anon key</i> de <b>Project Settings → API</b> a un fichero{' '}
            <Code>.env.local</Code>:
          </Step>
        </ol>

        <pre className="num overflow-x-auto rounded-xl border border-line bg-surface-sunken px-4 py-3 text-2xs leading-relaxed text-content">
          {`NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOi...`}
        </pre>

        <p className="text-2xs leading-relaxed text-content-faint">
          Después reinicia el servidor. Los pasos completos están en el README.
        </p>
      </div>

      <p className="mt-6 text-center text-2xs leading-relaxed text-content-faint">
        Mientras tanto puedes recorrer la app con datos de ejemplo en{' '}
        <a href="/demo" className="link">/demo</a>.
      </p>
    </main>
  );
}

function Step({ n, children }: { n: number; children: React.ReactNode }) {
  return (
    <li className="flex gap-3">
      <span className="num grid h-6 w-6 shrink-0 place-items-center rounded-full border border-line-strong text-2xs font-bold text-content-muted">
        {n}
      </span>
      <span className="text-content-muted">{children}</span>
    </li>
  );
}

function Code({ children }: { children: React.ReactNode }) {
  return (
    <code className="rounded border border-line bg-surface-raised px-1.5 py-0.5 text-2xs">
      {children}
    </code>
  );
}
