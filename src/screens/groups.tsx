import { Plus, SignIn, SignOut } from '@phosphor-icons/react/dist/ssr';
import { NavRow } from '@/components/nav-row';
import { points } from '@/lib/format';
import { Avatar } from '@/components/avatar';
import { Wordmark } from '@/components/logo';
import type { Profile } from '@/lib/types';
import { GroupsList, type GroupEntry, type ResultadoUnirse } from '@/components/groups-list';

export type { GroupEntry } from '@/components/groups-list';

/** Verde si vas por encima de lo que te dieron el lunes, rojo si por debajo. */
function tono(balance: number, start: number): string {
  if (balance > start) return 'text-brand';
  if (balance < start) return 'text-lose';
  return 'text-white';
}

/**
 * Tus grupos. Es lo primero que se ve al abrir la app.
 *
 * No es un escaparate, es un índice: quién se ha movido y cuántos puntos
 * llevas en cada sitio. Las filas van ordenadas por lo último que pasó dentro,
 * así que abrir la app y mirar arriba del todo basta para saber dónde ha
 * habido algo.
 *
 * El buscador de arriba hace de las dos cosas que se hacen aquí: filtrar los
 * tuyos y entrar en uno nuevo con su código.
 */
export function GroupsScreen({
  profile,
  groups,
  join,
  onSelect,
  currentId,
  onSignOut,
  codigoInvitacion = '',
  demo = false,
}: {
  profile: Profile | null;
  groups: GroupEntry[];
  /** Acción de servidor para entrar con un código. */
  join: (prev: ResultadoUnirse, formData: FormData) => Promise<ResultadoUnirse>;
  /** Solo en la demostración: cambiar de grupo guarda, no navega. */
  onSelect?: (formData: FormData) => void;
  currentId?: string;
  /** Acción de servidor. En la demostración no se pasa y el botón no sale. */
  onSignOut?: () => void;
  /** Viene de un enlace de invitación: deja el campo listo para pulsar. */
  codigoInvitacion?: string;
  demo?: boolean;
}) {
  const total = groups.reduce((a, g) => a + g.balance, 0);
  const partida = groups.reduce((a, g) => a + g.startingPoints, 0);
  const pendientes = groups.filter((g) => g.activity?.pendiente).length;

  return (
    <main className="mx-auto w-full max-w-2xl px-5 py-7 pb-20 pt-[max(1.75rem,env(safe-area-inset-top))]">
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
          <dl className="mt-5 grid grid-cols-3 divide-x divide-line border-y border-line">
            <Figure label="Grupos" value={String(groups.length)} />
            <Figure label="En total" value={points(total)} tone={tono(total, partida)} />
            {/* No es «te toca a ti»: es que en ese grupo hay algo parado, lo
                haya lanzado quien lo haya lanzado. */}
            <Figure
              label="Pendientes"
              value={String(pendientes)}
              tone={pendientes > 0 ? 'text-gold' : 'text-white'}
            />
          </dl>
        )}
      </header>

      <section className="animate-rise mt-8" style={{ animationDelay: '120ms' }}>
        {groups.length === 0 && (
          <p className="mb-6 max-w-[42ch] text-body-lg leading-relaxed text-content-muted">
            Todavía no estás en ningún grupo. Crea uno para tu pandilla, o entra con el código de
            seis caracteres que te hayan pasado.
          </p>
        )}
        <GroupsList
          groups={groups}
          join={join}
          onSelect={onSelect}
          currentId={currentId}
          codigoInicial={codigoInvitacion}
        />
      </section>

      <section className="animate-rise mt-10" style={{ animationDelay: '180ms' }}>
        <div className="-mx-5 border-y border-line">
          {demo ? (
            <NavRow
              href="/login"
              icon={SignIn}
              tone="brand"
              title="Entrar en la app de verdad"
              hint="Con tu cuenta y tus grupos, no con estos de mentira"
            />
          ) : (
            <NavRow
              href="/grupos/nuevo"
              icon={Plus}
              tone="brand"
              title="Crear un grupo"
              hint="Eliges los puntos de partida y repartes el código"
            />
          )}
        </div>
      </section>
    </main>
  );
}

function Figure({
  label,
  value,
  tone = 'text-white',
}: {
  label: string;
  value: string;
  tone?: string;
}) {
  return (
    <div className="px-3 py-3 first:pl-0">
      <dt className="field-label">{label}</dt>
      <dd className={`tnum mt-1 text-figure font-semibold ${tone}`}>{value}</dd>
    </div>
  );
}
