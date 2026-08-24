'use client';

import { useState } from 'react';
import { ArrowSquareOut } from '@phosphor-icons/react/dist/csr/ArrowSquareOut';
import { InstagramLogo } from '@phosphor-icons/react/dist/csr/InstagramLogo';
import { enlaceInstagram, limpiarInstagram } from '@/lib/instagram';

/**
 * Conectar tu Instagram.
 *
 * Antes esto era una caja de texto suelta y nada más: escribías algo y no
 * sabías si había quedado bien hasta que otro lo pulsaba. Ahora es un botón,
 * y una vez puesto se convierte en el enlace de verdad: al tocarlo se abre tu
 * perfil, en la app de Instagram si la tienes instalada.
 *
 * Mientras escribes se ve la dirección exacta a la que va a llevar y hay un
 * «Comprobar» que la abre, para no descubrir en la ficha del grupo que te
 * habías equivocado de letra.
 *
 * Lo que se guarda sigue siendo el nombre de usuario, nunca una dirección:
 * la URL se arma en la app. Vale pegar el enlace entero, pero de ahí solo se
 * queda el usuario, y solo si es de instagram.com.
 */
export function ConectarInstagram({
  guardado,
  valor,
  onChange,
}: {
  /** Lo que hay en la base ahora mismo, ya confirmado. */
  guardado: string;
  valor: string;
  onChange: (v: string) => void;
}) {
  const [abierto, setAbierto] = useState(false);

  const limpio = limpiarInstagram(valor);
  const usuario = typeof limpio === 'string' ? limpio : null;
  const malo = limpio === false;

  const yaEstaba = valor.trim() === guardado.trim() && guardado.trim().length > 0;

  return (
    <div>
      {/* Lo que viaja al servidor. Va aparte del campo visible para que la
          tarjeta pueda existir sin caja de texto delante. */}
      <input type="hidden" name="instagram" value={valor} />

      <p className="label">
        Tu Instagram
        <span className="ml-1.5 font-normal text-content-faint">opcional</span>
      </p>

      {!abierto && usuario ? (
        <div className="flex items-center gap-2">
          <a
            href={enlaceInstagram(usuario)}
            target="_blank"
            rel="noopener noreferrer"
            className="group flex min-w-0 flex-1 items-center gap-3 rounded-xl border border-line
                       bg-surface-sunken px-3.5 py-3 transition-colors duration-press ease-out
                       hover:border-line-strong active:bg-surface-raised/60"
          >
            <span
              className="grid h-9 w-9 shrink-0 place-items-center rounded-[11px] text-white"
              style={{
                background:
                  'radial-gradient(120% 120% at 28% 100%, #F9CE34, #EE2A7B 46%, #6228D7 92%)',
              }}
            >
              <InstagramLogo size={19} weight="bold" />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block truncate text-body font-semibold text-white">@{usuario}</span>
              <span className="block text-micro text-content-faint">
                {yaEstaba ? 'Toca para abrir tu perfil' : 'Toca para comprobarlo, y guarda abajo'}
              </span>
            </span>
            <ArrowSquareOut
              size={16}
              weight="bold"
              className="shrink-0 text-content-faint transition-transform duration-pop ease-out
                         motion-safe:group-hover:-translate-y-0.5"
            />
          </a>

          <button
            type="button"
            onClick={() => setAbierto(true)}
            className="btn-quiet shrink-0 !px-3 !py-2 text-caption"
          >
            Cambiar
          </button>
        </div>
      ) : abierto || valor ? (
        <div className={`space-y-2 ${abierto ? 'animate-swap' : ''}`}>
          <div className="relative">
            <span className="pointer-events-none absolute inset-y-0 left-3.5 grid place-items-center text-content-faint">
              <InstagramLogo size={17} />
            </span>
            <input
              id="instagram"
              value={valor}
              onChange={(e) => onChange(e.target.value)}
              placeholder="tu_usuario"
              autoCapitalize="none"
              autoComplete="off"
              spellCheck={false}
              maxLength={80}
              autoFocus={abierto}
              aria-invalid={malo}
              aria-describedby="instagram-pista"
              className={`!pl-10 ${malo ? '!border-lose/50' : ''}`}
            />
          </div>

          <p id="instagram-pista" className="flex flex-wrap items-center gap-x-2 text-micro leading-relaxed">
            {malo ? (
              <span className="text-lose">
                De ahí no sale un usuario. Vale «tu_usuario» o el enlace de instagram.com.
              </span>
            ) : usuario ? (
              <>
                <span className="num text-content-muted">instagram.com/{usuario}</span>
                <a
                  href={enlaceInstagram(usuario)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 font-semibold text-brand
                             transition-opacity duration-press ease-out hover:opacity-80"
                >
                  Comprobar
                  <ArrowSquareOut size={12} weight="bold" />
                </a>
              </>
            ) : (
              <span className="text-content-faint">
                Tu usuario, sin arroba. También vale pegar el enlace entero.
              </span>
            )}
          </p>

          {(abierto || valor) && (
            <button
              type="button"
              onClick={() => {
                onChange('');
                setAbierto(false);
              }}
              className="text-micro font-semibold text-content-faint transition-colors
                         duration-press ease-out hover:text-lose"
            >
              Quitar mi Instagram
            </button>
          )}
        </div>
      ) : (
        <div>
          <button
            type="button"
            onClick={() => setAbierto(true)}
            className="group flex w-full items-center gap-3 rounded-xl border border-line
                       bg-surface-sunken px-3.5 py-3 text-left transition-colors duration-press
                       ease-out hover:border-line-strong active:bg-surface-raised/60"
          >
            <span
              className="grid h-9 w-9 shrink-0 place-items-center rounded-[11px] text-white
                         transition-transform duration-pop ease-out motion-safe:group-hover:scale-105"
              style={{
                background:
                  'radial-gradient(120% 120% at 28% 100%, #F9CE34, #EE2A7B 46%, #6228D7 92%)',
              }}
            >
              <InstagramLogo size={19} weight="bold" />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block text-body font-semibold text-white">Conectar Instagram</span>
              <span className="block text-micro text-content-faint">
                Para que los del grupo lleguen a tu perfil de un toque
              </span>
            </span>
          </button>
        </div>
      )}
    </div>
  );
}
