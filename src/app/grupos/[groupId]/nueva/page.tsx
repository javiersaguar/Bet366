import { loadGroup } from '@/lib/data';
import { BackLink } from '@/components/nav-row';
import { NewMarketForm } from './form';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Lanzar una apuesta' };

export default async function NewMarketPage({
  params,
}: {
  params: Promise<{ groupId: string }>;
}) {
  const { groupId } = await params;
  const { season } = await loadGroup(groupId);

  return (
    <div>
      <BackLink href={`/grupos/${groupId}`}>El tablón</BackLink>
      <h1 className="mt-4 text-display font-semibold">Lanzar una apuesta</h1>
      <p className="mb-8 mt-1 text-body text-content-muted">
        Tú pones las cuotas de salida. Luego se mueven solas según por dónde vaya la gente.
      </p>
      <NewMarketForm groupId={groupId} seasonEndsAt={season.ends_at} />
    </div>
  );
}
