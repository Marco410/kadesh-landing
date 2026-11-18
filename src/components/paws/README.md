# Huellitas

Puntos por ayudar en Kadesh Pet. Los da y los quita kadesh-back (`models/Pet/Paws/README.md`); aquí solo se muestran.

## Dónde

- **Mi cuenta → Huellitas** (`/perfil?tab=paws`, `PawsSection`). A esa ruta lleva la notificación `paws.level_up`.
- **`/ranking`** (pública, «Quién apoya más»): encabezado con «Ayudar a buscar»; a la izquierda, pestañas «Este mes» y «De siempre», podio de los tres primeros (`RankingPodium`) y la lista del 4.º al 50.º (`PawRankRow`); a la derecha, «Tú» (o «¿Quieres aparecer aquí?»), cómo se ganan y los niveles. Cada persona: foto con la insignia de su nivel (`LevelAvatar`), nombre con inicial, racha y huellitas, y enlace a su perfil público (`/u/<username>`). Las dos listas se piden en el servidor (`server.ts`, `fetchPawLeaderboard`, 5 min; el back rehace su caché en cuanto cambia un saldo) y `RankingBoard` solo cambia de pestaña. Con sesión, la franja «Tú» (lugar, nivel, huellitas o «lo ocultaste») sale de `MyPawsSummary`, y tu fila se marca en «De siempre» por lugar y nombre (las filas no traen ids). Enlaces: menú del sitio («Ranking»), pie («Quién apoya más») y la vista Huellitas.
- **Portada** (`components/home/PawRankingSection`): los 5 primeros del mes (o de siempre si este mes hay menos de 3); con menos de 3 personas no sale. Usa la misma `fetchPawLeaderboard` que `/ranking`: comparten la caché.
- **Inicio del perfil**, bajo "Requiere atención" (`PawsSummaryCard`): nivel, huellitas, progreso y racha. Consulta propia `MyPawsSummary` (sin historial); con las huellitas apagadas o si falla, no se muestra.

## Qué muestra

- Nivel («Nivel 2 de 6 · Explorador»), saldo, barra de progreso hacia el siguiente nivel con «Te faltan N huellitas para …» y el camino de los 6 niveles.
- Racha semanal: semanas seguidas, si esta semana ya cuenta y la mejor racha.
- Cómo se ganan (`PAW_WAYS_TO_EARN`), historial con «Cargar más» y el interruptor del ranking.
- Con las huellitas apagadas en el back (`myPaws.enabled = false`): «Las huellitas llegan pronto».

## Datos

- `myPaws` al abrir la vista (una consulta, `cache-and-network`, sin polling). Trae los primeros 20 movimientos.
- `myPawHistory(take, skip)` para «Cargar más», de 20 en 20.
- `setPawRankingVisibility`: la respuesta corrige la caché de `myPaws`; no se vuelve a pedir.

## Qué no hacer

- **No calcular el nivel actual en el front.** Lo manda el back (`level`, `toNextLevel`). `PAW_LEVELS` y `PAW_WAYS_TO_EARN` son una copia para mostrar el camino y la tabla: si cambian las reglas en kadesh-back, se actualizan aquí.
- No pedir huellitas por tarjeta o por autor en listas. Si alguna lista necesita el nivel de muchas personas, el back tiene `getPawLevels` (una consulta); hay que exponerlo en la consulta de esa lista.
