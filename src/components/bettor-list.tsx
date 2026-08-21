'use client';

import { useActionState, useState } from 'react';
import type { MarketWithOptions, Profile, Wager } from '@/lib/types';
import { dateTime, odds as fmtOdds, points } from '@/lib/format';
import { voidWagerAction } from '@/lib/actions';
import { Alert, SectionTitle, SubmitButton, WagerBadge } from '@/components/ui';
import { Avatar } from '@/components/avatar';

export function BettorList({
  market,
  wagers,
  profilesById,
  meId,
  isCreator,
  groupId,
}: {
  market: MarketWithOptions;
  wagers: Wager[];
  profilesById: Record<string, Profile>;
  meId: string;
  isCreator: boolean;
  groupId: string;
}) {
  const canVoid = isCreator && !['resolved', 'cancelled'].includes(market.status);
  const labelOf = (id: string) =>
    market.market_options.find((o) => o.id === id)?.label ?? '—';

  if (wagers.length === 0) {
    return (
      <section>
        <SectionTitle>Apostantes</SectionTitle>
        <p className="card px-5 py-8 text-center text-sm text-content-faint">
          Todavía no ha entrado nadie.
        </p>
      </section>
    );
  }

  return (
    <section>
      <SectionTitle
        count={wagers.length}
        action={
          !market.stakes_public ? (
            <span className="chip border-line bg-surface-raised text-content-faint">
              {isCreator ? 'solo tú las ves' : 'solo ves las tuyas'}
            </span>
          ) : undefined
        }
      >
        Apostantes
      </SectionTitle>

      <ul className="card hairline overflow-hidden">
        {wagers.map((w) => {
          const who = profilesById[w.user_id];
          return (
            <li key={w.id} className="px-4 py-3">
              <div className="flex items-center gap-3">
                {who && <Avatar profile={who} size="sm" />}
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-content">
                    {w.user_id === meId ? 'Tú' : (who?.display_name ?? 'Alguien')}
                    <span className="font-normal text-content-muted"> · {labelOf(w.option_id)}</span>
                  </p>
                  <p className="num mt-0.5 text-2xs text-content-faint">
                    {points(w.stake)} pts a {fmtOdds(w.locked_odds)} →{' '}
                    <span className={w.status === 'won' ? 'text-brand' : ''}>{points(w.to_win)}</span>{' '}
                    · {dateTime(w.created_at)}
                  </p>
                  {w.void_reason && (
                    <p className="mt-1 text-2xs text-lose/80">Anulada: {w.void_reason}</p>
                  )}
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  <WagerBadge status={w.status} />
                  {canVoid && w.status === 'active' && <VoidButton wagerId={w.id} groupId={groupId} />}
                </div>
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

function VoidButton({ wagerId, groupId }: { wagerId: string; groupId: string }) {
  const [open, setOpen] = useState(false);
  const [state, action] = useActionState(voidWagerAction, {});

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        title="Anular esta apuesta por fraudulenta"
        className="rounded-lg border border-lose/30 px-2 py-1 text-2xs font-semibold text-lose transition hover:bg-lose/10"
      >
        Anular
      </button>
    );
  }

  return (
    <form action={action} className="animate-rise space-y-2">
      <input type="hidden" name="wager_id" value={wagerId} />
      <input type="hidden" name="group_id" value={groupId} />
      <input
        name="reason"
        required
        maxLength={200}
        placeholder="Motivo (lo verá todo el grupo)"
        className="w-56 !py-1.5 text-2xs"
      />
      {state.error && <Alert kind="error">{state.error}</Alert>}
      <div className="flex gap-2">
        <SubmitButton className="btn-danger !px-2.5 !py-1 text-2xs" pending="…">
          Confirmar
        </SubmitButton>
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="btn-ghost !px-2.5 !py-1 text-2xs"
        >
          Cancelar
        </button>
      </div>
    </form>
  );
}
