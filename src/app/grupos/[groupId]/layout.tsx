import Link from 'next/link';
import { countUnread, loadGroup } from '@/lib/data';
import { Mark } from '@/components/logo';
import { ToastProvider } from '@/components/toast';
import { CountUp } from '@/components/count-up';
import { BottomNav } from '@/components/bottom-nav';
import { Countdown } from '@/components/countdown';
import { Bell } from '@/components/bell';
import { GroupSwitch } from '@/components/group-switch';

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
  const unread = await countUnread(groupId);

  return (
    <ToastProvider>
      <div className="min-h-dvh">
        <header className="sticky top-0 z-30 border-b border-line bg-canvas/75 backdrop-blur-xl">
          <div className="mx-auto flex w-full max-w-3xl items-center justify-between gap-3 px-5 py-3">
            <Link
              href={`/grupos/${groupId}/grupo`}
              className="group flex min-w-0 items-center gap-2.5"
            >
              <Mark variant="compact" className="h-9 w-9 shrink-0 transition-transform duration-300 ease-out group-hover:scale-105" />
              <span className="min-w-0 leading-tight">
                <span className="block truncate font-semibold text-white transition group-hover:text-brand">
                  {group.name}
                </span>
                <span className="field-label flex items-center gap-1.5">
                  Semana {season.number}
                  <span className="text-content-faint/40">·</span>
                  <Countdown to={season.ends_at} urgentUnder={7200_000} className="!tracking-[0.06em]" />
                </span>
              </span>
            </Link>

            <div className="flex shrink-0 items-center gap-2">
              <div className="flex items-center gap-2 rounded-xl border border-line bg-surface px-3 py-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-brand shadow-[0_0_8px_rgba(43,224,140,.9)]" />
                <span className="text-right leading-tight">
                  <CountUp value={balance} className="block text-sm font-bold text-brand" />
                  <span className="field-label block ">puntos</span>
                </span>
              </div>
              <GroupSwitch />
              <Bell groupId={groupId} unread={unread} />
            </div>
          </div>
        </header>

        <main className="mx-auto w-full max-w-3xl px-5 py-6 pb-32">{children}</main>

        <BottomNav groupId={groupId} me={me} />
      </div>
    </ToastProvider>
  );
}
