'use client';

import { useState } from 'react';

export function InviteCode({ code }: { code: string }) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      setCopied(false);
    }
  }

  return (
    <section className="card flex flex-wrap items-center justify-between gap-3 px-5 py-4">
      <div>
        <p className="text-sm font-semibold text-white">Que se apunte más gente</p>
        <p className="text-xs text-content-muted">Pásales este código</p>
      </div>
      <button
        onClick={copy}
        className="num rounded-xl border border-line-strong bg-surface-sunken px-4 py-2.5 text-lg font-bold tracking-[0.25em] text-brand transition hover:border-brand/50"
      >
        {copied ? '¡copiado!' : code}
      </button>
    </section>
  );
}
