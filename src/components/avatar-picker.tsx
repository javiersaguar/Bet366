'use client';

import { useState } from 'react';
import { CaretDown } from '@phosphor-icons/react/dist/csr/CaretDown';
import { AVATAR_COLORS, AVATAR_SYMBOLS, SYMBOL_LABELS, paletteOf } from '@/lib/avatars';
import { SymbolGlyph } from '@/components/avatar-symbol';
import { Avatar } from '@/components/avatar';

/**
 * Cómo te ven: la foto si la has puesto y, debajo, el emblema.
 *
 * El emblema no desaparece al poner una foto. Es lo que se ve mientras la
 * foto carga, lo que queda si la quitas y lo que tiene todo el mundo desde el
 * primer día sin tocar nada, así que sigue mereciendo su sitio; eso sí, si ya
 * hay foto se recoge detrás de un desplegable para no dar la turra.
 */
export function AvatarPicker({
  userId,
  displayName,
  symbol,
  color,
  fotoPath = null,
  foto,
  onChange,
}: {
  userId: string;
  displayName: string;
  symbol: string;
  color: string;
  /** Ruta de la foto guardada, para pintar la vista previa de verdad. */
  fotoPath?: string | null;
  /** Los botones de poner y quitar la foto. Llegan de fuera porque llevan
      sus propias acciones de servidor. */
  foto?: React.ReactNode;
  onChange: (next: { symbol: string; color: string }) => void;
}) {
  const palette = paletteOf(color);
  const conFoto = Boolean(fotoPath);
  const [verEmblema, setVerEmblema] = useState(!conFoto);

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-4">
        <Avatar
          profile={{
            id: userId,
            avatar_symbol: symbol,
            avatar_color: color,
            avatar_path: fotoPath,
          }}
          size="xl"
          className="transition-transform duration-300 ease-out"
        />
        <div className="min-w-0">
          <p className="truncate text-lg font-bold text-white">{displayName || 'Sin nombre'}</p>
          <p className="text-sm text-content-muted">
            {conFoto
              ? 'Tu foto'
              : (SYMBOL_LABELS[symbol as keyof typeof SYMBOL_LABELS] ?? 'Emblema')}
          </p>
        </div>
      </div>

      {foto}

      {conFoto && (
        <button
          type="button"
          onClick={() => setVerEmblema((v) => !v)}
          aria-expanded={verEmblema}
          className="flex items-center gap-1.5 text-caption font-semibold text-content-muted
                     transition-colors duration-press ease-out hover:text-content"
        >
          Tu emblema
          <span className="font-normal text-content-faint">se ve si quitas la foto</span>
          <CaretDown
            size={13}
            weight="bold"
            className="transition-transform duration-pop ease-out"
            style={{ transform: verEmblema ? 'rotate(180deg)' : 'none' }}
          />
        </button>
      )}

      <div hidden={!verEmblema} className="space-y-5">
      <div>
        <p className="label">Color</p>
        <div className="flex flex-wrap gap-2">
          {AVATAR_COLORS.map((c) => {
            const p = paletteOf(c);
            const active = c === color;
            return (
              <button
                key={c}
                type="button"
                onClick={() => onChange({ symbol, color: c })}
                aria-label={c}
                aria-pressed={active}
                className={`h-8 w-8 rounded-full border-2 transition-[transform,border-color,color,background-color] duration-pop ease-out ${
                  active ? 'scale-110' : 'border-transparent hover:scale-105'
                }`}
                style={{
                  background: `linear-gradient(150deg, ${p.bright}, ${p.deep})`,
                  borderColor: active ? p.bright : 'transparent',
                  boxShadow: active ? `0 0 0 3px ${p.bright}25` : undefined,
                }}
              />
            );
          })}
        </div>
      </div>

      <div>
        <p className="label">Emblema</p>
        <div className="grid grid-cols-6 gap-2">
          {AVATAR_SYMBOLS.map((sym) => {
            const active = sym === symbol;
            return (
              <button
                key={sym}
                type="button"
                onClick={() => onChange({ symbol: sym, color })}
                title={SYMBOL_LABELS[sym]}
                aria-label={SYMBOL_LABELS[sym]}
                aria-pressed={active}
                className={`grid aspect-square place-items-center rounded-xl border transition-[transform,border-color,color,background-color] duration-pop ease-out ${
                  active
                    ? 'scale-[1.06] border-transparent'
                    : 'border-line bg-surface-sunken hover:-translate-y-0.5 hover:border-line-strong'
                }`}
                style={
                  active
                    ? {
                        color: palette.bright,
                        background: `radial-gradient(125% 125% at 28% 16%, ${palette.deep}66, ${palette.tint} 64%)`,
                        borderColor: palette.bright,
                        boxShadow: `0 0 0 3px ${palette.bright}22`,
                      }
                    : { color: 'var(--glyph-idle)' }
                }
              >
                <SymbolGlyph symbol={sym} className="h-5 w-5 transition-colors duration-200" />
              </button>
            );
          })}
        </div>
      </div>
      </div>
    </div>
  );
}

/** Estado del selector, para usarlo desde un formulario. */
export function useAvatarSelection(initialSymbol: string, initialColor: string) {
  const [value, setValue] = useState({ symbol: initialSymbol, color: initialColor });
  return { value, setValue };
}
