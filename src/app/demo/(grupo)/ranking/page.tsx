import { RankingScreen } from '@/screens/ranking';
import { grupoActual } from '@/app/demo/estado';

export default async function DemoRanking() {
  const { group, season, me, members, standings, seasonHistory } = await grupoActual();

  return (
    <RankingScreen
      basePath="/demo"
      group={group}
      season={season}
      me={me}
      members={members}
      standings={standings}
      history={seasonHistory}
    />
  );
}
