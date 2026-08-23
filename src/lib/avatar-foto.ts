/**
 * Fotos de perfil: qué se acepta, a qué se reduce y dónde se guarda.
 *
 * Todo lo que decide si un fichero entra o no vive aquí, en funciones puras,
 * para poder probarlo. La postura es la siguiente:
 *
 *   1. Del fichero que eliges no se guarda ni un byte. Se vuelve a dibujar en
 *      un lienzo y se codifica de cero, así que lo que sube son píxeles y
 *      nada más: cualquier cosa escondida dentro del original (un script en
 *      un SVG, un trozo de HTML pegado detrás de la cabecera, un ZIP en la
 *      cola) desaparece al reencodar. De paso se van los metadatos EXIF, que
 *      en una foto de móvil llevan las coordenadas de donde se hizo.
 *
 *   2. El servidor no se fía de lo que diga el navegador. Vuelve a mirar el
 *      tamaño y olfatea los primeros bytes: si no empieza por la firma de un
 *      JPEG o un WebP, no se sube. Un `content-type` es texto que manda el
 *      cliente, y el cliente puede ser cualquiera.
 *
 *   3. La ruta dentro del almacén la arma el servidor con el id de quien ha
 *      iniciado sesión. Nunca llega del formulario, así que no hay forma de
 *      escribir en la carpeta de otro ni de salirse con «../».
 *
 *   4. El tamaño de salida está atado por arriba. Un avatar se ve a 96
 *      píxeles como mucho, así que 512 sobra hasta en una pantalla a 3x, y
 *      512x512 en WebP pesa unas decenas de kilobytes. Cien personas ocupan
 *      menos que una sola foto sin tocar.
 */

/** Lado del cuadrado que se guarda. El avatar más grande de la app son 96px. */
export const LADO_SALIDA = 512;

/** Tope duro de lo que se sube. Un WebP de 512x512 anda por 30-60 KB. */
export const MAX_BYTES_SALIDA = 256 * 1024;

/**
 * Tope de lo que se acepta elegir. Una foto de 48 megapíxeles de un móvil
 * de ahora ronda los 8-12 MB, así que entra de sobra; lo que no entra es un
 * RAW o un PNG gigante que solo sirve para tumbar la pestaña.
 */
export const MAX_BYTES_ENTRADA = 12 * 1024 * 1024;

/** Y por si el fichero pesa poco pero se despliega en algo enorme. */
export const MAX_LADO_ENTRADA = 12_000;
export const MAX_PIXELES_ENTRADA = 80_000_000;

/** Lo que se le pide al selector de ficheros. HEIC entra: es lo de iPhone. */
export const TIPOS_QUE_SE_PUEDEN_ELEGIR =
  'image/jpeg,image/png,image/webp,image/heic,image/heif';

/** Y lo único que se puede llegar a guardar, después de reencodar. */
export type TipoGuardado = 'image/webp' | 'image/jpeg';

const EXTENSION: Record<TipoGuardado, string> = {
  'image/webp': 'webp',
  'image/jpeg': 'jpg',
};

/**
 * Qué es de verdad un fichero, mirando sus primeros bytes.
 *
 * Solo reconoce los dos formatos que produce nuestro reencodado. Todo lo
 * demás —incluido un SVG, que es texto y podría llevar `<script>`— devuelve
 * `null` y no llega al almacén.
 */
export function olfatear(bytes: Uint8Array): TipoGuardado | null {
  // JPEG: FF D8 FF
  if (bytes.length > 3 && bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) {
    return 'image/jpeg';
  }

  // WebP: "RIFF" .... "WEBP"
  if (
    bytes.length > 12 &&
    bytes[0] === 0x52 && bytes[1] === 0x49 && bytes[2] === 0x46 && bytes[3] === 0x46 &&
    bytes[8] === 0x57 && bytes[9] === 0x45 && bytes[10] === 0x42 && bytes[11] === 0x50
  ) {
    return 'image/webp';
  }

  return null;
}

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/**
 * Dónde va la foto de alguien: su propia carpeta, con un nombre nuevo cada
 * vez.
 *
 * El nombre cambia en cada subida a propósito. Con un nombre fijo la CDN
 * seguiría sirviendo la foto vieja durante horas y parecería que no se ha
 * guardado nada; la anterior se borra en cuanto la nueva está arriba.
 */
export function rutaDeAvatar(userId: string, tipo: TipoGuardado, ahora = Date.now()): string {
  if (!UUID.test(userId)) throw new Error('El id de usuario no es un uuid');
  const sufijo = Math.random().toString(36).slice(2, 8).padEnd(6, '0');
  return `${userId}/${ahora}-${sufijo}.${EXTENSION[tipo]}`;
}

const RUTA = /^[0-9a-f-]{36}\/\d{10,14}-[a-z0-9]{6}\.(?:webp|jpg)$/i;

/**
 * Si una ruta guardada es de verdad la carpeta de esa persona.
 *
 * Se comprueba al escribir y también al leer: una fila con una ruta rara no
 * puede acabar convertida en una URL hacia cualquier sitio.
 */
export function esRutaDeAvatarDe(ruta: string | null | undefined, userId: string): boolean {
  if (!ruta || !RUTA.test(ruta)) return false;
  return ruta.slice(0, ruta.indexOf('/')).toLowerCase() === userId.toLowerCase();
}

/** La misma comprobación sin saber de quién es: solo que la forma es la buena. */
export function esRutaDeAvatar(ruta: string | null | undefined): boolean {
  return Boolean(ruta) && RUTA.test(ruta as string);
}

export const CUBO = 'avatars';

/**
 * La dirección publica de una foto.
 *
 * Se arma aquí y nunca sale de la base: en `profiles` se guarda la ruta
 * dentro del almacén, no una URL. Si se guardara una URL, quien pudiera
 * escribir esa columna podría apuntar la foto de su perfil a cualquier
 * servidor y usar a todo el grupo para contar visitas.
 */
export function urlPublicaDeAvatar(base: string, ruta: string | null | undefined): string | null {
  if (!base || !esRutaDeAvatar(ruta)) return null;
  return `${base.replace(/\/+$/, '')}/storage/v1/object/public/${CUBO}/${ruta}`;
}

/** Por qué no vale un fichero, en una frase que se pueda enseñar. */
export function porQueNoVale(nombre: string, bytes: number, tipo: string): string | null {
  if (bytes > MAX_BYTES_ENTRADA) {
    return `«${recortar(nombre)}» pesa ${megas(bytes)} y el tope son ${megas(MAX_BYTES_ENTRADA)}.`;
  }
  if (bytes === 0) return 'Ese fichero está vacío.';
  if (tipo && !tipo.startsWith('image/')) return 'Eso no es una imagen.';
  if (tipo === 'image/svg+xml') return 'Los SVG no valen como foto de perfil.';
  return null;
}

function recortar(nombre: string): string {
  return nombre.length > 28 ? `${nombre.slice(0, 25)}…` : nombre;
}

export function megas(bytes: number): string {
  const mb = bytes / (1024 * 1024);
  return mb < 0.1
    ? `${Math.round(bytes / 1024)} KB`
    : `${mb.toFixed(1).replace('.', ',')} MB`;
}
