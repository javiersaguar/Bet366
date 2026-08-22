/**
 * La sesión de Supabase se abre desde el navegador, así que la URL del
 * proyecto y la clave pública tienen que estar dentro del JavaScript que se
 * descarga. Next solo mete ahí las variables que empiezan por `NEXT_PUBLIC_`.
 *
 * El problema es que la integración oficial de Supabase con Vercel pone sus
 * variables sin ese prefijo (`SUPABASE_URL`, `SUPABASE_ANON_KEY`), y añadir a
 * mano las `NEXT_PUBLIC_` es justo donde se tuerce todo: se marcan sin querer
 * como «Sensitive», se limitan a una rama, o simplemente no llegan.
 *
 * `env` resuelve eso: incrusta al construir cualquier variable, tenga el
 * prefijo o no. Aquí se busca por orden hasta encontrar una con valor, así que
 * la app arranca con lo que ponga la integración y no hace falta duplicar nada
 * a mano.
 *
 * Solo se exponen la URL y la clave pública, que es información pública por
 * diseño: la clave anónima no da acceso a nada por sí sola, quien manda son
 * las políticas de fila. La `service_role`, la `secret` y las `POSTGRES_*` no
 * se tocan aquí jamás: se saltan esas políticas.
 */

import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);

/* Next evalúa este fichero ANTES de leer los .env, así que en local no vería
   nada. En Vercel las variables ya vienen en el entorno del proceso, pero para
   que el comportamiento sea el mismo en los dos sitios se cargan aquí. */
require('@next/env').loadEnvConfig(process.cwd());

/* La lista vive en un solo sitio, que además tiene una prueba comprobando que
   ahí no se cuela nunca una clave de servicio. */
const NOMBRES = require('./src/lib/supabase/nombres.json');

/** Primera variable de la lista que traiga algo, con el nombre de dónde salió. */
function resolver(nombres) {
  for (const nombre of nombres) {
    const valor = process.env[nombre];
    if (valor && valor.length > 0) return { valor, nombre };
  }
  return { valor: '', nombre: '' };
}

const url = resolver(NOMBRES.url);
const clave = resolver(NOMBRES.clave);

/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: { serverActions: { bodySizeLimit: '1mb' } },
  env: {
    BET366_SUPABASE_URL: url.valor,
    BET366_SUPABASE_CLAVE: clave.valor,
    /* De qué variable ha salido cada una, para poder decirlo en /configurar. */
    BET366_SUPABASE_URL_ORIGEN: url.nombre,
    BET366_SUPABASE_CLAVE_ORIGEN: clave.nombre,
  },
};

export default nextConfig;
