'use client';

import { useId, useState } from 'react';
import { Eye } from '@phosphor-icons/react/dist/csr/Eye';
import { EyeSlash } from '@phosphor-icons/react/dist/csr/EyeSlash';
import { createClient } from '@/lib/supabase/client';
import { Alert } from '@/components/ui';

type Mode = 'signin' | 'signup';

export function LoginForm({ next }: { next: string }) {
  const [mode, setMode] = useState<Mode>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [reveal, setReveal] = useState(false);
  const [name, setName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const uid = useId();

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    setNotice(null);
    const supabase = createClient();

    if (mode === 'signup') {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { display_name: name.trim() || email.split('@')[0] } },
      });
      if (error) {
        setError(traducir(error.message));
        setBusy(false);
        return;
      }
      const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
      if (signInError) {
        setNotice('Cuenta creada. Confirma el correo que te hemos enviado y vuelve a entrar.');
        setBusy(false);
        return;
      }
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        setError(traducir(error.message));
        setBusy(false);
        return;
      }
    }

    window.location.assign(next);
  }

  return (
    <div>
      {/* Conmutador con píldora deslizante: el movimiento explica que las dos
          pestañas son el mismo sitio con dos modos, no dos pantallas. */}
      <div
        role="tablist"
        aria-label="Entrar o crear cuenta"
        className="relative grid grid-cols-2 gap-1 rounded-xl border border-line bg-surface-sunken p-1"
      >
        <span
          aria-hidden
          className="absolute inset-y-1 left-1 w-[calc(50%_-_0.25rem)] rounded-[9px] bg-brand
                     shadow-[0_2px_14px_-5px_rgba(43,224,140,.95)]
                     transition-transform duration-panel ease-out"
          style={{
            transform: mode === 'signin' ? 'translateX(0)' : 'translateX(calc(100% + 0.5rem))',
          }}
        />
        {(['signin', 'signup'] as const).map((m) => (
          <button
            key={m}
            role="tab"
            type="button"
            aria-selected={mode === m}
            onClick={() => {
              setMode(m);
              setError(null);
              setNotice(null);
            }}
            className={`relative z-10 rounded-[9px] py-2 text-body font-semibold
                        transition-colors duration-press ease-out ${
                          mode === m ? 'text-brand-ink' : 'text-content-muted hover:text-content'
                        }`}
          >
            {m === 'signin' ? 'Entrar' : 'Crear cuenta'}
          </button>
        ))}
      </div>

      <form onSubmit={submit} className="mt-6 space-y-4">
        {mode === 'signup' && (
          <div className="animate-rise">
            <label className="label" htmlFor={`${uid}-name`}>
              Cómo te llaman
            </label>
            <input
              id={`${uid}-name`}
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Javi"
              autoComplete="nickname"
              maxLength={40}
            />
            <p className="mt-1.5 text-micro leading-relaxed text-content-faint">
              Es el nombre que verá tu grupo en el ranking. Se puede cambiar después.
            </p>
          </div>
        )}

        <div>
          <label className="label" htmlFor={`${uid}-email`}>
            Correo
          </label>
          <input
            id={`${uid}-email`}
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="tu@correo.com"
            autoComplete="email"
          />
        </div>

        <div>
          <label className="label" htmlFor={`${uid}-password`}>
            Contraseña
          </label>
          <div className="relative">
            <input
              id={`${uid}-password`}
              type={reveal ? 'text' : 'password'}
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder={mode === 'signup' ? 'Mínimo 6 caracteres' : '••••••••'}
              autoComplete={mode === 'signup' ? 'new-password' : 'current-password'}
              className="pr-11"
            />
            <button
              type="button"
              onClick={() => setReveal((v) => !v)}
              aria-label={reveal ? 'Ocultar la contraseña' : 'Ver la contraseña'}
              className="absolute inset-y-0 right-0 grid w-11 place-items-center text-content-faint
                         transition-colors duration-press ease-out hover:text-content"
            >
              {reveal ? <EyeSlash size={18} /> : <Eye size={18} />}
            </button>
          </div>
        </div>

        {error && <Alert kind="error">{error}</Alert>}
        {notice && <Alert kind="ok">{notice}</Alert>}

        <button type="submit" disabled={busy} className="btn-primary w-full">
          {busy && (
            <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-current border-t-transparent opacity-70" />
          )}
          {busy ? 'Un momento…' : mode === 'signin' ? 'Entrar' : 'Crear cuenta'}
        </button>
      </form>
    </div>
  );
}

function traducir(message: string): string {
  if (/invalid login credentials/i.test(message)) return 'Correo o contraseña incorrectos.';
  if (/already registered/i.test(message)) return 'Ese correo ya tiene cuenta. Prueba a entrar.';
  if (/password should be/i.test(message)) return 'La contraseña necesita al menos 6 caracteres.';
  if (/email not confirmed/i.test(message)) {
    return 'Te falta confirmar el correo. Mira tu bandeja de entrada.';
  }
  if (/email/i.test(message) && /invalid/i.test(message)) return 'Ese correo no parece válido.';
  if (/rate limit|too many/i.test(message)) return 'Demasiados intentos seguidos. Prueba en un minuto.';
  return message;
}
