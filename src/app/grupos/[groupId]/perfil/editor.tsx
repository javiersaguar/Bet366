'use client';

import { useActionState, useEffect, useState } from 'react';
import type { Profile } from '@/lib/types';
import { updateProfileAction } from '@/lib/actions';
import { Alert, SubmitButton } from '@/components/ui';
import { AvatarPicker } from '@/components/avatar-picker';
import { resolveAvatar } from '@/components/avatar';
import { useToast } from '@/components/toast';

export function ProfileEditor({ me }: { me: Profile }) {
  const initial = resolveAvatar(me);
  const [state, action] = useActionState(updateProfileAction, {});
  const [name, setName] = useState(me.display_name);
  const [avatar, setAvatar] = useState({
    symbol: initial.symbol as string,
    color: me.avatar_color ?? 'mint',
  });
  const toast = useToast();

  useEffect(() => {
    if (state.ok) toast('Perfil guardado');
  }, [state, toast]);

  const dirty =
    name !== me.display_name ||
    avatar.symbol !== me.avatar_symbol ||
    avatar.color !== me.avatar_color;

  return (
    <form action={action} className="card space-y-6 p-5">
      <AvatarPicker
        userId={me.id}
        displayName={name}
        symbol={avatar.symbol}
        color={avatar.color}
        onChange={setAvatar}
      />

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
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
      </div>

      {state.error && <Alert kind="error">{state.error}</Alert>}

      <SubmitButton className="btn-primary w-full" pending="Guardando…" disabled={!dirty}>
        {dirty ? 'Guardar cambios' : 'Todo guardado'}
      </SubmitButton>
    </form>
  );
}
