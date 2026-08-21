import Link from 'next/link';
import { ArrowsLeftRight, Trophy } from '@phosphor-icons/react/dist/ssr';
import type { Group, Profile, Season } from '@/lib/types';
import type { GroupSummary } from '@/lib/data';
import { dateTime, points } from '@/lib/format';
import { Avatar } from '@/components/avatar';
import { InviteCode } from '@/components/invite-code';
import { Countdown } from '@/components/countdown';

/**
 * La ficha del grupo.
 *
 * Se llega tocando el nombre del grupo en la cabecera. Responde a las tres
 * preguntas que se hacen desde fuera de una apuesta concreta: quién está
 * aquí, quién manda de verdad (semanas ganadas, no puntos de hoy) y con qué
 * reglas se juega.
 *
 * El orden de la lista de gente no es el ranking de la semana. Es el palmarés:
 * quien más semanas ha ganado va primero. El ranking de esta semana ya tiene
 * su propia pestaña.
 */
export function GroupSummaryScreen({
  basePath,
  group,
  season,
  me,
  summary,
}: {
  basePath: string;
  group: Group;
  season: Season;
  me: Profile;
  summary: GroupSummary;
}) {
  const { members, history, marketsTotal } = summary;
  const creator = members.find((m) => m.profile.id === group.created_by)?.profile ?? null;
  const enJuego = members.reduce((a, m) => a + m.points, 0);

  return (
    <div className="space-y-8">
      <section className="animate-rise">
        <h1 className="text-display font-semibold">{group.name}</h1>
        <p className="mt-1 text-body text-content-muted">
          {creator ? <>Lo montó {creator.display_name} · </> : null}
          semana {season.number}, acaba en{' '}
          <Countdown to={season.ends_at} className="text-content" urgentUnder={7200_000} />
        </p>

        <dl className="mt-5 grid grid-cols-3 divide-x divide-line border-y border-line">
          <Figure label="Gente" value={String(members.length)} />
          <Figure label="Apuestas" value={String(marketsTotal)} />
          <Figure label="Semanas" value={String(history.length + 1)} />
        </dl>
      </section>

      <section className="animate-rise" style={{ animationDelay: '60ms' }}>
        <div className="mb-3 flex items-baseline gap-2">
          <h2 className="text-title-lg font-semibold">La gente</h2>
          <span className="tnum text-caption text-content-faint">{members.length}</span>
        </div>

        <ul className="stagger space-y-2.5">
          {members.map((m, i) => {
            const soyYo = m.profile.id === me.id;
            return (
              <li
                key={m.profile.id}
                style={{ '--i': i } as React.CSSProperties}
                className={`card flex items-center gap-3.5 px-4 py-3.5 ${
                  soyYo ? '!border-brand/30' : ''
                }`}
              >
                <Avatar
                  profile={m.profile}
                  size="md"
                  ring={soyYo ? 'brand' : m.weeksWon > 0 ? 'gold' : undefined}
                />

                <div className="min-w-0 flex-1">
                  <p className="flex items-center gap-2 truncate text-title font-semibold text-white">
                    {m.profile.display_name}
                    {soyYo && <span className="chip border-brand/30 bg-brand/[.08] text-brand">tú</span>}
                    {m.role === 'owner' && (
                      <span className="chip border-line bg-surface-raised text-content-muted">
                        jefe
                      </span>
                    )}
                  </p>
                  <p className="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-caption text-content-faint">
                    {m.weeksWon > 0 ? (
                      <span className="flex items-center gap-1 text-gold">
                        <Trophy size={13} weight="fill" />
                        <span className="tnum">{m.weeksWon}</span>
                        {m.weeksWon === 1 ? 'semana' : 'semanas'}
                      </span>
                    ) : (
                      <span>sin semanas ganadas</span>
                    )}
                    <Dot />
                    {m.wagersTotal > 0 ? (
                      <span className="num">
                        {m.wagersWon} de {m.wagersTotal} apuestas acertadas
                      </span>
                    ) : (
                      <span>aún sin historial</span>
                    )}
                  </p>
                </div>

                <div className="shrink-0 text-right">
                  <p
                    className={`tnum text-figure font-semibold ${
                      m.points > group.starting_points
                        ? 'text-brand'
                        : m.points < group.starting_points
                          ? 'text-lose'
                          : 'text-white'
                    }`}
                  >
                    {points(m.points)}
                  </p>
                  <p className="field-label mt-0.5">esta semana</p>
                </div>
              </li>
            );
          })}
        </ul>
      </section>

      {history.length > 0 && (
        <section className="animate-rise" style={{ animationDelay: '120ms' }}>
          <div className="mb-3 flex items-baseline gap-2">
            <h2 className="text-title-lg font-semibold">Palmarés</h2>
            <span className="tnum text-caption text-content-faint">{history.length}</span>
          </div>

          <ul className="-mx-4 divide-y divide-line border-y border-line sm:-mx-5">
            {history.map((s) => (
              <li key={s.number} className="flex items-center gap-3.5 px-4 py-3 sm:px-5">
                <span className="tnum grid h-8 w-11 shrink-0 place-items-center rounded-lg border border-line bg-surface-sunken text-caption font-semibold text-content-muted">
                  S{s.number}
                </span>
                {s.winner ? (
                  <>
                    <Avatar profile={s.winner} size="sm" ring="gold" />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-body font-medium text-white">
                        {s.winner.display_name}
                      </p>
                      <p className="text-caption text-content-faint">
                        terminó el {dateTime(s.endsAt)}
                      </p>
                    </div>
                    <span className="tnum shrink-0 text-body font-semibold text-gold">
                      {points(s.winnerPoints)}
                    </span>
                  </>
                ) : (
                  <p className="flex-1 text-body text-content-faint">Semana sin ganador</p>
                )}
              </li>
            ))}
          </ul>
        </section>
      )}

      <section className="animate-rise" style={{ animationDelay: '180ms' }}>
        <h2 className="mb-3 text-title-lg font-semibold">Las reglas de la casa</h2>
        <dl className="-mx-4 divide-y divide-line border-y border-line sm:-mx-5">
          <Rule
            label="Puntos al empezar la semana"
            value={points(group.starting_points)}
            unit="pts"
            hint="Cada lunes todo el mundo vuelve a esta cifra"
          />
          <Rule
            label="Cuánto se mueven las cuotas"
            value={Number(group.drift).toFixed(2).replace('.', ',')}
            hint="0 las deja clavadas, 1 las mueve deprisa con el dinero que entra"
          />
          <Rule
            label="Puntos para mover una cuota"
            value={points(group.liquidity)}
            unit="pts"
            hint="Cuanto más alto, más cuesta cambiar el precio"
          />
          <Rule
            label="Horas para impugnar"
            value={String(group.dispute_hours)}
            unit="horas"
            hint="Pasado el plazo sin quejas, los puntos se reparten solos"
          />
          <Rule label="Apuesta mínima" value={points(group.min_stake)} unit="pts" />
          <Rule
            label="En circulación ahora"
            value={points(enJuego)}
            unit="pts"
            hint="La suma de lo que tiene cada uno esta semana"
          />
        </dl>
      </section>

      <div className="animate-rise space-y-6" style={{ animationDelay: '240ms' }}>
        <InviteCode code={group.invite_code} groupName={group.name} />

        <Link
          href="/grupos"
          className="btn-ghost w-full"
          prefetch={basePath.startsWith('/demo') ? false : undefined}
        >
          <ArrowsLeftRight size={16} weight="bold" />
          Cambiar de grupo
        </Link>
      </div>
    </div>
  );
}

function Figure({ label, value }: { label: string; value: string }) {
  return (
    <div className="px-3 py-3 first:pl-0">
      <dt className="field-label">{label}</dt>
      <dd className="tnum mt-1 text-figure font-semibold text-white">{value}</dd>
    </div>
  );
}

function Rule({
  label,
  value,
  unit,
  hint,
}: {
  label: string;
  value: string;
  unit?: string;
  hint?: string;
}) {
  return (
    <div className="flex items-baseline justify-between gap-4 px-4 py-3 sm:px-5">
      <div className="min-w-0">
        <dt className="text-body text-content">{label}</dt>
        {hint && <dd className="mt-0.5 text-caption text-content-faint">{hint}</dd>}
      </div>
      <dd className="shrink-0 text-body font-semibold text-white">
        <span className="tnum">{value}</span>
        {unit && <span className="ml-1 text-caption font-normal text-content-muted">{unit}</span>}
      </dd>
    </div>
  );
}

function Dot() {
  return <span aria-hidden className="text-content-faint/35">·</span>;
}
