import Link from 'next/link';
import { BALANCE, DEMO_GROUP_ID, GROUP, ME, SEASON } from '@/lib/fixtures';
import { countUnreadDemo } from '@/app/demo/unread';
import { Mark } from '@/components/logo';
import { ToastProvider } from '@/components/toast';
import { CountUp } from '@/components/count-up';
import { BottomNav } from '@/components/bottom-nav';
import { Countdown } from '@/components/countdown';
import { Bell } from '@/components/bell';
import { GroupSwitch } from '@/components/group-switch';
import { BUILD_STAMP } from '@/lib/build';

/**
 * Vista de demostración: las pantallas reales de la app con datos inventados.
 *
 * Está disponible siempre, también en producción. Antes iba detrás de una
 * comprobación de NODE_ENV y eso la hacía desaparecer justo donde más se
 * quiere mirar: en el móvil, sobre el despliegue real. No hay nada que
 * proteger aquí, los datos son inventados y no tocan la base.
 */
export default function DemoLayout({ children }: { children: React.ReactNode }) {
  return (
    <ToastProvider>
      <div className="min-h-dvh">
        <div className="border-b border-gold/25 bg-gold/[.07] px-5 py-2 text-center text-micro font-semibold text-gold">
          Demostración con datos inventados.{' '}
          <Link href="/grupos" className="underline underline-offset-2">
            Ir a la app real
          </Link>
          <span className="tnum ml-2 opacity-60">{BUILD_STAMP}</span>
        </div>

        <header className="sticky top-0 z-30 border-b border-line bg-canvas/75 backdrop-blur-xl">
          <div className="mx-auto flex w-full max-w-3xl items-center justify-between gap-3 px-5 py-3">
            <Link href="/demo/grupo" className="group flex min-w-0 items-center gap-2.5">
              <Mark variant="compact" className="h-9 w-9 shrink-0 transition-transform duration-300 ease-out group-hover:scale-105" />
              <span className="min-w-0 leading-tight">
                <span className="block truncate font-semibold text-white transition group-hover:text-brand">
                  {GROUP.name}
                </span>
                <span className="field-label flex items-center gap-1.5">
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
                  <span className="field-label block ">puntos</span>
                </span>
              </div>
              <GroupSwitch />
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
