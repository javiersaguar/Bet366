'use client';

import { useState } from 'react';
import { useToast } from '@/components/toast';

export function InviteCode({ code, groupName }: { code: string; groupName: string }) {
  const [copied, setCopied] = useState(false);
  const toast = useToast();

  async function share() {
    const text = `Entra en «${groupName}» en Bet366 con el código ${code}`;
    try {
      if (navigator.share) {
        await navigator.share({ title: 'Bet366', text });
        return;
      }
      await navigator.clipboard.writeText(code);
      setCopied(true);
      toast('Código copiado');
      setTimeout(() => setCopied(false), 1800);
    } catch {
      /* el usuario canceló el compartir: no hay nada que hacer */
    }
  }

  return (
    <section className="card flex flex-wrap items-center justify-between gap-3 overflow-hidden px-5 py-4">
      <div>
        <p className="text-sm font-semibold text-white">Que se apunte más gente</p>
        <p className="text-micro text-content-muted">Pásales este código</p>
      </div>
      <button
        onClick={share}
        className="num group relative overflow-hidden rounded-xl border border-line-strong bg-surface-sunken px-4 py-2.5 text-lg font-bold tracking-[0.28em] text-brand transition-[transform,border-color,color,background-color] duration-pop hover:border-brand/50 hover:shadow-glow-brand active:scale-[.97]"
      >
        <span className={copied ? 'opacity-0' : 'transition-opacity'}>{code}</span>
        {copied && (
          <span className="absolute inset-0 grid place-items-center text-sm tracking-normal">
            ¡copiado!
          </span>
        )}
      </button>
    </section>
  );
}
