import type { MarketStatus } from '@/lib/types';

/**
 * Qué ha sido lo último que ha pasado en un grupo.
 *
 * La lista de grupos se ordena por esto, igual que la de conversaciones de
 * cualquier mensajería: lo que se mueve sube. Sin esto el orden era el de
 * entrada al grupo, que es justo el que no le sirve a nadie que tenga tres.
 *
 * Se mira en dos sitios y gana el más reciente:
 *
 *   - Los avisos tuyos, que ya vienen redactados («Has ganado…», «Te toca…»).
 *   - Las apuestas del grupo, que producen actividad aunque a ti no te haya
 *     llegado ningún aviso: alguien lanza una, alguien publica un resultado.
 *
 * Los avisos sin leer no se suben a la fuerza al principio de la lista: un
 * aviso nace de algo que acaba de pasar, así que ya sube solo. Lo que sí se
 * marca es el contador, como en cualquier bandeja.
 */

/** Lo mínimo de una apuesta para saber cuándo se movió. */
export type MercadoActivo = {
  title: string;
  status: MarketStatus;
  created_at: string;
  closes_at: string;
  result_set_at?: string | null;
  resolved_at?: string | null;
};

/** Lo mínimo de un aviso. */
export type AvisoActivo = {
  kind: string;
  title: string;
  created_at: string;
  read_at: string | null;
};

/* «Apuesta nueva» es el título que pone la base para este aviso, y el nombre
   de la apuesta se queda en el cuerpo. Como frase de resumen no dice nada, y
   además cuenta lo mismo que el «Nueva: …» que ya sale de la apuesta. */
const AVISOS_SIN_FRASE = ['market_opened'];

export type Actividad = {
  /** Cuándo pasó. */
  at: string;
  /** Una línea para la fila del grupo. */
  texto: string;
  /** Algo que pide tu intervención: falta un resultado o hay una impugnación. */
  pendiente: boolean;
};

const ms = (iso: string) => new Date(iso).getTime();

/** Los momentos en los que una apuesta ha dado señales de vida. */
function momentos(m: MercadoActivo): Actividad[] {
  const salida: Actividad[] = [
    { at: m.created_at, texto: `Nueva: ${m.title}`, pendiente: false },
  ];

  /* En una impugnada el resultado ya no es la noticia: lo que importa es que
     alguien lo ha discutido. Los dos eventos caen a la misma hora, así que si
     se emitieran los dos ganaría uno u otro según el orden del array. */
  if (m.result_set_at && m.status !== 'disputed') {
    salida.push({ at: m.result_set_at, texto: `Ya hay resultado: ${m.title}`, pendiente: false });
  }
  if (m.resolved_at) {
    salida.push({ at: m.resolved_at, texto: `Repartida: ${m.title}`, pendiente: false });
  }

  switch (m.status) {
    case 'closed':
    case 'pending':
      /* Ha cerrado y nadie ha dicho qué pasó. Es lo que más urge del grupo, y
         por eso se cuenta la hora de cierre como actividad. */
      salida.push({ at: m.closes_at, texto: `Falta el resultado de ${m.title}`, pendiente: true });
      break;
    case 'disputed':
      salida.push({
        at: m.result_set_at ?? m.closes_at,
        texto: `Impugnada: ${m.title}`,
        pendiente: true,
      });
      break;
    case 'cancelled':
      salida.push({ at: m.closes_at, texto: `Anulada: ${m.title}`, pendiente: false });
      break;
    default:
      break;
  }

  return salida;
}

/** El más reciente de una lista de momentos, o nada si está vacía. */
function elUltimo(eventos: Actividad[]): Actividad | null {
  if (eventos.length === 0) return null;
  return eventos.reduce((mejor, e) => (ms(e.at) > ms(mejor.at) ? e : mejor));
}

/**
 * Lo último que ha pasado en un grupo, o nada si todavía no ha pasado nada.
 *
 * Lo que aún no ha ocurrido no cuenta: una apuesta que cierra mañana no es
 * actividad de hoy, y si contase mandaría a lo alto de la lista al grupo más
 * quieto solo por tener algo programado.
 *
 * La frase y la hora son las del último movimiento, sin excepciones: la lista
 * está para contar qué se ha movido, y una apuesta atascada desde el martes
 * taparía para siempre lo que acaba de pasar.
 *
 * Que haya algo atascado se dice aparte, en `pendiente`, y se mira sobre todo
 * el grupo y no solo sobre el último evento. Así la marca no aparece y
 * desaparece según qué haya pasado en el último minuto.
 */
export function ultimaActividad(
  mercados: MercadoActivo[],
  avisos: AvisoActivo[] = [],
): Actividad | null {
  const ahora = Date.now();
  const yaPasado = (e: Actividad) => Boolean(e.at) && ms(e.at) <= ahora;

  const deMercados = mercados.flatMap(momentos).filter(yaPasado);
  const deAvisos = avisos
    .filter((a) => !AVISOS_SIN_FRASE.includes(a.kind))
    .map((a) => ({ at: a.created_at, texto: a.title, pendiente: false }))
    .filter(yaPasado);

  const ultimo = elUltimo([...deMercados, ...deAvisos]);
  if (!ultimo) return null;

  return { ...ultimo, pendiente: deMercados.some((e) => e.pendiente) };
}

/**
 * Sello de tiempo corto para la fila de un grupo.
 *
 * A propósito sin horas ni fechas absolutas: esto se pinta en el servidor y
 * un «12:40» saldría en la zona horaria del servidor, no en la de quien mira.
 * Los tramos relativos no tienen ese problema.
 */
export function sello(iso: string): string {
  const diff = Date.now() - ms(iso);
  if (!Number.isFinite(diff)) return '';
  if (diff < 60_000) return 'ahora';

  const minutos = Math.floor(diff / 60_000);
  if (minutos < 60) return `${minutos} min`;

  const horas = Math.floor(diff / 3_600_000);
  if (horas < 24) return `${horas} h`;
  if (horas < 48) return 'ayer';

  const dias = Math.floor(diff / 86_400_000);
  if (dias < 7) return `${dias} d`;

  const semanas = Math.floor(dias / 7);
  if (semanas < 5) return `${semanas} sem`;

  return `${Math.floor(dias / 30)} mes`;
}
