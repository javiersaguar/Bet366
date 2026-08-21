import { createClient } from '@/lib/supabase/server';
import { loadGroup, loadStandings } from '@/lib/data';
import { RankingScreen, type PastWinner } from '@/screens/ranking';

export const dynamic = 'force-dynamic';

export default async function RankingPage({ params }: { params: Promise<{ groupId: string }> }) {
  const { groupId } = await params;
  const { group, season, me, members } = await loadGroup(groupId);
  const standings = await loadStandings(groupId, season.number, members);
  const supabase = await createClient();

  const { data: history } = await supabase
    .from('season_results')
    .select('season_number, points, user_id')
    .eq('group_id', groupId)
    .eq('position', 1)
    .order('season_number', { ascending: false })
    .limit(8);

  return (
    <RankingScreen
      basePath={`/grupos/${groupId}`}
      group={group}
      season={season}
      me={me}
      members={members}
      standings={standings}
      history={(history ?? []) as PastWinner[]}
    />
  );
}
