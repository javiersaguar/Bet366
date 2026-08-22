'use client';

import Link from 'next/link';
import { useActionState, useMemo, useState } from 'react';
import { CaretRight } from '@phosphor-icons/react/dist/csr/CaretRight';
import { MagnifyingGlass } from '@phosphor-icons/react/dist/csr/MagnifyingGlass';
import { SignIn } from '@phosphor-icons/react/dist/csr/SignIn';
import { Alert, SubmitButton } from '@/components/ui';
import { points } from '@/lib/format';
import { sello } from '@/lib/actividad';

const LARGO_CODIGO = 6;

export type GroupEntry = {
  id: string;
  name: string;
  inviteCode: string;
  balance: number;
  /** Puntos con los que arranca la semana: sirve para saber si vas ganando. */
  startingPoints: number;
  /** Cuánta gente sois. */
  members: number;
  /** Avisos tuyos sin leer en ese grupo. */
  unread: number;
  /** Lo último que pasó dentro. Manda el orden de la lista. */
  activity: { at: string; texto: string; pendiente: boolean } | null;
};

export type ResultadoUnirse = { error?: string; ok?: true };

/** Verde si vas por encima de lo que te dieron el lunes, rojo si por debajo. */
function tono(balance: number, start: number): string {
  if (balance > start) return 'text-brand';
  if (balance < start) return 'text-lose';
  return 'text-white';
}

const soloCodigo = (v: string) =>
  v.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, LARGO_CODIGO);

/**
 * Tus grupos, con buscador.
 *
 * Un solo campo hace las dos cosas que se hacen aquí, porque las dos empiezan
 * igual: escribiendo. Si lo que escribes se parece al nombre de un grupo tuyo,
 * la lista se filtra; si son los seis caracteres de un código, aparece debajo
 * el botón para entrar. No hacen falta dos cajas ni una pantalla aparte.
 *
 * Las filas van ordenadas por lo último que pasó dentro, no por cuándo
 * entraste: quien tiene tres grupos abre la app para mirar el que se ha
 * movido.
 */
export function GroupsList({
  groups,
  join,
  onSelect,
  currentId,
  codigoInicial = '',
}: {
  groups: GroupEntry[];
  /** Acción de servidor para entrar con un código. */
  join: (prev: ResultadoUnirse, formData: FormData) => Promise<ResultadoUnirse>;
  /**
   * Solo en la demostración: cambiar de grupo no navega a otra dirección, la
   * guarda. Si viene, las filas son botones en lugar de enlaces.
   */
  onSelect?: (formData: FormData) => void;
  /** El grupo en el que estás ahora mismo, para marcarlo. */
  currentId?: string;
  /** Viene de un enlace de invitación: el campo ya trae el código. */
  codigoInicial?: string;
}) {
  const [busqueda, setBusqueda] = useState(codigoInicial);
  const [estado, accionUnirse] = useActionState(join, {});

  const ordenados = useMemo(
    () =>
      [...groups].sort((a, b) => {
        const ta = a.activity ? new Date(a.activity.at).getTime() : 0;
        const tb = b.activity ? new Date(b.activity.at).getTime() : 0;
        return tb - ta;
      }),
    [groups],
  );

  const texto = busqueda.trim();
  const codigo = soloCodigo(texto);

  const filtrados = useMemo(() => {
    if (texto.length === 0) return ordenados;
    const suelto = texto.toLowerCase();
    return ordenados.filter(
      (g) => g.name.toLowerCase().includes(suelto) || g.inviteCode.includes(codigo),
    );
  }, [ordenados, texto, codigo]);

  /* Un código completo que no es el de ninguno de los tuyos: lo que quieres es
     entrar, no buscar. */
  const ofrecerEntrar =
    codigo.length === LARGO_CODIGO && !groups.some((g) => g.inviteCode === codigo);

  return (
    <div className="space-y-5">
      <div className="relative">
        <MagnifyingGlass
          size={17}
          weight="bold"
          className="pointer-events-none absolute inset-y-0 left-3.5 my-auto text-content-faint"
        />
        <input
          type="search"
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          placeholder={
            groups.length > 0 ? 'Busca un grupo o pega un código' : 'Pega aquí el código, son 6'
          }
          autoCapitalize="none"
          autoComplete="off"
          spellCheck={false}
          aria-label="Buscar entre tus grupos o entrar con un código"
          className="w-full !pl-11 text-body"
        />
      </div>

      {ofrecerEntrar && (
        <form action={accionUnirse} className="animate-rise space-y-3">
          <input type="hidden" name="code" value={codigo} />
          <div
            className="flex items-center gap-3 rounded-xl border border-brand/30 bg-brand/[.06]
                       px-4 py-3"
          >
            <div className="min-w-0 flex-1">
              <p className="text-caption text-content-muted">Entrar en un grupo nuevo</p>
              <p className="tnum mt-0.5 text-title font-semibold tracking-[0.28em] text-white">
                {codigo}
              </p>
            </div>
            <SubmitButton className="btn-primary shrink-0" pending="Entrando…">
              <SignIn size={15} weight="bold" />
              Unirme
            </SubmitButton>
          </div>
          {estado.error && <Alert kind="error">{estado.error}</Alert>}
        </form>
      )}

      {!ofrecerEntrar && estado.error && <Alert kind="error">{estado.error}</Alert>}

      {filtrados.length > 0 && (
        <Contenedor onSelect={onSelect}>
          <ul className="stagger -mx-5 divide-y divide-line border-y border-line">
            {filtrados.map((g, i) => (
              <li key={g.id} style={{ '--i': i } as React.CSSProperties}>
                <Fila grupo={g} actual={g.id === currentId} conBoton={Boolean(onSelect)} />
              </li>
            ))}
          </ul>
        </Contenedor>
      )}

      {/* Solo cuando la búsqueda deja la lista a cero y no hay nada mejor que
          decir. Con el recuadro de entrar delante ya está todo dicho, y sin
          grupos quien habla es la pantalla, no esto. */}
      {filtrados.length === 0 && groups.length > 0 && !ofrecerEntrar && (
        <p className="py-6 text-body text-content-muted">Ninguno de tus grupos se llama así.</p>
      )}
    </div>
  );
}

/** En la demostración la lista entera es un formulario; en la app, enlaces. */
function Contenedor({
  onSelect,
  children,
}: {
  onSelect?: (formData: FormData) => void;
  children: React.ReactNode;
}) {
  if (!onSelect) return <>{children}</>;
  return <form action={onSelect}>{children}</form>;
}

function Fila({
  grupo,
  actual,
  conBoton,
}: {
  grupo: GroupEntry;
  actual: boolean;
  conBoton: boolean;
}) {
  const clases = `group flex w-full items-center gap-3.5 px-5 py-4 text-left
                  transition-colors duration-press ease-out active:bg-surface-raised/60
                  ${actual ? 'bg-surface-raised/40' : ''}`;

  const contenido = (
    <>
      <div className="min-w-0 flex-1">
        <div className="flex items-baseline gap-2">
          <p className="truncate text-title font-semibold text-white">{grupo.name}</p>
          {actual && <span className="field-label shrink-0 text-brand">aquí</span>}

          <span className="ml-auto flex shrink-0 items-baseline gap-1.5">
            {/* Algo del grupo está parado esperando un resultado. Es una marca
                aparte y no un color sobre la frase, porque la frase cuenta lo
                último que pasó y eso casi nunca es lo que está atascado. */}
            {grupo.activity?.pendiente && (
              <span
                title="Hay algo esperando resultado"
                className="h-1.5 w-1.5 self-center rounded-full bg-gold
                           shadow-[0_0_8px_rgba(245,194,75,.8)]"
              >
                <span className="sr-only">Hay algo esperando resultado</span>
              </span>
            )}
            {grupo.activity && (
              <span className="num text-micro text-content-faint">{sello(grupo.activity.at)}</span>
            )}
          </span>
        </div>

        <div className="mt-1 flex items-center gap-2">
          <p className="min-w-0 flex-1 truncate text-caption text-content-muted">
            {grupo.activity
              ? grupo.activity.texto
              : `${grupo.members} ${grupo.members === 1 ? 'persona' : 'personas'} · todavía sin apuestas`}
          </p>

          {grupo.unread > 0 && (
            <span
              className="grid h-[18px] min-w-[18px] shrink-0 place-items-center rounded-full bg-brand px-1"
              aria-label={`${grupo.unread} avisos sin leer`}
            >
              <span className="num text-[0.5625rem] font-semibold leading-none text-brand-ink">
                {grupo.unread > 9 ? '9+' : grupo.unread}
              </span>
            </span>
          )}
        </div>
      </div>

      <div className="shrink-0 text-right">
        <p className={`tnum text-figure font-semibold ${tono(grupo.balance, grupo.startingPoints)}`}>
          {points(grupo.balance)}
        </p>
        <p className="field-label mt-0.5">puntos</p>
      </div>

      <CaretRight
        size={16}
        weight="bold"
        className="shrink-0 text-content-faint transition-transform duration-pop ease-out
                   motion-safe:group-hover:translate-x-0.5"
      />
    </>
  );

  if (conBoton) {
    return (
      <button type="submit" name="grupo" value={grupo.id} className={clases}>
        {contenido}
      </button>
    );
  }

  return (
    <Link href={`/grupos/${grupo.id}`} className={clases}>
      {contenido}
    </Link>
  );
}
