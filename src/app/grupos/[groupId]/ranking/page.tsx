import { createClient } from '@/lib/supabase/server';
import { loadGroup, loadStandings } from '@/lib/data';
import { points, relative } from '@/lib/format';
import { SectionTitle } from '@/components/ui';
import { ProfileForm } from './profile-form';

export const dynamic = 'force-dynamic';

const MEDALS = ['🥇', '🥈', '🥉'];

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

  const top = standings[0];

  return (
    <div className="space-y-8">
      <section>
        <div className="mb-3 flex items-end justify-between gap-3">
          <div>
            <h1 className="text-xl font-bold text-white">Ranking de la semana {season.number}</h1>
            <p className="text-sm text-content-muted">
              Se cierra {relative(season.ends_at)} y todos vuelven a {points(group.starting_points)} pts
            </p>
          </div>
        </div>

        <ul className="card hairline">
          {standings.map((s, i) => {
            const isMe = s.profile.id === me.id;
            const total = s.points + s.staked;
            return (
              <li
                key={s.profile.id}
                className={`flex items-center gap-3 px-4 py-3.5 ${isMe ? 'bg-brand/[.08]' : ''}`}
              >
                <span className="w-7 shrink-0 text-center text-sm font-bold text-content-muted">
                  {MEDALS[i] ?? i + 1}
                </span>
                <span className="text-lg leading-none">{s.profile.avatar_emoji}</span>
                <span className="min-w-0 flex-1">
                  <span className={`block truncate font-semibold ${isMe ? 'text-brand' : 'text-white'}`}>
                    {s.profile.display_name}
                    {isMe && <span className="ml-1.5 text-xs font-normal text-brand/70">tú</span>}
                  </span>
                  <span className="num block text-xs text-content-muted">
                    {s.settled > 0 ? `${s.won}/${s.settled} acertadas` : 'sin apuestas cerradas'}
                    {s.staked > 0 && ` · ${points(s.staked)} en juego`}
                  </span>
                </span>
                <span className="shrink-0 text-right">
                  <span className={`num block text-lg font-bold ${isMe ? 'text-brand' : 'text-white'}`}>
                    {points(total)}
                  </span>
                  <Delta value={total - Number(group.starting_points)} />
                </span>
              </li>
            );
          })}
        </ul>

        {top && standings.length > 1 && (
          <p className="mt-3 text-center text-xs text-content-muted">
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
          <ul className="card hairline">
            {(history ?? []).map((h) => {
              const who = members.find((m) => m.id === h.user_id);
              return (
                <li
                  key={h.season_number}
                  className="flex items-center justify-between gap-3 px-4 py-3"
                >
                  <span className="text-sm text-content-muted">
                    🏆 Semana {h.season_number} ·{' '}
                    <strong className="text-white">{who?.display_name ?? 'Alguien'}</strong>
                  </span>
                  <span className="num text-sm text-content-muted">{points(h.points)} pts</span>
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
    return <span className="block text-2xs text-content-muted">igual</span>;
  }
  const up = value > 0;
  return (
    <span className={`num block text-2xs ${up ? 'text-brand' : 'text-lose'}`}>
      {up ? '▲' : '▼'} {points(Math.abs(value))}
    </span>
  );
}
