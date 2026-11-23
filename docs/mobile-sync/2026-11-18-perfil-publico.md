---
estado: pendiente
fecha: 2026-11-18
origen: kadesh-landing@feat/ranking-huellitas (actualizado 2026-11-23)
feature: profile
---

# Prompt para kadesh-pet-mobile: perfil público, autor con nivel y ajustes de perfil

Es el segundo de tres; impleméntalos en orden:
1. [Huellitas y sistema visual de niveles](2026-11-17-huellitas-perfil.md): define los colores por nivel, la **foto con insignia de nivel** y la **lista de niveles** que se usan aquí.
2. Este.
3. [Ranking «Quién apoya más»](2026-11-18-ranking-quien-apoya-mas.md).

## Contexto
Cada persona de Kadesh Pet tiene un perfil público con su nivel de huellitas, biografía, sus reportes, eventos, espacios de rescate y clínicas. En la ficha de un animal se ve quién lo publicó (antes solo lo veía el propio autor), con la insignia de su nivel en la foto, y tocarlo abre su perfil. La persona elige en sus datos si su perfil se ve y si muestra teléfono o correo. El nombre público siempre es nombre e inicial del apellido («Marco C.»).

## Qué implementar en la app

1. **Autor en la ficha del animal** (si el reporte no es de un espacio de rescate; esos siguen como están):
   - `animalAuthor(animalId)` en su propia consulta. Mientras carga, un círculo y una línea grises.
   - Foto mediana con insignia (prompt 1), `displayName` y debajo «Nivel N · nombre · Publicado {fecha}» (sin la parte del nivel si `level` es null).
   - Si trae `username`, toda la fila abre el perfil público. Si `animalAuthor` es `null` (perfil apagado, automatización, cuenta suspendida), «Usuario de KADESH» sin enlace.
2. **Perfil público** (pantalla nueva; se abre desde el autor, desde el ranking y desde un enlace `https://pet.kadesh.com.mx/u/<username>`):
   - **Encabezado**: foto extra grande con insignia, `displayName`, una pastilla con el color **sólido** del nivel y su ícono «Nivel N · nombre», y «En Kadesh desde {mes año}» (`memberSince`, en hora de CDMX). Debajo la `bio` si hay.
   - **Contacto**, solo lo que venga: con `phone`, botones «WhatsApp» (`https://wa.me/52{10 dígitos}`; si ya trae 52 y 12 dígitos, tal cual) y uno con el número que llama; con `email`, un botón con el correo que abre el correo.
   - **Cifras** (4 tarjetas): Huellitas (`lifetimeEarned`, con el ícono del nivel), Lugar (`#rank` o «—»; al tocarla abre el ranking), Racha (`{streakWeeks} sem.` o «—»), Reportes (`reportsCount`).
   - **Progreso**: «Rumbo a {siguiente}» con el nombre del siguiente nivel en su «texto del color», o «Nivel más alto alcanzado»; a la derecha «{lifetimeEarned} / {nextAt}»; barra de 8 px del color «barra» del nivel actual (mínimo 2 %). Solo si `level` no es null.
   - **Reportes** («Reportes» + `reportsCount`): cuadrícula (2 columnas en teléfono) de tarjetas con foto 4:3, pastilla de estado arriba a la izquierda (texto y color de estado que ya usa la app), nombre (`displayName`) y ciudad. Al tocar, abre la ficha. «Ver más reportes ({faltan})» pide `publicUserReports` de 12 en 12 con `skip` = los que ya se ven; si falla, «No pudimos cargar más. Intenta de nuevo.».
   - **Eventos que organizó** («Eventos que organizó» + `eventsCount`): lista con título, «ciudad, estado» y la fecha de `firstStartsAt` («10 dic 2026»). Al tocar, abre el evento.
   - **Espacios de rescate**: logo (o inicial) cuadrado, nombre y «rol · ciudad». Roles: `admin` Administración, `coordinator` Coordinación, `volunteer` Voluntariado, `foster` Hogar temporal. Al tocar, abre el espacio.
   - **Clínicas**: inicial, nombre y «municipio, estado». Al tocar, abre la veterinaria.
   - **Niveles**: la lista de niveles (prompt 1) marcando su nivel con «Su nivel».
   - Tarjeta oscura «Huellitas»: «Se ganan publicando reportes, avisando «Lo vi», cerrando casos y adoptando. Mira quién apoya más.» y «Ver el ranking →» (cuando exista la pantalla del prompt 3).
   - Cada sección sale solo si tiene algo. Si no hay reportes, eventos, espacios ni clínicas: «Todavía no hay nada publicado» / «Aquí aparecerán sus reportes, eventos, espacios de rescate y clínicas.».
   - Si `publicUserProfile` es `null`: «Este perfil no está disponible» con botón para volver.
3. **Ajustes en Datos del perfil** (tarjeta «Perfil público» / «Lo que ve cualquiera al tocar tu nombre en un reporte o en el ranking.»), con su propia consulta (`MyPublicProfileSettings`):
   - Botón «Ver mi perfil» (si el perfil está encendido) que abre el perfil público propio.
   - «Mostrar mi perfil público» (interruptor, encendido por defecto): «Apagado, tu perfil no abre y tus reportes salen sin tu nombre. El ranking se controla aparte, en Huellitas.»
   - «Biografía»: hasta 280 caracteres, contador «{n}/280. No pongas teléfonos ni direcciones aquí: para eso están las opciones de abajo.», ejemplo «Ej.: Rescato perros en Morelia desde 2019. Si ves uno en la calle, avísame.». Deshabilitada si el perfil está apagado.
   - Bloque «Contacto en tu perfil (apagado por defecto)»: «Mostrar mi teléfono» («Con botón de WhatsApp y de llamada.»; deshabilitado con «Primero agrega tu teléfono arriba.» si no tiene teléfono) y «Mostrar mi correo» («Cualquiera podrá escribirte.»). Ambos deshabilitados si el perfil está apagado.
   - «Guardar perfil público», habilitado solo con cambios. Manda la biografía sin espacios al inicio ni al final. Con la respuesta corrige el estado; toast «Perfil público guardado» o «No pudimos guardar».

Todo en consultas nuevas y aparte. Sin polling. El back ya está publicado con estos campos.

## GraphQL

```graphql
query AnimalAuthor($animalId: ID!) {
  animalAuthor(animalId: $animalId) {
    username displayName avatarUrl
    level { level key label from nextAt }
  }
}

query PublicUserProfile($username: String!) {
  publicUserProfile(username: $username) {
    username displayName avatarUrl bio phone email memberSince
    level { level key label from nextAt }
    lifetimeEarned streakWeeks rank reportsCount eventsCount
    reports { id slug displayName status outcome city coverUrl createdAt }
    events { id slug title city state firstStartsAt lastEndsAt }
    rescueOrgs { id slug name city state logoUrl role }
    clinics { id slug name municipality state }
  }
}

query PublicUserReports($username: String!, $take: Int, $skip: Int) {
  publicUserReports(username: $username, take: $take, skip: $skip) {
    id slug displayName status outcome city coverUrl createdAt
  }
}

query MyPublicProfileSettings($id: ID!) {
  user(where: { id: $id }) { id username bio publicProfileEnabled showPhoneOnProfile showEmailOnProfile }
}

mutation UpdatePublicProfileSettings($id: ID!, $data: UserUpdateInput!) {
  updateUser(where: { id: $id }, data: $data) { id bio publicProfileEnabled showPhoneOnProfile showEmailOnProfile }
}
```

`publicUserReports` acepta `take` hasta 24. El perfil trae los primeros 12 reportes y 6 eventos.

```ts
type PublicLevel = { level: number; key: string; label: string; from: number; nextAt: number | null };
type PublicUserCard = { username: string | null; displayName: string; avatarUrl: string | null; level: PublicLevel | null };
type PublicUserReport = {
  id: string; slug: string | null; displayName: string;
  status: string | null;   // último estado: lost | found | in_adoption | in_family | adopted | …
  outcome: string | null; city: string | null; coverUrl: string | null; createdAt: string | null;
};
type PublicUserProfile = {
  username: string; displayName: string; avatarUrl: string | null; bio: string | null;
  phone: string | null; email: string | null; memberSince: string | null;
  level: PublicLevel | null; lifetimeEarned: number; streakWeeks: number; rank: number | null;
  reportsCount: number; eventsCount: number;
  reports: PublicUserReport[];
  events: { id: string; slug: string | null; title: string; city: string | null; state: string | null; firstStartsAt: string | null; lastEndsAt: string | null }[];
  rescueOrgs: { id: string; slug: string | null; name: string; city: string | null; state: string | null; logoUrl: string | null; role: string | null }[];
  clinics: { id: string; slug: string | null; name: string; municipality: string | null; state: string | null }[];
};
```

## Reglas y constantes
- El nombre público ya llega armado (`displayName`, «Nombre I.»): no lo construyas con `name` / `lastName`.
- Teléfono y correo solo si el back los manda (la persona los activó). Nunca los saques de otra consulta para el perfil público.
- Perfil apagado: `publicUserProfile` y `animalAuthor` son `null`, y en el ranking su fila sale sin `username` (sin enlace).
- Biografía: máximo 280 caracteres.
- Fotos y logos son URLs firmadas que duran 1 h: la llave de caché de la imagen es el `id` (o `username`), nunca la URL.
- Colores de estado de los reportes: los mismos que ya usa la app en las tarjetas de animales.

## Referencia web
`src/app/u/[username]/page.tsx`, `src/components/public-profile/*` (`AnimalAuthorByline`, `ProfileReports`, `ReportCard`, `PublicProfileSettings`), `src/components/paws/LevelAvatar.tsx`, `PawLevelsList.tsx`.

## Criterios de aceptación
- [ ] La ficha de un animal muestra al autor con su insignia a cualquier persona, y abre su perfil.
- [ ] El perfil público muestra la pastilla de nivel, las cifras, la barra con el color del nivel y las secciones con contenido; «Ver más reportes» pagina.
- [ ] La lista de niveles del perfil marca su nivel con «Su nivel».
- [ ] Teléfono y correo solo aparecen si la persona los activó; WhatsApp abre con el prefijo 52.
- [ ] Los ajustes guardan y, con el perfil apagado, el perfil y el autor dejan de verse.
- [ ] Un perfil inexistente o apagado muestra «Este perfil no está disponible».
- [ ] Funciona en iOS y Android, en modo claro y oscuro.
- [ ] Maneja carga, error y vacío.
