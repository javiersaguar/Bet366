/**
 * Instagram en el perfil.
 *
 * Se guarda solo el nombre de usuario, nunca una dirección: así nadie puede
 * colar un enlace cualquiera en algo que los demás del grupo van a pulsar.
 * La app arma la URL a partir del nombre.
 */

const USUARIO = /^[A-Za-z0-9._]{1,30}$/;

/**
 * Deja el usuario en su forma mínima, aceptando lo que la gente pega de
 * verdad: "@javi", "instagram.com/javi" o la URL entera con parámetros.
 *
 * Devuelve `null` si el campo viene vacío y `false` si no hay forma de sacar
 * un usuario válido.
 */
export function limpiarInstagram(bruto: string): string | null | false {
  const texto = bruto.trim();
  if (!texto) return null;

  const sinEsquema = texto.replace(/^https?:\/\//i, '');

  /* Si lo pegado tiene pinta de dirección, la única que vale es la de
     Instagram. Sin esta comprobación, "otrositio.com/javi" se quedaba en
     "otrositio.com", que pasa el filtro de caracteres porque el punto está
     permitido, y acababa guardado como si fuera un usuario. */
  const pareceUrl = sinEsquema !== texto || sinEsquema.includes('/');
  if (pareceUrl) {
    const deInstagram = sinEsquema.match(/^(?:www\.)?instagram\.com\/(.*)$/i);
    if (!deInstagram) return false;
    const usuario = deInstagram[1].split(/[/?#]/)[0].replace(/^@+/, '');
    return USUARIO.test(usuario) ? usuario : false;
  }

  const usuario = sinEsquema.split(/[?#]/)[0].replace(/^@+/, '');
  return USUARIO.test(usuario) ? usuario : false;
}

/** Enlace al perfil. Siempre construido aquí, nunca guardado en la base. */
export function enlaceInstagram(usuario: string): string {
  return `https://instagram.com/${usuario}`;
}
