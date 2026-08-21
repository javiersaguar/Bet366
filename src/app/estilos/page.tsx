import { notFound } from 'next/navigation';
import type { MarketWithOptions, Profile, Wager } from '@/lib/types';
import { MarketCard } from '@/components/market-card';
import { BetSlip } from '@/components/bet-slip';
import { CreatorPanel } from '@/components/creator-panel';
import { DisputePanel } from '@/components/dispute-panel';
import { BettorList } from '@/components/bettor-list';
import { OddsFace } from '@/components/odds-button';
import { Avatar } from '@/components/avatar';
import { AVATAR_COLORS, AVATAR_SYMBOLS } from '@/lib/avatars';
import { AvatarPickerDemo } from './picker-demo';
import { Bell } from '@/components/bell';
import { NotificationRow } from '@/components/notification-row';
import type { Notification } from '@/lib/types';
import {
  IconEye,
  IconEyeOff,
  IconLock,
  IconRepeat,
  IconSpark,
  IconTarget,
  IconTrophy,
  IconWarning,
  Medal,
} from '@/components/icons';
import { Logo, Mark, Wordmark } from '@/components/logo';
import { ToastProvider } from '@/components/toast';
import { SkeletonMarketCard, SkeletonRows } from '@/components/skeleton';
import { Countdown, DeadlineRing } from '@/components/countdown';
import { Alert, Empty, MarketBadge, SectionTitle, WagerBadge } from '@/components/ui';
import type { MarketStatus, WagerStatus } from '@/lib/types';

/**
 * Guía de estilos. Solo existe en desarrollo (`npm run dev`) y sirve para ver
 * todas las piezas juntas sin tener que reproducir cada estado en la app real.
 */
const javi: Profile = { id: 'u1', username: 'javi', display_name: 'Javi', avatar_symbol: 'crown', avatar_color: 'gold' };
const lucia: Profile = { id: 'u2', username: 'lucia', display_name: 'Lucía', avatar_symbol: 'flame', avatar_color: 'rose' };
const marcos: Profile = { id: 'u3', username: 'marcos', display_name: 'Marcos', avatar_symbol: 'bolt', avatar_color: 'cyan' };

const opts = (rows: [string, number, number, number][], mid: string) =>
  rows.map(([label, current_odds, pool, opening], i) => ({
    id: `${mid}-o${i}`,
    market_id: mid,
    label,
    position: i + 1,
    opening_odds: opening,
    current_odds,
    pool,
  }));

const base = {
  group_id: 'g',
  season_number: 1,
  status: 'open' as MarketStatus,
  stakes_public: true,
  winning_option: null,
  result_note: null,
  result_set_at: null,
  dispute_until: null,
  resolved_at: null,
  cancel_reason: null,
  created_at: new Date().toISOString(),
};

const m1: MarketWithOptions = {
  ...base,
  id: 'm1',
  creator_id: 'u1',
  title: '¿A que Fulanito se lía con Menganito?',
  description: 'Cuenta solo si pasa antes de que acabe la verbena del sábado.',
  closes_at: new Date(Date.now() + 61 * 3600e3).toISOString(),
  market_options: opts([['Sí', 1.45, 500, 1.9], ['No', 2.76, 120, 1.9]], 'm1'),
  creator: javi,
};

const m2: MarketWithOptions = {
  ...base,
  id: 'm2',
  creator_id: 'u2',
  creator: lucia,
  title: '¿Quién es el primero que acaba en la piscina?',
  description: null,
  stakes_public: false,
  closes_at: new Date(Date.now() + 42 * 60e3).toISOString(),
  market_options: opts(
    [['Marcos', 2.1, 300, 2.3], ['Javi', 3.4, 90, 3.0], ['Lucía', 6.5, 20, 5.0]],
    'm2',
  ),
};

const m3: MarketWithOptions = {
  ...m1,
  id: 'm3',
  status: 'resolved',
  winning_option: 'm3-o0',
  title: 'Nos bañamos de noche en la playa',
  description: null,
  result_note: 'Nos bañamos los cuatro, hay fotos.',
  market_options: opts([['Sí', 1.62, 640, 1.8], ['No', 2.3, 210, 2.1]], 'm3'),
};

const m4: MarketWithOptions = {
  ...m1,
  id: 'm4',
  status: 'pending',
  winning_option: 'm4-o1',
  title: 'Llueve el domingo por la tarde',
  description: null,
  result_note: 'No cayó ni una gota.',
  result_set_at: new Date(Date.now() - 5 * 3600e3).toISOString(),
  dispute_until: new Date(Date.now() + 19 * 3600e3).toISOString(),
  market_options: opts([['Sí', 2.0, 150, 2.0], ['No', 1.8, 260, 2.0]], 'm4'),
};

const wagers: Wager[] = [
  { id: 'w1', market_id: 'm1', option_id: 'm1-o0', user_id: 'u2', stake: 300, locked_odds: 1.9, to_win: 570, status: 'active', void_reason: null, created_at: new Date(Date.now() - 7200e3).toISOString() },
  { id: 'w2', market_id: 'm1', option_id: 'm1-o0', user_id: 'u3', stake: 200, locked_odds: 1.52, to_win: 304, status: 'active', void_reason: null, created_at: new Date(Date.now() - 3600e3).toISOString() },
  { id: 'w3', market_id: 'm1', option_id: 'm1-o1', user_id: 'u1', stake: 120, locked_odds: 2.76, to_win: 331.2, status: 'voided', void_reason: 'Apostado justo después de que ya hubiera pasado', created_at: new Date(Date.now() - 600e3).toISOString() },
];

const byId = { u1: javi, u2: lucia, u3: marcos };

const aviso = (
  id: number,
  kind: Notification['kind'],
  title: string,
  body: string | null,
  minutes: number,
  amount: number | null = null,
  read = false,
): Notification => ({
  id,
  group_id: 'g',
  user_id: 'u2',
  kind,
  market_id: 'm1',
  title,
  body,
  amount,
  read_at: read ? new Date().toISOString() : null,
  created_at: new Date(Date.now() - minutes * 60e3).toISOString(),
});

const AVISOS: Notification[] = [
  aviso(1, 'wager_won', 'Has ganado Nos bañamos de noche en la playa', 'Salió «Sí»', 12, 570),
  aviso(2, 'market_closed', 'Te toca: ¿A que Fulanito se lía con Menganito?',
    'Ha cerrado. Dinos qué pasó para repartir los puntos.', 45),
  aviso(3, 'dispute_opened', 'Impugnada: Llueve el domingo por la tarde',
    'Vota tú también, decide la mayoría.', 90),
  aviso(4, 'result_published', 'Ya hay resultado: ¿Quién cae primero en la piscina?',
    'Tienes 24 h para impugnarlo si no te cuadra.', 180, null, true),
  aviso(5, 'wager_voided', 'Te han anulado una apuesta',
    'Apostado 30 segundos después de que ya hubiera pasado', 240, 120, true),
  aviso(6, 'wager_lost', 'Se te fue Llueve el domingo por la tarde', 'Salió «No»', 400, 80, true),
  aviso(7, 'market_opened', 'Apuesta nueva', 'Marcos acaba en la piscina antes de las 3', 700, null, true),
  aviso(8, 'season_rolled', 'Semana 3 en marcha',
    'Todos volvéis a 1000 puntos. El ranking de la semana 2 ya está cerrado.', 1500, 1000, true),
];

const MARKET_STATES: MarketStatus[] = ['open', 'closed', 'pending', 'disputed', 'resolved', 'cancelled'];
const WAGER_STATES: WagerStatus[] = ['active', 'won', 'lost', 'refunded', 'voided'];

export default function Styleguide() {
  if (process.env.NODE_ENV === 'production') notFound();

  return (
    <ToastProvider>
      <div className="mx-auto w-full max-w-3xl space-y-12 px-5 pb-32 pt-10">
        <div className="card border-gold/30 bg-gold/[.06] p-5">
          <p className="eyebrow !text-gold">Guía de estilos</p>
          <p className="mt-1 text-sm leading-relaxed text-content-muted">
            Esto <b className="text-white">no es la app</b>: es el catálogo de piezas sueltas, con
            datos inventados para poder verlas. Las apuestas que salen aquí no existen en tu grupo.
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            <a href="/demo" className="btn-primary !py-2 text-2xs">
              Ver la app con datos de ejemplo
            </a>
            <a href="/grupos" className="btn-ghost !py-2 text-2xs">
              Ir a la app real
            </a>
          </div>
        </div>
        <Block title="Marca">
          <div className="flex flex-wrap items-end gap-8">
            <Logo subtitle="Un día más que los profesionales." animated />
            <div className="flex items-center gap-4">
              <Mark className="h-8 w-8" />
              <Mark className="h-12 w-12" />
              <Mark className="h-20 w-20" />
            </div>
            <Wordmark className="text-3xl" />
          </div>
        </Block>

        <Block title="Color">
          <div className="grid grid-cols-3 gap-2 sm:grid-cols-6">
            {[
              ['marca / ganada', 'bg-brand'],
              ['perdida', 'bg-lose'],
              ['en juego', 'bg-info'],
              ['votación', 'bg-vote'],
              ['ranking', 'bg-gold'],
              ['fondo', 'bg-surface-high'],
            ].map(([name, cls]) => (
              <div key={name} className="space-y-1.5">
                <div className={`h-14 rounded-xl ${cls}`} />
                <p className="text-2xs text-content-muted">{name}</p>
              </div>
            ))}
          </div>
          <div className="mt-3 grid grid-cols-4 gap-2">
            {[
              ['canvas', 'bg-canvas'],
              ['surface', 'bg-surface'],
              ['raised', 'bg-surface-raised'],
              ['high', 'bg-surface-high'],
            ].map(([name, cls]) => (
              <div key={name} className="space-y-1.5">
                <div className={`h-12 rounded-xl border border-line ${cls}`} />
                <p className="text-2xs text-content-muted">{name}</p>
              </div>
            ))}
          </div>
        </Block>

        <Block title="Avatares">
          <div className="mb-5 flex flex-wrap items-end gap-3">
            <Avatar profile={javi} size="xs" />
            <Avatar profile={javi} size="sm" />
            <Avatar profile={javi} />
            <Avatar profile={javi} size="lg" ring="gold" />
            <Avatar profile={lucia} size="xl" ring="brand" />
          </div>
          <p className="eyebrow mb-2">Los doce emblemas</p>
          <div className="mb-5 grid grid-cols-6 gap-2 sm:grid-cols-12">
            {AVATAR_SYMBOLS.map((sym, i) => (
              <Avatar
                key={sym}
                profile={{
                  id: sym,
                  avatar_symbol: sym,
                  avatar_color: AVATAR_COLORS[i % AVATAR_COLORS.length],
                }}
                size="md"
              />
            ))}
          </div>
          <p className="eyebrow mb-2">Los ocho colores</p>
          <div className="grid grid-cols-8 gap-2">
            {AVATAR_COLORS.map((c) => (
              <Avatar key={c} profile={{ id: c, avatar_symbol: 'bolt', avatar_color: c }} size="md" />
            ))}
          </div>
        </Block>

        <Block title="Selector de perfil">
          <div className="card p-5">
            <AvatarPickerDemo />
          </div>
        </Block>

        <Block title="Iconos">
          <div className="flex flex-wrap items-center gap-4 text-content-muted">
            <IconTarget className="h-5 w-5" />
            <IconLock className="h-5 w-5" />
            <IconRepeat className="h-5 w-5" />
            <IconEye className="h-5 w-5" />
            <IconEyeOff className="h-5 w-5" />
            <IconTrophy className="h-5 w-5 text-gold" />
            <IconWarning className="h-5 w-5 text-lose" />
            <IconSpark className="h-5 w-5 text-brand" />
            <Medal position={1} />
            <Medal position={2} />
            <Medal position={3} />
            <Medal position={7} className="h-7 w-7" />
          </div>
        </Block>

        <Block title="Estados">
          <div className="flex flex-wrap gap-2">
            {MARKET_STATES.map((s) => (
              <MarketBadge key={s} status={s} />
            ))}
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            {WAGER_STATES.map((s) => (
              <WagerBadge key={s} status={s} />
            ))}
          </div>
        </Block>

        <Block title="Botones">
          <div className="flex flex-wrap gap-2">
            <button className="btn-primary">Principal</button>
            <button className="btn-primary sheen">Con brillo</button>
            <button className="btn-ghost">Secundario</button>
            <button className="btn-quiet">Discreto</button>
            <button className="btn-danger">Peligro</button>
            <button className="btn-primary" disabled>
              Deshabilitado
            </button>
          </div>
        </Block>

        <Block title="Mensajes en línea">
          <div className="space-y-2">
            <Alert kind="ok">Apuesta puesta. Suerte.</Alert>
            <Alert kind="info">
              Con esa cantidad ganarías pase lo que pase, y eso no vale. Aquí puedes poner como mucho{' '}
              <strong className="num">170,45</strong> pts.
            </Alert>
            <Alert kind="error">No te llegan los puntos: tienes 700.</Alert>
          </div>
        </Block>

        <Block title="Cuotas">
          <div className="grid gap-2 sm:grid-cols-2">
            <OddsFace option={m1.market_options[0]} share={80} />
            <OddsFace option={m1.market_options[1]} share={20} state="selected" />
            <OddsFace option={m3.market_options[0]} share={75} state="winner" />
            <OddsFace option={m3.market_options[1]} share={25} state="muted" />
          </div>
        </Block>

        <Block title="Tiempo">
          <div className="flex flex-wrap items-center gap-6">
            <Countdown to={new Date(Date.now() + 61 * 3600e3).toISOString()} />
            <Countdown to={new Date(Date.now() + 42 * 60e3).toISOString()} />
            <DeadlineRing
              from={new Date(Date.now() - 5 * 3600e3).toISOString()}
              to={new Date(Date.now() + 19 * 3600e3).toISOString()}
            />
            <DeadlineRing
              from={new Date(Date.now() - 6 * 3600e3).toISOString()}
              to={new Date(Date.now() + 2 * 3600e3).toISOString()}
              tone="vote"
            />
          </div>
        </Block>

        <Block title="Carga">
          <div className="space-y-3">
            <SkeletonMarketCard />
            <SkeletonRows rows={3} />
          </div>
        </Block>

        <Block title="Vacío">
          <Empty
            title="Aún no hay ninguna apuesta"
            hint="Lanza la primera: «¿a que fulanito se lía con menganito?»"
            action={<button className="btn-primary !py-2 text-2xs">Lanzar la primera</button>}
          />
        </Block>

        <Block title="Tablón">
          <div className="stagger space-y-2.5">
            {[m1, m2, m3].map((m, i) => (
              <div key={m.id} style={{ '--i': i } as React.CSSProperties}>
                <MarketCard market={m} groupId="g" myWagers={wagers} />
              </div>
            ))}
          </div>
        </Block>

        <Block title="Boleto">
          <BetSlip
            groupId="g"
            market={m1}
            myWagers={[wagers[0]]}
            balance={700}
            minStake={1}
            totalPool={620}
          />
        </Block>

        <Block title="Panel del creador">
          <CreatorPanel groupId="g" market={{ ...m1, status: 'closed' }} wagers={wagers} />
        </Block>

        <Block title="Impugnación">
          <div className="space-y-4">
            <DisputePanel
              groupId="g"
              market={m4}
              dispute={null}
              votes={[]}
              myWagers={[wagers[0]]}
              me={lucia}
              profilesById={byId}
              memberCount={4}
            />
            <DisputePanel
              groupId="g"
              market={{ ...m4, status: 'disputed' }}
              dispute={{
                market_id: 'm4',
                opened_by: 'u3',
                reason: 'Cayeron cuatro gotas a las 19h, lo vimos todos',
                opened_at: new Date(Date.now() - 6 * 3600e3).toISOString(),
                closes_at: new Date(Date.now() + 8 * 3600e3).toISOString(),
              }}
              votes={[
                { market_id: 'm4', user_id: 'u1', option_id: 'm4-o1' },
                { market_id: 'm4', user_id: 'u3', option_id: 'm4-o0' },
                { market_id: 'm4', user_id: 'u2', option_id: 'm4-o0' },
              ]}
              myWagers={[wagers[0]]}
              me={lucia}
              profilesById={byId}
              memberCount={4}
            />
          </div>
        </Block>

        <Block title="Avisos">
          <div className="mb-4 flex items-center gap-3">
            <Bell groupId="g" unread={0} />
            <Bell groupId="g" unread={3} />
            <Bell groupId="g" unread={42} />
          </div>
          <ul className="card hairline overflow-hidden">
            {AVISOS.map((n, i) => (
              <NotificationRow key={n.id} notification={n} groupId="g" index={i} />
            ))}
          </ul>
        </Block>

        <Block title="Apostantes">
          <BettorList
            market={m1}
            wagers={wagers}
            profilesById={byId}
            meId="u2"
            isCreator
            groupId="g"
          />
        </Block>
      </div>
    </ToastProvider>
  );
}

function Block({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <div className="mb-4">
        <SectionTitle>{title}</SectionTitle>
      </div>
      {children}
    </section>
  );
}
