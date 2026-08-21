'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { Check } from '@phosphor-icons/react/dist/csr/Check';
import { Info } from '@phosphor-icons/react/dist/csr/Info';
import { Warning } from '@phosphor-icons/react/dist/csr/Warning';

type Kind = 'ok' | 'error' | 'info';
type Toast = { id: number; text: string; kind: Kind; saliendo: boolean };
type Push = (text: string, kind?: Kind) => void;

const ToastContext = createContext<Push>(() => {});

export function useToast() {
  return useContext(ToastContext);
}

const ICONO = { ok: Check, error: Warning, info: Info } as const;

const TONO: Record<Kind, string> = {
  ok: 'border-brand/30 text-brand',
  error: 'border-lose/30 text-lose',
  info: 'border-info/30 text-info',
};

const VISIBLE = 3400;
const SALIDA = 220;

/**
 * Avisos efímeros.
 *
 * Con transiciones y no con fotogramas: dos apuestas seguidas disparan dos
 * avisos casi a la vez, y un keyframe reinicia desde cero mientras que una
 * transición retoma desde donde esté. Entran desde abajo y se van por abajo,
 * que es de donde vienen y adonde el pulgar los echaría.
 */
export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<Toast[]>([]);

  const push = useCallback<Push>((text, kind = 'ok') => {
    const id = Date.now() + Math.random();
    setItems((prev) => [...prev, { id, text, kind, saliendo: false }]);

    setTimeout(() => {
      setItems((prev) => prev.map((t) => (t.id === id ? { ...t, saliendo: true } : t)));
      setTimeout(() => setItems((prev) => prev.filter((t) => t.id !== id)), SALIDA);
    }, VISIBLE);
  }, []);

  const value = useMemo(() => push, [push]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="pointer-events-none fixed inset-x-0 bottom-5 z-50 flex flex-col items-center gap-2 px-5">
        {items.map((t) => (
          <Aviso key={t.id} toast={t} />
        ))}
      </div>
    </ToastContext.Provider>
  );
}

function Aviso({ toast }: { toast: Toast }) {
  // Dos pinturas: la primera deja el aviso fuera de sitio, la segunda lo trae.
  // Sin esto el navegador no tiene entre qué y qué hacer la transición.
  const [dentro, setDentro] = useState(false);
  useEffect(() => {
    const id = requestAnimationFrame(() => setDentro(true));
    return () => cancelAnimationFrame(id);
  }, []);

  const Glifo = ICONO[toast.kind];
  const puesto = dentro && !toast.saliendo;

  return (
    <div
      role="status"
      className={`pointer-events-auto flex max-w-sm items-center gap-2.5 rounded-xl border
                  bg-surface-high/95 px-4 py-2.5 text-body font-medium text-content shadow-lift
                  backdrop-blur-xl transition-[transform,opacity] duration-panel ease-out
                  ${TONO[toast.kind]}
                  ${puesto ? 'translate-y-0 opacity-100' : 'translate-y-2 opacity-0'}`}
    >
      <span
        className={`grid h-5 w-5 shrink-0 place-items-center rounded-full border ${TONO[toast.kind]}`}
      >
        <Glifo size={11} weight="bold" />
      </span>
      <span className="text-content">{toast.text}</span>
    </div>
  );
}
