# app-shell: el shell del panel con sesión

Menú lateral agrupado, barra superior flotante, encabezado de página, gráficas sin librería y el movimiento del panel. Lo usa **Mi cuenta** (`/perfil` y `/notificaciones`), a través de `kadesh/components/profile/shell/ProfileShell`.

Es una copia adaptada del shell de **kadesh-business** (`src/components/app-shell`, rama `feat/rediseno-operaciones`). Ese shell a su vez trae el lenguaje del admin de ICARM. **No se importa código entre repos**: si allá cambia algo que sirva aquí, se copia y se adapta.

Diferencias con business:

- El acento es el azul de marca (`--color-kadesh`, escala `kadesh-*`). No hay naranja: en este repo `orange-*` es un alias legado del azul, y el código nuevo usa `kadesh-*` explícito.
- No hay Kadesh AI. Sin `variant: "ai"`, sin degradado violeta y sin etiqueta Beta.
- No hay tours. Sin `dataTour` ni `navDataTour`. Si algún día se agregan:
  - Las anclas del menú en móvil están ocultas, porque el cajón está cerrado.
  - El tour debe saltar los elementos invisibles (`getClientRects().length === 0` o `visibility: hidden`) en vez de resaltarlos.
- La campana entra por `notifications` (un slot), no por un booleano, porque necesita el contador que ya consulta el producto.
- Los ítems externos (`external: true`) llevan ↗ y no quedan activos. Son los enlaces al sitio público del grupo "Kadesh".
- El título de grupo va en `text-dash-muted` (pasa AA), no en `faint`.

## Tokens (`src/app/globals.css`, bloque "Panel con sesión")

Las variables `--dash-*` viven en `:root` / `.dark`, **no dentro del shell**, porque los modales y menús en portal también las leen. Se usan como utilidades de Tailwind (`@theme inline`), sin repetir `dark:`.

| Utilidad | Uso |
|---|---|
| `bg-dash-canvas` | Fondo. La raíz `.kd-dash` ya lo pone, con brillos azules en las esquinas. |
| `bg-dash-surface` / `-surface-2` / `-surface-3` | Tarjetas / pistas, celdas y filas / bordes de pista y hover |
| `text-dash-ink` / `-soft` / `-muted` | Texto principal → tenue. `muted` pasa AA sobre canvas, surface y surface-2, pero no sobre surface-3 ni sobre el KPI tintado (ahí va `soft`). |
| `text-dash-faint` | **No pasa AA**: solo decorativo (separadores, deshabilitado). Nunca texto que haya que leer. |
| `border-dash-line` / `-line-strong`, `divide-dash-line` | Bordes |
| `bg-dash-hover`, `bg-dash-glass` | Hover neutro, barra de vidrio |
| `bg-dash-ink text-dash-on-ink` | Elemento "en tinta": chip activo, página actual (negro en claro, blanco en oscuro) |
| `shadow-dash`, `shadow-dash-lift`, `shadow-dash-accent(-lift)` | Sombra de tarjeta, tarjeta levantada, brillo azul del botón primario |
| `dash-grad-accent` / `dash-grad-dark` / `dash-grad-tint` | Degradados: botón principal y barra pico / KPI oscuro / KPI tintado |
| `dash-hatch` | Rayas para lo que va a medias (periodo en curso) |
| `dash-shimmer`, `dash-enter` | Esqueleto con brillo; entrada CSS escalonada con `style={{ "--i": n }}` |
| `font-dash` | Inter variable. `.kd-dash` ya la pone; en portales hay que agregarla. |

El degradado de acción es kadesh-400 → 500 → 700, con el 500 al **12 %**. Así el texto blanco queda ≥ 4.5:1 en todo el botón (mínimo medido: 4.69). Con el 500 a la mitad, el texto del lado izquierdo bajaba a 3.6:1.

Todos los acentos se derivan de `--color-kadesh` con `color-mix`: cambiar la marca cambia el panel.

## Componentes

- **`AppShell`**. Props: `brandTitle`, `brandSubtitle`, `groups` (`AppNavGroup[]`), `crumbs`, `actions` (botones antes de la campana), `notifications` (la campana) y `children`.
  - `collapsibleStorageKey`: el menú se colapsa a iconos en escritorio y se recuerda (`useSidebarCollapsed`).
  - Escritorio (`lg`): grid `272px | contenido` (84 px colapsado) con el menú fijo.
  - Móvil: el menú es un cajón.
    - Se cierra con Escape, el ✕, el velo o al elegir una sección.
    - Mientras está abierto, el contenido y lo flotante de fuera del shell (`[data-dash-outside]`, como la ayuda por WhatsApp) quedan `inert`, y el `body` sin scroll.
    - Al abrir, el foco va a la sección actual; al cerrar, regresa al botón.
  - Incluye "Saltar al contenido".
  - Da `DashPortalContext = true` a todo lo que monta (ver "Portales").
- **`AppSidebar`**:
  - Logo en cuadro con el degradado azul. La K es blanca y llena su lienzo, por eso lleva aire alrededor. Lleva a Inicio.
  - Grupos con título en versalitas. La opción activa es una píldora blanca que se desliza (`layoutId`), con el icono en azul y un globo rojo para pendientes (`badge` + `badgeLabel` para lectores de pantalla).
  - Abajo va la tarjeta del usuario (Ir al sitio, Salir). En teléfono, ahí también van el tema y el tamaño de texto, que no caben en la barra.
- **`AppTopBar`**: migas (en móvil solo la página actual), `actions`, `notifications`, tamaño de texto, tema y menú de cuenta. Es `sticky`; en escritorio flota redondeada.
- **`UserMenu`** (el avatar de la barra): reemplaza el menú del avatar del sitio. Incluye:
  - Mi perfil, Mis citas y Notificaciones.
  - Ir al sitio, Veterinarias, Animales, Blog y Contacto.
  - Cerrar sesión.

  Sin la barra del sitio, esos enlaces se perderían.
- **`AppPageHeader`**: eyebrow, título (`clamp(2rem, 1.4rem + 2.4vw, 2.85rem)`, tracking `-0.04em`), descripción y acciones. El `h1` lleva `data-app-title`; el producto le pasa el foco al cambiar de vista.
- **`Reveal`**: fade-up al montar, con `index` para escalonar.
- **`AnimatedNumber`**: cifra que cuenta hacia arriba. El lector de pantalla recibe el valor final.
- **`DashAvatar`**: foto o iniciales sobre el degradado azul.
- **Gráficas** (`charts.tsx`), hechas con divs y SVG porque el worker de Cloudflare tiene tope de 10 MB:
  - `Sparkline`: línea con área y trazo animado.
  - `ColumnBars`: barras tipo píldora. La del pico va en azul con su cifra en una burbuja, la del periodo en curso rayada, y admite desglose apilado. Con más de 14 barras solo lleva las fechas de los extremos. Siempre repite los datos en una tabla oculta.
  - `HBarList`: ranking horizontal.

## Kit (`ui.tsx`, exportado en el barril)

Copia adaptada de `components/admin/ui.tsx` de business, con prefijo `Dash*`. Ningún componente acepta `className` para cambiar su variante (`cn` no mezcla clases).

- **`DashStatTile`**: KPI con `variant`:
  - `default`: blanco.
  - `dark`: casi negro con brillo azul. Uno por vista, para la cifra principal.
  - `tint`: azul claro, para la segunda. Su texto secundario va en `soft`.

  Además acepta `delta` (pastilla ↗/↘ con `label` para lectores de pantalla), `sparkline`, `tone` (punto y cifra en ámbar, rojo o verde), `icon` y `href`/`onClick` (lift). Si `value` es número, cuenta hacia arriba.
- **`DashSegmented`**: cambio de vista dentro de una sección; píldora con indicador que se desliza y conteo opcional.
- **`DashFilterChips`**: filtros de lista; el activo en tinta. Acepta `count`, `dot` y `label`.
- **`DashButton` / `dashButtonClass`** (este último para `<Link>`). Variantes:
  - `primary`: degradado. Solo para la acción principal de la vista.
  - `dark`, `outline`, `ghost`, `danger`, `danger-ghost`.

  Tamaños `md` / `sm` / `icon` / `icon-sm`, y `fullWidth`.
- **`DashSectionCard`** (tarjeta con título, descripción y acción, con entrada escalonada), **`DashEmptyState`**, **`DashErrorState`**, **`DashLoadingRows`**, **`DashLoadMore`** y **`DashStatusBadge`** (colores de estatus: aquí sí con su `dark:`).
- **`DashModal`** (centrado; hoja inferior en móvil) y **`DashDrawer`** (sale de la derecha desde 640 px).
  - Portal a `body` con `font-dash`.
  - Escape, velo y ✕ cierran, salvo con `busy`.
  - Scroll del fondo bloqueado.
  - El foco entra al panel (o al campo con `data-autofocus`) y regresa a quien lo abrió.
  - `AnimatePresence` envuelve lo que se monta: también animan al cerrarse.
  - Con movimiento reducido aparecen y se van sin transición.
- **Clases**: `dashSurfaceClass` (tarjeta de 24 px), campos (`dashInputClass`, `dashSelectClass`, `dashTextareaClass`, `dashLabelClass`) y tabla (`dashTableWrapClass`, `dashTheadClass`, `dashThClass`, `dashTdClass`, `dashRowClass`).

## Portales

Lo que se monta en `document.body` queda fuera de `.kd-dash` y no hereda su fuente. Los tokens sí llegan, porque viven en `:root`. Un modal o menú del panel:

- se pone `font-dash`;
- si es un componente compartido con el sitio público (`ConfirmModal`, `StatusDatePicker`…), lee `useInDash()` y solo entonces agrega `font-dash`. En el sitio se ve igual que antes.

## Movimiento (`motion.ts`)

- Una sola curva: `DASH_EASE = [0.16, 0.84, 0.44, 1]`. Las barras de las gráficas también la usan.
- Entradas: 0.55 s, `y: 10`, escalón de 50 ms con tope de 8.
- Indicadores: resorte (`indicatorTransition`). Menús: `popTransition`.
- Movimiento reducido: el shell usa `<MotionConfig reducedMotion="user">` y `globals.css` apaga las animaciones y transiciones CSS dentro de `.kd-dash`, esqueletos incluidos.

## Qué no hacer

- **No poner los tokens dentro de `.kd-dash`.** Los portales no los verían.
- **No dejar parejas `dark:` junto a un token.** Con `@variant dark (.dark &)`, `dark:x` genera `.dark .dark\:x` (especificidad 0,2,0) y le gana a cualquier `bg-dash-*` (0,1,0).
  - Al migrar `text-[#121212] dark:text-[#eef1f6]` → `text-dash-ink`, la pareja `dark:` se quita.
  - `dark:` solo queda en colores de datos o estatus (rojo, verde, ámbar) y en el azul (`kadesh-600 dark:kadesh-300`).
- **No "sobrescribir" estilos por `className`.** `cn` (`kadesh/utils/cn`) solo une cadenas y no resuelve conflictos de Tailwind: gana el orden del CSS, no el de los argumentos. Si un componente necesita otra variante, se cambia el componente.
- **No cargar Inter con pesos fijos.** `layout.tsx` la carga sin `weight` (variable): con 400/700 fijos, el 500 y el 600 del panel se simulan y se leen mal.
- **No usar `font-sans` ni Poppins dentro del panel.** El sitio público conserva Poppins.
- **No poner naranja ni morado.** Tampoco el azul sólido fuera de la acción principal y de la barra pico de las gráficas. Los chips activos van en tinta.
- **No agregar librerías** de gráficas ni de animación (tope de 10 MB del worker).
- **No dejar `pt-[72px]`/`pt-20`** en las vistas del panel. Era para librar la barra fija del sitio, que aquí no existe.
- **Los encabezados sticky** de las listas van debajo de la barra: `top-[3.85rem]` en móvil y `lg:top-[4.75rem]`.
- **`AnimatePresence` envuelve lo que se monta y desmonta**, no al revés. Si no, el modal no anima al cerrarse.
- **No quitar `html:has(.kd-dash) body { overflow: visible }`.**
  - La base del sitio pone `overflow-x: hidden` en el `body`. Eso lo vuelve contenedor de scroll y rompe el `sticky` de la barra y del menú: en el teléfono, la barra se iba con el scroll.
  - El recorte horizontal lo sigue haciendo el viewport.
- **No animar `visibility` al abrir el cajón.** Si se anima, el primer cuadro sigue `hidden` y `focus()` no entra al menú. Por eso, abierto, solo transiciona `transform`; al cerrar sí espera a terminar de salir.
- **`MotionConfig reducedMotion="user"` no basta.** Solo apaga transformaciones y layout, y deja el fundido de opacidad.
  - Lo que anima opacidad o trazos (`Reveal`, `Sparkline`, menús) lee `useReducedMotion()` y, si está activo, aparece ya en su lugar (`initial={false}` o `duration: 0`).
- **El velo del cajón va en `z-[45]`**, por encima de la barra y del WhatsApp (z-40) y debajo del cajón (z-50).
