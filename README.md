# Bet366

> Un día más que los profesionales.

Casa de apuestas para un grupo de amigos. Se apuesta con **puntos, nunca con
dinero real**: cada uno empieza la semana con la misma cantidad, apuesta a las
chorradas que se le ocurran al grupo y el lunes se reparte el ranking y vuelta a
empezar.

Cualquiera puede lanzar una apuesta («¿a que fulanito se lía con menganito?»)
poniendo él mismo las cuotas de salida. A partir de ahí el mercado se mueve solo
según por dónde va entrando la gente.

---

## Cómo funciona

### Cuotas fijas con línea que se mueve

Quien lanza la apuesta fija las cuotas de apertura (`Sí 1,90 / No 1,90`). Cada
apuesta **bloquea la cuota que se veía en ese momento**, así que cobras lo que
te prometieron aunque después se mueva.

La cuota que se muestra sí se va moviendo con los puntos que entran: si todo el
mundo va al «Sí», el «Sí» pasa a pagar menos y el «No» a pagar más.

La fórmula está en [`src/lib/engine/odds.ts`](src/lib/engine/odds.ts) y
replicada en SQL en `recompute_odds()`. Tiene una propiedad que importa: **con
volumen cero devuelve exactamente las cuotas que puso el creador**, porque su
margen se conserva como multiplicador constante.

Dos ajustes por grupo controlan el movimiento:

| Ajuste      | Qué hace                                                              | Por defecto |
| ----------- | --------------------------------------------------------------------- | ----------- |
| `drift`     | `0` = cuotas congeladas · `1` = el dinero manda del todo               | `0.5`       |
| `liquidity` | Puntos que tienen que entrar para que el mercado pese como la apertura | `300`       |

### Por qué no se puede multiplicar puntos apostando a todo

Cuota fija + línea que se mueve permitiría arbitraje: apuestas 100 al «Sí» a
1,90 y, cuando el «No» sube a 2,76, cubres el otro lado y ganas pase lo que
pase.

En vez de tocar la fórmula de cuotas, el corte se hace **al aceptar la
apuesta**, con un invariante:

```
para cada usuario y cada apuesta:
    retorno mínimo garantizado  ≤  total de puntos arriesgados
```

Cubrirse sigue permitido (reducir riesgo es legítimo), pero el peor escenario
nunca puede ser una ganancia. Si solo apuestas a una opción el mínimo es 0, así
que la regla únicamente llega a activarse cuando cubres **todas** las opciones.

La comprobación vive en dos sitios a propósito:

- [`src/lib/engine/guard.ts`](src/lib/engine/guard.ts) — para avisar en vivo
  mientras escribes la cantidad y decirte el máximo que puedes poner.
- `place_wager()` en SQL — la que manda de verdad, dentro de la transacción y
  con el mercado bloqueado, para que no se cuele nada por carreras ni saltándose
  el cliente.

### Sin banca

No hay casa que pague ni que se arruine: si aciertas, cobras `apuesta × cuota` y
los puntos aparecen de la nada. Como todo se reinicia cada semana, no hace falta
que el sistema cuadre — solo que nadie tenga beneficio garantizado.

### Resolución de una apuesta

```
abierta ──(llega la fecha)──▶ cerrada ──(el creador pone el resultado)──▶ pendiente
                                                                            │
                              ┌──── nadie impugna en el plazo ──────────────┤
                              ▼                                             ▼
                           pagada                                    impugnada
                                                                            │
                                                            vota el grupo, mayoría
                                                            (empate ⇒ se devuelve)
```

El creador puede además **anular apuestas sueltas que considere fraudulentas**
—la clásica de apostar treinta segundos después de que ya haya pasado— indicando
un motivo que ve todo el grupo. Al anular, se devuelven los puntos y la cuota se
recalcula.

### Avatares

Nada de emojis: cada persona lleva un emblema vectorial, un símbolo sobre un
color. Doce símbolos por ocho colores dan 96 combinaciones, se ven igual en
cualquier móvil y se eligen desde la pestaña de perfil. Al darse de alta se
reparte uno al azar para que dos recién llegados no se confundan entre sí.

Los símbolos viven en [`src/components/avatar-symbol.tsx`](src/components/avatar-symbol.tsx)
y la paleta en [`src/lib/avatars.ts`](src/lib/avatars.ts); en la base de datos
son dos enums, así que no cabe un valor inventado.

### Apostantes públicos o a ciegas

Al lanzar una apuesta se elige si los apostantes y sus cantidades son visibles.
Si es «a ciegas», cada uno solo ve las suyas; el creador sí las ve todas, porque
si no, no podría detectar las fraudulentas. Esto **no** es una decisión de
interfaz: está en las políticas de Row Level Security, así que tampoco se puede
sacar leyendo la API a mano.

### Avisos

Cada vez que pasa algo que te afecta —alguien lanza una apuesta, cierra una
tuya y te toca resolverla, publican un resultado donde tienes puntos, te
impugnan, ganas, pierdes, te anulan una apuesta o empieza semana nueva— se
guarda un aviso para ti.

Se generan **dentro de las mismas funciones que mueven los puntos y en la misma
transacción**: si el pago ocurre, el aviso existe; si el pago se cae, el aviso
tampoco queda. No hay ningún proceso aparte que pueda desincronizarse.

Los avisos son estrictamente personales: la política de RLS solo deja ver los
propios, y la tabla no acepta escrituras directas, así que nadie puede
inventarse un «has ganado 5.000 puntos».

Falta la parte de que suene el móvil (push web), que necesita la app publicada
con HTTPS para poder registrar el service worker.

### La semana

Cada grupo va por semanas. Al cerrarse una:

1. Lo que quedara sin resolver se anula y se devuelven los puntos.
2. Se congela el ranking en `season_results`.
3. Empieza la siguiente con todo el mundo otra vez a la misma cifra.

No hace falta cron: `process_due()` se llama al abrir el grupo y pone al día lo
que toque. Si quieres que ocurra aunque nadie entre, hay un `process_all_due()`
para engancharlo a `pg_cron`.

---

## Arquitectura

```
src/
  app/                     rutas (App Router, todo server components salvo formularios)
    login/                 alta y acceso
    grupos/                lista de grupos, crear, unirse por código
      [groupId]/           tablón · nueva apuesta · detalle · mis apuestas · ranking
  components/              piezas de interfaz reutilizables
                           (cuotas, avatares, contadores, toasts, esqueletos)
  lib/
    engine/                motor de cuotas y guardia anti-arbitraje (+ tests)
    supabase/              clientes de navegador, servidor y middleware
    actions.ts             server actions (única vía de escritura desde la UI)
    data.ts                cargadores de datos
supabase/
  migrations/              esquema, funciones, resolución y políticas RLS
  tests/                   pruebas de la lógica contra un Postgres de verdad
```

**Todo lo que mueve puntos vive en Postgres**, en funciones `security definer`.
Las tablas tienen revocado el `INSERT`/`UPDATE`/`DELETE` directo, así que la
única forma de tocar un saldo es a través de una función que valida saldo,
cierre y arbitraje dentro de la misma transacción. El cliente no es de fiar y el
esquema está montado dando eso por hecho.

---

## Puesta en marcha

### 1. Proyecto de Supabase

Crea uno en [supabase.com](https://supabase.com) (el plan gratuito sobra) y
aplica las migraciones en orden desde el **SQL Editor**:

```
supabase/migrations/0001_schema.sql
supabase/migrations/0002_functions.sql
supabase/migrations/0003_resolution.sql
supabase/migrations/0004_policies.sql
```

Si algo falla, para ahí y no sigas con el siguiente: cada uno depende del
anterior.

O con la CLI: `supabase db push`.

En **Authentication → Providers → Email**, si quieres que la gente entre sin
confirmar el correo, desactiva *Confirm email*.

### 2. Variables de entorno

```bash
cp .env.example .env.local
```

Rellena con los datos de **Project Settings → API**:

```
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOi...
```

### 3. Arrancar

```bash
npm install
npm run dev
```

**En Windows**, si al arrancar sale `EACCES: permission denied 0.0.0.0:3000`, es
que Hyper-V o WSL tienen reservado ese puerto. No es un problema de permisos:
usa otro puerto.

```powershell
npm run dev -- -p 3005
```

Para ver qué rangos están reservados: `netsh interface ipv4 show excludedportrange protocol=tcp`.
Y ojo con encadenar comandos: PowerShell 5 no admite `&&`, usa `;` o dos líneas.

### 4. Publicar

Importa el repositorio en [Vercel](https://vercel.com), añade esas dos
variables de entorno y listo. Es una PWA: desde el móvil se puede añadir a la
pantalla de inicio y se comporta como una app.

---

## Tests

```bash
npm test                    # motor de cuotas y anti-arbitraje (vitest)
./supabase/tests/run.sh     # lógica completa contra un Postgres local
```

### Mirar el diseño sin montar nada

`npm install && npm run dev` funciona **sin proyecto de Supabase**: la app
redirige a `/configurar` con las instrucciones, y en
[`/estilos`](http://localhost:3000/estilos) están todas las piezas de interfaz
con todos sus estados en una sola página. Es la forma rápida de revisar el
diseño sin reproducir cada situación en la app real. En producción esa ruta
devuelve 404.

El segundo levanta un Postgres, aplica las migraciones sobre un stub mínimo de
lo que aporta Supabase (`auth.users`, `auth.uid()`) y comprueba el ciclo entero:
apuestas, rechazo de arbitraje, anulación por fraude, publicación de resultado,
impugnación con votación, pago, reinicio semanal y políticas de acceso.

Entre los dos hay 81 comprobaciones. Las que más importan:

- ninguna secuencia de apuestas aceptada produce beneficio garantizado
  (comprobado además con 300 secuencias aleatorias);
- `process_due()` es idempotente: llamarlo dos veces no paga dos veces;
- desde fuera de un grupo no se ve nada de ese grupo;
- no se pueden regalar puntos escribiendo directamente en las tablas;
- cada aviso llega exactamente a quien le toca y a nadie más.

---

## Ideas para más adelante

- Que suene el móvil: push web sobre los avisos que ya existen.
- Comentarios en cada apuesta.
- Cuotas que se mueven en pantalla sin recargar (Supabase Realtime).
- Compartir una apuesta como imagen para WhatsApp.
- Histórico del movimiento de la cuota en un gráfico.
- Ligas de varias semanas además del ranking semanal.
