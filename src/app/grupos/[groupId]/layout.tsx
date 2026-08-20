import Link from 'next/link';
import { loadGroup } from '@/lib/data';
import { GroupNav } from '@/components/group-nav';
import { Mark } from '@/components/logo';
import { ToastProvider } from '@/components/toast';
import { CountUp } from '@/components/count-up';
import { Avatar } from '@/components/avatar';

export const dynamic = 'force-dynamic';

export default async function GroupLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ groupId: string }>;
}) {
  const { groupId } = await params;
  const { group, balance, me, season } = await loadGroup(groupId);

  return (
    <ToastProvider>
      <div className="min-h-dvh">
        <header className="sticky top-0 z-30 border-b border-line bg-canvas/70 backdrop-blur-xl">
          <div className="mx-auto flex w-full max-w-3xl items-center justify-between gap-3 px-5 pt-3.5 pb-2.5">
            <Link href="/grupos" className="group flex min-w-0 items-center gap-2.5">
              <Mark className="h-9 w-9 shrink-0 transition-transform duration-300 ease-snap group-hover:scale-105" />
              <span className="min-w-0 leading-tight">
                <span className="block truncate font-semibold text-white transition group-hover:text-brand">
                  {group.name}
                </span>
                <span className="eyebrow block">Semana {season.number}</span>
              </span>
            </Link>

            <Link
              href={`/grupos/${groupId}/ranking`}
              className="group flex shrink-0 items-center gap-2.5 rounded-xl border border-line bg-surface px-2.5 py-1.5 transition-all duration-200 hover:border-brand/40 hover:bg-surface-raised"
            >
              <Avatar profile={me} size="sm" />
              <span className="text-right leading-tight">
                <CountUp value={balance} className="block text-sm font-bold text-brand" />
                <span className="eyebrow block !text-[0.625rem]">puntos</span>
              </span>
            </Link>
          </div>

          <GroupNav groupId={groupId} />
        </header>

        <main className="mx-auto w-full max-w-3xl px-5 py-6 pb-28">{children}</main>
      </div>
    </ToastProvider>
  );
}
