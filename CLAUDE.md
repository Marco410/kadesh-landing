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
pnpm lint          # next lint
```

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


Note: the README references `NEXT_PUBLIC_GRAPHQL_ENDPOINT`, but the code actually reads `NEXT_PUBLIC_API_URL` — trust the code.

## Architecture

### Path alias

All internal imports use the `kadesh/*` alias, mapped to `./src/*` in `tsconfig.json`. Never use deep relative imports (`../../../utils/foo`) — use `kadesh/utils/foo` instead.

### Directory layout (`src/`)

- `app/` — Next.js App Router routes. `layout.tsx` defines global metadata/fonts and delegates client-side setup to `app/ClientProviders.tsx`. Route folders mirror `core/routes.ts` (e.g. `app/animales/[id]`, `app/perfil/ventas/planes`, `app/blog/[url]`).
- `components/<feature>/` — feature-colocated UI. A feature typically contains its components, `hooks/`, `queries.ts` (Apollo queries/mutations), `constants.ts`, `types.ts`, and a barrel `index.ts` that re-exports the feature's public API (e.g. `src/components/animals/index.ts`). Prefer importing from the barrel (`kadesh/components/animals`) rather than reaching into a feature's internal files.
- `core/site.ts` — canonical origin (`https://pet.kadesh.com.mx`). `core/routes.ts` — the single source of truth for all route paths/anchors. Always use `Routes` from `kadesh/core/routes` instead of hardcoding path strings. Always use `SITE_URL` from `kadesh/core/site` for absolute URLs (canonical, OG, JSON-LD, sitemap).
- `providers/` — cross-cutting React context/client setup: `apollo-client.ts` (Apollo client factory + auth link that attaches the KeystoneJS session token from `localStorage`), `ApolloProviderWrapper.tsx`, `ThemeProvider.tsx` (next-themes).
- `utils/` — pure helpers plus `UserContext.tsx` (the app-wide authenticated-user context/hook `useUser`) and `getAuthUser.ts` (fetches `authenticatedItem` from Keystone). No UI in this folder.
- `constants/` — app-wide constants; feature-specific constants live inside the feature folder instead.

### Provider composition

`app/ClientProviders.tsx` nests, outermost to innermost: `ThemeProvider` → `HeroUIProvider` → `ApolloProviderWrapper` → `UserProvider`, then renders children plus a themed `Toaster` (from `sileo`), Vercel `SpeedInsights`, and `Analytics`. When adding a new global provider, place it inside this stack in the same order-of-concern (theme → UI kit → data → auth).

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

## Registro de cambios y sincronización con móvil

Existe (o existirá) una app móvil en un repo separado, `kadesh-mobile` (Expo + Expo Router + NativeWind + Apollo, mismo backend Keystone). Para que no se quede atrás de la web, **todo cambio en este repo se registra**, y los que apliquen a móvil se registran además como un prompt listo para implementarlo allá.

Al terminar **cualquier** cambio, antes de mostrar la lista de archivos modificados:

1. Añade una entrada al inicio de `docs/changes/CHANGELOG.md` (la más reciente arriba) con el formato que indica ese archivo.
2. Decide si el cambio aplica a móvil:
   - **Aplica**: lógica de negocio, queries/mutaciones GraphQL, validaciones, flujos de usuario, textos/copy de features, constantes o reglas (radios, roles, estados), y UI de pantallas que existen en la app (mascotas, veterinarias, blog, perfil/clínicas, auth, notificaciones).
   - **No aplica**: SEO, metadata, OG images, sitemap/robots, AdSense, Vercel, páginas de marketing (la app las abre en el navegador), estilos exclusivos de desktop, ventas/CRM (`/perfil/ventas`, fuera del MVP móvil).
3. Si aplica, crea `docs/mobile-sync/YYYY-MM-DD-<slug>.md` a partir de `docs/mobile-sync/_TEMPLATE.md`, con `estado: pendiente`, y añádelo a la tabla de `docs/mobile-sync/README.md`. El prompt debe ser **autocontenido**: quien lo ejecute trabaja en `kadesh-mobile` sin acceso a este repo, así que incluye el GraphQL completo, los tipos y las reglas, no solo rutas de archivos.
4. Si no aplica, deja el motivo en la línea `Móvil:` de la entrada del changelog.
5. Incluye estos archivos en la lista de cambios que muestras al final. La regla global de no hacer push se mantiene.
