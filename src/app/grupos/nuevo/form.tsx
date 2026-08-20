'use client';

import { useActionState, useState } from 'react';
import { createGroupAction } from '@/lib/actions';
import { Alert, SubmitButton } from '@/components/ui';

export function NewGroupForm() {
  const [state, action] = useActionState(createGroupAction, {});
  const [advanced, setAdvanced] = useState(false);
  const [drift, setDrift] = useState(0.5);

  return (
    <form action={action} className="space-y-6">
      <div className="card space-y-5 p-5">
        <div>
          <label className="label" htmlFor="name">
            Nombre del grupo
          </label>
          <input id="name" name="name" required maxLength={50} placeholder="Los de siempre" className="w-full" />
        </div>

        <div>
          <label className="label" htmlFor="starting_points">
            Puntos con los que empieza cada uno
          </label>
          <input
            id="starting_points"
            name="starting_points"
            type="number"
            min={100}
            max={100000}
            step={100}
            defaultValue={1000}
            className="w-full"
          />
          <p className="mt-1.5 text-xs text-content-muted">
            Cada lunes se reparte el ranking de la semana y todo el mundo vuelve a esta cifra.
          </p>
        </div>
      </div>

      <button
        type="button"
        onClick={() => setAdvanced((v) => !v)}
        className="text-sm font-semibold text-content-muted hover:text-content"
      >
        {advanced ? '− Ocultar' : '+ Ajustes finos'}
      </button>

      {advanced && (
        <div className="card animate-rise space-y-5 p-5">
          <div>
            <label className="label" htmlFor="drift">
              Cuánto se mueven las cuotas · <span className="num text-brand">{drift.toFixed(2)}</span>
            </label>
            <input
              id="drift"
              name="drift"
              type="range"
              min={0}
              max={1}
              step={0.05}
              value={drift}
              onChange={(e) => setDrift(Number(e.target.value))}
              className="w-full accent-brand !border-0 !bg-transparent !p-0"
            />
            <p className="mt-1.5 text-xs text-content-muted">
              0 = las cuotas no se mueven nunca. 1 = el dinero que entra las mueve mucho.
              Recomendado 0,50: se notan pero sin locuras.
            </p>
          </div>

          <div>
            <label className="label" htmlFor="liquidity">
              Puntos que hacen falta para mover la cuota
            </label>
            <input
              id="liquidity"
              name="liquidity"
              type="number"
              min={1}
              max={100000}
              step={50}
              defaultValue={300}
              className="w-full"
            />
          </div>

          <div>
            <label className="label" htmlFor="dispute_hours">
              Horas para impugnar un resultado
            </label>
            <input
              id="dispute_hours"
              name="dispute_hours"
              type="number"
              min={1}
              max={168}
              defaultValue={24}
              className="w-full"
            />
            <p className="mt-1.5 text-xs text-content-muted">
              Si nadie dice nada en ese plazo, los puntos se reparten solos.
            </p>
          </div>
        </div>
      )}

      {state.error && <Alert kind="error">{state.error}</Alert>}
      <SubmitButton className="btn-primary w-full" pending="Creando…">
        Crear grupo
      </SubmitButton>
    </form>
  );
}
