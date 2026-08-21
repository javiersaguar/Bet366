import Link from 'next/link';
import { NewMarketForm } from '@/app/grupos/[groupId]/nueva/form';
import { DEMO_GROUP_ID, SEASON } from '@/lib/fixtures';

export default function DemoNewMarket() {
  return (
    <div>
      <Link
        href="/demo"
        className="group mb-6 inline-flex items-center gap-1.5 text-sm text-content-muted transition-colors hover:text-content"
      >
        <span className="transition-transform duration-200 group-hover:-translate-x-0.5">←</span>
        El tablón
      </Link>
      <h1 className="text-2xl font-bold text-white">Lanzar una apuesta</h1>
      <p className="mb-8 mt-1 text-sm text-content-muted">
        Tú pones las cuotas de salida. Luego se mueven solas según por dónde vaya la gente.
      </p>
      <NewMarketForm groupId={DEMO_GROUP_ID} seasonEndsAt={SEASON.ends_at} />
    </div>
  );
}
