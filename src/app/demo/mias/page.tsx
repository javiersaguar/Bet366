import { MyBetsScreen } from '@/screens/my-bets';
import { MARKETS, MARKETS_PASADOS, ME, WAGERS } from '@/lib/fixtures';

export const metadata = { title: 'Mis apuestas' };

export default function DemoMyBets() {
  return (
    <MyBetsScreen
      basePath="/demo"
      me={ME}
      /* La pantalla real trae también las semanas cerradas, no solo la actual. */
      markets={[...MARKETS, ...MARKETS_PASADOS]}
      wagers={WAGERS.filter((w) => w.user_id === ME.id)}
    />
  );
}
