'use client';

import { useActionState, useState } from 'react';
import { SignOut } from '@phosphor-icons/react/dist/csr/SignOut';
import { Warning } from '@phosphor-icons/react/dist/csr/Warning';
import { leaveGroupAction } from '@/lib/actions';
import { Alert, SubmitButton } from '@/components/ui';

/**
 * Salir del grupo.
 *
 * Va detrás de dos toques a propósito: es lo único de la app que no se puede
 * deshacer solo (hay que volver a pedir el código). El primer toque cambia el
 * texto por lo que va a pasar de verdad, para que nadie confirme a ciegas.
 */
export function LeaveGroupForm({ groupId, groupName }: { groupId: string; groupName: string }) {
  const [state, action] = useActionState(leaveGroupAction, {});
  const [armado, setArmado] = useState(false);

  if (!armado) {
    return (
      <div className="space-y-3">
        <button
          type="button"
          onClick={() => setArmado(true)}
          className="btn-quiet w-full !text-content-faint hover:!text-lose"
        >
          <SignOut size={15} weight="bold" />
          Salir de «{groupName}»
        </button>
        {state.error && <Alert kind="error">{state.error}</Alert>}
      </div>
    );
  }

  return (
    <form action={action} className="animate-rise space-y-3">
      <input type="hidden" name="group_id" value={groupId} />

      <p className="flex gap-2.5 rounded-xl border border-lose/25 bg-lose/[.07] px-3.5 py-3 text-caption leading-relaxed text-content-muted">
        <Warning size={16} weight="fill" className="mt-0.5 shrink-0 text-lose" />
        <span>
          Dejarás de ver el tablón y el ranking de <b className="text-white">{groupName}</b>. Tus
          apuestas ya jugadas se quedan como están. Para volver a entrar necesitarás el código otra
          vez.
        </span>
      </p>

      {state.error && <Alert kind="error">{state.error}</Alert>}

      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => setArmado(false)}
          className="btn-ghost flex-1"
        >
          Mejor no
        </button>
        <SubmitButton className="btn-danger flex-1" pending="Saliendo…">
          Salir del grupo
        </SubmitButton>
      </div>
    </form>
  );
}
