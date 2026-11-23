---
estado: pendiente
fecha: 2026-11-17
origen: kadesh-landing@feat/huellitas, feat/ranking-huellitas (actualizado 2026-11-23)
feature: profile
---

# Prompt para kadesh-pet-mobile: Huellitas (nivel, progreso, racha) y sistema visual de niveles

Es el primero de tres; impleméntalos en orden:
1. Este: pantalla «Huellitas», tarjeta en Inicio y el sistema visual de niveles (colores, íconos, foto con insignia, lista de niveles).
2. [Perfil público, autor con nivel y ajustes de perfil](2026-11-18-perfil-publico.md).
3. [Ranking «Quién apoya más»](2026-11-18-ranking-quien-apoya-mas.md).

## Contexto
El back da **huellitas** (puntos) por ayudar en Kadesh Pet: publicar un reporte, avisar que viste a un animal («Lo vi»), cerrar un caso, reencuentros confirmados, adopciones, eventos publicados, comentarios, reseñas y compras en la tienda. Con ellas la persona sube de nivel (6 niveles) y mantiene una racha semanal. Cada nivel tiene su ícono y su color, y se usan igual en toda la app: pantalla de Huellitas, Inicio, perfil público, ranking y la foto de cada persona.

## Qué implementar en la app

### A. Sistema visual de niveles (base para los tres prompts)

1. **Colores e íconos por nivel** (por `level.key`). Íconos de `@hugeicons/react-native`. Colores de la paleta de Tailwind (NativeWind):

   | Nivel | `key` | Desde | Ícono | Sólido (fondo · texto) | Barra | Texto del color | Suave (fondo · texto, claro / oscuro) |
   |---|---|---|---|---|---|---|---|
   | 1 Cachorro | `puppy` | 0 | `Bone01Icon` | slate-500 #64748b · blanco | slate-500 | slate-600 / slate-300 | slate-100 · slate-700 / slate-400 al 15 % · slate-200 |
   | 2 Explorador | `explorer` | 30 | `Compass01Icon` | emerald-600 #059669 · blanco | emerald-500 #10b981 | emerald-700 / emerald-300 | emerald-50 · emerald-700 / emerald-500 al 15 % · emerald-300 |
   | 3 Guardián | `guardian` | 120 | `Shield01Icon` | sky-600 #0284c7 · blanco | sky-500 #0ea5e9 | sky-700 / sky-300 | sky-50 · sky-700 / sky-500 al 15 % · sky-300 |
   | 4 Rescatista | `rescuer` | 350 | `LifebuoyIcon` | violet-600 #7c3aed · blanco | violet-500 #8b5cf6 | violet-700 / violet-300 | violet-50 · violet-700 / violet-500 al 15 % · violet-300 |
   | 5 Héroe | `hero` | 900 | `Medal01Icon` | amber-500 #f59e0b · amber-950 #451a03 | amber-400 #fbbf24 | amber-700 / amber-300 | amber-50 · amber-800 / amber-400 al 15 % · amber-300 |
   | 6 Leyenda | `legend` | 2000 | `Crown02Icon` | degradado amber-300 #fcd34d → yellow-400 #facc15 → orange-500 #f97316 · amber-950 | el mismo degradado, de izquierda a derecha | amber-700 / yellow-300 | yellow-50 · amber-800 / yellow-400 al 15 % · yellow-300 |

   Una `key` desconocida usa Cachorro. Guarda esta tabla en un solo lugar: si un color cambia, cambia en toda la app.

2. **Foto con insignia de nivel** (componente reutilizable; lo usan los prompts 2 y 3):
   - La foto (o la inicial en blanco sobre el azul de marca `#216BFA`), redonda, con un **anillo del color del nivel** (el «sólido», separado de la foto por 2 px del color de fondo).
   - Abajo a la derecha, un **círculo con el ícono del nivel** sobre su color sólido, con borde del color de fondo.
   - Tamaños: chico 36 px (insignia 16, ícono 10), mediano 48 (20 / 12), grande 64 (28 / 15), extra grande 128 (40 / 20).
   - Sin nivel (`level: null`, huellitas apagadas en el back): foto normal, sin anillo ni insignia.
   - Accesibilidad: el lector de pantalla dice «Nivel N · nombre».

3. **Lista de niveles** (componente reutilizable): los 6 en fila vertical. Cada fila: círculo de 32 px con el ícono sobre su color sólido, «N. Nombre» y, a la derecha, «desde» en número (`2,000`). Con un nivel actual:
   - Su fila lleva un fondo gris suave y, junto al nombre, una pastilla con el color «suave» del nivel que dice «Tú» (o el texto que se le pase, p. ej. «Su nivel» en el perfil público).
   - Los niveles que aún no alcanza van con el círculo al 40 % de opacidad y el texto atenuado.
   - Sin nivel actual: todos normales.

### B. Pantalla «Huellitas» (dentro del perfil, junto a «Datos del perfil»)

La abre también la notificación de tipo `paws.level_up` (en la web su `url` es `/perfil?tab=paws`).

1. **Tarjeta del nivel**:
   - Un brillo suave del color del nivel en la esquina superior izquierda.
   - Cuadro de 64 px con el ícono del nivel (32 px) sobre su color sólido; al lado «NIVEL {level} DE 6» en mayúsculas con el «texto del color» y, grande, el nombre (`level.label`).
   - A la derecha, grande, el saldo (`balance`) con «huellita»/«huellitas». Cuenta hacia arriba al aparecer (opcional).
   - **Bloque de progreso** (fondo gris suave, esquinas redondeadas):
     - «Te faltan {toNextLevel} huellitas para {siguiente}.» (singular: «Te falta 1 huellita…»). En el nivel 6 (`nextAt` null): «Llegaste al nivel más alto. ¡Gracias por tanto!».
     - A la derecha del texto, una pastilla con el color «suave» del **siguiente** nivel, con su ícono: «Siguiente: {nombre}». No sale en el nivel 6.
     - Barra de 12 px del color «barra» del nivel actual, de `level.from` a `level.nextAt` con `lifetimeEarned` (mínimo 3 % si ya pasó de `from`); a la derecha «{lifetimeEarned} / {nextAt}» (en el nivel 6 solo `lifetimeEarned`, barra llena).
   - **Camino de niveles**: los 6 en una fila, unidos por una línea gris de 4 px que pasa por el centro de los círculos. El tramo ya recorrido (del primero al actual) va del color «barra» del nivel actual.
     - Cada nivel: círculo de 40 px con su ícono; los alcanzados sobre **su propio** color sólido, el actual un poco más grande (44 px, sombra) y los que faltan en gris con ícono gris.
     - Debajo: el nombre (el actual en su «texto del color», alcanzados en texto normal, los que faltan atenuados) y el umbral en chico.
2. **Racha semanal** (tarjeta al lado o debajo):
   - Ícono de fuego, «Racha semanal», `streakWeeks` grande y «semana seguida» / «semanas seguidas».
   - Pastilla: verde «Esta semana ya cuenta.» si `streakActiveThisWeek`; si no, ámbar «Ayuda en algo esta semana para no perderla.» (o «…para empezarla.» si va en 0).
   - «Una acción que ayude por semana (lunes a domingo) la mantiene. Desde la segunda semana seguida ganas un bono de hasta 25 huellitas.»
   - «Tu mejor racha: N semanas» si `bestStreakWeeks > 0`.
3. **Cómo ganar huellitas**: la tabla de «Reglas», cada fila con el texto, la regla en chico y una pastilla «+N». Arriba: «Por ayudar de verdad. Hasta 60 al día entre reportes, avisos, cierres, comentarios y reseñas.» Abajo: «Los likes, favoritos y visitas no dan huellitas. Si se borra un reporte, se oculta un aviso o se reabre un caso, las huellitas que dio se quitan.»
4. **Movimientos**: «Lo que ganaste y lo que se quitó, lo más reciente arriba.» Los 20 de `myPaws.history`; «Cargar más» pide `myPawHistory(take: 20, skip: <los que ya se ven>)` y se oculta cuando una página trae menos de 20. Cada fila: texto de la acción, fecha corta («18 nov 2026») y la cantidad en verde (+N) o rojo (−N). Vacío: «Aún no tienes movimientos» / «Publica un reporte o avisa que viste a un animal perdido para ganar tus primeras huellitas.» con botón a animales perdidos.
5. **Niveles**: tarjeta «Niveles» / «Desde cuántas huellitas empieza cada uno.» con la lista de niveles (A.3) marcando el nivel actual con «Tú».
6. **Ranking**: tarjeta con ícono de ranking, «Aparecer en el ranking de quien más apoya» y un interruptor (encendido = `!rankingHidden`). Texto: «Vas en el lugar {rank}. » si `rank` no es null y está encendido, más «Solo se ven tu nombre y tu foto, nunca tus datos de contacto.» y el enlace «Ver el ranking» (pantalla del prompt 3; mientras no exista, omítelo). Al cambiarlo, `setPawRankingVisibility`; con la respuesta corrige el estado local (`rankingHidden`, y `rank` a null si se ocultó) sin volver a pedir la pantalla. Toast con `message`; si `success` es false, toast de error «No pudimos guardar».
7. Si `myPaws.enabled` es `false`: estado vacío con ícono de huella, «Las huellitas llegan pronto» / «Muy pronto vas a ganar huellitas por cada reporte, aviso y caso cerrado, y a subir de nivel.»

### C. Tarjeta «Huellitas» en Inicio del perfil

Solo si la app ya tiene el Inicio del perfil (prompt 2026-11-03). Va debajo de «Requiere atención»:
- «Huellitas» y «Ver más ›» a la pantalla de Huellitas.
- Cuadro de 44 px con el ícono del nivel sobre su color sólido, «NIVEL N DE 6» con el «texto del color», el nombre del nivel y, a la derecha, el saldo con «huellitas».
- Barra de 10 px del color «barra» del nivel; debajo, el mismo texto «Te faltan…» y «{lifetimeEarned} / {nextAt}».
- Línea con ícono de fuego: «Racha de N semana(s)» (+ «: ayuda en algo esta semana para no perderla» si `streakActiveThisWeek` es false); con 0: «Ayuda en algo esta semana para empezar tu racha».
- Va en su propia operación (`MyPawsSummary`), no en la consulta de Inicio: si falla o `enabled` es false, la tarjeta no sale y el resto de Inicio sigue igual. Mientras carga, un bloque gris del mismo alto.

Una sola consulta al abrir cada pantalla y al jalar para refrescar. Nada de polling. Son campos nuevos del back: van en su propia operación, no dentro de la consulta de arranque.

## GraphQL

```graphql
query MyPaws {
  myPaws {
    enabled
    balance
    lifetimeEarned
    level { level key label from nextAt }
    toNextLevel
    streakWeeks
    bestStreakWeeks
    streakActiveThisWeek
    rankingHidden
    rank
    history { id action kind amount createdAt }
  }
}

query MyPawsSummary {
  myPaws {
    enabled
    balance
    lifetimeEarned
    level { level key label from nextAt }
    toNextLevel
    streakWeeks
    streakActiveThisWeek
    rankingHidden
    rank
  }
}

query MyPawHistory($take: Int, $skip: Int) {
  myPawHistory(take: $take, skip: $skip) { id action kind amount createdAt }
}

mutation SetPawRankingVisibility($hidden: Boolean!) {
  setPawRankingVisibility(hidden: $hidden) { success message rankingHidden }
}
```

`myPaws` es `null` sin sesión. `myPawHistory` acepta `take` hasta 50. `rank` es el lugar en el ranking de siempre si está entre los 50 primeros (lo calcula el back en el momento).

```ts
type PawLevelInfo = {
  level: number;            // 1..6
  key: string;              // puppy | explorer | guardian | rescuer | hero | legend
  label: string;            // Cachorro, Explorador…
  from: number;             // huellitas acumuladas donde empieza el nivel
  nextAt: number | null;    // donde empieza el siguiente; null en el último
};
type PawHistoryEntry = {
  id: string;
  action: string;
  kind: string;             // earn | reversal | adjust | spend
  amount: number;           // negativo si se quitaron o gastaron
  createdAt: string;        // ISO
};
type MyPaws = {
  enabled: boolean;
  balance: number;          // para gastar (aún no hay canje)
  lifetimeEarned: number;   // define el nivel
  level: PawLevelInfo;
  toNextLevel: number | null;
  streakWeeks: number;      // 0 si la racha ya caducó
  bestStreakWeeks: number;
  streakActiveThisWeek: boolean;
  rankingHidden: boolean;
  rank: number | null;
  history: PawHistoryEntry[];
};
```

## Reglas y constantes
Copia de las reglas del back (`kadesh-back/models/Pet/Paws/constants.ts`); si allá cambian, cambian aquí. El nivel actual y el progreso los manda el back: la tabla de niveles solo sirve para pintar el camino y la lista.

Cómo se ganan (texto, puntos, regla), en este orden:

| Acción | + | Regla |
|---|---|---|
| Publicar un reporte | 15 | Hasta 2 al día |
| Avisar que viste a un animal («Lo vi») | 10 | Hasta 3 al día, en reportes de otras personas |
| Cerrar tu caso | 10 | Con al menos 6 h abierto |
| Su familia lo reclamó y aceptaste | 40 | Reencuentro confirmado |
| Adoptar en Kadesh | 30 | Al completar la adopción |
| Publicar un evento | 20 | Cuando se aprueba |
| Comentar un reporte | 3 | Uno por reporte, 20+ caracteres |
| Reseñar una veterinaria | 5 | Una por veterinaria |
| Registrar tu primera mascota | 10 | Una vez |
| Comprar en la tienda de Kadesh | 10 | Por producto distinto de $100 o más, al recibirlo. Hasta 3 al día |
| Reseñar un producto que compraste | 5 | Una por producto, con la calificación que sea. Hasta 3 al día |
| Alguien que invitaste empieza a ayudar | 20 | Una vez por persona |

Texto de cada movimiento por `action`:
`report_published` Publicaste un reporte · `sighting` Avisaste que viste a un animal · `case_closed` Cerraste un caso · `reunion_helped` Ayudaste a un reencuentro · `adoption_completed` Adoptaste en Kadesh · `event_approved` Se publicó tu evento · `comment` Comentaste un reporte · `review` Reseñaste una veterinaria · `first_pet` Registraste tu primera mascota · `first_health_record` Primer registro en la cartilla · `rescue_verified` Verificamos tu espacio de rescate · `place_verified` Verificamos tu veterinaria · `referral` Alguien que invitaste empezó a ayudar · `purchase` Recibiste tu compra de la tienda · `product_review` Reseñaste un producto que compraste · `streak_bonus` Bono por tu racha · `admin_adjust` Ajuste de Kadesh · otra: Movimiento.
Con `kind = reversal`: «Se quitó: » + el texto con la inicial en minúscula. Con `kind = spend`: «Canjeaste huellitas».

## Referencia web
`src/components/paws/PawsSection.tsx` (pantalla), `PawsSummaryCard.tsx` (Inicio), `LevelAvatar.tsx` (colores e insignia), `PawLevelsList.tsx`, `constants.ts`, `queries.ts`, `useMyPaws.ts`.

## Criterios de aceptación
- [ ] Los colores e íconos de nivel salen de un solo lugar y coinciden con la tabla.
- [ ] La pantalla sale en el perfil y la abre la notificación `paws.level_up`.
- [ ] Tarjeta del nivel con su color, «Siguiente: …», barra y camino de niveles correctos en los niveles 1 a 6 (en el 6, barra llena y sin «Siguiente»).
- [ ] Racha con su aviso verde o ámbar y la mejor racha.
- [ ] Historial con «Cargar más» paginado; cantidades negativas en rojo; reversas con «Se quitó: …».
- [ ] La lista de niveles marca el nivel actual con «Tú» y atenúa los que faltan.
- [ ] El interruptor del ranking guarda y corrige el estado sin volver a pedir la pantalla.
- [ ] Inicio muestra la tarjeta; si falla su consulta, el resto de Inicio no se afecta.
- [ ] Con `enabled: false` muestra «Las huellitas llegan pronto» y la tarjeta de Inicio no sale.
- [ ] Una sola petición al abrir; ninguna con la app en segundo plano.
- [ ] Funciona en iOS y Android, en modo claro y oscuro.
- [ ] Maneja carga, error y vacío.
