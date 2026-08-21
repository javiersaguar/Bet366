'use client';

/**
 * Envuelve el contenido de cada pantalla. Next monta este componente de nuevo
 * en cada navegación, así que la animación de entrada se repite al cambiar de
 * pestaña y el salto entre secciones deja de ser seco.
 */
export function PageTransition({ children }: { children: React.ReactNode }) {
  return <div className="animate-page-in">{children}</div>;
}
