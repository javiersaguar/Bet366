import { loadGroup, loadMarkets, loadMyWagers } from '@/lib/data';
import { BoardScreen } from '@/screens/board';

export const dynamic = 'force-dynamic';

export default async function BoardPage({ params }: { params: Promise<{ groupId: string }> }) {
  const { groupId } = await params;
  const { group, season, me, members } = await loadGroup(groupId);
  const markets = await loadMarkets(groupId, season.number);
  const myWagers = await loadMyWagers(
    markets.map((m) => m.id),
    me.id,
  );

  return (
    <BoardScreen
      basePath={`/grupos/${groupId}`}
      group={group}
      season={season}
      me={me}
      members={members}
      markets={markets}
      myWagers={myWagers}
    />
  );
}
