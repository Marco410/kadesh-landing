---
estado: pendiente
fecha: 2026-11-04
origen: kadesh-landing@feat/control-actividad
feature: shared
---

# Prompt para kadesh-pet-mobile: app y pantalla en cada petición, reporte de errores, actividad y límites contra abuso

## Contexto
Kadesh (Operaciones) ahora ve, para cada evento y cada error de una persona, desde qué app y pantalla pasó, su IP, sistema y navegador. Los errores se agrupan en una bandeja. La web también reporta lo que el servidor no ve: red caída, respuestas 5xx, pantallas caídas. Además, el back limita los intentos (login, registros, reportes, comentarios, reseñas, veterinarias) y puede bloquear una IP. La app tiene que identificarse, reportar sus errores y mostrar bien los mensajes de límite y bloqueo.

## Qué implementar en la app

### 1. Identificar la app y la pantalla en cada petición al back
En **todas** las peticiones GraphQL (cliente Apollo y cualquier `fetch` directo al back), agregar estos headers:
- `x-kadesh-app: pet-mobile` (valor fijo; el back solo acepta `pet-web`, `business-web` o `pet-mobile`).
- `x-kadesh-page: <pantalla actual>`: la ruta de Expo Router en la que está la persona, codificada con `encodeURIComponent` (puede traer acentos).
  - Para ids o slugs, usar la ruta real (`/animales/luna-cdmx`); el back la guarda tal cual.
  - Nunca incluir parámetros con datos personales, tokens, correos ni búsquedas. Los únicos parámetros que el back conserva son `tab`, `vista`, `clinic` y `pet`; los demás los descarta.
  - Para leer la ruta fuera de React, guardar la ruta actual en una variable de módulo que actualice un efecto en el layout raíz cuando cambie `usePathname()`.
- `User-Agent` propio, para que Operaciones muestre versión y sistema:
  - iOS: `KadeshPet/<versión de la app> (iPhone; iOS <versión del sistema>)`, o `(iPad; iPadOS <versión>)` en tableta.
  - Android: `KadeshPet/<versión> (Linux; Android <versión>; <modelo>; Mobile)`.
  - Usar `expo-application` (versión de la app) y `expo-device` (sistema, versión y modelo). Si un header `User-Agent` no se puede fijar en alguna plataforma, no pasa nada: el back usa el que mande el sistema.

### 2. Reportar errores que el back no ve (`app.client_error`)
Se envían con la mutación `trackEvents` (abajo). **Sin sesión también se envían**: es el único tipo que el back acepta sin sesión, con tope por IP.
- **Errores de red de Apollo** (interceptor `onError` de `@apollo/client/link/error`): reportar **solo** si la petición no llegó (sin respuesta), si la respuesta no era JSON, o si el estado HTTP es ≥500, 413 o 429.
  - No reportar: cancelaciones (`AbortError`), errores de la propia operación `TrackEvents`, ni respuestas con `errors` de GraphQL. Esas ya las registra el back con la app, la pantalla, la IP y el navegador que van en los headers.
  - `metadata`: `{ kind: "network", message, operation, opType, status, page, online }`.
    - `operation` es `operation.operationName`.
    - `opType` es `query` o `mutation` (con `getMainDefinition` de `@apollo/client/utilities`).
    - `status` es el código HTTP, si hubo.
    - `online` viene de `@react-native-community/netinfo`, si está disponible; si no, `null`.
- **Pantalla caída**: en el `ErrorBoundary` de Expo Router (exportado desde el layout raíz o por ruta), reportar `{ kind: "crash", message: error.message, stack, page }`.
  - `stack` son las primeras 5 líneas de la pila, máximo 200 caracteres.
  - La pantalla de error dice "No pudimos mostrar esta pantalla", con "Reintentar" (`retry`) e "Ir al inicio".
- **Errores de JS no atrapados**: con `ErrorUtils.setGlobalHandler` (llamando también al handler anterior), reportar `{ kind: "script", message, stack, page }`. Si el error es fatal, usar `kind: "crash"`. Ignorar mensajes vacíos.
- `page` es la pantalla **del momento del error** (no la del envío).
- `message` va recortado a 200 caracteres. Nada de datos personales: no agregar variables, textos de formularios ni respuestas.

### 3. Cola de envío de eventos
- Los eventos se encolan y se mandan en lote cada 10 s, al pasar la app a segundo plano (`AppState` → `background`) y antes de cerrar sesión. Máximo 50 por lote.
- El mismo evento (tipo + metadata) dos veces en 3 s cuenta una vez.
- Con sesión van con `Authorization: Bearer <token>`. Sin sesión, solo se mandan los `app.client_error`; los demás se descartan.
- Si el envío falla (sin red), reintentar **una sola vez** en el siguiente lote; si vuelve a fallar, se pierde. Nunca bloquear la UI ni lanzar errores por esto.
- El envío usa `fetch` directo al back con los mismos headers del punto 1, no Apollo, para no entrar en el interceptor.

### 4. Navegación y tiempo activo (solo con sesión)
- `ui.section_viewed` con `metadata: { section }` cada vez que cambia la pantalla. `section` es la ruta con forma web y los ids como `:id`, para que Operaciones la etiquete igual que la web:
  - `/animales/:id`, `/animales/:id/editar`, `/animales/nuevo`, `/veterinarias/:id`, `/veterinarias/registro`, `/blog/:id`, `/notificaciones`, `/notificaciones/alertas`, `/notificaciones/ajustes`.
  - Perfil: `/perfil?tab=<tab>`, con `tab` en `profile`, `pets`, `posts`, `animals`, `appointments` o `clinics`; sin tab, `/perfil`.
  - Si una pantalla de la app no tiene equivalente web, usar su ruta de Expo Router.
- `auth.heartbeat` cada 5 minutos mientras la app está activa (`AppState` → `active`), y una vez al volver a primer plano. El back suma 5 minutos por latido, y no suma si llegan dos con menos de 4 minutos entre sí.
- `auth.logout` al cerrar sesión, enviado **antes** de borrar el token de SecureStore.

### 5. Mensajes de límite y bloqueo
Si una respuesta trae un error de GraphQL con `extensions.code` igual a `RATE_LIMITED` o `IP_BLOCKED`, mostrar **el mensaje del back** (`error.message`) en un toast (`sonner-native`), máximo uno cada 30 s, y no reportarlo como error.
- `RATE_LIMITED`: "Hiciste demasiadas solicitudes. Intenta de nuevo en N minutos." Trae además `extensions.retryAfter`, en segundos.
- `IP_BLOCKED`: "Tu acceso a Kadesh está bloqueado. Escríbenos a contacto@kadesh.com.mx para revisarlo." Llega sin `data`.

En el login con contraseña, el límite **no** llega como error: `authenticateUserWithPassword` responde la falla normal (`UserAuthenticationWithPasswordFailure`) con `message` = "Hiciste demasiadas solicitudes. Intenta de nuevo en N minutos." Mostrar ese `message` tal cual, como ya se hace con "Correo o contraseña incorrectos".

## GraphQL

```graphql
mutation TrackEvents($events: [TrackEventInput!]!) {
  trackEvents(events: $events) {
    accepted
  }
}
```

```graphql
# Ya existe en el schema del back (no hay que pedir cambios):
input TrackEventInput {
  type: String!      # ui.section_viewed | auth.heartbeat | auth.logout | app.client_error
  metadata: JSON     # objeto plano: texto, número, booleano o null; máx. 20 llaves, textos de 200
  entityType: String
  entityId: String
  companyId: ID
  occurredAt: String # ISO del dispositivo; el back lo usa si es de los últimos 10 min
}

type TrackEventsResult {
  accepted: Int!
  rejected: Int!
}
```

Tipos TypeScript:

```ts
export const TRACK_EVENT = {
  SECTION_VIEWED: "ui.section_viewed",
  HEARTBEAT: "auth.heartbeat",
  LOGOUT: "auth.logout",
  CLIENT_ERROR: "app.client_error",
} as const;

export type TrackEventType = (typeof TRACK_EVENT)[keyof typeof TRACK_EVENT];

/** Datos chicos y planos. Nada personal. */
export type TrackMetadata = Record<string, string | number | boolean | null>;

export type ClientErrorKind = "network" | "crash" | "script" | "chunk";

export type ClientErrorMetadata = {
  kind: ClientErrorKind;
  message: string;        // máx. 200
  page: string | null;    // pantalla al momento del error
  online?: boolean | null;
  operation?: string;     // solo network
  opType?: "query" | "mutation";
  status?: number;        // código HTTP, si hubo
  stack?: string;         // máx. 200
};

export type QueuedEvent = {
  type: TrackEventType;
  metadata?: TrackMetadata;
  occurredAt: string;
  retried?: boolean;      // no se manda al back
};
```

## Reglas y constantes
- Headers: `x-kadesh-app: pet-mobile`, `x-kadesh-page: encodeURIComponent(<ruta>)` y `User-Agent: KadeshPet/<versión> (...)`.
- Topes del back:
  - Errores sin sesión: 20 por IP cada 10 min. El mismo error de la misma persona o IP se guarda una vez cada 10 min.
  - Límites contra abuso (el back responde `RATE_LIMITED`):
    | Acción | Límite |
    |---|---|
    | Login con contraseña (solo fallidos) | 10 por IP y 5 por correo en 15 min |
    | Login con Google | 20 por IP en 15 min |
    | Registro (`createUser`) | 5 por IP por hora |
    | Reportes (`createAnimal`) | 10 por persona y 20 por IP por hora |
    | Comentarios | 30 por persona por hora |
    | Reseñas | 10 por persona por día |
    | Registro de veterinaria | 3 por IP por día |
- Cambios del back en permisos que la app debe esperar (no requieren cambios si la app ya manda lo mismo que hoy):
  - Los posts programados ya no salen antes de su fecha.
  - `createReview` exige `rating` entero de 1 a 5 y `pet_place`, y queda a nombre de la sesión aunque se mande otro `user`.
  - `createPetPlace` exige sesión; la ficha queda a nombre de quien la crea, con `claimStatus: pending` y `claimedAt` de ahora. Mandar `verified` o relaciones anidadas (horarios, redes) al crear da error.
  - Likes, favoritos, comentarios y vistas quedan a nombre de la sesión.
  - Solo el autor (o un admin) borra su comentario o reseña.
- No enviar nunca valores de variables, textos que escribe la persona, teléfonos ni correos en `metadata`.

## Referencia web
- `kadesh-landing/src/utils/activity/`:
  - `track.ts`: cola, envío, reintento y `trackLogout`.
  - `clientContext.ts`: headers.
  - `requestErrorLink.ts`: interceptor de Apollo.
  - `reportClientError.ts` y `useClientErrorListener.ts`.
  - `usePetActivity.ts`: pantallas y latido.
- `kadesh-landing/src/app/error.tsx` y `global-error.tsx`: pantalla caída.
- `kadesh-landing/src/providers/apollo-client.ts`: orden de links.

## Criterios de aceptación
- [ ] Cada petición al back lleva `x-kadesh-app: pet-mobile`, la pantalla actual y el `User-Agent` de la app. En Operaciones → Actividad, un evento hecho desde la app muestra "App móvil", la pantalla y "iOS 17.5 · App Kadesh Pet 1.4.0" (o el de Android).
- [ ] Con el modo avión activo, una consulta falla y, al volver la red, aparece un `app.client_error` con `kind: network` en Operaciones → Errores.
- [ ] Un error de GraphQL (p. ej. una validación del back) **no** se reporta desde la app; sale una sola vez en Errores, registrado por el back.
- [ ] Un error de render muestra la pantalla de error con "Reintentar" y llega como `kind: crash` con la pantalla correcta.
- [ ] Sin sesión, los errores se reportan; la navegación y el latido no se mandan.
- [ ] Con sesión: cada pantalla genera `ui.section_viewed` con la clave de la tabla; el latido suma tiempo activo; cerrar sesión deja `auth.logout`.
- [ ] Al pasarse de un límite, sale un toast con el mensaje del back (uno cada 30 s); en el login, el mensaje sale en el formulario.
- [ ] Nada de esto bloquea la UI ni lanza errores si el back no responde.
- [ ] Funciona en iOS y Android, en modo claro y oscuro.
