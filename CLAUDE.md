# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

KADESH is a landing page / web app for a digital platform for animal welfare in Mexico (lost pet reports, veterinary directory, blog, sales/leads flow, subscriptions). Built with Next.js (App Router), Mantine-era styling now on Tailwind CSS, HeroUI components, and Apollo Client against a KeystoneJS GraphQL backend.

## Commands

Package manager is **pnpm** — do not use npm or yarn for installing or running scripts.

```bash
pnpm install       # install dependencies
pnpm dev           # start dev server (Turbopack) at http://localhost:3000
pnpm build         # production build
pnpm start         # run production build
pnpm lint          # eslint . (ESLint 9 + eslint-config-next 15, eslint.config.mjs); no corre dentro de next build

# Cloudflare Workers (OpenNext)
pnpm run preview   # OpenNext build + local Workers preview (wrangler dev, local R2/DO simulators)
pnpm run deploy    # OpenNext build + deploy to Cloudflare (production)
pnpm run upload    # OpenNext build + upload a new version without promoting it
pnpm cf-typegen    # regenerate cloudflare-env.d.ts from wrangler.jsonc bindings
pnpm wrangler deploy --dry-run --outdir /tmp/cf-dry   # check worker size (gzip must stay under 10 MB)
```

Hosting is Cloudflare Workers via `@opennextjs/cloudflare` (not Vercel). Config lives in `open-next.config.ts` (R2 incremental cache + Durable Object revalidation queue, needed because blog/home/OG routes use `revalidate`) and `wrangler.jsonc` (worker `kadesh-pet`, custom domain `pet.kadesh.com.mx`, R2 bucket `kadesh-pet-cache`). `NEXT_PUBLIC_*` vars are inlined at build time (and OpenNext also copies the `.env*` values into the worker), so the build must see production values: `.env.local` overrides `.env.production`, so deploying from a dev machine whose `.env.local` points at `localhost` ships that. Use shell env vars or a `.env.production.local` (both take precedence), or build in CI with the real values. The build uses webpack (Next 15 default); if upgrading to Next 16, add `--webpack` to `buildCommand` in `open-next.config.ts`, since a Turbopack build pushes the worker over Cloudflare's 10 MB compressed limit.

There is no test suite configured in this repo currently (no test files, no test runner in package.json), despite `.cursor/rules/basic.mdc` mentioning Playwright as an aspiration.

### Environment variables

Required in `.env.local` (all client-exposed, hence `NEXT_PUBLIC_` prefix):
- `NEXT_PUBLIC_API_URL` — KeystoneJS GraphQL endpoint, used by the Apollo client (`src/providers/apollo-client.ts`) and blog server fetches (`src/app/blog/[url]/layout.tsx`).
- `NEXT_PUBLIC_SITE_URL` — canonical origin of **this** app: `https://pet.kadesh.com.mx`. Defined in `src/core/site.ts`. Never point it at `www.kadesh.com.mx` (that host is the B2B SaaS). Canonical, Open Graph, JSON-LD, sitemap and robots must be self-referential on pet.
- `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` — Google Maps (animal/veterinary map views, location picker).
- `NEXT_PUBLIC_GOOGLE_CLIENT_ID` — Google OAuth login.
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` — Stripe subscriptions (sales plans).
- `NEXT_PUBLIC_IMAGE_DOMAIN` — allowed remote image host for `next/image` (see `next.config.ts`).
- `NEXT_PUBLIC_ADSENSE_CLIENT` — optional override of the AdSense publisher ID; the default lives in `src/core/ads.ts`. The AdSense script is loaded in the root layout `<head>`, and `/ads.txt` is served from `app/ads.txt/route.ts`.
- `NEXT_PUBLIC_ADSENSE_SLOT_ANIMAL_DETAIL` — AdSense ad unit ID for the animal detail page. Optional: without it the ad box doesn't render.
- `NEXT_PUBLIC_ADSENSE_SLOT_VETERINARY_DETAIL` — AdSense ad unit ID for the veterinary detail page. Optional: falls back to the animal detail slot.
- `NEXT_PUBLIC_ADSENSE_SLOT_BLOG` — AdSense ad unit ID for the blog sidebar (index and post). Optional: falls back to the animal detail slot (`BLOG_AD_SLOT` in `src/core/ads.ts`).


Note: the README references `NEXT_PUBLIC_GRAPHQL_ENDPOINT`, but the code actually reads `NEXT_PUBLIC_API_URL` — trust the code.

## Architecture

### Path alias

All internal imports use the `kadesh/*` alias, mapped to `./src/*` in `tsconfig.json`. Never use deep relative imports (`../../../utils/foo`) — use `kadesh/utils/foo` instead.

### Directory layout (`src/`)

- `app/` — Next.js App Router routes. `layout.tsx` defines global metadata/fonts and delegates client-side setup to `app/ClientProviders.tsx`. Route folders mirror `core/routes.ts` (e.g. `app/animales/[id]`, `app/perfil/ventas/planes`, `app/blog/[url]`).
- `components/<feature>/` — feature-colocated UI. A feature typically contains its components, `hooks/`, `queries.ts` (Apollo queries/mutations), `constants.ts`, `types.ts`, and a barrel `index.ts` that re-exports the feature's public API (e.g. `src/components/animals/index.ts`). Prefer importing from the barrel (`kadesh/components/animals`) rather than reaching into a feature's internal files.
- `core/og-card.tsx` — shared pieces of the share cards (`app/*/[slug]/og/route.tsx`): keep all content in the centered 760px safe column (Facebook mobile crops ~190px per side), render with `renderOgCard` (serves WhatsApp a half-size variant; don't use `transform: scale` in Satori, it breaks ellipsis clipping) and wrap the handler in `withOgEdgeCache`.
- `core/site.ts` — canonical origin (`https://pet.kadesh.com.mx`). `core/routes.ts` — the single source of truth for all route paths/anchors. Always use `Routes` from `kadesh/core/routes` instead of hardcoding path strings. Always use `SITE_URL` from `kadesh/core/site` for absolute URLs (canonical, OG, JSON-LD, sitemap).
- `providers/` — cross-cutting React context/client setup: `apollo-client.ts` (Apollo client factory + auth link that attaches the KeystoneJS session token from `localStorage`), `ApolloProviderWrapper.tsx`, `ThemeProvider.tsx` (next-themes).
- `utils/` — pure helpers plus `UserContext.tsx` (the app-wide authenticated-user context/hook `useUser`) and `getAuthUser.ts` (fetches `authenticatedItem` from Keystone). No UI in this folder.
- `constants/` — app-wide constants; feature-specific constants live inside the feature folder instead.

### Provider composition

`app/ClientProviders.tsx` nests, outermost to innermost: `ThemeProvider` → `HeroUIProvider` → `ApolloProviderWrapper` → `UserProvider`, then renders children plus the WhatsApp help button and a themed `Toaster` (from `sileo`). When adding a new global provider, place it inside this stack in the same order-of-concern (theme → UI kit → data → auth).

### Auth

Session is a bearer token stored in `localStorage` under `keystonejs-session-token`. `providers/apollo-client.ts`'s `authLink` attaches it to every GraphQL request. `utils/UserContext.tsx` exposes `useUser()` (`user`, `loading`, `refreshUser`, `setUser`) and fetches the current user via `getAuthenticatedUser()` on mount; it deliberately avoids clearing `user` if a token exists but the query returns null (to not fight a Google-login race), so preserve that behavior if touching this file.

### Data fetching

GraphQL via Apollo Client against a KeystoneJS backend. Keep queries/mutations colocated in each feature's `queries.ts` rather than centralizing them, and use the shared client from `kadesh/providers` — don't instantiate new Apollo clients in components (server-side one-off calls, like `getAuthenticatedUser`, use `createApolloClient()` directly since there's no client context on the server).

### Styling and UI kit

- Tailwind CSS v4 (custom `orange`/`green`/`brown` palettes and `Poppins`/`Inter` font stack in `tailwind.config.ts`), with `darkMode: 'class'` driven by `next-themes`.
- HeroUI (`@heroui/*`) is the component kit in current use; Mantine is referenced in the README but is not a dependency in `package.json` — treat HeroUI + Tailwind as current.
- Icons: `@hugeicons/react` only. Do not introduce other icon libraries (lucide, heroicons, etc.) for new code.
- Server vs Client: prefer React Server Components; add `'use client'` only where needed (hooks, browser APIs, event handlers, client-only libs), and keep the client boundary as low as possible in the tree.

### Conventions

- Directories: lowercase-with-dashes. Files: PascalCase for React components (`AnimalCard.tsx`), camelCase for hooks/utils (`useLostAnimals.ts`, `format-date.tsx`), and non-component modules (`queries.ts`, `types.ts`, `constants.ts`).
- Validation: Zod where schema validation is needed.

## Rendimiento y costo

Aterriza en este repo las reglas generales de "Rendimiento y costo de infraestructura" de `~/.claude/CLAUDE.md`. Este front no toca Postgres: toda la carga llega a kadesh-back por `NEXT_PUBLIC_API_URL`.

### Utilidades que hay que reutilizar

- `src/utils/useRefetchOnTabReturn.ts`: `isTabHidden` va en `skipPollAttempt` de todo `pollInterval`, y `useRefetchOnTabReturn(refetch, { staleMs })` refresca al volver a la pestaña. Úsalos juntos; no escribas otro listener de `visibilitychange`.
- `src/components/notifications/hooks/useUnreadNotifications.ts`: el contador de la campana. En pantallas que ya están dentro del shell de `/perfil`, usa `{ passive: true }` (lee la caché, no consulta).
- `src/components/blog/server.ts`: `cacheWindowStart()` / `publishedCutoff()` y la cabecera `x-kadesh-cache-window`. Cualquier fetch del servidor que filtre por "ahora" (posts programados, eventos vigentes) usa ese patrón, no `new Date()`.
- `src/components/home/server.ts` + `src/components/home/recentReports.ts`: patrón para traer datos en el servidor y pasarlos al hook cliente como valor inicial, con `skip` cuando no cambian los filtros.
- `src/components/blog/queries.ts`: `MyPostFavorites` (una consulta por persona para todas las tarjetas) y `GetPostLikes` (`postLikesCount` + el like propio). Sigue ese modelo para cualquier "¿lo marqué?" en listas.
- Sin equivalente aún en este repo: `normalizeSearchText` y `useStableQuery` (están en kadesh-business). Si una feature los necesita, tráelos en lugar de reescribirlos.

### Valores vigentes

| Qué | Valor | Dónde |
|---|---|---|
| Campana y globos de `/perfil` | cada 5 min, pausado con pestaña oculta; refetch al volver tras ≥ 60 s | `src/components/notifications/constants.ts` (`UNREAD_POLL_MS`, `UNREAD_STALE_MS`) |
| Heartbeat de actividad | cada 5 min, solo con pestaña visible | `src/utils/activity/usePetActivity.ts` (`HEARTBEAT_MS`) |
| Reintentos de consultas | hasta 4, 500 ms a 5 s | `src/providers/queryRetryLink.ts` |
| Política por defecto de Apollo | `cache-and-network` | `src/providers/apollo-client.ts` |
| Blog (datos y páginas) | ventana de 10 min (`revalidate = 600`) | `src/components/blog/server.ts`, `src/app/blog/**/page.tsx` |
| Portada: alertas y reportes recientes | 10 min | `src/components/home/server.ts` (`ZONE_ALERTS_REVALIDATE_SECONDS`) |
| Portada: resto de datos | 1 h | `src/components/home/server.ts` (`REVALIDATE_SECONDS`) |
| Eventos | 60 s (portada: 10 min) | `src/components/events/server.ts`, `src/app/eventos/**/page.tsx` |
| Animales y veterinarias (servidor) | 60 s; datos para compartir 1 h | `src/components/{animals,veterinaries}/server.ts` |
| Organizaciones y aliados | 30 min | `src/components/rescue/server.ts`, `src/app/{organizaciones,aliados}/page.tsx` |
| Imágenes OG | `max-age=300`; tarjetas `s-maxage=600` | `src/app/*/[slug]/og/route.tsx`, `src/core/og-card.tsx` |
| URLs firmadas de imágenes | caducan a 1 h | `kadesh-back/keystone.ts` (`signed.expiry: 3600`) |
| Pool de Postgres del back | `connection_limit` 5, `pool_timeout` 20 s (`DB_CONNECTION_LIMIT`, `DB_POOL_TIMEOUT`) | `kadesh-back/keystone.ts` |

Cualquier `revalidate` de datos con imágenes debe quedar por debajo de 1 h por las URLs firmadas.

### Pendientes conocidos (no empeorarlos)

- `getNearbyAnimals` (`kadesh-back/graphql/customs/queries/nearbyAnimals.ts`) carga todos los animales y sus bitácoras y filtra y pagina en memoria; `limit` no abarata la llamada. No agregues llamadas nuevas: reutiliza la de la página. `/animales` pide `limit: 500` y el mapa muestra como máximo esos 500 (`src/components/animals/hooks/useLostAnimals.ts`); al acercarse a ese número hace falta una consulta ligera solo para el mapa.
- `getNearbyPetPlaces` sin ubicación trae todas las veterinarias, y el directorio pide reseñas completas por lugar (`src/components/veterinaries/queries.ts`, `hooks/useNearbyPetPlaces.ts`).
- Ficha de animal: el servidor ya trae la ficha para metadata y el cliente la vuelve a pedir con `cache-and-network` (`src/app/animales/[slug]/layout.tsx`, `src/components/animals/detail/hooks/useAnimalDetail.ts`). Cada visita además escribe una vista; lo mismo en blog y eventos (`useAnimalView.ts`, `usePostView.ts`, `useEventViews.ts`).
- `sitemap.xml` (`src/app/sitemap.ts`) recorre posts, eventos, animales, veterinarias y organizaciones en cada regeneración.
- Código de ventas muerto: `src/components/profile/sales/` y `src/app/(cuenta)/perfil/ventas/` (el layout redirige a `/perfil`). No lo revivas ni le agregues consultas.

### Cómo comprobar que una feature no agrega carga

- Pestaña Red, filtro `graphql`: cuenta las peticiones al cargar la pantalla y al navegar dentro de ella. Cada `operationName` debe salir una vez; dos iguales seguidas indican doble fetch (servidor + cliente, o dos hooks).
- Deja la pestaña oculta 2–3 min: no debe salir ninguna petición. Al volver, a lo más un refetch por consulta con polling.
- En listas, el número de peticiones no debe crecer con el número de tarjetas.
- En el HTML de una página del servidor (ver código fuente), los datos ya deben venir; si el navegador los vuelve a pedir al cargar, sobra la consulta del cliente.
- Para el caché del servidor, prueba con `pnpm build && pnpm start` (o `pnpm run preview`), no con `pnpm dev`: recarga varias veces y en los logs de kadesh-back debe llegar una sola petición por consulta por ventana de `revalidate`.
- Revisa el tamaño de la respuesta en Red: si trae campos que la pantalla no pinta, recórtalos.

## Registro de cambios y sincronización con móvil

Existe (o existirá) una app móvil en un repo separado, `kadesh-pet-mobile` (Expo + Expo Router + NativeWind + Apollo, mismo backend Keystone). Para que no se quede atrás de la web, **todo cambio en este repo se registra**, y los que apliquen a móvil se registran además como un prompt listo para implementarlo allá.

Al terminar **cualquier** cambio, antes de mostrar la lista de archivos modificados:

1. Añade una entrada al inicio de `docs/changes/CHANGELOG.md` (la más reciente arriba) con el formato que indica ese archivo.
2. Decide si el cambio aplica a móvil:
   - **Aplica**: lógica de negocio, queries/mutaciones GraphQL, validaciones, flujos de usuario, textos/copy de features, constantes o reglas (radios, roles, estados), y UI de pantallas que existen en la app (mascotas, veterinarias, blog, perfil/clínicas, auth, notificaciones).
   - **No aplica**: SEO, metadata, OG images, sitemap/robots, AdSense, Vercel, páginas de marketing (la app las abre en el navegador), estilos exclusivos de desktop, ventas/CRM (`/perfil/ventas`, fuera del MVP móvil).
3. Si aplica, crea `docs/mobile-sync/YYYY-MM-DD-<slug>.md` a partir de `docs/mobile-sync/_TEMPLATE.md`, con `estado: pendiente`, y añádelo a la tabla de `docs/mobile-sync/README.md`. El prompt debe ser **autocontenido**: quien lo ejecute trabaja en `kadesh-pet-mobile` sin acceso a este repo, así que incluye el GraphQL completo, los tipos y las reglas, no solo rutas de archivos.
4. Si no aplica, deja el motivo en la línea `Móvil:` de la entrada del changelog.
5. Incluye estos archivos en la lista de cambios que muestras al final. La regla global de no hacer push se mantiene.

### Dirección inversa: prompts de móvil → web

`kadesh-pet-mobile` registra sus cambios igual y deja en `../kadesh-pet-mobile/docs/web-sync/` los que pueden llevarse a la web. Revisa los `pendiente` de su `README.md` cuando trabajes en una feature relacionada. Al implementar uno:

1. Márcalo `estado: implementado` en el archivo y en la tabla de `../kadesh-pet-mobile/docs/web-sync/README.md` (o `descartado` con el motivo; los `evaluar: sí` son ideas que quizá no apliquen).
2. Registra el cambio en `docs/changes/CHANGELOG.md` con `Móvil: no aplica (viene de móvil)`, para no generar un prompt de vuelta.

La app usa Clean Architecture (`src/modules/<módulo>/<feature>/{domain,application,data,presentation}`) y GraphQL con operaciones `.graphql` + codegen, no `queries.ts` con hooks de Apollo. Al escribir un prompt de `mobile-sync`, describe el comportamiento, el GraphQL y las reglas; no prescribas la estructura de archivos de la app.
