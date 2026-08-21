import { createClient } from '@/lib/supabase/server';
import { loadGroup } from '@/lib/data';
import { ProfileScreen } from '@/screens/profile';

export const dynamic = 'force-dynamic';

export default async function ProfilePage({ params }: { params: Promise<{ groupId: string }> }) {
  const { groupId } = await params;
  const { me, group, season, balance } = await loadGroup(groupId);
  const supabase = await createClient();

  const { data: markets } = await supabase
    .from('markets')
    .select('id')
    .eq('group_id', groupId)
    .eq('season_number', season.number);

  const ids = (markets ?? []).map((m) => m.id);
  const { data: wagers } = ids.length
    ? await supabase.from('wagers').select('stake, status').in('market_id', ids).eq('user_id', me.id)
    : { data: [] as { stake: number; status: string }[] };

  const all = wagers ?? [];
  return (
    <ProfileScreen
      basePath={`/grupos/${groupId}`}
      me={me}
      group={group}
      season={season}
      balance={balance}
      stats={{
        total: all.length,
        won: all.filter((w) => w.status === 'won').length,
        settled: all.filter((w) => w.status === 'won' || w.status === 'lost').length,
        inPlay: all
          .filter((w) => w.status === 'active')
          .reduce((a, w) => a + Number(w.stake), 0),
      }}
    />
  );
}
