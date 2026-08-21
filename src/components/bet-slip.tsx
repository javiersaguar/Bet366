'use client';

import { useActionState, useEffect, useMemo, useState } from 'react';
import type { MarketWithOptions, Wager } from '@/lib/types';
import { odds as fmtOdds, points } from '@/lib/format';
import { maxNonArbitrageStake, checkStake } from '@/lib/engine/guard';
import { payoutFor } from '@/lib/engine/odds';
import { placeWagerAction } from '@/lib/actions';
import { Alert, SubmitButton } from '@/components/ui';
import { useToast } from '@/components/toast';
import { OddsFace } from '@/components/odds-button';
import { CountUp } from '@/components/count-up';

const QUICK = [10, 25, 50, 100, 250];

export function BetSlip({
  groupId,
  market,
  myWagers,
  balance,
  minStake,
  totalPool,
}: {
  groupId: string;
  market: MarketWithOptions;
  myWagers: Wager[];
  balance: number;
  minStake: number;
  totalPool: number;
}) {
  const [selected, setSelected] = useState<string | null>(null);
  const [stake, setStake] = useState('');
  const [saliendo, setSaliendo] = useState(false);
  const [state, action] = useActionState(placeWagerAction, {});
  const toast = useToast();

  /* Al confirmar, el boleto no desaparece de golpe: se va por donde entró y
     solo entonces se desmonta. Es el momento con más carga de la app y verlo
     salir es la mitad de la confirmación; la otra mitad es tu importe
     apareciendo en la opción de arriba. */
  useEffect(() => {
    if (state.ok) {
      toast('Apuesta puesta. Suerte.');
      setSaliendo(true);
    }
  }, [state, toast]);

  function alTerminarLaSalida(e: React.AnimationEvent<HTMLFormElement>) {
    if (!saliendo || e.target !== e.currentTarget) return;
    setSaliendo(false);
    setStake('');
    setSelected(null);
  }

  const option = market.market_options.find((o) => o.id === selected) ?? null;

  const guardCtx = useMemo(
    () => ({
      optionIds: market.market_options.map((o) => o.id),
      existing: myWagers.map((w) => ({
        optionId: w.option_id,
        stake: Number(w.stake),
        lockedOdds: Number(w.locked_odds),
      })),
    }),
    [market.market_options, myWagers],
  );

  const cap = option
    ? Math.min(balance, maxNonArbitrageStake(guardCtx, option.id, Number(option.current_odds)))
    : balance;

  const stakeNumber = Number(stake.replace(',', '.'));
  const valid = Number.isFinite(stakeNumber) && stakeNumber > 0;
  const check =
    option && valid
      ? checkStake(guardCtx, option.id, Number(option.current_odds), stakeNumber, balance, minStake)
      : null;
  const payout = option && valid ? payoutFor(stakeNumber, Number(option.current_odds)) : 0;
  const profit = payout - (valid ? stakeNumber : 0);

  return (
    <section className="space-y-3">
      <div className="stagger grid gap-2 sm:grid-cols-2">
        {market.market_options.map((o, i) => {
          const mineHere = myWagers.filter((w) => w.option_id === o.id);
          const totalMine = mineHere.reduce((a, w) => a + Number(w.stake), 0);
          return (
            <button
              key={o.id}
              type="button"
              onClick={() => setSelected(selected === o.id ? null : o.id)}
              style={{ '--i': i } as React.CSSProperties}
              className="block w-full text-left transition-transform duration-press ease-out
                         active:scale-[.985]"
              aria-pressed={selected === o.id}
            >
              <OddsFace
                option={o}
                share={totalPool > 0 ? (Number(o.pool) / totalPool) * 100 : 0}
                state={selected === o.id ? 'selected' : 'idle'}
                mine={
                  totalMine > 0
                    ? { stake: totalMine, lockedOdds: Number(mineHere[0].locked_odds) }
                    : undefined
                }
              />
            </button>
          );
        })}
      </div>

      {!option ? (
        <p className="py-2 text-center text-sm text-content-faint">
          Toca una opción para apostar.
        </p>
      ) : (
        <form
          action={action}
          onAnimationEnd={alTerminarLaSalida}
          className={`card space-y-4 p-5 ${saliendo ? 'slip-out' : 'animate-rise'}`}
        >
          <input type="hidden" name="market_id" value={market.id} />
          <input type="hidden" name="option_id" value={option.id} />
          <input type="hidden" name="group_id" value={groupId} />

          <header className="flex items-center justify-between gap-3 border-b border-line pb-3">
            <div className="min-w-0">
              <p className="field-label">Tu boleto</p>
              <p className="truncate font-semibold text-white">{option.label}</p>
            </div>
            <span className="odds shrink-0 rounded-lg border border-brand/40 bg-brand/10 px-3 py-1.5 text-lg text-brand">
              {fmtOdds(option.current_odds)}
            </span>
          </header>

          <div>
            <div className="flex items-baseline justify-between">
              <label className="label" htmlFor="stake">
                Cuánto pones
              </label>
              <span className="num text-micro text-content-faint">
                tienes {points(balance)} pts
              </span>
            </div>
            <input
              id="stake"
              name="stake"
              type="number"
              inputMode="decimal"
              min={minStake}
              step="1"
              required
              value={stake}
              onChange={(e) => setStake(e.target.value)}
              placeholder="0"
              className="num !py-3 text-3xl font-bold !tracking-tightest"
            />
            <div className="mt-2.5 flex flex-wrap gap-1.5">
              {QUICK.filter((q) => q <= cap).map((q) => (
                <Quick key={q} onClick={() => setStake(String(q))}>
                  {q}
                </Quick>
              ))}
              {Number.isFinite(cap) && cap >= minStake && (
                <Quick onClick={() => setStake(String(Math.floor(cap)))} accent>
                  máx
                </Quick>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 overflow-hidden rounded-xl border border-line bg-surface-sunken">
            <div className="border-r border-line px-4 py-3">
              <p className="field-label !mb-1">Ganancia</p>
              <CountUp
                value={profit}
                prefix={profit > 0 ? '+' : ''}
                className="text-lg font-bold text-content"
                duration={350}
              />
            </div>
            <div className="px-4 py-3">
              <p className="field-label !mb-1">Cobras</p>
              <CountUp value={payout} className="text-lg font-bold text-brand" duration={350} />
            </div>
          </div>

          {check && !check.ok && check.reason === 'arbitrage' && (
            <Alert kind="info">
              Con esa cantidad ganarías pase lo que pase, y eso no vale. Aquí puedes poner como mucho{' '}
              <strong className="num">{points(check.maxStake)}</strong> pts.
            </Alert>
          )}
          {check && !check.ok && check.reason === 'insufficient_balance' && (
            <Alert kind="error">No te llegan los puntos: tienes {points(balance)}.</Alert>
          )}
          {check && !check.ok && check.reason === 'invalid_stake' && (
            <Alert kind="error">La apuesta mínima es de {points(minStake)} pts.</Alert>
          )}
          {state.error && <Alert kind="error">{state.error}</Alert>}

          <SubmitButton
            className="btn-primary w-full !py-3"
            pending="Poniendo…"
            disabled={!check?.ok}
          >
            {valid ? `Apostar ${points(stakeNumber)} pts` : 'Apostar'}
          </SubmitButton>

          <p className="text-center text-micro leading-relaxed text-content-faint">
            La cuota se te queda bloqueada en {fmtOdds(option.current_odds)} aunque luego se mueva.
          </p>
        </form>
      )}
    </section>
  );
}

function Quick({
  children,
  onClick,
  accent,
}: {
  children: React.ReactNode;
  onClick: () => void;
  accent?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`num rounded-lg border px-3 py-1.5 text-micro font-semibold
                  transition-[transform,background-color,border-color,color] duration-press
                  ease-out active:scale-[0.94] ${
        accent
          ? 'border-brand/35 text-brand hover:bg-brand/10'
          : 'border-line-strong text-content-muted hover:border-content-faint hover:text-content'
      }`}
    >
      {children}
    </button>
  );
}
