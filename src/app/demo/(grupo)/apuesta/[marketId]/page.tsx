import { notFound } from 'next/navigation';
import { MarketScreen } from '@/screens/market';
import { grupoActual } from '@/app/demo/estado';

export default async function DemoMarket({
  params,
}: {
  params: Promise<{ marketId: string }>;
}) {
  const { marketId } = await params;
  const { group, me, members, markets, pastMarkets, wagers, balance, dispute, votes } =
    await grupoActual();

  const market = [...markets, ...pastMarkets].find((m) => m.id === marketId);
  if (!market) notFound();

  /* La impugnación es de una apuesta concreta: si estás mirando otra, no hay
     votación que enseñar. */
  const enDisputa = dispute?.market_id === market.id;

  return (
    <MarketScreen
      basePath="/demo"
      groupId={group.id}
      group={group}
      market={market}
      wagers={wagers.filter((w) => w.market_id === market.id)}
      me={me}
      balance={balance}
      members={members}
      dispute={enDisputa ? dispute : null}
      votes={enDisputa ? votes.filter((v) => v.market_id === market.id) : []}
    />
  );
}
