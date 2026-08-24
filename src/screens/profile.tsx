import { ArrowsLeftRight, UsersThree } from '@phosphor-icons/react/dist/ssr';
import type { Group, Profile, Season } from '@/lib/types';
import { points } from '@/lib/format';
import { SectionTitle } from '@/components/ui';
import { NavRow } from '@/components/nav-row';
import { listaDeGrupos } from '@/lib/rutas';
import { signOutAction } from '@/lib/actions';
import { ProfileEditor } from '@/app/grupos/[groupId]/perfil/editor';

export type ProfileStats = { total: number; won: number; settled: number; inPlay: number };

/** Tu perfil, tus números de la semana y los ajustes del grupo. */
export function ProfileScreen({
  basePath,
  me,
  group,
  balance,
  stats,
  demo = false,
}: {
  basePath: string;
  me: Profile;
  group: Group;
  season?: Season;
  balance: number;
  stats: ProfileStats;
  /** En la vista de ejemplo no hay nada que guardar. */
  demo?: boolean;
}) {
  const hitRate = stats.settled > 0 ? Math.round((stats.won / stats.settled) * 100) : null;

  return (

    <div className="space-y-8">
      {/* La pantalla se titula con tu nombre, que ya se ve grande dentro del
          editor. Aquí va solo para el lector de pantalla y para que el
          documento tenga un encabezado, como todas las demás. */}
      <h1 className="sr-only">Tu perfil, {me.display_name}</h1>

      <ProfileEditor me={me} demo={demo} />

      <section>
        <SectionTitle>Tu semana</SectionTitle>
        {/* Las mismas cuatro cifras que el tablón, el ranking y la lista de
            grupos: filetes y columnas, no tarjetas. Una cifra es un dato, no
            un objeto que se pueda tocar. */}
        <dl className="grid grid-cols-4 divide-x divide-line border-y border-line">
          <Stat label="Puntos" value={points(balance)} tone="brand" />
          <Stat
            label="Acierto"
            value={hitRate === null ? '—' : `${hitRate}%`}
            tone={hitRate !== null && hitRate >= 50 ? 'brand' : 'plain'}
          />
          <Stat label="Apuestas" value={String(stats.total)} tone="plain" />
          <Stat label="En juego" value={points(stats.inPlay)} tone="info" />
        </dl>
      </section>

      <section>
        <SectionTitle>Grupo</SectionTitle>
        <nav className="-mx-4 divide-y divide-line border-y border-line sm:-mx-5">
          <NavRow
            href={`${basePath}/grupo`}
            icon={UsersThree}
            title={group.name}
            hint="La gente, el palmarés y las reglas de la casa"
          />
          <NavRow
            href={listaDeGrupos(basePath)}
            icon={ArrowsLeftRight}
            title="Cambiar de grupo"
            hint="Tus grupos y el código para entrar en otro"
          />
        </nav>
      </section>

      {!demo && (
        <form action={signOutAction}>
          <button className="btn-ghost w-full !text-lose">Cerrar sesión</button>
        </form>
      )}
    </div>
  );
}

function Stat({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone: 'brand' | 'info' | 'plain';
}) {
  const color = { brand: 'text-brand', info: 'text-info', plain: 'text-white' }[tone];
  return (
    <div className="px-3 py-3 first:pl-0">
      <dt className="field-label">{label}</dt>
      <dd className={`tnum mt-1 text-figure font-semibold ${color}`}>{value}</dd>
    </div>
  );
}
