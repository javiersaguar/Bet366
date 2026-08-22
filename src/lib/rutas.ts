/**
 * Las mismas pantallas se pintan en dos sitios: bajo `/grupos/<id>` en la app
 * de verdad y bajo `/demo` en la demostración. Casi todos los enlaces se
 * construyen a partir de `basePath` y salen bien solos, pero la lista de
 * grupos no cuelga del grupo: está por encima. De ahí este ayudante.
 */
export function listaDeGrupos(basePath: string): string {
  return basePath.startsWith('/demo') ? '/demo/grupos' : '/grupos';
}
