'use client';

import Link from 'next/link';
import { startTransition, useActionState, useCallback, useEffect, useRef, useState } from 'react';
import { Camera } from '@phosphor-icons/react/dist/csr/Camera';
import { Trash } from '@phosphor-icons/react/dist/csr/Trash';
import { MagnifyingGlassPlus } from '@phosphor-icons/react/dist/csr/MagnifyingGlassPlus';
import { removeProfilePhotoAction, setProfilePhotoAction } from '@/lib/actions';
import {
  LADO_SALIDA,
  MAX_BYTES_SALIDA,
  MAX_LADO_ENTRADA,
  MAX_PIXELES_ENTRADA,
  TIPOS_QUE_SE_PUEDEN_ELEGIR,
  megas,
  porQueNoVale,
} from '@/lib/avatar-foto';
import { Alert } from '@/components/ui';
import { useToast } from '@/components/toast';

/** Cuánto se puede acercar sobre el tamaño que ya cubre el cuadro. */
const ZOOM_MAX = 3;

type Elegida = { img: HTMLImageElement; url: string };

/**
 * Poner, cambiar o quitar tu foto de perfil.
 *
 * El fichero que eliges no se sube nunca. Se dibuja en un lienzo, se recorta
 * al cuadrado que has encuadrado y se codifica de cero a 512x512: lo que sale
 * son píxeles y nada más. Eso tira por el camino cualquier cosa escondida
 * dentro del original y, de paso, los metadatos EXIF, que en una foto de
 * móvil llevan las coordenadas de dónde se hizo. Nadie del grupo tiene por
 * qué saber dónde vives.
 *
 * La vista previa y el recorte final salen del mismo elemento `img`, así que
 * lo que se guarda es exactamente lo que se estaba viendo, con la orientación
 * de la foto ya aplicada por el navegador.
 */
export function FotoDePerfil({
  tieneFoto,
  demo = false,
}: {
  tieneFoto: boolean;
  /** En la demostración no hay sesión ni almacén: mejor decirlo que fallar. */
  demo?: boolean;
}) {
  /* La rama de la demostración va en un componente aparte y no en un `return`
     antes de tiempo: lo de abajo tiene estado, y un atajo por encima de los
     hooks es de las cosas que funcionan hasta el día que dejan de hacerlo. */
  if (demo) {
    return (
      <Link href="/login" className="btn-ghost w-full">
        <Camera size={16} weight="bold" />
        Pon tu foto en la app de verdad
      </Link>
    );
  }
  return <Subidor tieneFoto={tieneFoto} />;
}

function Subidor({ tieneFoto }: { tieneFoto: boolean }) {
  const entrada = useRef<HTMLInputElement>(null);
  const marco = useRef<HTMLDivElement>(null);
  const [elegida, setElegida] = useState<Elegida | null>(null);
  const [aviso, setAviso] = useState<string | null>(null);
  const [lado, setLado] = useState(260);
  const [zoom, setZoom] = useState(1);
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const [comprimiendo, setComprimiendo] = useState(false);

  const [guardado, guardar, guardando] = useActionState(setProfilePhotoAction, {});
  const [quitado, quitar, quitando] = useActionState(
    async () => removeProfilePhotoAction(),
    {} as { error?: string; ok?: true },
  );
  const toast = useToast();

  /* Escala a la que la foto justo cubre el cuadro. Todo lo demás se mide
     sobre esta: zoom 1 es "cubre y no sobra por ningún lado". */
  const base = elegida
    ? lado / Math.min(elegida.img.naturalWidth, elegida.img.naturalHeight)
    : 1;

  const limpiar = useCallback(() => {
    setElegida((previa) => {
      if (previa) URL.revokeObjectURL(previa.url);
      return null;
    });
    setZoom(1);
    setPos({ x: 0, y: 0 });
    setComprimiendo(false);
  }, []);

  useEffect(() => {
    if (guardado.ok) {
      toast('Foto guardada');
      limpiar();
    }
  }, [guardado, toast, limpiar]);

  useEffect(() => {
    if (quitado.ok) toast('Foto quitada');
  }, [quitado, toast]);

  // El cuadro es elástico, y la cuenta del recorte necesita su lado en píxeles.
  useEffect(() => {
    const caja = marco.current;
    if (!caja) return;
    const observador = new ResizeObserver(([e]) => setLado(e.contentRect.width));
    observador.observe(caja);
    return () => observador.disconnect();
  }, [elegida]);

  // Y al cerrar, soltar el objeto de la foto para no dejarlo en memoria.
  useEffect(() => () => setElegida((p) => (p && URL.revokeObjectURL(p.url), null)), []);

  /** Que la foto no se despegue nunca de los bordes del cuadro. */
  const encajar = useCallback(
    (x: number, y: number, z: number, e: Elegida) => {
      const ancho = e.img.naturalWidth * base * z;
      const alto = e.img.naturalHeight * base * z;
      return {
        x: Math.min(0, Math.max(lado - ancho, x)),
        y: Math.min(0, Math.max(lado - alto, y)),
      };
    },
    [base, lado],
  );

  async function alElegir(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = ''; // para poder volver a elegir la misma
    if (!file) return;

    setAviso(null);

    const pega = porQueNoVale(file.name, file.size, file.type);
    if (pega) return setAviso(pega);

    const url = URL.createObjectURL(file);
    const img = new Image();
    img.decoding = 'async';

    try {
      await new Promise<void>((listo, falla) => {
        img.onload = () => listo();
        img.onerror = () => falla(new Error('no se puede leer'));
        img.src = url;
      });
    } catch {
      URL.revokeObjectURL(url);
      return setAviso(
        'Tu navegador no sabe abrir esa foto. Si es un HEIC de iPhone, prueba a exportarla como JPG.',
      );
    }

    const { naturalWidth: w, naturalHeight: h } = img;
    if (w < 1 || h < 1) {
      URL.revokeObjectURL(url);
      return setAviso('Esa foto no tiene contenido.');
    }
    /* Un fichero pequeño puede desplegarse en algo enorme al descomprimirlo.
       Aquí ya está decodificada y el navegador ha aguantado, pero se para de
       todas formas: a partir de este tamaño no es una foto, es otra cosa. */
    if (w > MAX_LADO_ENTRADA || h > MAX_LADO_ENTRADA || w * h > MAX_PIXELES_ENTRADA) {
      URL.revokeObjectURL(url);
      return setAviso(`Esa foto es enorme (${w}x${h}). Prueba con una normal de la galería.`);
    }

    setZoom(1);
    setPos({ x: 0, y: 0 });
    setElegida({ img, url });
  }

  // -------------------------------------------------------------- arrastrar

  const arrastre = useRef<{ id: number; x: number; y: number } | null>(null);

  function alPulsar(e: React.PointerEvent) {
    if (!elegida) return;
    (e.target as Element).setPointerCapture(e.pointerId);
    arrastre.current = { id: e.pointerId, x: e.clientX - pos.x, y: e.clientY - pos.y };
  }

  function alMover(e: React.PointerEvent) {
    const a = arrastre.current;
    if (!a || a.id !== e.pointerId || !elegida) return;
    setPos(encajar(e.clientX - a.x, e.clientY - a.y, zoom, elegida));
  }

  function alSoltar(e: React.PointerEvent) {
    if (arrastre.current?.id === e.pointerId) arrastre.current = null;
  }

  function alAcercar(z: number) {
    setZoom(z);
    if (elegida) setPos((p) => encajar(p.x, p.y, z, elegida));
  }

  // ----------------------------------------------------------------- subir

  async function subir() {
    if (!elegida) return;
    setComprimiendo(true);
    setAviso(null);

    try {
      const escala = base * zoom;
      const lienzo = document.createElement('canvas');
      lienzo.width = LADO_SALIDA;
      lienzo.height = LADO_SALIDA;
      const ctx = lienzo.getContext('2d');
      if (!ctx) throw new Error('sin lienzo');

      /* El trozo visible, en coordenadas de la foto original: donde empieza
         el cuadro y cuánto abarca a la escala actual. */
      ctx.imageSmoothingQuality = 'high';
      ctx.drawImage(
        elegida.img,
        -pos.x / escala,
        -pos.y / escala,
        lado / escala,
        lado / escala,
        0,
        0,
        LADO_SALIDA,
        LADO_SALIDA,
      );

      const hecho = await comprimir(lienzo);
      if (!hecho) throw new Error('sin comprimir');

      const fd = new FormData();
      fd.append('foto', hecho.blob, `avatar.${hecho.ext}`);
      startTransition(() => guardar(fd));
    } catch {
      setAviso('No se ha podido preparar la foto. Prueba con otra.');
    } finally {
      setComprimiendo(false);
    }
  }

  const ocupado = comprimiendo || guardando;
  const error = aviso ?? guardado.error ?? quitado.error;

  // ------------------------------------------------------------------ pinta

  if (!elegida) {
    return (
      <div className="space-y-3">
        <input
          ref={entrada}
          type="file"
          accept={TIPOS_QUE_SE_PUEDEN_ELEGIR}
          onChange={alElegir}
          className="sr-only"
          aria-label="Elegir una foto de la galería"
        />

        <div className="flex flex-wrap gap-2">
          <button type="button" onClick={() => entrada.current?.click()} className="btn-ghost">
            <Camera size={16} weight="bold" />
            {tieneFoto ? 'Cambiar la foto' : 'Poner una foto'}
          </button>

          {tieneFoto && (
            <button
              type="button"
              onClick={() => startTransition(() => quitar())}
              disabled={quitando}
              className="btn-quiet !text-lose disabled:opacity-50"
            >
              <Trash size={15} weight="bold" />
              {quitando ? 'Quitando…' : 'Quitar'}
            </button>
          )}
        </div>

        <p className="text-micro leading-relaxed text-content-faint">
          {tieneFoto
            ? 'Si la quitas vuelve tu emblema, que sigue siendo el de abajo.'
            : 'La eliges de la galería y la encuadras. Se guarda recortada y sin los datos de dónde se hizo.'}
        </p>

        {error && <Alert kind="error">{error}</Alert>}
      </div>
    );
  }

  return (
    <div className="animate-rise space-y-4">
      <div className="mx-auto w-full max-w-[280px]">
        <div
          ref={marco}
          onPointerDown={alPulsar}
          onPointerMove={alMover}
          onPointerUp={alSoltar}
          onPointerCancel={alSoltar}
          className="relative aspect-square w-full cursor-grab touch-none overflow-hidden
                     rounded-3xl border border-line-strong bg-surface-sunken active:cursor-grabbing"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={elegida.url}
            alt=""
            draggable={false}
            style={{
              width: elegida.img.naturalWidth * base,
              height: elegida.img.naturalHeight * base,
              transform: `translate3d(${pos.x}px, ${pos.y}px, 0) scale(${zoom})`,
              transformOrigin: '0 0',
            }}
            className="max-w-none select-none"
          />

          {/* Guía de lo que se va a ver de verdad: los avatares son cuadrados
              de esquinas redondeadas, no círculos. */}
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 rounded-3xl
                       shadow-[inset_0_0_0_1px_rgba(255,255,255,.14)]"
          />
        </div>
      </div>

      <div className="mx-auto flex w-full max-w-[280px] items-center gap-3">
        <MagnifyingGlassPlus size={16} weight="bold" className="shrink-0 text-content-faint" />
        <input
          type="range"
          min={1}
          max={ZOOM_MAX}
          step={0.01}
          value={zoom}
          onChange={(e) => alAcercar(Number(e.target.value))}
          aria-label="Acercar la foto"
          style={{ '--v': (zoom - 1) / (ZOOM_MAX - 1) } as React.CSSProperties}
        />
      </div>

      <p className="text-center text-micro text-content-faint">
        Arrastra para encuadrar. Se guarda a {LADO_SALIDA}x{LADO_SALIDA}, menos de{' '}
        {megas(MAX_BYTES_SALIDA)}.
      </p>

      {error && <Alert kind="error">{error}</Alert>}

      <div className="flex gap-2">
        <button type="button" onClick={limpiar} disabled={ocupado} className="btn-quiet flex-1">
          Cancelar
        </button>
        <button type="button" onClick={subir} disabled={ocupado} className="btn-primary flex-1">
          {ocupado ? 'Guardando…' : 'Usar esta foto'}
        </button>
      </div>
    </div>
  );
}

/**
 * Del lienzo a un fichero pequeño.
 *
 * Se prueba WebP y, si el navegador no sabe (Safari viejo devuelve un PNG sin
 * avisar, por eso se mira el tipo de lo que sale), JPEG. Se baja la calidad
 * hasta entrar en el tope; un cuadrado de 512 entra de sobra a la primera,
 * pero el bucle está para que nunca salga de aquí algo más grande de lo que
 * el servidor va a aceptar.
 */
async function comprimir(
  lienzo: HTMLCanvasElement,
): Promise<{ blob: Blob; ext: string } | null> {
  const formatos = [
    { tipo: 'image/webp', ext: 'webp' },
    { tipo: 'image/jpeg', ext: 'jpg' },
  ] as const;

  for (const { tipo, ext } of formatos) {
    for (const calidad of [0.85, 0.72, 0.6, 0.45]) {
      const blob = await new Promise<Blob | null>((r) => lienzo.toBlob(r, tipo, calidad));
      if (!blob || blob.type !== tipo) break; // este navegador no sabe ese formato
      if (blob.size <= MAX_BYTES_SALIDA) return { blob, ext };
    }
  }
  return null;
}
