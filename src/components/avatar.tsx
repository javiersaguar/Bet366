import type { Profile } from '@/lib/types';

/**
 * El emoji del perfil sobre un halo de color propio de cada persona.
 * El tono sale del id, así que es estable y no hay que guardarlo en la base.
 */
function hue(id: string): number {
  let h = 0;
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) % 360;
  return h;
}

const SIZES = {
  sm: 'h-7 w-7 text-sm',
  md: 'h-9 w-9 text-base',
  lg: 'h-12 w-12 text-xl',
} as const;

export function Avatar({
  profile,
  size = 'md',
  ring,
}: {
  profile: Pick<Profile, 'id' | 'avatar_emoji'>;
  size?: keyof typeof SIZES;
  /** Aro de acento, para marcar "eres tú" o el primero del ranking. */
  ring?: 'brand' | 'gold';
}) {
  const h = hue(profile.id);
  return (
    <span
      className={`relative grid shrink-0 place-items-center rounded-full border leading-none ${SIZES[size]} ${
        ring === 'brand'
          ? 'border-brand/50 shadow-[0_0_0_3px_rgba(43,224,140,.12)]'
          : ring === 'gold'
            ? 'border-gold/50 shadow-[0_0_0_3px_rgba(245,194,75,.12)]'
            : 'border-line'
      }`}
      style={{
        background: `radial-gradient(circle at 30% 25%, hsl(${h} 70% 22%), hsl(${h} 60% 11%))`,
      }}
    >
      {profile.avatar_emoji}
    </span>
  );
}
