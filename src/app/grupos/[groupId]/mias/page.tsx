import { loadGroup, loadMyBets } from '@/lib/data';
import { MyBetsScreen } from '@/screens/my-bets';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Mis apuestas' };

export default async function MyBetsPage({ params }: { params: Promise<{ groupId: string }> }) {
  const { groupId } = await params;
  const { me } = await loadGroup(groupId);
  const { markets, wagers } = await loadMyBets(groupId, me.id);

  return (
    <MyBetsScreen basePath={`/grupos/${groupId}`} me={me} markets={markets} wagers={wagers} />
  );
}
