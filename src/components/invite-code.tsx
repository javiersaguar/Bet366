'use client';

import { useState } from 'react';
import { Check } from '@phosphor-icons/react/dist/csr/Check';
import { ShareNetwork } from '@phosphor-icons/react/dist/csr/ShareNetwork';
import { useToast } from '@/components/toast';

/**
 * Invitar a alguien.
 *
 * Antes solo se compartían seis caracteres, que el otro tenía que teclear a
 * mano en la pantalla correcta. Ahora se manda un enlace que abre la app con
 * el código ya puesto; el código sigue a la vista porque en persona sigue
 * siendo más rápido decirlo que mandar nada.
 */
export function InviteCode({ code, groupName }: { code: string; groupName: string }) {
  const [copiado, setCopiado] = useState<'enlace' | 'codigo' | null>(null);
  const toast = useToast();

  const enlace = () =>
    typeof window === 'undefined' ? '' : `${window.location.origin}/grupos?codigo=${code}`;

  async function compartir() {
    const text = `Entra en «${groupName}» en Bet366`;
    try {
      if (navigator.share) {
        await navigator.share({ title: 'Bet366', text, url: enlace() });
        return;
      }
      await navigator.clipboard.writeText(`${text}: ${enlace()}`);
      avisar('enlace', 'Enlace copiado');
    } catch {
      /* el usuario canceló el compartir: no hay nada que hacer */
    }
  }

  async function copiarCodigo() {
    try {
      await navigator.clipboard.writeText(code);
      avisar('codigo', 'Código copiado');
    } catch {
      /* sin portapapeles: el código está a la vista igualmente */
    }
  }

  function avisar(cual: 'enlace' | 'codigo', mensaje: string) {
    setCopiado(cual);
    toast(mensaje);
    setTimeout(() => setCopiado(null), 1800);
  }

  return (
    <section className="border-t border-line pt-5">
      <p className="text-body font-medium text-white">Que se apunte más gente</p>
      <p className="text-caption text-content-faint">
        Mándales el enlace y entran con un toque, o dictales el código
      </p>

      <div className="mt-3.5 flex flex-wrap items-center gap-2">
        <button onClick={compartir} className="btn-primary flex-1">
          {copiado === 'enlace' ? (
            <Check size={16} weight="bold" />
          ) : (
            <ShareNetwork size={16} weight="bold" />
          )}
          {copiado === 'enlace' ? 'Copiado' : 'Mandar invitación'}
        </button>

        <button
          onClick={copiarCodigo}
          title="Copiar solo el código"
          className="tnum group relative shrink-0 overflow-hidden rounded-xl border border-line-strong
                     bg-surface-sunken px-4 py-2.5 text-body-lg font-bold tracking-[0.28em] text-brand
                     transition-[transform,border-color,box-shadow] duration-pop ease-out
                     hover:border-brand/50 hover:shadow-glow-brand active:scale-[.97]"
        >
          <span className={copiado === 'codigo' ? 'opacity-0' : 'transition-opacity'}>{code}</span>
          {copiado === 'codigo' && (
            <span className="absolute inset-0 grid place-items-center tracking-normal">
              <Check size={18} weight="bold" />
            </span>
          )}
        </button>

      </div>
    </section>
  );
}
