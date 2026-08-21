import { notFound } from 'next/navigation';
import { MarketScreen } from '@/screens/market';
import { BALANCE, DEMO_GROUP_ID, GROUP, MARKETS, ME, MEMBERS, PEOPLE, WAGERS } from '@/lib/fixtures';

export function generateStaticParams() {
  return MARKETS.map((m) => ({ marketId: m.id }));
}

export default async function DemoMarket({
  params,
}: {
  params: Promise<{ marketId: string }>;
}) {
  const { marketId } = await params;
  const market = MARKETS.find((m) => m.id === marketId);
  if (!market) notFound();

  // La apuesta impugnada lleva su votación, para poder ver ese estado.
  const disputed = market.id === 'm-lluvia';

  return (
    <MarketScreen
      basePath="/demo"
      groupId={DEMO_GROUP_ID}
      group={GROUP}
      market={market}
      wagers={WAGERS.filter((w) => w.market_id === market.id)}
      me={ME}
      balance={BALANCE}
      members={MEMBERS}
      dispute={
        disputed
          ? {
              market_id: market.id,
              opened_by: PEOPLE.marcos.id,
              reason: 'Cayeron cuatro gotas a las 19h, lo vimos todos',
              opened_at: new Date(Date.now() - 6 * 3600e3).toISOString(),
              closes_at: new Date(Date.now() + 8 * 3600e3).toISOString(),
            }
          : null
      }
      votes={
        disputed
          ? [
              { market_id: market.id, user_id: PEOPLE.javi.id, option_id: `${market.id}-o1` },
              { market_id: market.id, user_id: PEOPLE.marcos.id, option_id: `${market.id}-o0` },
            ]
          : []
      }
    />
  );
}
