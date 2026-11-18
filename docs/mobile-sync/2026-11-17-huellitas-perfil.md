---
estado: pendiente
fecha: 2026-11-17
origen: kadesh-landing@feat/huellitas
feature: profile
---

# Prompt para kadesh-pet-mobile: Huellitas en el perfil (nivel, progreso y racha)

## Contexto
El back ahora da **huellitas** (puntos) por ayudar en Kadesh Pet: publicar un reporte, avisar que viste a un animal, cerrar un caso, reencuentros confirmados, adopciones, eventos publicados, comentarios y reseñas. Con ellas la persona sube de nivel (6 niveles) y mantiene una racha semanal. En la web hay una pantalla nueva en el perfil, «Huellitas», con su nivel, cuánto le falta para el siguiente, su racha, cómo se ganan, su historial y si aparece en el ranking público.

## Qué implementar en la app
Una pantalla «Huellitas» dentro del perfil (junto a «Datos del perfil»). La abre también la notificación de tipo `paws.level_up` (su `url` en la web es `/perfil?tab=paws`).

1. **Nivel**: ícono de huella, «Nivel {level} de 6», el nombre del nivel (`level.label`) y, a la derecha, el saldo (`balance`) con «huellitas».
2. **Progreso**: barra de `level.from` a `level.nextAt` con el valor `lifetimeEarned`.
   - Texto: «Te faltan {toNextLevel} huellitas para {nombre del siguiente nivel}» (singular: «Te falta 1 huellita…»), y «{lifetimeEarned} / {nextAt}».
   - En el último nivel (`nextAt` null): barra llena y «Llegaste al nivel más alto. ¡Gracias por tanto!».
   - Debajo, los 6 niveles con su umbral; los alcanzados con palomita y el actual resaltado.
3. **Racha semanal**: `streakWeeks` con «semana(s) seguida(s)».
   - Si `streakActiveThisWeek`: aviso verde «Esta semana ya cuenta.». Si no: ámbar, «Ayuda en algo esta semana para no perderla.» (o «…para empezarla.» si va en 0).
   - Explicación: «Una acción que ayude por semana (lunes a domingo) la mantiene. Desde la segunda semana seguida ganas un bono de hasta 25 huellitas.»
   - «Tu mejor racha: N semanas» si `bestStreakWeeks > 0`.
4. **Cómo ganar huellitas**: la tabla de abajo, con «Hasta 60 al día entre reportes, avisos, cierres, comentarios y reseñas» y la nota «Los likes, favoritos y visitas no dan huellitas. Si se borra un reporte, se oculta un aviso o se reabre un caso, las huellitas que dio se quitan.»
5. **Movimientos**: los 20 de `myPaws.history`; «Cargar más» pide `myPawHistory(take: 20, skip: <los que ya se ven>)` y se oculta cuando una página trae menos de 20. Cada fila: texto de la acción, fecha corta y la cantidad en verde (+) o rojo (−). Vacío: «Aún no tienes movimientos» con un botón a animales perdidos.
6. **Ranking**: interruptor «Aparecer en el ranking de quien más apoya» (encendido = `!rankingHidden`), con «Vas en el lugar {rank}.» si `rank` no es null y «Solo se ven tu nombre y tu foto, nunca tus datos de contacto.». Al cambiarlo, `setPawRankingVisibility`; con la respuesta corrige el estado local (`rankingHidden`, y `rank` a null si se ocultó) sin volver a pedir la pantalla. Toast con `message`.
7. Si `myPaws.enabled` es `false`: estado vacío «Las huellitas llegan pronto» / «Muy pronto vas a ganar huellitas por cada reporte, aviso y caso cerrado, y a subir de nivel.»
8. **Inicio del perfil**: una tarjeta «Huellitas» bajo «Requiere atención» con «Nivel {level} de 6», el nombre del nivel, el saldo, la barra de progreso con el mismo texto «Te faltan…» y «{lifetimeEarned} / {nextAt}», una línea de racha («Racha de N semanas», y si `streakActiveThisWeek` es false: «: ayuda en algo esta semana para no perderla»; con 0: «Ayuda en algo esta semana para empezar tu racha») y «Ver más» a la pantalla de Huellitas. Va en su propia operación (`MyPawsSummary`, abajo), no en la consulta de Inicio: si falla o `enabled` es false, la tarjeta no sale y el resto de Inicio sigue igual.

Una sola consulta al abrir la pantalla y al jalar para refrescar. Nada de polling. Es un campo nuevo del back: va en su propia operación, no dentro de la consulta de arranque, hasta que todas las versiones publicadas del back lo tengan.

9. **Ranking «Quién apoya más»** (pantalla nueva, se abre desde Huellitas y, si la app tiene una portada, con los 5 primeros del mes):
   - Pestañas «Este mes» (`period: "month"`) y «De siempre» (`period: "all_time"`); abre en «Este mes» si tiene filas, si no en «De siempre».
   - Cada fila: lugar (1 oro, 2 plata, 3 bronce, el resto gris), foto o inicial, nombre de pila, «Nivel N · nombre» con el ícono del nivel, «N semanas» con ícono de fuego si `streakWeeks > 1`, y las huellitas del periodo.
   - Con sesión, arriba una franja «Tú · Nivel N nombre.» con: «Vas en el lugar {rank} de siempre, con {lifetimeEarned} huellitas.» / «No apareces en el ranking: lo ocultaste en tu perfil.» / «Llevas N huellitas. Sigue ayudando para entrar a los 50 primeros.» / «Aún no tienes huellitas…», y enlace a Huellitas. Marca tu fila con «Tú» usando `isMe`: la app manda la sesión en la consulta, así que el back lo resuelve (la web no puede porque arma la lista en el servidor, sin sesión).
   - Vacío: «Este mes todavía nadie suma huellitas.» / «Todavía nadie aparece en el ranking.» con botón a animales perdidos.
   - En la portada de la app, solo si hay 3 personas o más.
   - El ranking ya viene cacheado 10 min del back: pídelo al abrir la pantalla, sin polling.

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

query PawLeaderboard($period: String, $take: Int) {
  pawLeaderboard(period: $period, take: $take) {
    rank name avatarUrl points streakWeeks
    level { level key label }
    isMe
  }
}

query MyPawHistory($take: Int, $skip: Int) {
  myPawHistory(take: $take, skip: $skip) { id action kind amount createdAt }
}

mutation SetPawRankingVisibility($hidden: Boolean!) {
  setPawRankingVisibility(hidden: $hidden) { success message rankingHidden }
}
```

`myPaws` es `null` sin sesión. `myPawHistory` acepta `take` hasta 50.

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
  balance: number;
  lifetimeEarned: number;
  level: PawLevelInfo;
  toNextLevel: number | null;
  streakWeeks: number;
  bestStreakWeeks: number;
  streakActiveThisWeek: boolean;
  rankingHidden: boolean;
  rank: number | null;      // lugar en el ranking histórico si está en el top 50
  history: PawHistoryEntry[];
};
```

## Reglas y constantes
Copia de las reglas del back (`kadesh-back/models/Pet/Paws/constants.ts`); si allá cambian, cambian aquí.

Niveles (umbral e ícono de `@hugeicons/react-native` por `level.key`): 1 Cachorro `puppy` (0, `Bone01Icon`), 2 Explorador `explorer` (30, `Compass01Icon`), 3 Guardián `guardian` (120, `Shield01Icon`), 4 Rescatista `rescuer` (350, `LifebuoyIcon`), 5 Héroe `hero` (900, `Medal01Icon`), 6 Leyenda `legend` (2000, `Crown02Icon`). El ícono del nivel actual va en el cuadro azul del encabezado y de la tarjeta de Inicio; en el camino de niveles, cada uno con el suyo: el actual en azul relleno, los alcanzados en azul claro y los que faltan en gris.

Cómo se ganan (texto, puntos, regla):
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
| Alguien que invitaste empieza a ayudar | 20 | Una vez por persona |

Texto de cada movimiento por `action`:
`report_published` Publicaste un reporte · `sighting` Avisaste que viste a un animal · `case_closed` Cerraste un caso · `reunion_helped` Ayudaste a un reencuentro · `adoption_completed` Adoptaste en Kadesh · `event_approved` Se publicó tu evento · `comment` Comentaste un reporte · `review` Reseñaste una veterinaria · `first_pet` Registraste tu primera mascota · `first_health_record` Primer registro en la cartilla · `rescue_verified` Verificamos tu espacio de rescate · `place_verified` Verificamos tu veterinaria · `referral` Alguien que invitaste empezó a ayudar · `streak_bonus` Bono por tu racha · `admin_adjust` Ajuste de Kadesh · otro: Movimiento.
Con `kind = reversal`: «Se quitó: » + el texto en minúscula inicial. Con `kind = spend`: «Canjeaste huellitas».

## Referencia web
`src/components/paws/PawsSection.tsx`, `useMyPaws.ts`, `constants.ts`, `queries.ts`; menú en `src/components/profile/shell/profileNav.ts`.

## Criterios de aceptación
- [ ] La pantalla sale en el perfil y la abre la notificación `paws.level_up`.
- [ ] Inicio muestra la tarjeta de Huellitas; si falla su consulta, el resto de Inicio no se afecta.
- [ ] Nivel, saldo, barra de progreso y texto «Te faltan…» correctos, también en el nivel 6.
- [ ] Racha con su aviso verde o ámbar y la mejor racha.
- [ ] Historial con «Cargar más» paginado; cantidades negativas en rojo.
- [ ] El interruptor del ranking guarda y corrige el estado sin volver a pedir la pantalla.
- [ ] Con `enabled: false` muestra «Las huellitas llegan pronto».
- [ ] Una sola petición al abrir; ninguna con la app en segundo plano.
- [ ] Funciona en iOS y Android, en modo claro y oscuro.
- [ ] Maneja carga, error y vacío.
