import type { Profile } from '@/lib/types';
import { fallbackAvatar, isSymbol, paletteOf, type AvatarSymbol } from '@/lib/avatars';
import { SymbolGlyph } from '@/components/avatar-symbol';

const SIZES = {
  xs: { box: 'h-6 w-6 rounded-[7px]', glyph: 'h-3 w-3' },
  sm: { box: 'h-8 w-8 rounded-[9px]', glyph: 'h-4 w-4' },
  md: { box: 'h-10 w-10 rounded-[11px]', glyph: 'h-5 w-5' },
  lg: { box: 'h-14 w-14 rounded-2xl', glyph: 'h-7 w-7' },
  xl: { box: 'h-24 w-24 rounded-3xl', glyph: 'h-11 w-11' },
} as const;

export type AvatarLike = Pick<Profile, 'id'> &
  Partial<Pick<Profile, 'avatar_symbol' | 'avatar_color'>>;

export function resolveAvatar(profile: AvatarLike) {
  const guess = fallbackAvatar(profile.id);
  const symbol: AvatarSymbol =
    profile.avatar_symbol && isSymbol(profile.avatar_symbol) ? profile.avatar_symbol : guess.symbol;
  return { symbol, palette: paletteOf(profile.avatar_color ?? guess.color) };
}

/**
 * Emblema de una persona: su símbolo sobre un fondo tintado con su color.
 * Todo vectorial, así que se ve igual en cualquier móvil, a diferencia de los
 * emojis, que cambian de aspecto según el sistema.
 */
export function Avatar({
  profile,
  size = 'md',
  ring,
  className = '',
}: {
  profile: AvatarLike;
  size?: keyof typeof SIZES;
  /** Aro de acento: para marcar "eres tú" o el primero del ranking. */
  ring?: 'brand' | 'gold';
  className?: string;
}) {
  const { symbol, palette } = resolveAvatar(profile);
  const s = SIZES[size];

  return (
    <span
      className={`relative grid shrink-0 place-items-center overflow-hidden border ${s.box} ${
        ring === 'brand'
          ? 'border-brand/50 shadow-[0_0_0_3px_rgba(43,224,140,.13)]'
          : ring === 'gold'
            ? 'border-gold/50 shadow-[0_0_0_3px_rgba(245,194,75,.13)]'
            : 'border-white/10'
      } ${className}`}
      style={{
        color: palette.bright,
        background: `radial-gradient(125% 125% at 28% 16%, ${palette.deep}66, ${palette.tint} 64%)`,
      }}
    >
      {/* Brillo superior: le da aspecto de chapa en lugar de cuadrado plano. */}
      <span
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-1/2"
        style={{ background: 'linear-gradient(180deg, rgba(255,255,255,.11), transparent)' }}
      />
      <SymbolGlyph symbol={symbol} className={`relative ${s.glyph}`} />
    </span>
  );
}
