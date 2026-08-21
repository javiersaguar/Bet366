import Link from 'next/link';
import { notFound } from 'next/navigation';
import { BALANCE, DEMO_GROUP_ID, GROUP, ME, SEASON } from '@/lib/fixtures';
import { countUnreadDemo } from '@/app/demo/unread';
import { Mark } from '@/components/logo';
import { ToastProvider } from '@/components/toast';
import { CountUp } from '@/components/count-up';
import { BottomNav } from '@/components/bottom-nav';
import { Countdown } from '@/components/countdown';
import { Bell } from '@/components/bell';

/**
 * Vista de demostración: las pantallas reales de la app con datos inventados,
 * para poder verlas sin montar Supabase. Solo existe en desarrollo.
 */
export default function DemoLayout({ children }: { children: React.ReactNode }) {
  if (process.env.NODE_ENV === 'production') notFound();

  return (
    <ToastProvider>
      <div className="min-h-dvh">
        <div className="border-b border-gold/25 bg-gold/[.07] px-5 py-2 text-center text-2xs font-semibold text-gold">
          Vista de demostración · datos inventados · la app real está en /grupos
        </div>

        <header className="sticky top-0 z-30 border-b border-line bg-canvas/75 backdrop-blur-xl">
          <div className="mx-auto flex w-full max-w-3xl items-center justify-between gap-3 px-5 py-3">
            <Link href="/demo" className="group flex min-w-0 items-center gap-2.5">
              <Mark className="h-9 w-9 shrink-0 transition-transform duration-300 ease-snap group-hover:scale-105" />
              <span className="min-w-0 leading-tight">
                <span className="block truncate font-semibold text-white transition group-hover:text-brand">
                  {GROUP.name}
                </span>
                <span className="eyebrow flex items-center gap-1.5">
                  Semana {SEASON.number}
                  <span className="text-content-faint/40">·</span>
                  <Countdown to={SEASON.ends_at} urgentUnder={7200_000} className="!tracking-[0.06em]" />
                </span>
              </span>
            </Link>

            <div className="flex shrink-0 items-center gap-2">
              <div className="flex items-center gap-2 rounded-xl border border-line bg-surface px-3 py-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-brand shadow-[0_0_8px_rgba(43,224,140,.9)]" />
                <span className="text-right leading-tight">
                  <CountUp value={BALANCE} className="block text-sm font-bold text-brand" />
                  <span className="eyebrow block !text-[0.625rem]">puntos</span>
                </span>
              </div>
              <Bell groupId={DEMO_GROUP_ID} unread={countUnreadDemo()} />
            </div>
          </div>
        </header>

        <main className="mx-auto w-full max-w-3xl px-5 py-6 pb-32">{children}</main>

        <BottomNav groupId={DEMO_GROUP_ID} me={ME} />
      </div>
    </ToastProvider>
  );
}
