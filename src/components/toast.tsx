'use client';

import { createContext, useCallback, useContext, useMemo, useState } from 'react';

type Toast = { id: number; text: string; kind: 'ok' | 'error' | 'info' };
type Push = (text: string, kind?: Toast['kind']) => void;

const ToastContext = createContext<Push>(() => {});

export function useToast() {
  return useContext(ToastContext);
}

const ICON: Record<Toast['kind'], string> = { ok: '✓', error: '!', info: 'i' };

const TONE: Record<Toast['kind'], string> = {
  ok: 'border-brand/30 text-brand',
  error: 'border-lose/30 text-lose',
  info: 'border-info/30 text-info',
};

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<Toast[]>([]);

  const push = useCallback<Push>((text, kind = 'ok') => {
    const id = Date.now() + Math.random();
    setItems((prev) => [...prev, { id, text, kind }]);
    setTimeout(() => setItems((prev) => prev.filter((t) => t.id !== id)), 3600);
  }, []);

  const value = useMemo(() => push, [push]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="pointer-events-none fixed inset-x-0 bottom-5 z-50 flex flex-col items-center gap-2 px-5">
        {items.map((t) => (
          <div
            key={t.id}
            role="status"
            className={`animate-pop-in pointer-events-auto flex max-w-sm items-center gap-2.5 rounded-xl border bg-surface-high/95 px-4 py-2.5 text-sm font-medium text-content shadow-lift backdrop-blur-xl ${TONE[t.kind]}`}
          >
            <span
              className={`grid h-5 w-5 shrink-0 place-items-center rounded-full border text-micro font-bold ${TONE[t.kind]}`}
            >
              {ICON[t.kind]}
            </span>
            <span className="text-content">{t.text}</span>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}
