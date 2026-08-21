'use client';

import { useActionState, useState } from 'react';
import { joinGroupAction } from '@/lib/actions';
import { Alert, SubmitButton } from '@/components/ui';

const LARGO = 6;

/**
 * Entrar con código.
 *
 * El campo y el botón van en la misma línea porque es una sola frase: pego el
 * código y entro. El botón solo se activa cuando el código está completo, así
 * que no hace falta explicar el formato en un mensaje de error.
 *
 * Si se llega desde un enlace de invitación el código ya viene puesto y solo
 * queda pulsar.
 */
export function JoinGroupForm({ inicial = '' }: { inicial?: string }) {
  const [state, action] = useActionState(joinGroupAction, {});
  const [code, setCode] = useState(inicial);

  return (
    <form action={action} className="space-y-3">
      <div className="flex gap-2">
        <div className="relative flex-1">
          <label className="sr-only" htmlFor="code">
            Código del grupo
          </label>
          <input
            id="code"
            name="code"
            required
            maxLength={LARGO}
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, ''))}
            placeholder="A1B2C3"
            autoCapitalize="characters"
            autoComplete="off"
            spellCheck={false}
            autoFocus={inicial.length === LARGO}
            inputMode="text"
            className="tnum w-full pr-12 text-body-lg uppercase tracking-[0.32em]"
          />
          <span className="tnum pointer-events-none absolute inset-y-0 right-3.5 grid place-items-center text-micro text-content-faint">
            {code.length}/{LARGO}
          </span>
        </div>
        <SubmitButton
          className="btn-primary shrink-0"
          pending="Entrando…"
          disabled={code.length < LARGO}
        >
          Unirme
        </SubmitButton>
      </div>
      {state.error && <Alert kind="error">{state.error}</Alert>}
    </form>
  );
}
