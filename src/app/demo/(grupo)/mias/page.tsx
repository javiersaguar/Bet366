import { MyBetsScreen } from '@/screens/my-bets';
import { grupoActual } from '@/app/demo/estado';

export const metadata = { title: 'Mis apuestas' };

export default async function DemoMyBets() {
  const { me, markets, pastMarkets, wagers } = await grupoActual();

  return (
    <MyBetsScreen
      basePath="/demo"
      me={me}
      /* La pantalla real trae también las semanas cerradas, no solo la actual. */
      markets={[...markets, ...pastMarkets]}
      wagers={wagers.filter((w) => w.user_id === me.id)}
    />
  );
}
