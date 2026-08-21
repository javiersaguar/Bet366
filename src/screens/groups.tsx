import Link from 'next/link';
import { CaretRight, Plus, SignOut } from '@phosphor-icons/react/dist/ssr';
import { NavRow } from '@/components/nav-row';
import { points } from '@/lib/format';
import { Avatar } from '@/components/avatar';
import { Wordmark } from '@/components/logo';
import type { Profile } from '@/lib/types';
import { JoinGroupForm } from '@/app/grupos/join-form';

export type GroupEntry = {
  id: string;
  name: string;
  inviteCode: string;
  role: string;
  balance: number;
  /** Puntos con los que arranca la semana: sirve para saber si vas ganando. */
  startingPoints: number;
};

/** Verde si vas por encima de lo que te dieron el lunes, rojo si por debajo. */
function tono(balance: number, start: number): string {
  if (balance > start) return 'text-brand';
  if (balance < start) return 'text-lose';
  return 'text-white';
}

/**
 * Tus grupos.
 *
 * Es un índice, no un escaparate: lo que importa es el nombre del grupo y
 * cuántos puntos llevas en cada uno. Filas separadas por una línea, saldos en
 * columna con cifras monoespaciadas para poder compararlos de un vistazo, y
 * las dos acciones (entrar con código, crear grupo) abajo del todo.
 */
export function GroupsScreen({
  profile,
  groups,
  onSignOut,
}: {
  profile: Profile | null;
  groups: GroupEntry[];
  /** Acción de servidor. En la vista de ejemplo no se pasa y el botón no sale. */
  onSignOut?: () => void;
}) {
  const total = groups.reduce((a, g) => a + g.balance, 0);
  const partida = groups.reduce((a, g) => a + g.startingPoints, 0);

  return (
    <main className="mx-auto w-full max-w-2xl px-5 py-7 pb-20">
      <div className="animate-rise mb-8 flex items-center justify-between">
        <Wordmark className="text-title" />
        {onSignOut && (
          <form action={onSignOut}>
            <button className="btn-quiet !px-2.5 !py-1.5 text-caption">
              <SignOut size={15} weight="bold" />
              Salir
            </button>
          </form>
        )}
      </div>

      <header className="animate-rise" style={{ animationDelay: '60ms' }}>
        <div className="flex items-center gap-3.5">
          {profile && <Avatar profile={profile} size="lg" ring="brand" />}
          <div className="min-w-0">
            <p className="text-caption text-content-muted">
              Hola, {profile?.display_name ?? 'crack'}
            </p>
            <h1 className="truncate text-display font-semibold">Tus grupos</h1>
          </div>
        </div>

        {groups.length > 0 && (
          <dl className="mt-5 grid grid-cols-2 divide-x divide-line border-y border-line">
            <Figure label="Grupos" value={String(groups.length)} />
            <Figure label="Puntos en total" value={points(total)} tone={tono(total, partida)} />
          </dl>
        )}
      </header>

      {groups.length > 0 ? (
        <section className="animate-rise mt-8" style={{ animationDelay: '120ms' }}>
          <ul className="stagger -mx-5 divide-y divide-line border-y border-line">
            {groups.map((g, i) => (
              <li key={g.id} style={{ '--i': i } as React.CSSProperties}>
                <Link
                  href={`/grupos/${g.id}`}
                  className="group flex items-center gap-4 px-5 py-4
                             transition-colors duration-press ease-out active:bg-surface-raised/60"
                >
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-title font-semibold text-white">{g.name}</p>
                    <p className="mt-0.5 text-caption text-content-faint">
                      {g.role === 'owner' ? 'Lo creaste tú' : 'Miembro'} · código{' '}
                      <span className="tnum text-content-muted">{g.inviteCode}</span>
                    </p>
                  </div>
                  <div className="shrink-0 text-right">
                    <p className={`tnum text-figure font-semibold ${tono(g.balance, g.startingPoints)}`}>
                      {points(g.balance)}
                    </p>
                    <p className="field-label mt-0.5">puntos</p>
                  </div>
                  <CaretRight
                    size={16}
                    weight="bold"
                    className="shrink-0 text-content-faint transition-transform duration-pop ease-out
                               motion-safe:group-hover:translate-x-0.5"
                  />
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ) : (
        <p
          className="animate-rise mt-8 max-w-[42ch] text-body-lg leading-relaxed text-content-muted"
          style={{ animationDelay: '120ms' }}
        >
          Todavía no estás en ningún grupo. Crea uno para tu pandilla, o entra con el código de
          seis caracteres que te hayan pasado.
        </p>
      )}

      <section className="animate-rise mt-10" style={{ animationDelay: '180ms' }}>
        <h2 className="text-title-lg font-semibold">Entrar en un grupo</h2>
        <p className="mt-1 text-body text-content-muted">
          Pide el código a quien lo creó. Son seis caracteres.
        </p>
        <div className="mt-4">
          <JoinGroupForm />
        </div>

        <div className="-mx-5 mt-6 border-y border-line">
          <NavRow
            href="/grupos/nuevo"
            icon={Plus}
            tone="brand"
            title="Crear un grupo"
            hint="Eliges los puntos de partida y repartes el código"
          />
        </div>
      </section>
    </main>
  );
}

function Figure({ label, value, tone = 'text-white' }: { label: string; value: string; tone?: string }) {
  return (
    <div className="px-3 py-3 first:pl-0">
      <dt className="field-label">{label}</dt>
      <dd className={`tnum mt-1 text-figure font-semibold ${tone}`}>{value}</dd>
    </div>
  );
}
