import type { Group, Profile, Season } from '@/lib/types';
import type { Standing } from '@/lib/data';
import { points } from '@/lib/format';
import { SectionTitle } from '@/components/ui';
import { Avatar } from '@/components/avatar';
import { Countdown } from '@/components/countdown';
import { IconTrophy, Medal } from '@/components/icons';

export type PastWinner = { season_number: number; points: number; user_id: string };

/** Ranking de la semana, podio y palmarés. */
export function RankingScreen({
  group,
  season,
  me,
  members,
  standings,
  history,
}: {
  group: Group;
  season: Season;
  me: Profile;
  members: Profile[];
  standings: Standing[];
  history: PastWinner[];
}) {
  const start = Number(group.starting_points);
  const top = standings[0];
  const best = Math.max(...standings.map((s) => s.points + s.staked), start);

  return (

    <div className="space-y-8">
      <section>
        <div className="mb-4">
          <h1 className="text-xl font-bold">Ranking de la semana {season.number}</h1>
          <p className="mt-0.5 text-sm text-content-muted">
            Se cierra en <Countdown to={season.ends_at} className="text-content" urgentUnder={7200_000} />{' '}
            y todos vuelven a {points(start)} pts
          </p>
        </div>

        <ul className="stagger card hairline overflow-hidden">
          {standings.map((s, i) => {
            const isMe = s.profile.id === me.id;
            const total = s.points + s.staked;
            const width = best > 0 ? (total / best) * 100 : 0;

            return (
              <li
                key={s.profile.id}
                style={{ '--i': i } as React.CSSProperties}
                className={`relative overflow-hidden ${isMe ? 'bg-brand/[.06]' : ''}`}
              >
                {/* Barra de fondo proporcional a los puntos. */}
                {/* Barra de puntos. Se desvanece hacia la derecha para que no
                    parezca un rectángulo cortado a mitad de fila. */}
                <span
                  className="absolute inset-y-0 left-0 transition-[width] duration-[1200ms] ease-smooth"
                  style={{
                    width: `${width}%`,
                    background: `linear-gradient(90deg, ${
                      i === 0 ? 'rgba(245,194,75,.10)' : 'rgba(255,255,255,.035)'
                    }, transparent)`,
                  }}
                />
                <div className="relative flex items-center gap-3 px-4 py-3.5">
                  <Medal position={i + 1} className="h-7 w-7 shrink-0" />

                  <Avatar
                    profile={s.profile}
                    ring={i === 0 ? 'gold' : isMe ? 'brand' : undefined}
                  />

                  <span className="min-w-0 flex-1">
                    <span
                      className={`block truncate font-semibold ${isMe ? 'text-brand' : 'text-white'}`}
                    >
                      {s.profile.display_name}
                      {isMe && <span className="ml-1.5 text-2xs font-normal text-brand/60">tú</span>}
                    </span>
                    <span className="num block text-2xs text-content-faint">
                      {s.settled > 0
                        ? `${s.won}/${s.settled} acertadas`
                        : 'sin apuestas cerradas'}
                      {s.staked > 0 && (
                        <span className="text-info"> · {points(s.staked)} en juego</span>
                      )}
                    </span>
                  </span>

                  <span className="shrink-0 text-right">
                    <span
                      className={`num block text-lg font-bold ${isMe ? 'text-brand' : 'text-white'}`}
                    >
                      {points(total)}
                    </span>
                    <Delta value={total - start} />
                  </span>
                </div>
              </li>
            );
          })}
        </ul>

        {top && standings.length > 1 && (
          <p className="mt-3 text-center text-2xs text-content-faint">
            {top.profile.display_name} va primero por{' '}
            <span className="num text-content-muted">
              {points(top.points + top.staked - (standings[1].points + standings[1].staked))}
            </span>{' '}
            pts. Aún hay tiempo.
          </p>
        )}
      </section>

      {history.length > 0 && (
        <section>
          <SectionTitle>Los que han ganado semanas</SectionTitle>
          <ul className="card hairline overflow-hidden">
            {history.map((h) => {
              const who = members.find((m) => m.id === h.user_id);
              return (
                <li
                  key={h.season_number}
                  className="flex items-center justify-between gap-3 px-4 py-3"
                >
                  <span className="flex items-center gap-2.5 text-sm text-content-muted">
                    <IconTrophy className="h-4 w-4 text-gold" />
                    Semana {h.season_number} ·{' '}
                    <strong className="text-white">{who?.display_name ?? 'Alguien'}</strong>
                  </span>
                  <span className="num text-sm text-content-faint">{points(h.points)} pts</span>
                </li>
              );
            })}
          </ul>
        </section>
      )}

    </div>
  );
}

function Delta({ value }: { value: number }) {
  if (Math.abs(value) < 0.01) {
    return <span className="block text-2xs text-content-faint">igual</span>;
  }
  const up = value > 0;
  return (
    <span className={`num block text-2xs ${up ? 'text-brand' : 'text-lose'}`}>
      {up ? '▲' : '▼'} {points(Math.abs(value))}
    </span>
  );
}
