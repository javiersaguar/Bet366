/**
 * Sistema de avatares.
 *
 * En vez de emojis (que se ven distintos en cada móvil y dan aspecto de
 * prototipo) cada persona lleva un emblema vectorial: un símbolo sobre un
 * fondo de color. Doce símbolos por ocho colores dan 96 combinaciones, que
 * sobran para cualquier grupo de amigos.
 */

export const AVATAR_SYMBOLS = [
  'bolt',
  'crown',
  'flame',
  'star',
  'target',
  'diamond',
  'shield',
  'wave',
  'peak',
  'spade',
  'horseshoe',
  'orbit',
] as const;

export type AvatarSymbol = (typeof AVATAR_SYMBOLS)[number];

export const AVATAR_COLORS = [
  'mint',
  'gold',
  'sky',
  'violet',
  'rose',
  'cyan',
  'amber',
  'lime',
] as const;

export type AvatarColor = (typeof AVATAR_COLORS)[number];

type Palette = { bright: string; deep: string; tint: string };

export const AVATAR_PALETTES: Record<AvatarColor, Palette> = {
  mint: { bright: '#2BE08C', deep: '#0E7A4A', tint: '#0C2A1D' },
  gold: { bright: '#F5C24B', deep: '#9C7415', tint: '#2C2410' },
  sky: { bright: '#5AA9FF', deep: '#1E5DB8', tint: '#0F1D33' },
  violet: { bright: '#A78BFA', deep: '#6234D4', tint: '#1C1533' },
  rose: { bright: '#FF7D9B', deep: '#C22E56', tint: '#301118' },
  cyan: { bright: '#3FDCE0', deep: '#0E8F9B', tint: '#0B2A2D' },
  amber: { bright: '#FF9F45', deep: '#C25E12', tint: '#301B0D' },
  lime: { bright: '#B6F04A', deep: '#6F9E15', tint: '#1D2A0C' },
};

export function paletteOf(color: string): Palette {
  return AVATAR_PALETTES[color as AvatarColor] ?? AVATAR_PALETTES.mint;
}

export function isSymbol(value: string): value is AvatarSymbol {
  return (AVATAR_SYMBOLS as readonly string[]).includes(value);
}

/** Reparto estable a partir del id, para quien todavía no ha elegido. */
export function fallbackAvatar(id: string): { symbol: AvatarSymbol; color: AvatarColor } {
  let h = 0;
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) >>> 0;
  return {
    symbol: AVATAR_SYMBOLS[h % AVATAR_SYMBOLS.length],
    color: AVATAR_COLORS[(h >> 5) % AVATAR_COLORS.length],
  };
}

/** Nombres en castellano, para el selector de perfil. */
export const SYMBOL_LABELS: Record<AvatarSymbol, string> = {
  bolt: 'Rayo',
  crown: 'Corona',
  flame: 'Llama',
  star: 'Estrella',
  target: 'Diana',
  diamond: 'Diamante',
  shield: 'Escudo',
  wave: 'Ola',
  peak: 'Cumbre',
  spade: 'Pica',
  horseshoe: 'Herradura',
  orbit: 'Órbita',
};
