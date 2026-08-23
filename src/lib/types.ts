export type MarketStatus =
  | 'open'
  | 'closed'
  | 'pending'
  | 'disputed'
  | 'resolved'
  | 'cancelled';

export type WagerStatus = 'active' | 'won' | 'lost' | 'refunded' | 'voided';

export type Profile = {
  id: string;
  username: string;
  display_name: string;
  avatar_symbol: string;
  avatar_color: string;
  /**
   * Nombre de usuario de Instagram, sin arroba. Opcional en el tipo porque la
   * columna la añade la migración 0005 y la app tiene que seguir funcionando
   * en una base que todavía no la tenga.
   */
  instagram?: string | null;
  /**
   * Ruta de la foto de perfil dentro del almacén, nunca una dirección. La
   * columna llega con la migración 0007; sin ella se sigue viendo el
   * emblema, que es el respaldo de siempre.
   */
  avatar_path?: string | null;
};

export type Group = {
  id: string;
  name: string;
  invite_code: string;
  created_by: string;
  starting_points: number;
  liquidity: number;
  drift: number;
  dispute_hours: number;
  min_stake: number;
};

export type Season = {
  group_id: string;
  number: number;
  starts_at: string;
  ends_at: string;
  closed_at: string | null;
};

export type MarketOption = {
  id: string;
  market_id: string;
  label: string;
  position: number;
  opening_odds: number;
  current_odds: number;
  pool: number;
};

export type Market = {
  id: string;
  group_id: string;
  season_number: number;
  creator_id: string;
  title: string;
  description: string | null;
  status: MarketStatus;
  closes_at: string;
  stakes_public: boolean;
  winning_option: string | null;
  result_note: string | null;
  result_set_at: string | null;
  dispute_until: string | null;
  resolved_at: string | null;
  cancel_reason: string | null;
  created_at: string;
};

export type Wager = {
  id: string;
  market_id: string;
  option_id: string;
  user_id: string;
  stake: number;
  locked_odds: number;
  to_win: number;
  status: WagerStatus;
  void_reason: string | null;
  created_at: string;
};

export type MarketWithOptions = Market & {
  market_options: MarketOption[];
  creator: Profile | null;
};

export type NotificationKind =
  | 'market_opened'
  | 'market_closed'
  | 'result_published'
  | 'dispute_opened'
  | 'wager_won'
  | 'wager_lost'
  | 'wager_voided'
  | 'market_cancelled'
  | 'season_rolled';

export type Notification = {
  id: number;
  group_id: string;
  user_id: string;
  kind: NotificationKind;
  market_id: string | null;
  title: string;
  body: string | null;
  amount: number | null;
  read_at: string | null;
  created_at: string;
};
