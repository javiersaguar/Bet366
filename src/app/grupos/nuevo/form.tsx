'use client';

import { useActionState, useState } from 'react';
import { CaretDown } from '@phosphor-icons/react/dist/csr/CaretDown';
import { createGroupAction } from '@/lib/actions';
import { Alert, SubmitButton } from '@/components/ui';

const ATAJOS_PUNTOS = [500, 1000, 5000];

/** Traduce el número del deslizador a algo que se entienda sin leer la ayuda. */
function describirDeriva(v: number): string {
  if (v === 0) return 'Las cuotas se quedan clavadas donde las pongas';
  if (v <= 0.35) return 'Se mueven poco: casi siempre pagas lo que viste';
  if (v <= 0.65) return 'Se mueven lo justo para que entrar tarde cueste algo';
  return 'Se mueven mucho: el dinero que entra cambia el precio deprisa';
}

/**
 * Crear un grupo.
 *
 * Dos campos arriba y el resto escondido. Los ajustes finos existen porque el
 * motor de cuotas los usa, pero nadie debería tener que tocarlos para montar
 * una porra entre amigos, así que van detrás de un desplegable.
 */
export function NewGroupForm() {
  const [state, action] = useActionState(createGroupAction, {});
  const [advanced, setAdvanced] = useState(false);
  const [drift, setDrift] = useState(0.5);
  const [starting, setStarting] = useState(1000);

  return (
    <form action={action} className="space-y-7">
      <div className="space-y-6">
        <div>
          <label className="label" htmlFor="name">
            Nombre del grupo
          </label>
          <input
            id="name"
            name="name"
            required
            maxLength={50}
            placeholder="Los de siempre"
            autoComplete="off"
            className="text-body-lg"
          />
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
            value={starting}
            onChange={(e) => setStarting(Number(e.target.value))}
            className="tnum text-body-lg"
          />
          <div className="mt-2.5 flex gap-2">
            {ATAJOS_PUNTOS.map((n) => (
              <button
                key={n}
                type="button"
                onClick={() => setStarting(n)}
                aria-pressed={starting === n}
                className={`tnum rounded-lg border px-2.5 py-1 text-caption font-semibold
                            transition-[transform,background-color,border-color,color] duration-press
                            ease-out active:scale-[0.97] ${
                              starting === n
                                ? 'border-brand/40 bg-brand/[.10] text-brand'
                                : 'border-line text-content-muted hover:border-line-strong hover:text-content'
                            }`}
              >
                {n.toLocaleString('es-ES')}
              </button>
            ))}
          </div>
          <p className="mt-2 text-caption leading-relaxed text-content-muted">
            Cada lunes se cierra el ranking de la semana y todo el mundo vuelve a esta cifra.
          </p>
        </div>
      </div>

      <div className="-mx-5 border-t border-line px-5 pt-6">
        <button
          type="button"
          onClick={() => setAdvanced((v) => !v)}
          aria-expanded={advanced}
          className="flex items-center gap-1.5 text-body font-semibold text-content-muted
                     transition-colors duration-press ease-out hover:text-content"
        >
          Ajustes finos
          <CaretDown
            size={14}
            weight="bold"
            className="transition-transform duration-pop ease-out"
            style={{ transform: advanced ? 'rotate(180deg)' : 'none' }}
          />
        </button>

        {advanced && (
          <div className="animate-rise mt-6 space-y-6">
            <div>
              <label className="label flex items-baseline justify-between" htmlFor="drift">
                Cuánto se mueven las cuotas
                <span className="tnum text-caption font-semibold text-brand">
                  {drift.toFixed(2).replace('.', ',')}
                </span>
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
                style={{ '--v': drift } as React.CSSProperties}
              />
              <p className="mt-2 text-caption leading-relaxed text-content-muted">
                {describirDeriva(drift)}. La cuota que te sale al apostar queda fijada: lo que se
                mueve es la que verán los siguientes.
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
                className="tnum"
              />
              <p className="mt-2 text-caption leading-relaxed text-content-muted">
                Cuanto más alto, más dinero hace falta para que una apuesta cambie el precio.
              </p>
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
                className="tnum"
              />
              <p className="mt-2 text-caption leading-relaxed text-content-muted">
                Si nadie dice nada en ese plazo, los puntos se reparten solos.
              </p>
            </div>
          </div>
        )}
      </div>

      {state.error && <Alert kind="error">{state.error}</Alert>}

      <SubmitButton className="btn-primary w-full" pending="Creando…">
        Crear grupo
      </SubmitButton>
    </form>
  );
}
