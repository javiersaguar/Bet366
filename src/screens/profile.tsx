import { ArrowsLeftRight, UsersThree } from '@phosphor-icons/react/dist/ssr';
import type { Group, Profile, Season } from '@/lib/types';
import { points } from '@/lib/format';
import { SectionTitle } from '@/components/ui';
import { NavRow } from '@/components/nav-row';
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
}: {
  basePath: string;
  me: Profile;
  group: Group;
  season?: Season;
  balance: number;
  stats: ProfileStats;
}) {
  const hitRate = stats.settled > 0 ? Math.round((stats.won / stats.settled) * 100) : null;

  return (

    <div className="space-y-8">
      <ProfileEditor me={me} />

      <section>
        <SectionTitle>Tu semana</SectionTitle>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <Stat label="Puntos" value={points(balance)} tone="brand" />
          <Stat
            label="Acierto"
            value={hitRate === null ? '—' : `${hitRate}%`}
            tone={hitRate !== null && hitRate >= 50 ? 'brand' : 'plain'}
          />
          <Stat label="Apuestas" value={String(stats.total)} tone="plain" />
          <Stat
            label="En juego"
            value={points(stats.inPlay)}
            tone="info"
          />
        </div>
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
            href="/grupos"
            icon={ArrowsLeftRight}
            title="Cambiar de grupo"
            hint="Tus grupos y el código para entrar en otro"
          />
        </nav>
      </section>

      <form action={signOutAction}>
        <button className="btn-ghost w-full !text-lose">Cerrar sesión</button>
      </form>
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
    <div className="card px-4 py-3.5">
      <p className="field-label !mb-1 ">{label}</p>
      <p className={`num text-xl font-bold ${color}`}>{value}</p>
    </div>
  );
}
