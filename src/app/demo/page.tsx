import { BoardScreen } from '@/screens/board';
import { GROUP, MARKETS, MEMBERS, SEASON, WAGERS, ME } from '@/lib/fixtures';

export default function DemoBoard() {
  return (
    <BoardScreen
      basePath="/demo"
      group={GROUP}
      season={SEASON}
      me={ME}
      members={MEMBERS}
      markets={MARKETS}
      myWagers={WAGERS.filter((w) => w.user_id === ME.id)}
    />
  );
}
