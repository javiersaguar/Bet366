import { describe, expect, it } from 'vitest';
import {
  MAX_BYTES_ENTRADA,
  esRutaDeAvatar,
  esRutaDeAvatarDe,
  olfatear,
  porQueNoVale,
  rutaDeAvatar,
  urlPublicaDeAvatar,
} from '@/lib/avatar-foto';

const UID = '11111111-2222-4333-8444-555555555555';
const OTRO = '99999999-8888-4777-8666-555555555555';

const bytes = (...v: number[]) => new Uint8Array(v);
const relleno = (n: number) => new Uint8Array(n);

describe('olfatear', () => {
  it('reconoce un JPEG por su firma', () => {
    expect(olfatear(bytes(0xff, 0xd8, 0xff, 0xe0, 0x00, 0x10))).toBe('image/jpeg');
  });

  it('reconoce un WebP por RIFF....WEBP', () => {
    const webp = bytes(
      0x52, 0x49, 0x46, 0x46, // RIFF
      0x24, 0x00, 0x00, 0x00, // tamaño
      0x57, 0x45, 0x42, 0x50, // WEBP
      0x56, 0x50, 0x38, 0x20,
    );
    expect(olfatear(webp)).toBe('image/webp');
  });

  it('no acepta un PNG: nuestro reencodado nunca produce uno', () => {
    expect(olfatear(bytes(0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0, 0, 0, 0, 0))).toBeNull();
  });

  it('no acepta un SVG aunque se llame .webp', () => {
    /* Un SVG es texto y puede llevar <script> dentro. Es el fichero que mas
       veces se cuela en un subidor de imagenes. */
    const svg = new TextEncoder().encode('<svg xmlns="http://www.w3.org/2000/svg"><script/>');
    expect(olfatear(svg)).toBeNull();
  });

  it('no acepta HTML disfrazado', () => {
    expect(olfatear(new TextEncoder().encode('<!DOCTYPE html><html><body>hola'))).toBeNull();
  });

  it('no acepta un GIF, ni un PDF, ni un ZIP', () => {
    expect(olfatear(new TextEncoder().encode('GIF89a...........'))).toBeNull();
    expect(olfatear(new TextEncoder().encode('%PDF-1.7.........'))).toBeNull();
    expect(olfatear(bytes(0x50, 0x4b, 0x03, 0x04, 0, 0, 0, 0, 0, 0, 0, 0, 0))).toBeNull();
  });

  it('no se cae con un fichero vacio o cortado', () => {
    expect(olfatear(relleno(0))).toBeNull();
    expect(olfatear(bytes(0xff, 0xd8))).toBeNull();
    expect(olfatear(bytes(0x52, 0x49, 0x46, 0x46, 0, 0, 0, 0))).toBeNull();
  });

  it('un RIFF que no es WEBP tampoco pasa (un WAV, por ejemplo)', () => {
    const wav = bytes(
      0x52, 0x49, 0x46, 0x46,
      0x24, 0x00, 0x00, 0x00,
      0x57, 0x41, 0x56, 0x45, // WAVE
      0, 0, 0, 0,
    );
    expect(olfatear(wav)).toBeNull();
  });
});

describe('rutaDeAvatar', () => {
  it('mete la foto en la carpeta de quien la sube', () => {
    const ruta = rutaDeAvatar(UID, 'image/webp');
    expect(ruta.startsWith(`${UID}/`)).toBe(true);
    expect(ruta.endsWith('.webp')).toBe(true);
    expect(esRutaDeAvatarDe(ruta, UID)).toBe(true);
  });

  it('cambia de nombre en cada subida, para que la CDN no sirva la vieja', () => {
    const a = rutaDeAvatar(UID, 'image/webp');
    const b = rutaDeAvatar(UID, 'image/webp');
    expect(a).not.toBe(b);
  });

  it('no acepta un id que no sea un uuid', () => {
    expect(() => rutaDeAvatar('../../otro', 'image/webp')).toThrow();
    expect(() => rutaDeAvatar('', 'image/jpeg')).toThrow();
  });
});

describe('esRutaDeAvatarDe', () => {
  it('rechaza la carpeta de otra persona', () => {
    expect(esRutaDeAvatarDe(rutaDeAvatar(OTRO, 'image/webp'), UID)).toBe(false);
  });

  it('rechaza los intentos de salirse de la carpeta', () => {
    expect(esRutaDeAvatarDe(`${UID}/../otro/foto.webp`, UID)).toBe(false);
    expect(esRutaDeAvatarDe(`../${UID}/1700000000000-abc123.webp`, UID)).toBe(false);
    expect(esRutaDeAvatarDe(`${UID}/sub/1700000000000-abc123.webp`, UID)).toBe(false);
  });

  it('rechaza extensiones que no son las nuestras', () => {
    expect(esRutaDeAvatarDe(`${UID}/1700000000000-abc123.svg`, UID)).toBe(false);
    expect(esRutaDeAvatarDe(`${UID}/1700000000000-abc123.html`, UID)).toBe(false);
    expect(esRutaDeAvatarDe(`${UID}/1700000000000-abc123.webp.html`, UID)).toBe(false);
  });

  it('rechaza lo vacio y lo que no es una ruta', () => {
    expect(esRutaDeAvatarDe(null, UID)).toBe(false);
    expect(esRutaDeAvatarDe(undefined, UID)).toBe(false);
    expect(esRutaDeAvatarDe('', UID)).toBe(false);
    expect(esRutaDeAvatarDe('https://otrositio.com/foto.webp', UID)).toBe(false);
  });
});

describe('urlPublicaDeAvatar', () => {
  const BASE = 'https://proyecto.supabase.co';

  it('arma la direccion a partir de la ruta guardada', () => {
    const ruta = `${UID}/1700000000000-abc123.webp`;
    expect(urlPublicaDeAvatar(BASE, ruta)).toBe(
      `${BASE}/storage/v1/object/public/avatars/${ruta}`,
    );
  });

  it('aguanta una barra de mas en la base', () => {
    expect(urlPublicaDeAvatar(`${BASE}/`, `${UID}/1700000000000-abc123.webp`)).toContain(
      `${BASE}/storage`,
    );
  });

  it('no arma nada con una ruta que no tenga nuestra forma', () => {
    /* Lo importante: si alguien lograra escribir una URL entera en la
       columna, aqui no sale un enlace hacia su servidor. */
    expect(urlPublicaDeAvatar(BASE, 'https://malo.example/pixel.gif')).toBeNull();
    expect(urlPublicaDeAvatar(BASE, 'javascript:alert(1)')).toBeNull();
    expect(urlPublicaDeAvatar(BASE, '../../../etc/passwd')).toBeNull();
    expect(urlPublicaDeAvatar(BASE, null)).toBeNull();
  });

  it('sin proyecto configurado no inventa una direccion', () => {
    expect(urlPublicaDeAvatar('', `${UID}/1700000000000-abc123.webp`)).toBeNull();
  });
});

describe('porQueNoVale', () => {
  it('deja pasar una foto normal de movil', () => {
    expect(porQueNoVale('IMG_2049.HEIC', 4 * 1024 * 1024, 'image/heic')).toBeNull();
    expect(porQueNoVale('foto.jpg', 900 * 1024, 'image/jpeg')).toBeNull();
  });

  it('para los pies a lo que pesa demasiado, diciendo cuanto', () => {
    const aviso = porQueNoVale('enorme.png', MAX_BYTES_ENTRADA + 1, 'image/png');
    expect(aviso).toMatch(/tope/);
    expect(aviso).toMatch(/12,0 MB/);
  });

  it('rechaza lo que no es una imagen y los SVG', () => {
    expect(porQueNoVale('virus.exe', 1000, 'application/x-msdownload')).toBe('Eso no es una imagen.');
    expect(porQueNoVale('logo.svg', 1000, 'image/svg+xml')).toMatch(/SVG/);
  });

  it('rechaza un fichero vacio', () => {
    expect(porQueNoVale('nada.jpg', 0, 'image/jpeg')).toMatch(/vacío/);
  });
});
