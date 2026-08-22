'use client';

import { useActionState, useEffect, useState } from 'react';
import { InstagramLogo } from '@phosphor-icons/react/dist/csr/InstagramLogo';
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
  const [ig, setIg] = useState(me.instagram ?? '');
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
    avatar.color !== me.avatar_color ||
    ig.trim() !== (me.instagram ?? '');

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

      <div>
        <label className="label" htmlFor="instagram">
          Tu Instagram
          <span className="ml-1.5 font-normal text-content-faint">opcional</span>
        </label>
        <div className="relative">
          <span className="pointer-events-none absolute inset-y-0 left-3.5 grid place-items-center text-content-faint">
            <InstagramLogo size={17} />
          </span>
          <input
            id="instagram"
            name="instagram"
            value={ig}
            onChange={(e) => setIg(e.target.value)}
            placeholder="tu_usuario"
            autoCapitalize="none"
            autoComplete="off"
            spellCheck={false}
            maxLength={80}
            className="!pl-10"
          />
        </div>
        <p className="mt-1.5 text-micro leading-relaxed text-content-faint">
          Sale junto a tu nombre en la ficha del grupo, y quien lo toque va directo a tu perfil.
          Vale pegar la dirección entera.
        </p>
      </div>

      {state.error && <Alert kind="error">{state.error}</Alert>}

      <SubmitButton className="btn-primary w-full" pending="Guardando…" disabled={!dirty}>
        {dirty ? 'Guardar cambios' : 'Todo guardado'}
      </SubmitButton>
    </form>
  );
}
