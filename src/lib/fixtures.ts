/**
 * Datos de ejemplo para la vista de demostración y la guía de estilos.
 *
 * Son cuatro grupos con contenido de verdad, no uno: la demostración tiene que
 * poder enseñar el cambio de grupo, y para eso hace falta que al cambiar se
 * note algo. Cada uno va por una semana distinta, con su gente, sus apuestas y
 * su saldo, de forma que las cifras de la cabecera cambian al saltar.
 *
 * El cuarto («Pádel de los martes») no está en tu lista: se entra con su
 * código, para poder enseñar también cómo es unirse a uno nuevo.
 *
 * Nada de esto toca la base de datos. La app real arranca vacía.
 */
import type {
  Group,
  MarketStatus,
  MarketWithOptions,
  Notification,
  NotificationKind,
  Profile,
  Season,
  Wager,
} from '@/lib/types';
import type { GroupSummary, Standing } from '@/lib/data';

/** El grupo que se ve si todavía no has cambiado a ninguno. */
export const GRUPO_POR_DEFECTO = 'demo';
export const DEMO_GROUP_ID = GRUPO_POR_DEFECTO;

/** Horas respecto a ahora. Negativo es pasado. */
const h = (horas: number) => new Date(Date.now() + horas * 3600e3).toISOString();

// ---------------------------------------------------------------------- gente

export const PEOPLE: Record<string, Profile> = {
  javi: { id: 'p-javi', username: 'javi', display_name: 'Javi', avatar_symbol: 'crown', avatar_color: 'gold', instagram: 'javi' },
  lucia: { id: 'p-lucia', username: 'lucia', display_name: 'Lucía', avatar_symbol: 'flame', avatar_color: 'rose', instagram: 'lucia.mp' },
  marcos: { id: 'p-marcos', username: 'marcos', display_name: 'Marcos', avatar_symbol: 'bolt', avatar_color: 'cyan', instagram: null },
  ana: { id: 'p-ana', username: 'ana', display_name: 'Ana', avatar_symbol: 'orbit', avatar_color: 'violet', instagram: 'ana_gr' },
  bruno: { id: 'p-bruno', username: 'bruno', display_name: 'Bruno', avatar_symbol: 'peak', avatar_color: 'lime', instagram: null },
  raquel: { id: 'p-raquel', username: 'raquel', display_name: 'Raquel', avatar_symbol: 'diamond', avatar_color: 'sky', instagram: 'raquel.dlr' },
  dani: { id: 'p-dani', username: 'dani', display_name: 'Dani', avatar_symbol: 'shield', avatar_color: 'amber', instagram: null },
  sergio: { id: 'p-sergio', username: 'sergio', display_name: 'Sergio', avatar_symbol: 'target', avatar_color: 'mint', instagram: null },
  nuria: { id: 'p-nuria', username: 'nuria', display_name: 'Nuria', avatar_symbol: 'wave', avatar_color: 'cyan', instagram: 'nuriaaa' },
  paco: { id: 'p-paco', username: 'paco', display_name: 'Paco', avatar_symbol: 'horseshoe', avatar_color: 'amber', instagram: null },
  cris: { id: 'p-cris', username: 'cris', display_name: 'Cris', avatar_symbol: 'star', avatar_color: 'violet', instagram: 'cris.rv' },
  ivan: { id: 'p-ivan', username: 'ivan', display_name: 'Iván', avatar_symbol: 'spade', avatar_color: 'lime', instagram: null },
};

/** Quién eres en la demostración. Es la misma persona en los cuatro grupos. */
export const ME = PEOPLE.lucia;

// -------------------------------------------------------------------- moldes

type Dispute = {
  market_id: string;
  opened_by: string;
  reason: string;
  opened_at: string;
  closes_at: string;
};

type Vote = { market_id: string; user_id: string; option_id: string | null };

export type GrupoDemo = {
  id: string;
  group: Group;
  season: Season;
  me: Profile;
  members: Profile[];
  /** Apuestas de la semana en curso: lo que sale en el tablón. */
  markets: MarketWithOptions[];
  /** Semanas ya cerradas: solo salen en el historial de «mis apuestas». */
  pastMarkets: MarketWithOptions[];
  wagers: Wager[];
  balance: number;
  standings: Standing[];
  notifications: Notification[];
  summary: GroupSummary;
  /** Quién ganó cada semana cerrada, para el palmarés del ranking. */
  seasonHistory: { season_number: number; points: number; user_id: string }[];
  stats: { total: number; won: number; settled: number; inPlay: number };
  dispute: Dispute | null;
  votes: Vote[];
};

type FilaOpcion = [label: string, opening: number, current: number, pool: number];

function opciones(marketId: string, rows: FilaOpcion[]) {
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

type Borrador = {
  id: string;
  creator: Profile;
  title: string;
  description?: string | null;
  status: MarketStatus;
  /** Horas respecto a ahora, negativo si ya pasó. */
  closes: number;
  created: number;
  options: FilaOpcion[];
  season?: number;
  winning?: number;
  note?: string;
  resultAt?: number;
  disputeUntil?: number;
  resolvedAt?: number;
  cancel?: string;
  stakesPublic?: boolean;
};

function mercado(groupId: string, semana: number, b: Borrador): MarketWithOptions {
  return {
    id: b.id,
    group_id: groupId,
    season_number: b.season ?? semana,
    creator_id: b.creator.id,
    creator: b.creator,
    title: b.title,
    description: b.description ?? null,
    status: b.status,
    closes_at: h(b.closes),
    created_at: h(b.created),
    stakes_public: b.stakesPublic ?? true,
    winning_option: b.winning === undefined ? null : `${b.id}-o${b.winning}`,
    result_note: b.note ?? null,
    result_set_at: b.resultAt === undefined ? null : h(b.resultAt),
    dispute_until: b.disputeUntil === undefined ? null : h(b.disputeUntil),
    resolved_at: b.resolvedAt === undefined ? null : h(b.resolvedAt),
    cancel_reason: b.cancel ?? null,
    market_options: opciones(b.id, b.options),
  };
}

type BorradorApuesta = {
  id: string;
  market: string;
  option: number;
  user?: Profile;
  stake: number;
  odds: number;
  status: Wager['status'];
  created: number;
  voidReason?: string;
};

function apuesta(b: BorradorApuesta): Wager {
  return {
    id: b.id,
    market_id: b.market,
    option_id: `${b.market}-o${b.option}`,
    user_id: (b.user ?? ME).id,
    stake: b.stake,
    locked_odds: b.odds,
    to_win: Math.round(b.stake * b.odds * 100) / 100,
    status: b.status,
    void_reason: b.voidReason ?? null,
    created_at: h(b.created),
  };
}

type BorradorAviso = {
  kind: NotificationKind;
  title: string;
  body?: string;
  hours: number;
  amount?: number;
  read?: boolean;
  market?: string;
};

function avisos(groupId: string, desde: number, lista: BorradorAviso[]): Notification[] {
  return lista.map((n, i) => ({
    id: desde + i,
    group_id: groupId,
    user_id: ME.id,
    kind: n.kind,
    market_id: n.market ?? null,
    title: n.title,
    body: n.body ?? null,
    amount: n.amount ?? null,
    read_at: n.read ? h(-n.hours + 1) : null,
    created_at: h(-n.hours),
  }));
}

// ------------------------------------------------------- 1 · Los de siempre

const SIEMPRE_ID = 'demo';

const siempreMercados: MarketWithOptions[] = [
  mercado(SIEMPRE_ID, 3, {
    id: 'm-fiesta',
    creator: PEOPLE.javi,
    title: '¿A que Fulanito se lía con Menganito?',
    description: 'Cuenta solo si pasa antes de que acabe la verbena del sábado.',
    status: 'open',
    closes: 61,
    created: -20,
    options: [
      ['Sí', 1.9, 1.45, 500],
      ['No', 1.9, 2.76, 120],
    ],
  }),
  mercado(SIEMPRE_ID, 3, {
    id: 'm-piscina',
    creator: PEOPLE.lucia,
    title: '¿Quién es el primero que acaba en la piscina?',
    status: 'open',
    stakesPublic: false,
    closes: 0.7,
    created: -6,
    options: [
      ['Marcos', 2.3, 2.1, 300],
      ['Javi', 3.0, 3.4, 90],
      ['Ana', 5.0, 6.5, 20],
    ],
  }),
  mercado(SIEMPRE_ID, 3, {
    id: 'm-karaoke',
    creator: ME,
    title: 'Bruno canta en el karaoke antes de las 2',
    status: 'closed',
    closes: -1,
    created: -30,
    options: [
      ['Sí', 1.6, 1.38, 420],
      ['No', 2.4, 3.2, 95],
    ],
  }),
  mercado(SIEMPRE_ID, 3, {
    id: 'm-lluvia',
    creator: PEOPLE.javi,
    title: 'Llueve el domingo por la tarde',
    status: 'disputed',
    winning: 1,
    note: 'No cayó ni una gota.',
    resultAt: -5,
    disputeUntil: 19,
    closes: -6,
    created: -50,
    options: [
      ['Sí', 2.0, 2.0, 150],
      ['No', 2.0, 1.8, 260],
    ],
  }),
  mercado(SIEMPRE_ID, 3, {
    id: 'm-hielo',
    creator: PEOPLE.marcos,
    title: 'Quién trae el hielo el sábado',
    status: 'resolved',
    winning: 1,
    resultAt: -50,
    resolvedAt: -49,
    closes: -52,
    created: -96,
    options: [
      ['Bruno', 2.2, 2.6, 90],
      ['Marcos', 1.7, 1.5, 210],
    ],
  }),
  mercado(SIEMPRE_ID, 3, {
    id: 'm-paella',
    creator: PEOPLE.ana,
    title: 'La paella sale antes de las tres',
    status: 'cancelled',
    cancel: 'Al final pedimos pizzas',
    closes: -60,
    created: -110,
    options: [
      ['Sí', 1.9, 1.9, 0],
      ['No', 1.9, 1.9, 0],
    ],
  }),
  mercado(SIEMPRE_ID, 3, {
    id: 'm-playa',
    creator: PEOPLE.javi,
    title: 'Nos bañamos de noche en la playa',
    status: 'resolved',
    winning: 0,
    note: 'Nos bañamos los cuatro, hay fotos.',
    resolvedAt: -12,
    closes: -26,
    created: -60,
    options: [
      ['Sí', 1.8, 1.62, 640],
      ['No', 2.1, 2.3, 210],
    ],
  }),
];

/* Semanas ya cerradas. El historial de «mis apuestas» va de todas, no solo de
   la que está en curso, así que la demostración necesita pasado. */
const siempreMercadosPasados: MarketWithOptions[] = [
  mercado(SIEMPRE_ID, 2, {
    id: 'v-cena',
    creator: PEOPLE.javi,
    title: 'Cenamos antes de las diez',
    status: 'resolved',
    winning: 1,
    closes: -120,
    resolvedAt: -118,
    created: -160,
    options: [
      ['Sí', 2.1, 2.4, 140],
      ['No', 1.8, 1.6, 320],
    ],
  }),
  mercado(SIEMPRE_ID, 2, {
    id: 'v-tortilla',
    creator: ME,
    title: 'Bruno se come la tortilla entera',
    status: 'resolved',
    winning: 0,
    closes: -150,
    resolvedAt: -148,
    created: -200,
    options: [
      ['Sí', 3.0, 2.8, 180],
      ['No', 1.4, 1.45, 260],
    ],
  }),
  mercado(SIEMPRE_ID, 1, {
    id: 'v-madrugada',
    creator: PEOPLE.marcos,
    title: 'Alguien aguanta hasta que amanezca',
    status: 'resolved',
    winning: 0,
    closes: -300,
    resolvedAt: -298,
    created: -340,
    options: [
      ['Sí', 1.7, 1.55, 400],
      ['No', 2.2, 2.6, 110],
    ],
  }),
  mercado(SIEMPRE_ID, 1, {
    id: 'v-melon',
    creator: PEOPLE.ana,
    title: 'El melón sale bueno',
    status: 'resolved',
    winning: 0,
    closes: -320,
    resolvedAt: -318,
    created: -360,
    options: [
      ['Sí', 1.6, 1.7, 210],
      ['No', 2.4, 2.2, 95],
    ],
  }),
];

const SIEMPRE: GrupoDemo = {
  id: SIEMPRE_ID,
  group: {
    id: SIEMPRE_ID,
    name: 'Los de siempre',
    invite_code: 'K7QM2X',
    created_by: PEOPLE.javi.id,
    starting_points: 1000,
    liquidity: 300,
    drift: 0.5,
    dispute_hours: 24,
    min_stake: 1,
  },
  season: {
    group_id: SIEMPRE_ID,
    number: 3,
    starts_at: h(-70),
    ends_at: h(98),
    closed_at: null,
  },
  me: ME,
  members: [PEOPLE.javi, PEOPLE.lucia, PEOPLE.marcos, PEOPLE.ana, PEOPLE.bruno],
  markets: siempreMercados,
  pastMarkets: siempreMercadosPasados,
  wagers: [
    apuesta({ id: 'w1', market: 'm-fiesta', option: 0, stake: 300, odds: 1.9, status: 'active', created: -18 }),
    apuesta({ id: 'w2', market: 'm-fiesta', option: 0, user: PEOPLE.marcos, stake: 200, odds: 1.52, status: 'active', created: -9 }),
    apuesta({ id: 'w3', market: 'm-fiesta', option: 1, user: PEOPLE.ana, stake: 120, odds: 2.76, status: 'voided', created: -2, voidReason: 'Apostado 30 segundos después de que ya hubiera pasado' }),
    apuesta({ id: 'w4', market: 'm-karaoke', option: 0, stake: 150, odds: 1.6, status: 'active', created: -25 }),
    apuesta({ id: 'w5', market: 'm-playa', option: 0, stake: 200, odds: 1.8, status: 'won', created: -55 }),
    apuesta({ id: 'w6', market: 'm-lluvia', option: 0, stake: 80, odds: 2.0, status: 'active', created: -40 }),
    // Semana 2, ya cerrada.
    apuesta({ id: 'w7', market: 'v-cena', option: 1, stake: 250, odds: 1.75, status: 'won', created: -140 }),
    apuesta({ id: 'w8', market: 'v-tortilla', option: 1, stake: 180, odds: 1.4, status: 'lost', created: -170 }),
    // Semana 1.
    apuesta({ id: 'w9', market: 'v-madrugada', option: 1, stake: 120, odds: 2.2, status: 'lost', created: -320 }),
    apuesta({ id: 'w10', market: 'v-melon', option: 0, stake: 60, odds: 1.7, status: 'won', created: -318 }),
  ],
  balance: 1130,
  standings: [
    { profile: PEOPLE.javi, points: 1420, staked: 200, won: 5, settled: 7 },
    { profile: ME, points: 600, staked: 530, won: 3, settled: 5 },
    { profile: PEOPLE.marcos, points: 980, staked: 200, won: 2, settled: 6 },
    { profile: PEOPLE.bruno, points: 870, staked: 0, won: 1, settled: 4 },
    { profile: PEOPLE.ana, points: 640, staked: 120, won: 1, settled: 5 },
  ].sort((a, b) => b.points + b.staked - (a.points + a.staked)),
  notifications: avisos(SIEMPRE_ID, 100, [
    { kind: 'wager_won', title: 'Has ganado Nos bañamos de noche en la playa', body: 'Salió «Sí»', hours: 0.2, amount: 360, market: 'm-playa' },
    { kind: 'market_closed', title: 'Te toca: ¿Quién es el primero que acaba en la piscina?', body: 'Ha cerrado. Dinos qué pasó para repartir los puntos.', hours: 0.75, market: 'm-piscina' },
    { kind: 'dispute_opened', title: 'Impugnada: Llueve el domingo por la tarde', body: 'Vota tú también, decide la mayoría.', hours: 2, market: 'm-lluvia' },
    { kind: 'result_published', title: 'Ya hay resultado: Llueve el domingo por la tarde', body: 'Tienes 24 h para impugnarlo si no te cuadra.', hours: 5, read: true, market: 'm-lluvia' },
    { kind: 'wager_voided', title: 'Te han anulado una apuesta', body: 'Apostado 30 segundos después de que ya hubiera pasado', hours: 26, amount: 120, read: true, market: 'm-fiesta' },
    { kind: 'market_opened', title: 'Apuesta nueva', body: 'Bruno canta en el karaoke antes de las 2', hours: 30, read: true, market: 'm-karaoke' },
    { kind: 'wager_lost', title: 'Se te fue Quién trae el hielo', body: 'Salió «Marcos»', hours: 48, amount: 60, read: true },
    { kind: 'season_rolled', title: 'Semana 3 en marcha', body: 'Todos volvéis a 1000 puntos. El ranking de la semana 2 ya está cerrado.', hours: 70, amount: 1000, read: true },
  ]),
  summary: {
    marketsTotal: 17,
    history: [
      { number: 2, startsAt: h(-238), endsAt: h(-70), winner: PEOPLE.javi, winnerPoints: 2140 },
      { number: 1, startsAt: h(-406), endsAt: h(-238), winner: PEOPLE.marcos, winnerPoints: 1780 },
    ],
    members: [
      { profile: PEOPLE.javi, role: 'owner', joinedAt: h(-406), points: 1420, weeksWon: 1, podiums: 2, wagersWon: 9, wagersTotal: 14 },
      { profile: PEOPLE.marcos, role: 'member', joinedAt: h(-404), points: 980, weeksWon: 1, podiums: 2, wagersWon: 7, wagersTotal: 15 },
      { profile: ME, role: 'member', joinedAt: h(-400), points: 600, weeksWon: 0, podiums: 1, wagersWon: 6, wagersTotal: 13 },
      { profile: PEOPLE.bruno, role: 'member', joinedAt: h(-240), points: 870, weeksWon: 0, podiums: 1, wagersWon: 3, wagersTotal: 8 },
      { profile: PEOPLE.ana, role: 'member', joinedAt: h(-72), points: 640, weeksWon: 0, podiums: 0, wagersWon: 1, wagersTotal: 6 },
    ],
  },
  seasonHistory: [
    { season_number: 2, points: 2140, user_id: PEOPLE.javi.id },
    { season_number: 1, points: 1780, user_id: PEOPLE.marcos.id },
  ],
  stats: { total: 6, won: 3, settled: 5, inPlay: 530 },
  dispute: {
    market_id: 'm-lluvia',
    opened_by: PEOPLE.marcos.id,
    reason: 'Cayeron cuatro gotas a las 19h, lo vimos todos',
    opened_at: h(-6),
    closes_at: h(8),
  },
  votes: [
    { market_id: 'm-lluvia', user_id: PEOPLE.javi.id, option_id: 'm-lluvia-o1' },
    { market_id: 'm-lluvia', user_id: PEOPLE.marcos.id, option_id: 'm-lluvia-o0' },
  ],
};

// ------------------------------------------------------------ 2 · La oficina

const OFICINA_ID = 'oficina';

const OFICINA: GrupoDemo = {
  id: OFICINA_ID,
  group: {
    id: OFICINA_ID,
    name: 'La oficina',
    invite_code: 'TRB4NL',
    created_by: PEOPLE.raquel.id,
    starting_points: 1000,
    liquidity: 250,
    drift: 0.4,
    dispute_hours: 12,
    min_stake: 5,
  },
  season: {
    group_id: OFICINA_ID,
    number: 5,
    starts_at: h(-96),
    ends_at: h(72),
    closed_at: null,
  },
  me: ME,
  members: [PEOPLE.raquel, PEOPLE.lucia, PEOPLE.dani, PEOPLE.sergio, PEOPLE.nuria],
  markets: [
    mercado(OFICINA_ID, 5, {
      id: 'o-cafe',
      creator: PEOPLE.raquel,
      title: 'La máquina del café se rompe antes del viernes',
      description: 'Vale con que se quede sin vasos. Ya van tres semanas seguidas.',
      status: 'open',
      closes: 44,
      created: -30,
      options: [
        ['Sí', 1.7, 1.42, 380],
        ['No', 2.2, 3.1, 95],
      ],
    }),
    mercado(OFICINA_ID, 5, {
      id: 'o-reunion',
      creator: ME,
      title: 'La de las diez pasa de una hora',
      status: 'open',
      closes: 16,
      created: -8,
      options: [
        ['Sí', 1.45, 1.3, 260],
        ['No', 2.8, 3.6, 55],
      ],
    }),
    mercado(OFICINA_ID, 5, {
      id: 'o-viernes',
      creator: ME,
      title: 'Alguien se pide el viernes libre',
      status: 'closed',
      closes: -3,
      created: -52,
      options: [
        ['Sí', 1.9, 1.75, 210],
        ['No', 1.9, 2.05, 160],
      ],
    }),
    mercado(OFICINA_ID, 5, {
      id: 'o-ascensor',
      creator: PEOPLE.dani,
      title: 'Nos quedamos otra vez sin ascensor',
      status: 'resolved',
      winning: 0,
      note: 'Se paró el martes a las nueve, cuatro plantas a pie.',
      resultAt: -46,
      resolvedAt: -45,
      closes: -48,
      created: -90,
      options: [
        ['Sí', 2.4, 1.95, 180],
        ['No', 1.6, 1.85, 140],
      ],
    }),
    mercado(OFICINA_ID, 5, {
      id: 'o-comida',
      creator: PEOPLE.nuria,
      title: 'Sergio vuelve a pedir lo mismo de siempre',
      status: 'resolved',
      winning: 0,
      resultAt: -20,
      resolvedAt: -19,
      closes: -22,
      created: -70,
      options: [
        ['Sí', 1.35, 1.22, 300],
        ['No', 3.2, 4.4, 40],
      ],
    }),
  ],
  pastMarkets: [
    mercado(OFICINA_ID, 4, {
      id: 'o-parking',
      creator: PEOPLE.sergio,
      title: 'Dani aparca bien a la primera',
      status: 'resolved',
      winning: 1,
      closes: -180,
      resolvedAt: -178,
      created: -230,
      options: [
        ['Sí', 2.6, 3.1, 70],
        ['No', 1.5, 1.35, 320],
      ],
    }),
    mercado(OFICINA_ID, 4, {
      id: 'o-pizza',
      creator: PEOPLE.raquel,
      title: 'La cena de equipo acaba antes de las once',
      status: 'resolved',
      winning: 1,
      closes: -200,
      resolvedAt: -198,
      created: -250,
      options: [
        ['Sí', 1.8, 1.9, 150],
        ['No', 2.0, 1.85, 190],
      ],
    }),
  ],
  wagers: [
    apuesta({ id: 'ow1', market: 'o-cafe', option: 0, stake: 120, odds: 1.55, status: 'active', created: -26 }),
    apuesta({ id: 'ow2', market: 'o-reunion', option: 0, stake: 90, odds: 1.4, status: 'active', created: -7 }),
    apuesta({ id: 'ow3', market: 'o-cafe', option: 0, user: PEOPLE.dani, stake: 200, odds: 1.7, status: 'active', created: -29 }),
    apuesta({ id: 'ow4', market: 'o-ascensor', option: 1, stake: 150, odds: 1.6, status: 'lost', created: -80 }),
    apuesta({ id: 'ow5', market: 'o-comida', option: 1, stake: 100, odds: 3.2, status: 'lost', created: -60 }),
    // Semana 4.
    apuesta({ id: 'ow6', market: 'o-parking', option: 1, stake: 200, odds: 1.5, status: 'won', created: -220 }),
    apuesta({ id: 'ow7', market: 'o-pizza', option: 0, stake: 140, odds: 1.8, status: 'lost', created: -240 }),
  ],
  balance: 640,
  standings: [
    { profile: PEOPLE.raquel, points: 1310, staked: 80, won: 4, settled: 5 },
    { profile: PEOPLE.dani, points: 900, staked: 200, won: 3, settled: 6 },
    { profile: PEOPLE.nuria, points: 1050, staked: 0, won: 2, settled: 4 },
    { profile: ME, points: 640, staked: 210, won: 0, settled: 2 },
    { profile: PEOPLE.sergio, points: 780, staked: 60, won: 1, settled: 5 },
  ].sort((a, b) => b.points + b.staked - (a.points + a.staked)),
  notifications: avisos(OFICINA_ID, 200, [
    { kind: 'market_closed', title: 'Te toca: Alguien se pide el viernes libre', body: 'Ha cerrado y la lanzaste tú. Di qué pasó para repartir.', hours: 3, market: 'o-viernes' },
    { kind: 'wager_lost', title: 'Se te fue Sergio vuelve a pedir lo mismo de siempre', body: 'Pidió lo de siempre, cómo no.', hours: 19, amount: 100, market: 'o-comida' },
    { kind: 'market_opened', title: 'Apuesta nueva', body: 'La máquina del café se rompe antes del viernes', hours: 30, read: true, market: 'o-cafe' },
    { kind: 'wager_lost', title: 'Se te fue Nos quedamos otra vez sin ascensor', body: 'Se paró el martes.', hours: 45, amount: 150, read: true, market: 'o-ascensor' },
    { kind: 'season_rolled', title: 'Semana 5 en marcha', body: 'Todos volvéis a 1000 puntos. Raquel ganó la semana 4.', hours: 96, amount: 1000, read: true },
  ]),
  summary: {
    marketsTotal: 34,
    history: [
      { number: 4, startsAt: h(-264), endsAt: h(-96), winner: PEOPLE.raquel, winnerPoints: 1960 },
      { number: 3, startsAt: h(-432), endsAt: h(-264), winner: PEOPLE.raquel, winnerPoints: 1720 },
      { number: 2, startsAt: h(-600), endsAt: h(-432), winner: PEOPLE.nuria, winnerPoints: 2050 },
      { number: 1, startsAt: h(-768), endsAt: h(-600), winner: PEOPLE.dani, winnerPoints: 1640 },
    ],
    members: [
      { profile: PEOPLE.raquel, role: 'owner', joinedAt: h(-768), points: 1310, weeksWon: 2, podiums: 4, wagersWon: 18, wagersTotal: 26 },
      { profile: PEOPLE.nuria, role: 'member', joinedAt: h(-768), points: 1050, weeksWon: 1, podiums: 3, wagersWon: 14, wagersTotal: 24 },
      { profile: PEOPLE.dani, role: 'member', joinedAt: h(-760), points: 900, weeksWon: 1, podiums: 2, wagersWon: 12, wagersTotal: 25 },
      { profile: PEOPLE.sergio, role: 'member', joinedAt: h(-600), points: 780, weeksWon: 0, podiums: 1, wagersWon: 8, wagersTotal: 19 },
      { profile: ME, role: 'member', joinedAt: h(-300), points: 640, weeksWon: 0, podiums: 0, wagersWon: 4, wagersTotal: 11 },
    ],
  },
  seasonHistory: [
    { season_number: 4, points: 1960, user_id: PEOPLE.raquel.id },
    { season_number: 3, points: 1720, user_id: PEOPLE.raquel.id },
    { season_number: 2, points: 2050, user_id: PEOPLE.nuria.id },
    { season_number: 1, points: 1640, user_id: PEOPLE.dani.id },
  ],
  stats: { total: 5, won: 1, settled: 3, inPlay: 210 },
  dispute: null,
  votes: [],
};

// ----------------------------------------------------------- 3 · Cuñados FC

const CUNADOS_ID = 'cunados';

const CUNADOS: GrupoDemo = {
  id: CUNADOS_ID,
  group: {
    id: CUNADOS_ID,
    name: 'Cuñados FC',
    invite_code: 'GOL9RT',
    created_by: PEOPLE.paco.id,
    starting_points: 1000,
    liquidity: 400,
    drift: 0.7,
    dispute_hours: 24,
    min_stake: 10,
  },
  season: {
    group_id: CUNADOS_ID,
    number: 2,
    starts_at: h(-120),
    ends_at: h(48),
    closed_at: null,
  },
  me: ME,
  members: [PEOPLE.paco, PEOPLE.lucia, PEOPLE.javi, PEOPLE.cris, PEOPLE.ivan],
  markets: [
    mercado(CUNADOS_ID, 2, {
      id: 'c-derbi',
      creator: PEOPLE.paco,
      title: 'El derbi acaba en empate',
      description: 'Empate en los noventa. La prórroga no cuenta.',
      status: 'open',
      closes: 27,
      created: -22,
      options: [
        ['Sí', 3.4, 3.9, 120],
        ['No', 1.3, 1.24, 640],
      ],
    }),
    mercado(CUNADOS_ID, 2, {
      id: 'c-primero',
      creator: PEOPLE.cris,
      title: '¿Quién mete el primer gol de la peña el domingo?',
      status: 'open',
      closes: 3.5,
      created: -14,
      options: [
        ['Iván', 2.6, 2.2, 340],
        ['Paco', 3.2, 4.1, 80],
        ['Javi', 4.0, 3.6, 190],
        ['Nadie, 0-0', 6.0, 7.5, 30],
      ],
    }),
    mercado(CUNADOS_ID, 2, {
      id: 'c-vermut',
      creator: PEOPLE.javi,
      title: 'Paco llega tarde al vermut',
      status: 'resolved',
      winning: 0,
      note: 'Cuarenta minutos. Récord de la temporada.',
      resultAt: -20,
      resolvedAt: -19,
      closes: -21,
      created: -68,
      options: [
        ['Sí', 1.5, 1.28, 520],
        ['No', 2.6, 3.9, 70],
      ],
    }),
    mercado(CUNADOS_ID, 2, {
      id: 'c-camiseta',
      creator: PEOPLE.ivan,
      title: 'Iván se compra la camiseta nueva antes del derbi',
      status: 'resolved',
      winning: 1,
      resultAt: -70,
      resolvedAt: -69,
      closes: -72,
      created: -110,
      options: [
        ['Sí', 1.9, 2.4, 90],
        ['No', 1.9, 1.6, 260],
      ],
    }),
  ],
  pastMarkets: [
    mercado(CUNADOS_ID, 1, {
      id: 'c-copa',
      creator: PEOPLE.paco,
      title: 'Ganamos el primer partido de la copa del barrio',
      status: 'resolved',
      winning: 0,
      closes: -260,
      resolvedAt: -258,
      created: -300,
      options: [
        ['Sí', 2.1, 1.85, 430],
        ['No', 1.75, 2.0, 180],
      ],
    }),
  ],
  wagers: [
    apuesta({ id: 'cw1', market: 'c-derbi', option: 1, stake: 250, odds: 1.28, status: 'active', created: -20 }),
    apuesta({ id: 'cw2', market: 'c-primero', option: 0, stake: 180, odds: 2.4, status: 'active', created: -12 }),
    apuesta({ id: 'cw3', market: 'c-primero', option: 2, user: PEOPLE.javi, stake: 190, odds: 3.6, status: 'active', created: -10 }),
    apuesta({ id: 'cw4', market: 'c-vermut', option: 0, stake: 300, odds: 1.5, status: 'won', created: -60 }),
    apuesta({ id: 'cw5', market: 'c-camiseta', option: 1, stake: 200, odds: 1.75, status: 'won', created: -100 }),
    // Semana 1.
    apuesta({ id: 'cw6', market: 'c-copa', option: 0, stake: 260, odds: 2.1, status: 'won', created: -290 }),
  ],
  balance: 1860,
  standings: [
    { profile: ME, points: 1860, staked: 430, won: 3, settled: 3 },
    { profile: PEOPLE.paco, points: 1120, staked: 80, won: 2, settled: 4 },
    { profile: PEOPLE.javi, points: 760, staked: 190, won: 1, settled: 4 },
    { profile: PEOPLE.cris, points: 990, staked: 120, won: 2, settled: 3 },
    { profile: PEOPLE.ivan, points: 540, staked: 340, won: 1, settled: 4 },
  ].sort((a, b) => b.points + b.staked - (a.points + a.staked)),
  notifications: avisos(CUNADOS_ID, 300, [
    { kind: 'wager_won', title: 'Has ganado Paco llega tarde al vermut', body: 'Cuarenta minutos tarde.', hours: 19, amount: 450, market: 'c-vermut' },
    { kind: 'market_opened', title: 'Apuesta nueva', body: '¿Quién mete el primer gol de la peña el domingo?', hours: 14, read: true, market: 'c-primero' },
    { kind: 'market_opened', title: 'Apuesta nueva', body: 'El derbi acaba en empate', hours: 22, read: true, market: 'c-derbi' },
    { kind: 'wager_won', title: 'Has ganado Iván se compra la camiseta nueva', body: 'Sigue con la del año pasado.', hours: 69, amount: 350, read: true, market: 'c-camiseta' },
    { kind: 'season_rolled', title: 'Semana 2 en marcha', body: 'Todos volvéis a 1000 puntos. Cris ganó la semana 1.', hours: 120, amount: 1000, read: true },
  ]),
  summary: {
    marketsTotal: 9,
    history: [{ number: 1, startsAt: h(-288), endsAt: h(-120), winner: PEOPLE.cris, winnerPoints: 1890 }],
    members: [
      { profile: PEOPLE.cris, role: 'member', joinedAt: h(-286), points: 990, weeksWon: 1, podiums: 1, wagersWon: 4, wagersTotal: 6 },
      { profile: ME, role: 'member', joinedAt: h(-284), points: 1860, weeksWon: 0, podiums: 1, wagersWon: 4, wagersTotal: 5 },
      { profile: PEOPLE.paco, role: 'owner', joinedAt: h(-288), points: 1120, weeksWon: 0, podiums: 1, wagersWon: 3, wagersTotal: 7 },
      { profile: PEOPLE.javi, role: 'member', joinedAt: h(-280), points: 760, weeksWon: 0, podiums: 0, wagersWon: 2, wagersTotal: 6 },
      { profile: PEOPLE.ivan, role: 'member', joinedAt: h(-130), points: 540, weeksWon: 0, podiums: 0, wagersWon: 1, wagersTotal: 5 },
    ],
  },
  seasonHistory: [{ season_number: 1, points: 1890, user_id: PEOPLE.cris.id }],
  stats: { total: 4, won: 3, settled: 3, inPlay: 430 },
  dispute: null,
  votes: [],
};

// ------------------------------------------------- 4 · Pádel de los martes

/* Este no está en tu lista: se entra con el código, para poder enseñar cómo
   es unirse a un grupo nuevo sin tocar la base de datos. */
const PADEL_ID = 'padel';

const PADEL: GrupoDemo = {
  id: PADEL_ID,
  group: {
    id: PADEL_ID,
    name: 'Pádel de los martes',
    invite_code: 'PADEL7',
    created_by: PEOPLE.nuria.id,
    starting_points: 500,
    liquidity: 150,
    drift: 0.5,
    dispute_hours: 24,
    min_stake: 1,
  },
  season: {
    group_id: PADEL_ID,
    number: 1,
    starts_at: h(-40),
    ends_at: h(128),
    closed_at: null,
  },
  me: ME,
  members: [PEOPLE.nuria, PEOPLE.lucia, PEOPLE.marcos, PEOPLE.cris],
  markets: [
    mercado(PADEL_ID, 1, {
      id: 'p-remonte',
      creator: PEOPLE.nuria,
      title: 'Remontamos un set el martes',
      description: 'Vale cualquiera de los dos partidos.',
      status: 'open',
      closes: 50,
      created: -2,
      options: [
        ['Sí', 2.2, 2.05, 110],
        ['No', 1.7, 1.8, 90],
      ],
    }),
    mercado(PADEL_ID, 1, {
      id: 'p-pala',
      creator: PEOPLE.marcos,
      title: 'Marcos rompe otra pala este mes',
      status: 'open',
      closes: 120,
      created: -18,
      options: [
        ['Sí', 1.6, 1.5, 160],
        ['No', 2.4, 2.7, 55],
      ],
    }),
  ],
  pastMarkets: [],
  wagers: [
    apuesta({ id: 'pw1', market: 'p-pala', option: 0, user: PEOPLE.cris, stake: 60, odds: 1.6, status: 'active', created: -16 }),
    apuesta({ id: 'pw2', market: 'p-remonte', option: 0, user: PEOPLE.nuria, stake: 40, odds: 2.2, status: 'active', created: -1 }),
  ],
  balance: 500,
  standings: [
    { profile: PEOPLE.nuria, points: 460, staked: 40, won: 0, settled: 0 },
    { profile: PEOPLE.marcos, points: 500, staked: 0, won: 0, settled: 0 },
    { profile: PEOPLE.cris, points: 440, staked: 60, won: 0, settled: 0 },
    { profile: ME, points: 500, staked: 0, won: 0, settled: 0 },
  ].sort((a, b) => b.points + b.staked - (a.points + a.staked)),
  notifications: avisos(PADEL_ID, 400, [
    { kind: 'market_opened', title: 'Apuesta nueva', body: 'Remontamos un set el martes', hours: 2, market: 'p-remonte' },
    { kind: 'market_opened', title: 'Apuesta nueva', body: 'Marcos rompe otra pala este mes', hours: 18, read: true, market: 'p-pala' },
  ]),
  summary: {
    marketsTotal: 2,
    history: [],
    members: [
      { profile: PEOPLE.nuria, role: 'owner', joinedAt: h(-40), points: 460, weeksWon: 0, podiums: 0, wagersWon: 0, wagersTotal: 0 },
      { profile: PEOPLE.marcos, role: 'member', joinedAt: h(-38), points: 500, weeksWon: 0, podiums: 0, wagersWon: 0, wagersTotal: 0 },
      { profile: PEOPLE.cris, role: 'member', joinedAt: h(-36), points: 440, weeksWon: 0, podiums: 0, wagersWon: 0, wagersTotal: 0 },
      { profile: ME, role: 'member', joinedAt: h(-0.1), points: 500, weeksWon: 0, podiums: 0, wagersWon: 0, wagersTotal: 0 },
    ],
  },
  seasonHistory: [],
  stats: { total: 0, won: 0, settled: 0, inPlay: 0 },
  dispute: null,
  votes: [],
};

// --------------------------------------------------------------------- índice

export const GRUPOS: Record<string, GrupoDemo> = {
  [SIEMPRE_ID]: SIEMPRE,
  [OFICINA_ID]: OFICINA,
  [CUNADOS_ID]: CUNADOS,
  [PADEL_ID]: PADEL,
};

/** Los que salen en tu lista nada más abrir. El de pádel hay que buscarlo. */
export const GRUPOS_UNIDOS = [SIEMPRE_ID, OFICINA_ID, CUNADOS_ID];

/** El grupo pedido, o el de siempre si el identificador no vale. */
export function grupoDemo(id?: string | null): GrupoDemo {
  return (id && GRUPOS[id]) || GRUPOS[GRUPO_POR_DEFECTO];
}

/** Busca un grupo por su código de invitación, mires o no en tu lista. */
export function grupoDemoPorCodigo(codigo: string): GrupoDemo | null {
  const limpio = codigo.trim().toUpperCase();
  return Object.values(GRUPOS).find((g) => g.group.invite_code === limpio) ?? null;
}
