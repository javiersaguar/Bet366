'use client';

import Link from 'next/link';
import { useActionState, useEffect, useState } from 'react';
import type { Profile } from '@/lib/types';
import { updateProfileAction } from '@/lib/actions';
import { Alert, SubmitButton } from '@/components/ui';
import { AvatarPicker } from '@/components/avatar-picker';
import { resolveAvatar } from '@/components/avatar';
import { ConectarInstagram } from '@/components/conectar-instagram';
import { FotoDePerfil } from '@/components/foto-perfil';
import { useToast } from '@/components/toast';

export function ProfileEditor({ me, demo = false }: { me: Profile; demo?: boolean }) {
  const tieneFoto = Boolean(me.avatar_path);
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
    <div className="card space-y-6 p-5">
      {/* La foto se guarda sola, en cuanto la encuadras: no tiene sentido
          hacerla esperar al botón de abajo, que es de otras cosas. Por eso va
          fuera del formulario, y no dentro: un formulario no puede llevar
          otro dentro. */}
      <AvatarPicker
        userId={me.id}
        displayName={name}
        symbol={avatar.symbol}
        color={avatar.color}
        fotoPath={me.avatar_path ?? null}
        onChange={setAvatar}
        foto={<FotoDePerfil tieneFoto={tieneFoto} demo={demo} />}
      />

      <form action={demo ? undefined : action} className="space-y-6 border-t border-line pt-6">
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

        <input type="hidden" name="avatar_symbol" value={avatar.symbol} />
        <input type="hidden" name="avatar_color" value={avatar.color} />

        <ConectarInstagram guardado={me.instagram ?? ''} valor={ig} onChange={setIg} />

        {state.error && <Alert kind="error">{state.error}</Alert>}

        {demo ? (
          <Link href="/login" className="btn-primary w-full">
            Entrar para guardar tu perfil
          </Link>
        ) : (
          <SubmitButton className="btn-primary w-full" pending="Guardando…" disabled={!dirty}>
            {dirty ? 'Guardar cambios' : 'Todo guardado'}
          </SubmitButton>
        )}
      </form>
    </div>
  );
}
