import type { Profile } from '@/lib/types';
import { fallbackAvatar, isSymbol, paletteOf, type AvatarSymbol } from '@/lib/avatars';
import { SymbolGlyph } from '@/components/avatar-symbol';
import { esRutaDeAvatarDe, urlPublicaDeAvatar } from '@/lib/avatar-foto';
import { SUPABASE_URL } from '@/lib/supabase/config';

const SIZES = {
  xs: { box: 'h-6 w-6 rounded-[7px]', glyph: 'h-3 w-3', px: 24 },
  sm: { box: 'h-8 w-8 rounded-[9px]', glyph: 'h-4 w-4', px: 32 },
  md: { box: 'h-10 w-10 rounded-[11px]', glyph: 'h-5 w-5', px: 40 },
  lg: { box: 'h-14 w-14 rounded-2xl', glyph: 'h-7 w-7', px: 56 },
  xl: { box: 'h-24 w-24 rounded-3xl', glyph: 'h-11 w-11', px: 96 },
} as const;

export type AvatarLike = Pick<Profile, 'id'> &
  Partial<Pick<Profile, 'avatar_symbol' | 'avatar_color' | 'avatar_path'>>;

export function resolveAvatar(profile: AvatarLike) {
  const guess = fallbackAvatar(profile.id);
  const symbol: AvatarSymbol =
    profile.avatar_symbol && isSymbol(profile.avatar_symbol) ? profile.avatar_symbol : guess.symbol;
  return { symbol, palette: paletteOf(profile.avatar_color ?? guess.color) };
}

/**
 * La dirección de la foto de alguien, o nada si no tiene o si la ruta
 * guardada no es suya.
 *
 * Se comprueba también al leer, no solo al escribir. Es barato y quiere decir
 * que una fila con la ruta manipulada acaba enseñando el emblema de siempre
 * en vez de convertirse en una etiqueta `img` apuntando a cualquier sitio.
 */
export function fotoDeAvatar(profile: AvatarLike): string | null {
  if (!esRutaDeAvatarDe(profile.avatar_path, profile.id)) return null;
  return urlPublicaDeAvatar(SUPABASE_URL, profile.avatar_path);
}

/**
 * Emblema de una persona: su foto si la ha puesto y, si no, su símbolo sobre
 * un fondo tintado con su color.
 *
 * El símbolo no es un premio de consolación: es lo que se ve mientras la foto
 * carga y lo que queda si falla, y todo el mundo tiene uno desde el primer
 * día sin haber tocado nada. Va debajo de la foto, en la misma caja, así que
 * el hueco nunca parpadea en blanco.
 */
export function Avatar({
  profile,
  size = 'md',
  ring,
  className = '',
  alt,
}: {
  profile: AvatarLike;
  size?: keyof typeof SIZES;
  /** Aro de acento: para marcar "eres tú" o el primero del ranking. */
  ring?: 'brand' | 'gold';
  className?: string;
  /** Texto alternativo de la foto. Vacío si el nombre ya está al lado. */
  alt?: string;
}) {
  const { symbol, palette } = resolveAvatar(profile);
  const s = SIZES[size];
  const foto = fotoDeAvatar(profile);

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
      <SymbolGlyph symbol={symbol} className={`relative ${s.glyph}`} />

      {foto && (
        /* Sin `next/image` a propósito: son cuadrados de 512 que ya vienen
           recortados y comprimidos al subirlos, así que el optimizador no
           tiene nada que hacer y solo añadiría una configuración de dominios
           remotos que hay que acertar en cada despliegue. */
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={foto}
          alt={alt ?? ''}
          width={s.px}
          height={s.px}
          loading="lazy"
          decoding="async"
          className="absolute inset-0 h-full w-full object-cover"
        />
      )}

      {/* Brillo superior: le da aspecto de chapa en lugar de cuadrado plano. */}
      <span
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-1/2"
        style={{ background: 'linear-gradient(180deg, rgba(255,255,255,.11), transparent)' }}
      />
    </span>
  );
}
