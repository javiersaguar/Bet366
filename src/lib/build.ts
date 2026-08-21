/**
 * Sello de la versión que se está viendo.
 *
 * Existe para cortar en seco la duda de "¿estoy mirando el código nuevo o uno
 * viejo?". En Vercel sale el commit desplegado; en local, la hora en que se
 * arrancó el servidor.
 */
const SHA =
  process.env.VERCEL_GIT_COMMIT_SHA ??
  process.env.NEXT_PUBLIC_COMMIT_SHA ??
  '';

export const BUILD_STAMP = SHA
  ? SHA.slice(0, 7)
  : `local ${new Date().toLocaleString('es-ES', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })}`;
