'use client';

import { useActionState, useState } from 'react';
import type { MarketWithOptions, Profile, Wager } from '@/lib/types';
import { relative } from '@/lib/format';
import { castVoteAction, openDisputeAction } from '@/lib/actions';
import { Alert, SubmitButton } from '@/components/ui';
import { DeadlineRing } from '@/components/countdown';

type Dispute = {
  market_id: string;
  opened_by: string;
  reason: string;
  opened_at: string;
  closes_at: string;
} | null;
type Vote = { market_id: string; user_id: string; option_id: string | null };

export function DisputePanel({
  groupId,
  market,
  dispute,
  votes,
  myWagers,
  me,
  profilesById,
  memberCount,
}: {
  groupId: string;
  market: MarketWithOptions;
  dispute: Dispute;
  votes: Vote[];
  myWagers: Wager[];
  me: Profile;
  profilesById: Record<string, Profile>;
  memberCount: number;
}) {
  const declared = market.market_options.find((o) => o.id === market.winning_option);
  const hasSkin = myWagers.length > 0;

  if (market.status === 'pending') {
    return (
      <section className="card animate-rise flex gap-4 border-info/25 p-5">
        {market.result_set_at && market.dispute_until && (
          <DeadlineRing from={market.result_set_at} to={market.dispute_until} />
        )}
        <div className="min-w-0 flex-1">
        <h2 className="eyebrow !text-info">
          Plazo para impugnar
        </h2>
        <p className="mt-1 text-sm leading-relaxed text-content-muted">
          El creador dice que ganó <strong className="text-white">{declared?.label}</strong>. Si nadie
          lo discute, los puntos se reparten{' '}
          {market.dispute_until ? relative(market.dispute_until) : 'en breve'}.
        </p>
        {hasSkin ? (
          <DisputeForm groupId={groupId} marketId={market.id} />
        ) : (
          <p className="mt-3 text-2xs text-content-faint">
            Solo puede impugnar quien tenga puntos en juego.
          </p>
        )}
        </div>
      </section>
    );
  }

  // --- en votación ---
  const tally = new Map<string, number>();
  let voidVotes = 0;
  for (const v of votes) {
    if (v.option_id === null) voidVotes += 1;
    else tally.set(v.option_id, (tally.get(v.option_id) ?? 0) + 1);
  }
  const myVote = votes.find((v) => v.user_id === me.id);

  return (
    <section className="card animate-rise border-vote/25 p-5">
      <div className="flex gap-4">
        {dispute && <DeadlineRing from={dispute.opened_at} to={dispute.closes_at} tone="vote" />}
        <div className="min-w-0 flex-1">
      <h2 className="eyebrow !text-vote">
        Lo decide el grupo
      </h2>
      {dispute && (
        <p className="mt-1 text-sm leading-relaxed text-content-muted">
          <strong className="text-white">
            {profilesById[dispute.opened_by]?.display_name ?? 'Alguien'}
          </strong>{' '}
          lo impugnó: «{dispute.reason}». La votación acaba {relative(dispute.closes_at)}.
        </p>
      )}

      <VoteForm
        groupId={groupId}
        market={market}
        tally={tally}
        voidVotes={voidVotes}
        myVoteOption={myVote ? (myVote.option_id ?? 'void') : null}
        totalVotes={votes.length}
        memberCount={memberCount}
      />
        </div>
      </div>
    </section>
  );
}

function DisputeForm({ groupId, marketId }: { groupId: string; marketId: string }) {
  const [open, setOpen] = useState(false);
  const [state, action] = useActionState(openDisputeAction, {});

  if (!open) {
    return (
      <button type="button" onClick={() => setOpen(true)} className="btn-ghost mt-3 !py-2 text-xs">
        Eso no fue así
      </button>
    );
  }

  return (
    <form action={action} className="animate-rise mt-3 space-y-2">
      <input type="hidden" name="market_id" value={marketId} />
      <input type="hidden" name="group_id" value={groupId} />
      <input
        name="reason"
        required
        minLength={3}
        maxLength={300}
        placeholder="¿Qué pasó de verdad?"
        className="w-full text-sm"
      />
      {state.error && <Alert kind="error">{state.error}</Alert>}
      <div className="flex gap-2">
        <SubmitButton className="btn-primary !py-2 text-xs" pending="Enviando…">
          Impugnar y que vote el grupo
        </SubmitButton>
        <button type="button" onClick={() => setOpen(false)} className="btn-ghost !py-2 text-xs">
          Déjalo
        </button>
      </div>
    </form>
  );
}

function VoteForm({
  groupId,
  market,
  tally,
  voidVotes,
  myVoteOption,
  totalVotes,
  memberCount,
}: {
  groupId: string;
  market: MarketWithOptions;
  tally: Map<string, number>;
  voidVotes: number;
  myVoteOption: string | null;
  totalVotes: number;
  memberCount: number;
}) {
  const [state, action] = useActionState(castVoteAction, {});
  const choices = [
    ...market.market_options.map((o) => ({ value: o.id, label: o.label, count: tally.get(o.id) ?? 0 })),
    { value: 'void', label: 'Anular y devolver los puntos', count: voidVotes },
  ];

  return (
    <form action={action} className="mt-4 space-y-3">
      <input type="hidden" name="market_id" value={market.id} />
      <input type="hidden" name="group_id" value={groupId} />

      <div className="space-y-2">
        {choices.map((c) => {
          const pct = totalVotes > 0 ? (c.count / totalVotes) * 100 : 0;
          const mine = myVoteOption === c.value;
          return (
            <button
              key={c.value}
              type="submit"
              name="option_id"
              value={c.value}
              className={`relative block w-full overflow-hidden rounded-xl border px-4 py-3 text-left transition-all duration-200 ease-smooth active:scale-[.985] ${
                mine
                  ? 'border-vote/60 bg-vote/10 shadow-glow-vote'
                  : 'border-line hover:border-line-strong hover:bg-surface-raised/50'
              }`}
            >
              <span
                className="absolute inset-y-0 left-0 bg-vote/[.14] transition-[width] duration-700 ease-smooth"
                style={{ width: `${pct}%` }}
              />
              <span className="relative flex items-center justify-between gap-3">
                <span className={`text-sm font-semibold ${mine ? 'text-vote' : 'text-content'}`}>
                  {mine && '✓ '}
                  {c.label}
                </span>
                <span className="num text-xs text-content-muted">
                  {c.count} {c.count === 1 ? 'voto' : 'votos'}
                </span>
              </span>
            </button>
          );
        })}
      </div>

      {state.error && <Alert kind="error">{state.error}</Alert>}

      <p className="text-2xs text-content-faint">
        Han votado {totalVotes} de {memberCount}. Gana la mayoría; si hay empate se devuelven los
        puntos. Puedes cambiar tu voto hasta que acabe el plazo.
      </p>
    </form>
  );
}
