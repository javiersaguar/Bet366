'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';

type Mode = 'signin' | 'signup';

export function LoginForm({ next }: { next: string }) {
  const [mode, setMode] = useState<Mode>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

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
    <div className="card p-6">
      <div className="grid grid-cols-2 gap-1 p-1 mb-6 rounded-xl border border-line bg-surface-sunken">
        {(['signin', 'signup'] as const).map((m) => (
          <button
            key={m}
            type="button"
            onClick={() => {
              setMode(m);
              setError(null);
            }}
            className={`rounded-[9px] py-2 text-sm font-semibold tracking-tight transition duration-200 ${
              mode === m
                ? 'bg-brand text-canvas shadow-[0_2px_10px_-4px_rgba(43,224,140,.8)]'
                : 'text-content-muted hover:text-content'
            }`}
          >
            {m === 'signin' ? 'Entrar' : 'Crear cuenta'}
          </button>
        ))}
      </div>

      <form onSubmit={submit} className="space-y-4">
        {mode === 'signup' && (
          <div>
            <label className="label" htmlFor="name">
              Cómo te llaman
            </label>
            <input
              id="name"
              className="w-full"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Javi"
              autoComplete="nickname"
            />
          </div>
        )}

        <div>
          <label className="label" htmlFor="email">
            Correo
          </label>
          <input
            id="email"
            type="email"
            required
            className="w-full"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="tu@correo.com"
            autoComplete="email"
          />
        </div>

        <div>
          <label className="label" htmlFor="password">
            Contraseña
          </label>
          <input
            id="password"
            type="password"
            required
            minLength={6}
            className="w-full"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            autoComplete={mode === 'signup' ? 'new-password' : 'current-password'}
          />
        </div>

        {error && (
          <p className="rounded-xl border border-lose/30 bg-lose/10 px-3.5 py-2.5 text-sm text-lose">
            {error}
          </p>
        )}
        {notice && (
          <p className="rounded-xl border border-brand/30 bg-brand/[.08] px-3.5 py-2.5 text-sm text-brand-bright">
            {notice}
          </p>
        )}

        <button type="submit" disabled={busy} className="btn-primary w-full">
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
  if (/email/i.test(message) && /invalid/i.test(message)) return 'Ese correo no parece válido.';
  return message;
}
