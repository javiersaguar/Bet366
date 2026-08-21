import { BoardScreen } from '@/screens/board';
import { DEMO_GROUP_ID, GROUP, MARKETS, MEMBERS, SEASON, WAGERS, ME } from '@/lib/fixtures';

export default function DemoBoard() {
  return (
    <BoardScreen
      groupId={DEMO_GROUP_ID}
      group={GROUP}
      season={SEASON}
      members={MEMBERS}
      markets={MARKETS}
      myWagers={WAGERS.filter((w) => w.user_id === ME.id)}
    />
  );
}
