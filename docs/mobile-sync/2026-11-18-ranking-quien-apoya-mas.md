---
estado: pendiente
fecha: 2026-11-18
origen: kadesh-landing@feat/ranking-huellitas (escrito 2026-11-23)
feature: profile
---

# Prompt para kadesh-pet-mobile: ranking «Quién apoya más»

Es el tercero de tres; impleméntalos en orden:
1. [Huellitas y sistema visual de niveles](2026-11-17-huellitas-perfil.md): colores por nivel, **foto con insignia de nivel** y **lista de niveles**.
2. [Perfil público, autor con nivel y ajustes de perfil](2026-11-18-perfil-publico.md): cada persona del ranking abre su perfil.
3. Este.

## Contexto
En la web hay un ranking público de huellitas, «Quién apoya más», con las personas que más ayudan este mes y de siempre (los 50 primeros), y una sección en la portada con los primeros del mes. La app debe tener la misma pantalla y, si tiene portada, la misma sección.

## Qué implementar en la app

1. **Pantalla «Quién apoya más»** (se abre desde Huellitas → «Ver el ranking», desde la cifra «Lugar» del perfil público, desde la portada y desde `https://pet.kadesh.com.mx/ranking`):
   - **Encabezado**: ícono de ranking con «Ranking de huellitas», título «Quién apoya más», «Quienes reportan, avisan y no dejan de buscar. Gracias a ellos, más mascotas vuelven a casa.» y un botón «Ayudar a buscar» a animales perdidos.
   - **Pestañas** «Este mes» (`period: "month"`) y «De siempre» (`period: "all_time"`), estilo segmentado. Abre en «Este mes» si tiene filas; si no, en «De siempre». Junto a las pestañas, «{N} personas · {suma} huellitas» del periodo.
   - **Podio** (los 3 primeros): tarjetas con un brillo arriba del color de la medalla, la medalla con el número (1 oro amber-400, 2 plata slate-300, 3 bronce orange-300), foto grande con insignia de nivel, nombre, «Nivel N · nombre», las huellitas del periodo en grande y, si `streakWeeks > 1`, una pastilla naranja con fuego «{N} semanas seguidas». La del 1.º lleva borde dorado. En teléfono van una debajo de otra; en tablet en fila (2.º, 1.º un poco más arriba, 3.º).
   - **Lista** del 4.º en adelante, en una tarjeta con divisores: lugar, foto chica con insignia, nombre (con pastilla «Tú» si es la persona), «Nivel N · nombre», racha («🔥 {N} sem.» si `> 1`, se puede ocultar en pantallas angostas) y huellitas a la derecha.
   - Cada fila y cada tarjeta del podio abren el **perfil público** si traen `username`; sin `username` (perfil apagado) no son tocables.
   - **Tu fila**: marcarla con `isMe` (la consulta va con la sesión): fondo azul suave y pastilla «Tú», también en el podio.
   - **Tarjeta «Tú»** (oscura, arriba de todo o en la columna lateral en tablet), con `MyPawsSummary` del prompt 1 (`enabled` true):
     - «TÚ», foto mediana con insignia, «Nivel N · nombre», «{lifetimeEarned} huellitas» y, a la derecha, «#{rank}» grande si tiene lugar y no lo ocultó.
     - Texto: «No apareces en el ranking: lo ocultaste en tu perfil.» si `rankingHidden`; «Vas en el lugar {rank} de siempre.» si tiene `rank`; «Sigue ayudando para entrar a los 50 primeros.» si tiene huellitas y el ranking ya tiene 50; «El ranking se actualiza cada pocos minutos.» si tiene huellitas y aún no aparece; «Publica un reporte o avisa que viste a un animal para ganar tus primeras huellitas.» si va en 0.
     - Enlace «Tus huellitas →» a la pantalla de Huellitas.
   - **Sin sesión**, en lugar de «Tú»: tarjeta oscura «¿Quieres aparecer aquí?» / «Cada reporte, cada «Lo vi» y cada caso cerrado suma huellitas y te sube de nivel.» con botón «Crear mi cuenta» (con sesión pero sin huellitas activas: «Ver animales perdidos»).
   - **Cómo se ganan**: «Hasta 60 al día. Likes y visitas no cuentan.» y la tabla de «Cómo se ganan» del prompt 1 en forma compacta (texto y «+N» en azul).
   - **Niveles**: la lista de niveles del prompt 1, sin nivel marcado, y debajo «Solo se ven tu nombre con inicial y tu foto. Para no aparecer, apágalo en tus huellitas.» con enlace a Huellitas.
   - **Vacío** del periodo: «Este mes todavía nadie suma huellitas.» / «Todavía nadie aparece en el ranking.» con «Publica un reporte o avisa que viste a un animal perdido y aparece aquí.» y botón «Ver animales perdidos».
2. **Sección en la portada de la app** (si la app tiene portada):
   - Solo si el periodo tiene **3 personas o más**. Usa «Este mes»; si este mes hay menos de 3, «De siempre».
   - Etiqueta «Ranking de este mes» (o «Ranking de huellitas»), título «Quién apoya más», texto «Cada reporte, cada «Lo vi» y cada caso cerrado suma huellitas. Sube de nivel ayudando a que más mascotas vuelvan a casa.»
   - Dos cifras: «Huellitas este mes» (o «Huellitas») con la suma, y «Personas».
   - El podio y, debajo, del 4.º al 6.º en lista (hasta 6 personas).
   - Botones «Ver ranking completo» y «Cómo se ganan» (abre el ranking en esa sección).

Pide el ranking al abrir la pantalla (y la portada) y al jalar para refrescar; nada de polling. El back lo guarda unos minutos y lo rehace en cuanto cambia un saldo. Las dos pestañas pueden pedirse juntas en una sola operación con alias (abajo) o la segunda al tocarla; no las pidas en cada cambio de pestaña si ya las tienes.

## GraphQL

```graphql
query PawLeaderboards($take: Int) {
  month: pawLeaderboard(period: "month", take: $take) {
    rank name username avatarUrl points streakWeeks isMe
    level { level key label }
  }
  allTime: pawLeaderboard(period: "all_time", take: $take) {
    rank name username avatarUrl points streakWeeks isMe
    level { level key label }
  }
}
```

En la pantalla, `take: 50`; en la portada, `take: 6` (o reusa lo que ya tengas en caché). `MyPawsSummary` es la del prompt 1.

```ts
type PawLeaderboardEntry = {
  rank: number;
  name: string;               // «Marco C.» (ya viene armado)
  username: string | null;    // para abrir el perfil; null si la persona lo apagó
  avatarUrl: string | null;   // null si apagó su perfil o no tiene foto
  points: number;             // huellitas del periodo
  streakWeeks: number;
  isMe: boolean;              // solo con sesión
  level: { level: number; key: string; label: string };
};
```

## Reglas y constantes
- Máximo 50 personas por periodo. «Este mes» es el mes de calendario en hora de CDMX.
- No aparecen: admins de Kadesh, la cuenta de automatización, cuentas de prueba, suspendidas o anonimizadas, ni quien ocultó su ranking.
- El nombre ya llega como «Nombre I.»; no lo armes en la app.
- Las fotos son URLs firmadas de 1 h: la llave de caché de la imagen es `username` (o el lugar + periodo si no hay), nunca la URL.
- Medallas: 1 amber-400 #fbbf24 con texto amber-950, 2 slate-300 #cbd5e1 con texto slate-900, 3 orange-300 #fdba74 con texto orange-950.

## Referencia web
`src/app/ranking/page.tsx`, `src/components/paws/RankingBoard.tsx`, `RankingPodium.tsx`, `PawRankRow.tsx`, `src/components/home/PawRankingSection.tsx`.

## Criterios de aceptación
- [ ] Pestañas «Este mes» / «De siempre» con podio y lista; abre en «Este mes» solo si tiene filas.
- [ ] Cada persona muestra su foto con la insignia y el color de su nivel; las que tienen `username` abren su perfil.
- [ ] Tu fila sale marcada con «Tú» (`isMe`), y la tarjeta «Tú» muestra el texto correcto en cada caso.
- [ ] Sin sesión sale «¿Quieres aparecer aquí?».
- [ ] La sección de la portada solo sale con 3 personas o más.
- [ ] Una sola petición al abrir; ninguna con la app en segundo plano.
- [ ] Funciona en iOS y Android, en modo claro y oscuro.
- [ ] Maneja carga, error y vacío.
