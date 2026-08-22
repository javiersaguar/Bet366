import { BoardScreen } from '@/screens/board';
import { grupoActual } from '@/app/demo/estado';

export default async function DemoBoard() {
  const { group, season, me, members, markets, wagers } = await grupoActual();

  return (
    <BoardScreen
      basePath="/demo"
      group={group}
      season={season}
      me={me}
      members={members}
      markets={markets}
      myWagers={wagers.filter((w) => w.user_id === me.id)}
    />
  );
}
