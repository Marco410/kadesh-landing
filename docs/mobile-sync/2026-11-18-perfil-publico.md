---
estado: pendiente
fecha: 2026-11-18
origen: kadesh-landing@feat/ranking-huellitas
feature: profile
---

# Prompt para kadesh-pet-mobile: perfil público, autor con nivel y ajustes de perfil

## Contexto
Cada persona de Kadesh Pet tiene ahora un perfil público con su nivel de huellitas, biografía, sus reportes, eventos, espacios de rescate y clínicas. En la ficha de un animal se ve quién lo publicó (antes solo lo veía el propio autor), con una insignia de su nivel en la foto, y tocarlo abre su perfil. La persona elige en sus datos si su perfil se ve y si muestra teléfono o correo. Depende del prompt «Huellitas en el perfil» (2026-11-17), que trae niveles e íconos.

## Qué implementar en la app
1. **Foto con insignia de nivel** (componente reutilizable): la foto (o la inicial sobre azul) con un anillo del color del nivel y, abajo a la derecha, un círculo con el ícono del nivel. Colores por `level.key`: `puppy` gris pizarra, `explorer` verde esmeralda, `guardian` azul cielo, `rescuer` violeta, `hero` ámbar, `legend` dorado. Íconos (`@hugeicons/react-native`): `Bone01Icon`, `Compass01Icon`, `Shield01Icon`, `LifebuoyIcon`, `Medal01Icon`, `Crown02Icon`. Sin nivel (`level: null`, huellitas apagadas) es una foto normal. Úsalo en el ranking, el perfil público y el autor de la ficha.
2. **Autor en la ficha del animal** (si el reporte no es de un espacio de rescate): `animalAuthor(animalId)` en su propia consulta. Foto con insignia, `displayName`, «Nivel N · nombre · Publicado …». Si trae `username`, al tocar abre el perfil público. Si es `null`, «Usuario de KADESH» sin enlace.
3. **Perfil público** (pantalla nueva; ábrela desde el autor, el ranking y un enlace `https://pet.kadesh.com.mx/u/<username>`):
   - Encabezado: foto grande con insignia, `displayName`, chip «Nivel N · nombre» del color del nivel, «En Kadesh desde {mes año}» (`memberSince`), `bio` si hay.
   - Contacto solo si viene: `phone` → botones WhatsApp (`https://wa.me/52{10 dígitos}`) y llamar; `email` → correo.
   - Cifras: Huellitas (`lifetimeEarned`), Lugar (`#rank` o «—»), Racha (`streakWeeks` sem. o «—»), Reportes (`reportsCount`).
   - Barra de progreso al siguiente nivel: de `level.from` a `level.nextAt` con `lifetimeEarned`; «Rumbo a {siguiente}» o «Nivel más alto alcanzado».
   - Secciones (solo si tienen algo): Reportes (cuadrícula con foto, pastilla de estado con su color, nombre y ciudad; «Ver más reportes (N)» pide `publicUserReports` de 12 en 12 con `skip` = los que ya se ven); Eventos que organizó; Espacios de rescate (logo, nombre, rol: admin «Administración», coordinator «Coordinación», volunteer «Voluntariado», foster «Hogar temporal»); Clínicas. Sin nada: «Todavía no hay nada publicado».
   - Si `publicUserProfile` es `null`: «Este perfil no está disponible».
4. **Ajustes en Datos del perfil** (tarjeta «Perfil público»): «Mostrar mi perfil público» (encendido por defecto; texto: «Apagado, tu perfil no abre y tus reportes salen sin tu nombre. El ranking se controla aparte, en Huellitas.»), Biografía (máx. 280, contador, deshabilitada si el perfil está apagado), y dentro de «Contacto en tu perfil (apagado por defecto)»: «Mostrar mi teléfono» (deshabilitado sin teléfono) y «Mostrar mi correo». Botón «Guardar perfil público» habilitado solo con cambios; corrige el estado con la respuesta.
5. **Ranking**: cada fila y el podio abren el perfil si la fila trae `username`; el nombre ya llega como «Marco C.».

Todo en consultas nuevas y aparte (el back debe estar publicado antes). Sin polling.

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

# El ranking ahora trae también username
query PawLeaderboard($period: String, $take: Int) {
  pawLeaderboard(period: $period, take: $take) {
    rank name username avatarUrl points streakWeeks isMe
    level { level key label }
  }
}
```

```ts
type PublicLevel = { level: number; key: string; label: string; from: number; nextAt: number | null };
type PublicUserCard = { username: string | null; displayName: string; avatarUrl: string | null; level: PublicLevel | null };
type PublicUserReport = { id: string; slug: string | null; displayName: string; status: string | null; outcome: string | null; city: string | null; coverUrl: string | null; createdAt: string | null };
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
- El nombre público ya llega armado (`displayName`, «Nombre I.»): no lo construyas con `name`/`lastName`.
- Teléfono y correo solo si el back los manda (la persona los activó).
- Biografía: máximo 280 caracteres.
- Perfil apagado: `publicUserProfile` es `null` y `animalAuthor` es `null`.
- Colores de estado de reportes: los mismos que ya usa la app en las tarjetas de animales.

## Referencia web
`src/app/u/[username]/page.tsx`, `src/components/public-profile/*`, `src/components/paws/LevelAvatar.tsx`, `src/components/paws/RankingPodium.tsx`.

## Criterios de aceptación
- [ ] La ficha de un animal muestra al autor con su insignia para cualquier persona, y abre su perfil.
- [ ] El perfil público muestra nivel, barra, cifras y las secciones con contenido; «Ver más reportes» pagina.
- [ ] Teléfono y correo solo aparecen si la persona los activó.
- [ ] Los ajustes guardan y, con el perfil apagado, el perfil y el autor dejan de verse.
- [ ] El ranking abre perfiles.
- [ ] Funciona en iOS y Android, en modo claro y oscuro.
- [ ] Maneja carga, error y vacío.
