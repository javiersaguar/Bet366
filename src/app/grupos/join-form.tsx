'use client';

import { useActionState } from 'react';
import { joinGroupAction } from '@/lib/actions';
import { Alert, SubmitButton } from '@/components/ui';

export function JoinGroupForm() {
  const [state, action] = useActionState(joinGroupAction, {});

  return (
    <form action={action} className="card space-y-3 px-5 py-6">
      <div>
        <label className="label" htmlFor="code">
          Entrar con código
        </label>
        <input
          id="code"
          name="code"
          required
          maxLength={6}
          placeholder="A1B2C3"
          autoCapitalize="characters"
          className="w-full num uppercase tracking-[0.3em]"
        />
      </div>
      {state.error && <Alert kind="error">{state.error}</Alert>}
      <SubmitButton className="btn-ghost w-full" pending="Entrando…">
        Unirme
      </SubmitButton>
    </form>
  );
}
