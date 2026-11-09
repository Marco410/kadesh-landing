# Registro de uso y errores (`kadesh/utils/activity`)

Lo que solo sabe el navegador de Kadesh Pet, para Operaciones (kadesh-business → Actividad y Errores). Va a la mutación `trackEvents` de kadesh-back, que lo guarda en `ActivityEvent` (y el tiempo activo en `UserActivityDay`). Es el mismo mecanismo que el panel de Negocios (`kadesh-business/src/utils/activity`).

## Qué se registra

| Evento | Dónde | Cuándo |
| --- | --- | --- |
| `ui.section_viewed` (`section`) | `usePetActivity` (`PetActivityTracker` en `ClientProviders`) | Con sesión, al cambiar de pantalla. `section` tiene forma de ruta: `/perfil?tab=pets`, `/animales/:id` |
| `auth.heartbeat` | El mismo hook | Con sesión, cada 5 min con la pestaña visible |
| `auth.logout` | `useLogout` | Antes de borrar el token |
| `app.client_error` | `requestErrorLink`, `useClientErrorListener`, `src/app/error.tsx`, `global-error.tsx` | Siempre, también sin sesión: red caída o 5xx/413/429 (`network`), pantalla caída (`crash`), error de código suelto (`script`), código que no cargó (`chunk`) |

## App y pantalla en cada petición

`clientContextHeaders()` agrega `x-kadesh-app: pet-web` y `x-kadesh-page` (la ruta con solo `tab`, `vista`, `clinic` y `pet`) a cada petición de Apollo (`clientContextLink`) y a `trackEvents`. El back guarda ambos en cada evento, incluidos los errores de GraphQL (`app.error`), así que el navegador no los reporta otra vez.

## Cómo funciona

- `trackActivity(type, { metadata })` encola. El lote sale cada 10 s, al ocultar la pestaña o al salir (`fetch` con `keepalive`, no Apollo).
- El mismo evento repetido en 3 s cuenta una vez.
- Sin sesión solo se manda `app.client_error`.
- Errores de red (`requestErrorLink`): las consultas se reintentan hasta 3 veces (`queryRetryLink`, nunca mutaciones) y solo se reporta si fallan todas con la persona en línea y la página visible. No se reportan las canceladas (pantalla desmontada, cambio de ruta) ni las que cortó el navegador al cerrar o salir de la página (`pagehide`, `kadesh/utils/network`).
- `reportClientError` no manda nada si el error es por falta de WebGL (el mapa muestra su respaldo, no se cae nada) ni si el navegador es un bot: user agents de crawlers y vistas previas (`facebookexternalhit`, `meta-externalagent`, WhatsApp, buscadores, `HeadlessChrome`…) o `navigator.webdriver`. El crawler de Meta con user agent de Chrome normal lo descarta el back por rango de IP.
- Un mapa que truena no tumba la pantalla: `MapErrorBoundary` (`components/shared`) muestra el respaldo y lo reporta como `script`.
- Si el envío falla (sin red), se reintenta una vez. Nunca lanza ni bloquea la UI.
- Ante `RATE_LIMITED` o `IP_BLOCKED`, `requestErrorLink` muestra el mensaje del back en un aviso (uno cada 30 s).

## Reglas

- `metadata` chica y plana. Nada personal: ni nombres, ni teléfonos, ni textos que escribe la persona, ni valores de formularios.
- Un tipo nuevo va aquí (`TRACK_EVENT`) y en `CLIENT_EVENT_TYPES` de kadesh-back. Si no, el back lo descarta.
- Pantallas nuevas: si quieres que Operaciones muestre su nombre, agrégala a `PET_PAGE_LABELS` en kadesh-business (`src/components/admin/constants.ts`).
