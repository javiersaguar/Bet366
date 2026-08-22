import { NewMarketForm } from '@/app/grupos/[groupId]/nueva/form';
import { BackLink } from '@/components/nav-row';
import { grupoActual } from '@/app/demo/estado';

export const metadata = { title: 'Lanzar una apuesta' };

export default async function DemoNewMarket() {
  const { group, season } = await grupoActual();

  return (
    <div>
      <BackLink href="/demo">El tablón</BackLink>
      <h1 className="mt-4 text-display font-semibold">Lanzar una apuesta</h1>
      <p className="mb-8 mt-1 text-body text-content-muted">
        Tú pones las cuotas de salida. Luego se mueven solas según por dónde vaya la gente.
      </p>
      <NewMarketForm groupId={group.id} seasonEndsAt={season.ends_at} />
    </div>
  );
}
