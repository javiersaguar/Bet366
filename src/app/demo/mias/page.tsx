import { MyBetsScreen } from '@/screens/my-bets';
import { DEMO_GROUP_ID, MARKETS, ME, WAGERS } from '@/lib/fixtures';

export default function DemoMyBets() {
  return (
    <MyBetsScreen
      basePath="/demo"
      me={ME}
      markets={MARKETS}
      wagers={WAGERS.filter((w) => w.user_id === ME.id)}
    />
  );
}
