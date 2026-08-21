/**
 * Datos de ejemplo para la vista de demostración y la guía de estilos.
 *
 * Solo se usan en desarrollo: las rutas que los consumen devuelven 404 en
 * producción. La app real arranca vacía.
 */
import type { Group, MarketWithOptions, Notification, Profile, Season, Wager } from '@/lib/types';

export const DEMO_GROUP_ID = 'demo';

export const PEOPLE: Record<string, Profile> = {
  javi: { id: 'p-javi', username: 'javi', display_name: 'Javi', avatar_symbol: 'crown', avatar_color: 'gold' },
  lucia: { id: 'p-lucia', username: 'lucia', display_name: 'Lucía', avatar_symbol: 'flame', avatar_color: 'rose' },
  marcos: { id: 'p-marcos', username: 'marcos', display_name: 'Marcos', avatar_symbol: 'bolt', avatar_color: 'cyan' },
  ana: { id: 'p-ana', username: 'ana', display_name: 'Ana', avatar_symbol: 'orbit', avatar_color: 'violet' },
  bruno: { id: 'p-bruno', username: 'bruno', display_name: 'Bruno', avatar_symbol: 'peak', avatar_color: 'lime' },
};

export const ME = PEOPLE.lucia;
export const MEMBERS = Object.values(PEOPLE);

export const GROUP: Group = {
  id: DEMO_GROUP_ID,
  name: 'Los de siempre',
  invite_code: 'K7QM2X',
  created_by: PEOPLE.javi.id,
  starting_points: 1000,
  liquidity: 300,
  drift: 0.5,
  dispute_hours: 24,
  min_stake: 1,
};

const inHours = (h: number) => new Date(Date.now() + h * 3600e3).toISOString();
const agoHours = (h: number) => new Date(Date.now() - h * 3600e3).toISOString();

export const SEASON: Season = {
  group_id: DEMO_GROUP_ID,
  number: 3,
  starts_at: agoHours(70),
  ends_at: inHours(98),
  closed_at: null,
};

function options(
  marketId: string,
  rows: [label: string, opening: number, current: number, pool: number][],
) {
  return rows.map(([label, opening_odds, current_odds, pool], i) => ({
    id: `${marketId}-o${i}`,
    market_id: marketId,
    label,
    position: i + 1,
    opening_odds,
    current_odds,
    pool,
  }));
}

const base = {
  group_id: DEMO_GROUP_ID,
  season_number: 3,
  stakes_public: true,
  winning_option: null,
  result_note: null,
  result_set_at: null,
  dispute_until: null,
  resolved_at: null,
  cancel_reason: null,
};

export const MARKETS: MarketWithOptions[] = [
  {
    ...base,
    id: 'm-fiesta',
    creator_id: PEOPLE.javi.id,
    creator: PEOPLE.javi,
    title: '¿A que Fulanito se lía con Menganito?',
    description: 'Cuenta solo si pasa antes de que acabe la verbena del sábado.',
    status: 'open',
    closes_at: inHours(61),
    created_at: agoHours(20),
    market_options: options('m-fiesta', [
      ['Sí', 1.9, 1.45, 500],
      ['No', 1.9, 2.76, 120],
    ]),
  },
  {
    ...base,
    id: 'm-piscina',
    creator_id: PEOPLE.lucia.id,
    creator: PEOPLE.lucia,
    title: '¿Quién es el primero que acaba en la piscina?',
    description: null,
    status: 'open',
    stakes_public: false,
    closes_at: inHours(0.7),
    created_at: agoHours(6),
    market_options: options('m-piscina', [
      ['Marcos', 2.3, 2.1, 300],
      ['Javi', 3.0, 3.4, 90],
      ['Ana', 5.0, 6.5, 20],
    ]),
  },
  {
    ...base,
    id: 'm-karaoke',
    creator_id: ME.id,
    creator: ME,
    title: 'Bruno canta en el karaoke antes de las 2',
    description: null,
    status: 'closed',
    closes_at: agoHours(1),
    created_at: agoHours(30),
    market_options: options('m-karaoke', [
      ['Sí', 1.6, 1.38, 420],
      ['No', 2.4, 3.2, 95],
    ]),
  },
  {
    ...base,
    id: 'm-lluvia',
    creator_id: PEOPLE.javi.id,
    creator: PEOPLE.javi,
    title: 'Llueve el domingo por la tarde',
    description: null,
    status: 'disputed',
    winning_option: 'm-lluvia-o1',
    result_note: 'No cayó ni una gota.',
    result_set_at: agoHours(5),
    dispute_until: inHours(19),
    closes_at: agoHours(6),
    created_at: agoHours(50),
    market_options: options('m-lluvia', [
      ['Sí', 2.0, 2.0, 150],
      ['No', 2.0, 1.8, 260],
    ]),
  },
  {
    ...base,
    id: 'm-playa',
    creator_id: PEOPLE.javi.id,
    creator: PEOPLE.javi,
    title: 'Nos bañamos de noche en la playa',
    description: null,
    status: 'resolved',
    winning_option: 'm-playa-o0',
    result_note: 'Nos bañamos los cuatro, hay fotos.',
    resolved_at: agoHours(12),
    closes_at: agoHours(26),
    created_at: agoHours(60),
    market_options: options('m-playa', [
      ['Sí', 1.8, 1.62, 640],
      ['No', 2.1, 2.3, 210],
    ]),
  },
];

export const WAGERS: Wager[] = [
  {
    id: 'w1', market_id: 'm-fiesta', option_id: 'm-fiesta-o0', user_id: ME.id,
    stake: 300, locked_odds: 1.9, to_win: 570, status: 'active', void_reason: null,
    created_at: agoHours(18),
  },
  {
    id: 'w2', market_id: 'm-fiesta', option_id: 'm-fiesta-o0', user_id: PEOPLE.marcos.id,
    stake: 200, locked_odds: 1.52, to_win: 304, status: 'active', void_reason: null,
    created_at: agoHours(9),
  },
  {
    id: 'w3', market_id: 'm-fiesta', option_id: 'm-fiesta-o1', user_id: PEOPLE.ana.id,
    stake: 120, locked_odds: 2.76, to_win: 331.2, status: 'voided',
    void_reason: 'Apostado 30 segundos después de que ya hubiera pasado',
    created_at: agoHours(2),
  },
  {
    id: 'w4', market_id: 'm-karaoke', option_id: 'm-karaoke-o0', user_id: ME.id,
    stake: 150, locked_odds: 1.6, to_win: 240, status: 'active', void_reason: null,
    created_at: agoHours(25),
  },
  {
    id: 'w5', market_id: 'm-playa', option_id: 'm-playa-o0', user_id: ME.id,
    stake: 200, locked_odds: 1.8, to_win: 360, status: 'won', void_reason: null,
    created_at: agoHours(55),
  },
  {
    id: 'w6', market_id: 'm-lluvia', option_id: 'm-lluvia-o0', user_id: ME.id,
    stake: 80, locked_odds: 2.0, to_win: 160, status: 'active', void_reason: null,
    created_at: agoHours(40),
  },
];

export const BALANCE = 1130;

const aviso = (
  id: number,
  kind: Notification['kind'],
  title: string,
  body: string | null,
  hours: number,
  amount: number | null = null,
  read = false,
  market: string | null = 'm-fiesta',
): Notification => ({
  id, group_id: DEMO_GROUP_ID, user_id: ME.id, kind, market_id: market,
  title, body, amount, read_at: read ? agoHours(hours - 1) : null, created_at: agoHours(hours),
});

export const NOTIFICATIONS: Notification[] = [
  aviso(1, 'wager_won', 'Has ganado Nos bañamos de noche en la playa', 'Salió «Sí»', 0.2, 360, false, 'm-playa'),
  aviso(2, 'market_closed', 'Te toca: ¿Quién es el primero que acaba en la piscina?', 'Ha cerrado. Dinos qué pasó para repartir los puntos.', 0.75, null, false, 'm-piscina'),
  aviso(3, 'dispute_opened', 'Impugnada: Llueve el domingo por la tarde', 'Vota tú también, decide la mayoría.', 2, null, false, 'm-lluvia'),
  aviso(4, 'result_published', 'Ya hay resultado: Llueve el domingo por la tarde', 'Tienes 24 h para impugnarlo si no te cuadra.', 5, null, true, 'm-lluvia'),
  aviso(5, 'wager_voided', 'Te han anulado una apuesta', 'Apostado 30 segundos después de que ya hubiera pasado', 26, 120, true),
  aviso(6, 'market_opened', 'Apuesta nueva', 'Bruno canta en el karaoke antes de las 2', 30, null, true, 'm-karaoke'),
  aviso(7, 'wager_lost', 'Se te fue Quién trae el hielo', 'Salió «Marcos»', 48, 60, true, null),
  aviso(8, 'season_rolled', 'Semana 3 en marcha', 'Todos volvéis a 1000 puntos. El ranking de la semana 2 ya está cerrado.', 70, 1000, true, null),
];

export const STANDINGS = [
  { profile: PEOPLE.javi, points: 1420, staked: 200, won: 5, settled: 7 },
  { profile: ME, points: 600, staked: 530, won: 3, settled: 5 },
  { profile: PEOPLE.marcos, points: 980, staked: 200, won: 2, settled: 6 },
  { profile: PEOPLE.bruno, points: 870, staked: 0, won: 1, settled: 4 },
  { profile: PEOPLE.ana, points: 640, staked: 120, won: 1, settled: 5 },
].sort((a, b) => b.points + b.staked - (a.points + a.staked));

/**
 * Palmarés inventado para la ficha del grupo: dos semanas ya cerradas con su
 * ganador, y el historial acumulado de cada uno.
 */
export const GROUP_SUMMARY = {
  marketsTotal: 17,
  history: [
    {
      number: 2,
      startsAt: agoHours(238),
      endsAt: agoHours(70),
      winner: PEOPLE.javi,
      winnerPoints: 2140,
    },
    {
      number: 1,
      startsAt: agoHours(406),
      endsAt: agoHours(238),
      winner: PEOPLE.marcos,
      winnerPoints: 1780,
    },
  ],
  members: [
    { profile: PEOPLE.javi, role: 'owner', joinedAt: agoHours(406), points: 1420, weeksWon: 1, podiums: 2, wagersWon: 9, wagersTotal: 14 },
    { profile: PEOPLE.marcos, role: 'member', joinedAt: agoHours(404), points: 980, weeksWon: 1, podiums: 2, wagersWon: 7, wagersTotal: 15 },
    { profile: ME, role: 'member', joinedAt: agoHours(400), points: 600, weeksWon: 0, podiums: 1, wagersWon: 6, wagersTotal: 13 },
    { profile: PEOPLE.bruno, role: 'member', joinedAt: agoHours(240), points: 870, weeksWon: 0, podiums: 1, wagersWon: 3, wagersTotal: 8 },
    { profile: PEOPLE.ana, role: 'member', joinedAt: agoHours(72), points: 640, weeksWon: 0, podiums: 0, wagersWon: 1, wagersTotal: 6 },
  ],
};
