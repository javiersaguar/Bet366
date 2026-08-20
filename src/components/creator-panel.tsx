'use client';

import { useActionState, useState } from 'react';
import type { MarketWithOptions, Wager } from '@/lib/types';
import { relative } from '@/lib/format';
import { cancelMarketAction, closeMarketAction, setResultAction } from '@/lib/actions';
import { Alert, SubmitButton } from '@/components/ui';

export function CreatorPanel({
  groupId,
  market,
  wagers,
}: {
  groupId: string;
  market: MarketWithOptions;
  wagers: Wager[];
}) {
  if (['resolved', 'cancelled'].includes(market.status)) return null;

  return (
    <section className="card border-brand/25 p-5">
      <h2 className="eyebrow !mb-1.5 !text-brand">
        Tú lanzaste esta apuesta
      </h2>
      <p className="mb-4 text-sm leading-relaxed text-content-muted">
        {market.status === 'open'
          ? 'Puedes cerrarla antes de tiempo, poner el resultado cuando cierre o anular apuestas que veas raras.'
          : market.status === 'closed'
            ? 'Ya está cerrada: dinos qué pasó y se reparten los puntos solos.'
            : 'Resultado publicado. Si nadie lo impugna, se paga al acabar el plazo.'}
      </p>

      <div className="space-y-4">
        {market.status === 'open' && <CloseForm groupId={groupId} marketId={market.id} />}
        {(market.status === 'closed' || market.status === 'pending') && (
          <ResultForm groupId={groupId} market={market} />
        )}
        <CancelForm groupId={groupId} marketId={market.id} hasBets={wagers.some((w) => w.status === 'active')} />
      </div>
    </section>
  );
}

function CloseForm({ groupId, marketId }: { groupId: string; marketId: string }) {
  const [state, action] = useActionState(closeMarketAction, {});
  return (
    <form action={action} className="space-y-2">
      <input type="hidden" name="market_id" value={marketId} />
      <input type="hidden" name="group_id" value={groupId} />
      {state.error && <Alert kind="error">{state.error}</Alert>}
      <SubmitButton className="btn-ghost" pending="Cerrando…">
        Cerrar ya (dejar de admitir apuestas)
      </SubmitButton>
    </form>
  );
}

function ResultForm({ groupId, market }: { groupId: string; market: MarketWithOptions }) {
  const [state, action] = useActionState(setResultAction, {});
  const [choice, setChoice] = useState<string>(market.winning_option ?? '');

  return (
    <form action={action} className="space-y-3 rounded-xl border border-line bg-surface-sunken p-4">
      <input type="hidden" name="market_id" value={market.id} />
      <input type="hidden" name="group_id" value={groupId} />

      <p className="label !mb-2">¿Qué pasó al final?</p>
      <div className="grid gap-2 sm:grid-cols-2">
        {market.market_options.map((o) => (
          <label
            key={o.id}
            className={`cursor-pointer rounded-xl border px-4 py-3 text-sm font-semibold transition ${
              choice === o.id
                ? 'border-brand bg-brand/[.08] text-brand'
                : 'border-line text-content-muted hover:border-line-strong'
            }`}
          >
            <input
              type="radio"
              name="option_id"
              value={o.id}
              checked={choice === o.id}
              onChange={() => setChoice(o.id)}
              className="sr-only"
            />
            {o.label}
          </label>
        ))}
      </div>

      <input name="note" maxLength={300} placeholder="Comentario (opcional)" className="w-full text-sm" />

      {state.error && <Alert kind="error">{state.error}</Alert>}

      <SubmitButton className="btn-primary w-full" pending="Publicando…" disabled={!choice}>
        {market.status === 'pending' ? 'Corregir resultado' : 'Publicar resultado'}
      </SubmitButton>

      <p className="text-center text-2xs text-content-faint">
        {market.status === 'pending' && market.dispute_until
          ? `Se paga ${relative(market.dispute_until)} si nadie lo impugna.`
          : 'Se abrirá un plazo para que el grupo lo impugne antes de repartir.'}
      </p>
    </form>
  );
}

function CancelForm({
  groupId,
  marketId,
  hasBets,
}: {
  groupId: string;
  marketId: string;
  hasBets: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [state, action] = useActionState(cancelMarketAction, {});

  if (!open) {
    return (
      <button type="button" onClick={() => setOpen(true)} className="btn-danger !py-2 text-xs">
        Anular la apuesta entera
      </button>
    );
  }

  return (
    <form action={action} className="animate-rise space-y-2 rounded-xl border border-lose/25 p-4">
      <input type="hidden" name="market_id" value={marketId} />
      <input type="hidden" name="group_id" value={groupId} />
      <p className="text-sm text-content-muted">
        {hasBets
          ? 'Se devuelven todos los puntos a quien haya apostado. No se puede deshacer.'
          : 'Nadie ha apostado todavía.'}
      </p>
      <input name="reason" required maxLength={200} placeholder="Motivo" className="w-full text-sm" />
      {state.error && <Alert kind="error">{state.error}</Alert>}
      <div className="flex gap-2">
        <SubmitButton className="btn-danger" pending="Anulando…">
          Sí, anular
        </SubmitButton>
        <button type="button" onClick={() => setOpen(false)} className="btn-ghost">
          Mejor no
        </button>
      </div>
    </form>
  );
}
