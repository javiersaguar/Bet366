'use client';

import { useActionState, useMemo, useState } from 'react';
import { createMarketAction } from '@/lib/actions';
import { Alert, SubmitButton } from '@/components/ui';
import { computeCurrentOdds, impliedProbability } from '@/lib/engine/odds';

type Opt = { label: string; odds: string };

const PRESETS: { name: string; options: Opt[] }[] = [
  { name: 'Sí o no', options: [{ label: 'Sí', odds: '1.90' }, { label: 'No', odds: '1.90' }] },
  {
    name: 'Tres opciones',
    options: [
      { label: '', odds: '3.00' },
      { label: '', odds: '3.00' },
      { label: '', odds: '3.00' },
    ],
  },
];

function localInput(date: Date) {
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

export function NewMarketForm({
  groupId,
  seasonEndsAt,
}: {
  groupId: string;
  seasonEndsAt: string;
}) {
  const [state, action] = useActionState(createMarketAction, {});
  const [options, setOptions] = useState<Opt[]>(PRESETS[0].options);

  const seasonEnd = new Date(seasonEndsAt);
  const defaultClose = useMemo(() => {
    const d = new Date(Date.now() + 2 * 86_400_000);
    return localInput(d < seasonEnd ? d : new Date(seasonEnd.getTime() - 3_600_000));
  }, [seasonEndsAt]);

  const parsed = options
    .map((o) => Number(o.odds.replace(',', '.')))
    .map((n) => (Number.isFinite(n) && n >= 1.01 ? n : 0));
  const valid = parsed.every((n) => n > 0);
  const preview = valid
    ? computeCurrentOdds(parsed.map((openingOdds) => ({ openingOdds, pool: 0 })))
    : [];

  function update(i: number, patch: Partial<Opt>) {
    setOptions((prev) => prev.map((o, idx) => (idx === i ? { ...o, ...patch } : o)));
  }

  return (
    <form action={action} className="space-y-6">
      <input type="hidden" name="group_id" value={groupId} />

      <div className="card space-y-5 p-5">
        <div>
          <label className="label" htmlFor="title">
            La apuesta
          </label>
          <input
            id="title"
            name="title"
            required
            minLength={5}
            maxLength={140}
            placeholder="¿A que fulanito se lía con menganito?"
            className="w-full"
          />
        </div>

        <div>
          <label className="label" htmlFor="description">
            Letra pequeña <span className="normal-case tracking-normal text-content-faint">(opcional)</span>
          </label>
          <input
            id="description"
            name="description"
            maxLength={500}
            placeholder="Cuenta solo si pasa antes del domingo"
            className="w-full"
          />
          <p className="mt-1.5 text-xs text-content-muted">
            Cuanto más claro dejes qué cuenta y qué no, menos discusiones luego.
          </p>
        </div>

        <div>
          <label className="label" htmlFor="closes_at">
            Cierra el
          </label>
          <input
            id="closes_at"
            name="closes_at"
            type="datetime-local"
            required
            defaultValue={defaultClose}
            max={localInput(seasonEnd)}
            className="w-full"
          />
          <p className="mt-1.5 text-xs text-content-muted">
            A partir de esa hora ya no se puede apostar. Tiene que ser antes de que acabe la semana.
          </p>
        </div>
      </div>

      <div className="card space-y-4 p-5">
        <div className="flex items-center justify-between">
          <p className="label !mb-0">Opciones y cuotas</p>
          <div className="flex gap-1.5">
            {PRESETS.map((p) => (
              <button
                key={p.name}
                type="button"
                onClick={() => setOptions(p.options)}
                className="rounded-lg border border-line-strong px-2.5 py-1 text-micro font-semibold text-content-muted transition hover:border-brand/50 hover:text-brand"
              >
                {p.name}
              </button>
            ))}
          </div>
        </div>

        <ul className="space-y-2">
          {options.map((o, i) => (
            <li key={i} className="flex items-center gap-2">
              <input
                name="option_label"
                value={o.label}
                onChange={(e) => update(i, { label: e.target.value })}
                placeholder={`Opción ${i + 1}`}
                maxLength={60}
                className="min-w-0 flex-1"
              />
              <input
                name="option_odds"
                value={o.odds}
                onChange={(e) => update(i, { odds: e.target.value })}
                inputMode="decimal"
                placeholder="1.90"
                className="w-24 text-center font-mono"
              />
              {preview[i] > 0 && (
                <span
                  className="w-12 shrink-0 text-right text-xs text-content-muted"
                  title="Probabilidad que implica esa cuota"
                >
                  {Math.round(impliedProbability(preview[i], preview) * 100)}%
                </span>
              )}
              {options.length > 2 && (
                <button
                  type="button"
                  onClick={() => setOptions((prev) => prev.filter((_, idx) => idx !== i))}
                  className="shrink-0 px-1.5 text-content-muted transition hover:text-lose"
                  aria-label="Quitar opción"
                >
                  ✕
                </button>
              )}
            </li>
          ))}
        </ul>

        {options.length < 8 && (
          <button
            type="button"
            onClick={() => setOptions((prev) => [...prev, { label: '', odds: '3.00' }])}
            className="text-sm font-semibold text-content-muted transition hover:text-brand"
          >
            + Añadir opción
          </button>
        )}

        <p className="text-xs text-content-muted">
          Una cuota de 2,00 significa «lo veo al 50%»: quien acierte cobra el doble de lo que puso.
        </p>
      </div>

      <label className="card flex cursor-pointer items-start gap-3 p-5">
        <input
          type="checkbox"
          name="stakes_public"
          defaultChecked
          className="mt-0.5 h-5 w-5 shrink-0 accent-brand !p-0"
        />
        <span>
          <span className="block font-semibold text-white">Apostantes a la vista</span>
          <span className="block text-xs text-content-muted">
            Si lo desmarcas, nadie ve quién ha apostado ni cuánto: cada uno solo ve lo suyo (tú, como
            creador, sí lo ves todo para poder cazar apuestas raras).
          </span>
        </span>
      </label>

      {state.error && <Alert kind="error">{state.error}</Alert>}

      <SubmitButton className="btn-primary w-full" pending="Lanzando…">
        Lanzar apuesta
      </SubmitButton>
    </form>
  );
}
