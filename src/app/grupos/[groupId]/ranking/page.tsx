import { createClient } from '@/lib/supabase/server';
import { loadGroup, loadStandings } from '@/lib/data';
import { points, relative } from '@/lib/format';
import { SectionTitle } from '@/components/ui';
import { Avatar } from '@/components/avatar';
import { Countdown } from '@/components/countdown';
import { ProfileForm } from './profile-form';

export const dynamic = 'force-dynamic';

const PODIUM = [
  { medal: '🥇', ring: 'gold' as const, glow: 'shadow-[0_0_0_1px_rgba(245,194,75,.25)]' },
  { medal: '🥈', ring: undefined, glow: '' },
  { medal: '🥉', ring: undefined, glow: '' },
];

export default async function RankingPage({ params }: { params: Promise<{ groupId: string }> }) {
  const { groupId } = await params;
  const { group, season, me, members } = await loadGroup(groupId);
  const standings = await loadStandings(groupId, season.number, members);
  const supabase = await createClient();

  const { data: history } = await supabase
    .from('season_results')
    .select('season_number, position, points, user_id')
    .eq('group_id', groupId)
    .eq('position', 1)
    .order('season_number', { ascending: false })
    .limit(8);

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
            const podium = PODIUM[i];
            const width = best > 0 ? (total / best) * 100 : 0;

            return (
              <li
                key={s.profile.id}
                style={{ '--i': i } as React.CSSProperties}
                className={`relative overflow-hidden ${isMe ? 'bg-brand/[.06]' : ''}`}
              >
                {/* Barra de fondo proporcional a los puntos. */}
                <span
                  className={`absolute inset-y-0 left-0 transition-[width] duration-1000 ease-smooth ${
                    i === 0 ? 'bg-gold/[.07]' : 'bg-white/[.025]'
                  }`}
                  style={{ width: `${width}%` }}
                />
                <div className="relative flex items-center gap-3 px-4 py-3.5">
                  <span
                    className={`num w-6 shrink-0 text-center text-sm font-bold ${
                      i === 0 ? 'text-gold' : 'text-content-faint'
                    }`}
                  >
                    {podium?.medal ?? i + 1}
                  </span>

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

      {(history ?? []).length > 0 && (
        <section>
          <SectionTitle>Los que han ganado semanas</SectionTitle>
          <ul className="card hairline overflow-hidden">
            {(history ?? []).map((h) => {
              const who = members.find((m) => m.id === h.user_id);
              return (
                <li
                  key={h.season_number}
                  className="flex items-center justify-between gap-3 px-4 py-3"
                >
                  <span className="flex items-center gap-2.5 text-sm text-content-muted">
                    <span className="text-base">🏆</span>
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

      <section>
        <SectionTitle>Tu perfil</SectionTitle>
        <ProfileForm me={me} />
      </section>
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
