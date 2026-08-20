'use client';

import { useActionState } from 'react';
import type { Profile } from '@/lib/types';
import { updateProfileAction, signOutAction } from '@/lib/actions';
import { Alert, SubmitButton } from '@/components/ui';

const EMOJIS = ['🎲', '🍺', '🔥', '🐐', '🦅', '🥷', '🤡', '👑', '🦍', '🌊', '⚡', '🍀', '🎯', '💀', '🧠', '🚀'];

export function ProfileForm({ me }: { me: Profile }) {
  const [state, action] = useActionState(updateProfileAction, {});

  return (
    <form action={action} className="card space-y-4 p-5">
      <div>
        <label className="label" htmlFor="display_name">
          Cómo te ven los demás
        </label>
        <input
          id="display_name"
          name="display_name"
          required
          minLength={2}
          maxLength={40}
          defaultValue={me.display_name}
          className="w-full"
        />
      </div>

      <fieldset>
        <legend className="label">Tu icono</legend>
        <div className="flex flex-wrap gap-1.5">
          {EMOJIS.map((e) => (
            <label
              key={e}
              className="cursor-pointer rounded-xl border border-line px-2.5 py-1.5 text-lg transition-all duration-200 ease-snap hover:-translate-y-0.5 hover:border-brand/50 has-[:checked]:border-brand has-[:checked]:bg-brand/[.08] has-[:checked]:shadow-glow-brand"
            >
              <input
                type="radio"
                name="avatar_emoji"
                value={e}
                defaultChecked={me.avatar_emoji === e}
                className="sr-only"
              />
              {e}
            </label>
          ))}
        </div>
      </fieldset>

      {state.error && <Alert kind="error">{state.error}</Alert>}
      {state.ok && <Alert kind="ok">Guardado.</Alert>}

      <div className="flex items-center justify-between gap-3">
        <SubmitButton className="btn-primary" pending="Guardando…">
          Guardar
        </SubmitButton>
        <button
          formAction={signOutAction}
          className="text-sm font-semibold text-content-muted hover:text-lose"
        >
          Cerrar sesión
        </button>
      </div>
    </form>
  );
}
