import Link from 'next/link';
import { grupoActual } from '@/app/demo/estado';
import { DemoBanner } from '@/components/demo-banner';
import { Mark } from '@/components/logo';
import { CountUp } from '@/components/count-up';
import { BottomNav } from '@/components/bottom-nav';
import { Countdown } from '@/components/countdown';
import { Bell } from '@/components/bell';
import { GroupSwitch } from '@/components/group-switch';

/**
 * La cabecera de un grupo, en la demostración.
 *
 * Todo lo que cuelga de aquí depende del grupo que estés mirando, que se
 * guarda en una cookie: al cambiar de grupo cambian el nombre, la semana, el
 * saldo y los avisos, igual que en la app de verdad.
 */
export default async function DemoGroupLayout({ children }: { children: React.ReactNode }) {
  const { group, season, balance, me, notifications } = await grupoActual();
  const unread = notifications.filter((n) => n.read_at === null).length;

  return (
    <>
      <div className="barra-superior sticky top-0 z-30 bg-canvas/85 backdrop-blur-xl">
        <DemoBanner />

        <header className="border-b border-line">
          <div className="mx-auto flex w-full max-w-3xl items-center justify-between gap-3 px-5 py-3">
            <Link href="/demo/grupo" className="group flex min-w-0 items-center gap-2.5">
              <Mark
                variant="compact"
                className="h-9 w-9 shrink-0 transition-transform duration-300 ease-out group-hover:scale-105"
              />
              <span className="min-w-0 leading-tight">
                <span className="block truncate font-semibold text-white transition group-hover:text-brand">
                  {group.name}
                </span>
                <span className="field-label flex items-center gap-1.5 whitespace-nowrap">
                  Semana {season.number}
                  <span className="text-content-faint/40">·</span>
                  <Countdown
                    to={season.ends_at}
                    urgentUnder={7200_000}
                    className="!tracking-[0.06em]"
                  />
                </span>
              </span>
            </Link>

            <div className="flex shrink-0 items-center gap-2">
              <div className="flex items-center gap-2 rounded-xl border border-line bg-surface px-2.5 py-1.5 sm:px-3">
                <span className="h-1.5 w-1.5 rounded-full bg-brand shadow-[0_0_8px_rgba(43,224,140,.9)]" />
                <span className="text-right leading-tight">
                  {/* La clave hace que la cifra vuelva a contar al cambiar de
                      grupo, en vez de quedarse con la del anterior. */}
                  <CountUp
                    key={group.id}
                    value={balance}
                    className="block text-sm font-bold text-brand"
                  />
                  <span className="field-label hidden sm:block">puntos</span>
                </span>
              </div>
              <GroupSwitch href="/demo/grupos" />
              <Bell groupId={group.id} unread={unread} demo />
            </div>
          </div>
        </header>
      </div>

      <main className="mx-auto w-full max-w-3xl px-5 py-6 pb-32">{children}</main>

      <BottomNav groupId={group.id} me={me} />
    </>
  );
}
