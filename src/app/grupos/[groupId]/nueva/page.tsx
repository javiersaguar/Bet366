import Link from 'next/link';
import { loadGroup } from '@/lib/data';
import { NewMarketForm } from './form';

export const dynamic = 'force-dynamic';

export default async function NewMarketPage({
  params,
}: {
  params: Promise<{ groupId: string }>;
}) {
  const { groupId } = await params;
  const { season } = await loadGroup(groupId);

  return (
    <div>
      <Link
        href={`/grupos/${groupId}`}
        className="mb-6 inline-block text-sm text-content-muted hover:text-content"
      >
        ← El tablón
      </Link>
      <h1 className="text-2xl font-bold text-white">Lanzar una apuesta</h1>
      <p className="mt-1 mb-8 text-sm text-content-muted">
        Tú pones las cuotas de salida. Luego se mueven solas según por dónde vaya la gente.
      </p>
      <NewMarketForm groupId={groupId} seasonEndsAt={season.ends_at} />
    </div>
  );
}
