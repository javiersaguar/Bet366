'use client';

import { useFormStatus } from 'react-dom';
import { Receipt } from '@phosphor-icons/react/dist/ssr';
import type { MarketStatus, WagerStatus } from '@/lib/types';

export function SubmitButton({
  children,
  pending: pendingLabel,
  className = 'btn-primary',
  disabled,
}: {
  children: React.ReactNode;
  pending?: string;
  className?: string;
  disabled?: boolean;
}) {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending || disabled} className={className}>
      {pending && (
        <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-current border-t-transparent opacity-70" />
      )}
      {pending ? (pendingLabel ?? 'Un momento…') : children}
    </button>
  );
}

export function Alert({
  kind,
  children,
}: {
  kind: 'error' | 'ok' | 'info';
  children: React.ReactNode;
}) {
  const styles = {
    error: 'border-lose/25 bg-lose/[.07] text-lose',
    ok: 'border-brand/25 bg-brand/[.07] text-brand',
    info: 'border-info/25 bg-info/[.07] text-info',
  }[kind];
  return (
    <p className={`animate-rise rounded-xl border px-3.5 py-2.5 text-sm leading-relaxed ${styles}`}>
      {children}
    </p>
  );
}

const MARKET_LABELS: Record<MarketStatus, { text: string; className: string }> = {
  open: { text: 'Abierta', className: 'border-brand/25 bg-brand/[.08] text-brand' },
  closed: { text: 'Sin resultado', className: 'border-gold/25 bg-gold/[.08] text-gold' },
  pending: { text: 'Impugnable', className: 'border-info/25 bg-info/[.08] text-info' },
  disputed: { text: 'En votación', className: 'border-vote/35 bg-vote/[.10] text-vote' },
  resolved: { text: 'Pagada', className: 'border-line bg-surface-raised text-content-muted' },
  cancelled: { text: 'Anulada', className: 'border-line bg-surface-raised text-content-faint' },
};

export function MarketBadge({ status }: { status: MarketStatus }) {
  const s = MARKET_LABELS[status];
  return <span className={`chip ${s.className}`}>{s.text}</span>;
}

const WAGER_LABELS: Record<WagerStatus, { text: string; className: string }> = {
  active: { text: 'En juego', className: 'border-info/25 bg-info/[.08] text-info' },
  won: { text: 'Ganada', className: 'border-brand/25 bg-brand/[.08] text-brand' },
  lost: { text: 'Perdida', className: 'border-line bg-surface-raised text-content-faint' },
  refunded: { text: 'Devuelta', className: 'border-line bg-surface-raised text-content-muted' },
  voided: { text: 'Anulada', className: 'border-lose/25 bg-lose/[.08] text-lose' },
};

export function WagerBadge({ status }: { status: WagerStatus }) {
  const s = WAGER_LABELS[status];
  return <span className={`chip ${s.className}`}>{s.text}</span>;
}

export function Empty({
  title,
  hint,
  action,
}: {
  title: string;
  hint?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="card grid place-items-center gap-3 px-6 py-16 text-center">
      <Receipt size={44} className="text-content-faint/45" />
      <div className="space-y-1">
        <p className="font-semibold text-white">{title}</p>
        {hint && <p className="mx-auto max-w-[28ch] text-sm leading-relaxed text-content-muted">{hint}</p>}
      </div>
      {action}
    </div>
  );
}

/** Botón en píldora para las cabeceras de sección. */
export function PillLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <a
      href={href}
      className="inline-flex items-center gap-1 rounded-full border border-line-strong px-3 py-1 text-micro font-semibold text-content-muted transition-[transform,border-color,color,background-color] duration-pop hover:border-brand/50 hover:text-brand"
    >
      {children}
    </a>
  );
}

/** Cabecera de sección con contador opcional. */
export function SectionTitle({
  children,
  count,
  action,
  tone = 'default',
}: {
  children: React.ReactNode;
  count?: number;
  action?: React.ReactNode;
  tone?: 'default' | 'warn';
}) {
  return (
    <div className="mb-3 flex items-center justify-between gap-3">
      <h2 className={`field-label flex items-center gap-2 ${tone === 'warn' ? '!text-gold' : ''}`}>
        {children}
        {count !== undefined && (
          <span
            className={`num rounded-md px-1.5 py-0.5 text-micro ${
              tone === 'warn' ? 'bg-gold/15 text-gold' : 'bg-surface-raised text-content-muted'
            }`}
          >
            {count}
          </span>
        )}
      </h2>
      {action}
    </div>
  );
}
