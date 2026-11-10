# Registro de cambios — kadesh-landing

Todo cambio en este repo se anota aquí, el más reciente arriba. La línea `Móvil:` enlaza al prompt de `docs/mobile-sync/` o explica por qué no aplica a la app. La regla completa está en `CLAUDE.md`, en la sección "Registro de cambios y sincronización con móvil".

Formato:

```md
## YYYY-MM-DD · <tipo>: <título corto>
- Rama: <rama>
- Qué cambió y por qué: …
- Archivos: src/…, src/…
- GraphQL: queries/mutaciones nuevas o modificadas (o "ninguna")
- Móvil: [prompt](../mobile-sync/YYYY-MM-DD-<slug>.md) | no aplica (motivo)
```

---

## 2026-11-10 · fix+feat: blog sin errores de hidratación; columna con lo más leído, relacionados, publicidad y categorías
- Rama: fix/blog
- Qué cambió y por qué:
  - **Hidratación (#418 en `/blog`)**: reproducido en `next dev` con el servidor en UTC y el navegador en México. La tarjeta, la fecha del artículo, «Actualizado el», los comentarios y «Se unió el» usaban `toLocaleDateString('es-MX')` sin zona horaria. Con el servidor en UTC (Workers), una fecha de las 18:00–24:00 de México salía con otro día en cada lado.
    - Ahora todas van en hora de la Ciudad de México con `formatLongDateMx` / `formatShortDateMx` / `dayKeyMx` (`utils/format-date.tsx`). Intl da los números y los nombres de mes son nuestros, para que no cambien entre motores.
    - El año del pie usa `suppressHydrationWarning` solo en ese `<span>`, porque el HTML de ISR puede ser de antes de Año Nuevo.
    - Verificado con `next build && next start` en UTC y el navegador en México, Tokio y Los Ángeles: índice, filtro por categoría y 3 artículos (incluido uno publicado a las 00:08 UTC) sin errores de hidratación.
  - **Reporte de errores**:
    - El listener de `window` se instala al cargar el módulo, antes de hidratar. En un `useEffect` llegaba tarde y se perdían los errores de hidratación del primer pase.
    - Un error de hidratación (#418/#419/#422/#423/#425) en una página que tradujo el navegador (`translated-ltr`/`-rtl`, `<font>`, `_msttexthash`) se manda como `kind: "warning"` (aviso de baja prioridad), no como `script`. La señal se recuerda porque el render de recuperación de React la borra.
    - Probado forzando un desajuste en producción: con traducción sale `warning`; sin ella, `script`. kadesh-back resume `warning` como «Aviso en …» y el panel de Negocios lo etiqueta «Aviso (baja prioridad)».
  - **Diseño del blog**:
    - **Índice:** columna derecha con «Lo más leído» (top 5 por vistas, numerado) y la cuadrícula a 3 por fila.
    - **Artículo:** columna de lectura de ~68ch y, a la derecha, «Artículos relacionados» (sin coincidencias, «Lo más reciente»). Reemplaza al carrusel del final; se borraron `RelatedPostsSlider` y `useRelatedPosts`.
    - **Debajo, en las dos columnas:** el bloque de publicidad del detalle de animal (`BLOG_AD_SLOT`, que sin slot propio usa el del animal) y las categorías con su conteo de publicados, con la activa marcada.
    - Publicidad y categorías se quedan fijas al hacer scroll solo en escritorio con pantalla alta.
    - Todo se pide en el servidor (`fetchMostViewedPosts`, `fetchRelatedPosts`, `fetchBlogCategories`).
  - Mismo cambio en kadesh-business (fechas, reporte, columna y un `AdSlot` propio con anuncios de Kadesh Pet y Food).
- Archivos: src/utils/format-date.tsx, src/components/blog/{BlogSidebar.tsx (nuevo), BlogIndexClient.tsx, BlogCard.tsx, server.ts, types.ts, README.md}, src/components/blog/post/{BlogPostDetail.tsx, BlogPostPageClient.tsx, CommentsSection.tsx}, src/components/blog/post/RelatedPostsSlider.tsx (borrado), src/components/blog/hooks/useRelatedPosts.ts (borrado), src/app/blog/page.tsx, src/app/blog/[url]/page.tsx, src/components/shared/AuthorCard.tsx, src/components/layout/Footer.tsx, src/core/ads.ts, src/utils/activity/{useClientErrorListener.ts, reportClientError.ts, README.md}, CLAUDE.md
- GraphQL: nuevas `GetSidebarPosts` (posts ligeros para la columna) y `GetBlogCategories` (categorías con `postsCount` de publicados), solo lectura y desde el servidor.
- Móvil: [prompt](../mobile-sync/2026-11-10-blog-mas-leidos-y-categorias.md) (lo más leído, relacionados, categorías y fechas en hora de México; la publicidad y la hidratación no aplican).

## 2026-11-09 · chore: skill de diseño Impeccable actualizado a v4.8.2
- Rama: fix/sesion-y-red-resilientes (sin commit; es independiente de ese fix)
- Qué cambió y por qué: `npx impeccable update` pasó el skill de v4.1.1 a v4.8.2. Los scripts `.mjs` se reemplazan por un motor nativo (`scripts/impeccable`, que usa `scripts/bin/<plataforma>/impeccable`, 18 MB) y se agregan los agentes del skill en `.claude/agents/` (revisor final, documentador, productor de imágenes, aplicador de ediciones manuales). Instala además el hook que revisa el diseño después de editar UI, en `.claude/settings.local.json` (local, no se versiona).
- Archivos: .claude/skills/impeccable/ (referencias actualizadas, scripts reemplazados por el motor), .claude/agents/ (nuevo)
- GraphQL: ninguna.
- Móvil: no aplica (herramienta de desarrollo).

## 2026-11-09 · feat: sección «Espacios de rescate» en la portada
- Rama: fix/sesion-y-red-resilientes (sin commit; es independiente de ese fix)
- Qué cambió y por qué: la portada solo hablaba de los espacios de rescate en el muro de Aliados, que no se pinta mientras no haya aliados, y en un enlace de «Cómo funciona». Ahora tienen su sección, entre Historias y Aliados:
  - **Texto**: H2 «Tu rescate en orden, desde que llega hasta que se va a casa», respuesta directa, los cinco tipos de espacio, tres puntos (equipo con roles, solicitudes de adopción, perfil verificado), **Activar mi espacio de rescate** y «Ver espacios verificados».
  - **Vitrina** (`RescueJourney`): la ficha de ejemplo de Bruno, marcada «Ejemplo», con su recorrido. Llega, recibe una vacuna con recordatorio por WhatsApp, se publica en adopción, le aprueban una solicitud y su cartilla pasa de «Refugio Colibrí» a «Familia Ruiz». Al entrar en pantalla los pasos aparecen uno a uno y la etapa cambia con las etiquetas reales de la ficha interna. Sin JS o con «reducir movimiento» se ve el estado final.
  - **Aliados** queda como la prueba de la sección: pierde su recuadro «¿Rescatas? Únete como aliado», que repetía el botón, y pasa a fondo blanco para alternar con la nueva sección.
  - Revisado con capturas en escritorio, móvil (390 px, sin desborde horizontal) y modo oscuro. tsc, ESLint y el detector de diseño, limpios.
- Archivos: src/components/home/RescueSpacesSection.tsx (nuevo), src/components/home/RescueJourney.tsx (nuevo), src/components/home/index.ts, src/components/home/AlliesSection.tsx, src/components/home/README.md, src/components/rescue/README.md, src/app/page.tsx
- GraphQL: ninguna.
- Móvil: no aplica (sección de la portada; la app abre las páginas de marketing en el navegador).

## 2026-11-09 · fix: sesión y consultas que aguantan cortes de red; sin ruido de «Error de conexión»
- Rama: develop
- Qué cambió y por qué: Operaciones registraba «Error de conexión en AuthenticatedItem» (`Failed to fetch` / Safari `Load failed`) en la ficha y el blog, y lo mismo en GetAnimal, GetPosts, NotificationUnreadCount, ProfileNavCounts… La mayoría eran bots sin sesión que cierran la página a media carga, o celulares que pierden señal. Además, con sesión válida y la red caída al cargar, `/perfil` y otras pantallas **mandaban al login**: el fallo de red se tomaba como "sin sesión".
  - **Sin token no se pide la sesión**: `UserProvider` no manda `AuthenticatedItem` si no hay `keystonejs-session-token`. La API vive en otro sitio (`*.up.railway.app`), así que su cookie no viaja y sin token la respuesta siempre es `null`. NotificationUnreadCount y ProfileNavCounts ya se saltaban sin usuario; ahora tampoco hay usuario sin token.
  - **«No se pudo verificar» ≠ «sin sesión»**: `fetchSessionUser` devuelve `ok` o `unreachable`. Con red caída, la sesión queda `sessionPending`: se ve como invitado (o el usuario que ya había) y nadie sale al login. Se reintenta en silencio al volver la red (`online`), al volver la pestaña (`visibilitychange`) y a los 15/30/60 s. Las pantallas con sesión (`ProfileShell`, reportar, eventos, registro de veterinaria) esperan con `loading || sessionPending`.
  - **Reintentos**: `queryRetryLink` (`RetryLink`) reintenta solo consultas, nunca mutaciones: hasta 3 veces con backoff exponencial y jitter, ante "Failed to fetch" o 502/503/504. Va debajo de `requestErrorLink`, que solo ve el error final.
  - **Reporte**: no se reportan errores de red cancelados (`AbortError`: pantalla desmontada o cambio de ruta; Apollo + `apollo-upload-client` abortan el fetch al desuscribirse), con la página yéndose (`pagehide`), oculta o sin red. Tampoco los recuperados en un reintento ni los de bots. Solo se reporta si fallan todos los reintentos con la persona en línea y la página visible.
  - **Recuperación**: al volver la red o la pestaña, `ApolloProviderWrapper` vuelve a pedir solo las consultas activas que quedaron en error de red.
  - **Ficha**: un refetch fallido ya no esconde la ficha si había datos en caché. Sin datos, sale «No se pudo cargar» con «Reintentar» y se carga sola al volver la red.
  - Mismo cambio en kadesh-business (cliente Apollo, sesión, reporte y filtro de bots).
  - Verificado con Chrome headless por DevTools Protocol contra el dev server, simulando un Chrome normal para que el filtro de bots no tape los resultados:
    - Sin token no sale `AuthenticatedItem`; con token, sí.
    - Offline a media carga sale «No se pudo cargar», sin reporte, y la ficha se recupera sola al volver la red.
    - Salir a media carga no reporta nada.
    - Con red, si fallan los 4 intentos, sí reporta uno; si un reintento sale bien, no reporta.
    - Con token y la sesión caída por red, `/perfil` no manda al login; con token inválido confirmado, sí.
- Archivos: src/utils/network.ts (nuevo), src/utils/sessionToken.ts (nuevo), src/providers/queryRetryLink.ts (nuevo), src/providers/apollo-client.ts, src/providers/ApolloProviderWrapper.tsx, src/utils/getAuthUser.ts, src/utils/UserContext.tsx, src/utils/activity/requestErrorLink.ts, src/utils/activity/README.md, src/app/animales/[slug]/page.tsx, src/app/animales/nuevo/page.tsx, src/app/veterinarias/registro/page.tsx, src/components/events/form/EventFormPage.tsx, src/components/profile/shell/ProfileShell.tsx
- GraphQL: ninguna (misma `AuthenticatedItem`).
- Móvil: [prompt](../mobile-sync/2026-11-09-sesion-y-red-resilientes.md).

## 2026-11-09 · fix: el mapa sin WebGL ya no tumba la ficha del animal; ciclo de vida de los mapas
- Rama: develop
- Qué cambió y por qué: Operaciones registraba «Se cayó la pantalla» en `/animales/[slug]` con `Error: {"requestedAttributes":…}`. Es el `throw` de MapLibre cuando no puede crear el contexto WebGL. Los 22 casos venían de IPs de Meta (crawler de vista previa con Chrome/139 headless, sin GPU ni sesión). Además, en `/veterinarias` salían «reading 'getZoom' / '_leaflet_pos' / 'jumpTo'» por llamadas al mapa después de quitarlo.
  - **Prueba de WebGL** antes de crear cualquier mapa (`utils/webgl.ts`, con los mismos atributos que pide MapLibre). Sin WebGL no se baja Leaflet/MapLibre ni se crea el mapa: sale `MapFallback` con la zona y «Ver en Google Maps».
  - **`createFreeMap`** (`components/shared/free-map.ts`) reemplaza el `L.map` + `attachFreeMapBaseLayer` de cada componente: nunca lanza (try/catch) y avisa con `onUnavailable`. La capa de MapLibre es una subclase segura del plugin (`free-map-layer.ts`). Si `new maplibregl.Map()` falla o MapLibre emite después un `error` de WebGL, queda inerte y el componente cambia al respaldo.
  - **Ciclo de vida**: la capa segura revisa que siga montada en sus callbacks diferidos (throttle, `requestAnimationFrame`, `moveend`), que eran los `getZoom`/`jumpTo` de `null`. `isMapAlive()` protege frames, timeouts, ResizeObserver y efectos; `destroyMap()` cancela el cierre pendiente de la animación de zoom y quita el mapa sin lanzar (el `_leaflet_pos`). Los `requestAnimationFrame` se cancelan en el cleanup.
  - **Ficha**: `AnimalLocationMap` carga `LogMap` con `next/dynamic` (`ssr: false`) y lo envuelve en `MapErrorBoundary`. Si el mapa truena, solo cae el mapa y fotos, datos, contacto y botones siguen. `LogMap` sale del barrel para no meterlo estático al bundle.
  - **Los demás mapas** (directorios de animales y veterinarias, ficha de veterinaria, eventos, selector de ubicación, zona de alertas) usan el mismo hook (`useFreeMapStack`), `createFreeMap` y su respaldo. En el selector de ubicación, «Usar mi ubicación» y la búsqueda siguen funcionando sin mapa.
  - **Reporte de errores**: `reportClientError` ya no manda errores de falta de WebGL ni de bots (UA de crawlers y vistas previas, `HeadlessChrome`, `navigator.webdriver`). El crawler de Meta con UA normal lo descarta kadesh-back por rango de IP (`utils/security/knownCrawlers.ts`, cambio aparte en ese repo).
  - Verificado con Chrome headless y WebGL desactivado (`--disable-webgl --disable-3d-apis`): la ficha sale completa con el respaldo, sin errores en consola. Con WebGL el mapa se dibuja igual que antes.
- Archivos: src/utils/webgl.ts (nuevo), src/components/shared/free-map.ts, src/components/shared/free-map-layer.ts (nuevo), src/components/shared/useFreeMapStack.ts (nuevo), src/components/shared/MapFallback.tsx (nuevo), src/components/shared/MapErrorBoundary.tsx (nuevo), src/components/animals/detail/AnimalLocationMap.tsx (nuevo), src/components/animals/detail/LogMap.tsx, src/components/animals/detail/LogTimeline.tsx, src/components/animals/detail/MapModal.tsx, src/components/animals/detail/index.ts, src/components/animals/AnimalsMap.tsx, src/components/animals/nuevo/LocationPicker.tsx, src/components/events/EventMap.tsx, src/components/veterinaries/VeterinariesMap.tsx, src/components/notifications/AlertZoneMap.tsx, src/utils/activity/reportClientError.ts, src/utils/activity/useClientErrorListener.ts, src/utils/activity/index.ts, src/utils/activity/README.md
- GraphQL: ninguna.
- Móvil: no aplica (la app dibuja el mapa con `@maplibre/maplibre-react-native`, nativo: sin WebGL de navegador, sin Leaflet y sin crawlers de vista previa).

## 2026-11-09 · feat: difusión pagada del reporte en Facebook e Instagram (sin lucro, por WhatsApp)
- Rama: feat/difusion-pagada
- Qué cambió y por qué: quien reporta una mascota puede pagar un anuncio para que más gente de su zona vea el reporte. Que no parezca negocio ni estafa (a quien pierde una mascota le escriben estafadores pidiendo dinero).
  - **Ficha del animal**: aviso «Impulsar en Facebook», solo para quien puede editar el reporte (`canEditAnimal`) y si está `lost` o `found`. Recuerda que el reporte ya se publicó gratis en la página de Facebook.
  - **Formulario** (`Sheet`): presupuesto ($150/$300/$500 o libre entre $100 y $5,000) y días (3/5/7). Lo elegido es lo que se transfiere y lo que va al anuncio, sin renglones extra.
  - **Promesa antes de pagar**:
    - KADESH no cobra nada: el 100 % va a Meta.
    - No es una donación.
    - Comprobantes de Meta y avances por WhatsApp.
    - Si aparece, se pausa y se devuelve lo no gastado.
    - No garantiza encontrarlo.

    Aviso antiestafa: solo el WhatsApp oficial; KADESH nunca escribe primero para cobrar ni pide datos de tarjeta. Casilla «Entiendo que el pago es solo para el anuncio…».
  - **WhatsApp**: «Solicitar por WhatsApp» abre el número oficial con el mensaje armado (folio `KP-<6 del reporte>-<4 al azar>`, enlace, zona, días y presupuesto). Después se ven el folio y los siguientes pasos.
  - **Nada en el servidor**: no se guarda la solicitud, ni comprobantes, ni datos bancarios. La CLABE, el comprobante, los recibos de Meta, los avances y la devolución van por WhatsApp. El proceso manual está en el README de la feature.
  - **Términos**: nueva §6 «Difusión pagada de reportes en Facebook e Instagram» (las siguientes se renumeran). §5 aclara que las donaciones no incluyen esta difusión.
- Archivos: src/components/animals/promotion/ (carpeta nueva: constants.ts, promotionRequest.ts, PromoteReportBanner.tsx, PromotionSheet.tsx, index.ts, README.md), src/app/animales/[slug]/page.tsx, src/app/terminos/page.tsx
- GraphQL: ninguna.
- Móvil: [prompt](../mobile-sync/2026-11-09-difusion-pagada.md).

## 2026-11-06 · feat: «Adopciones» en el perfil (ver, seguir y editar mis solicitudes)
- Rama: feat/espacios-de-rescate
- Qué cambió y por qué: quien enviaba una solicitud de adopción solo veía su estado en la ficha del animal. Ahora tiene dónde seguirla y corregirla.
  - **Adopciones** en «Mis animales» (`/perfil?tab=adopciones`): sus solicitudes con foto, estado y quién cuida al animal, con filtros Abiertas/Todas.
  - **Detalle** (`&solicitud=<id>`):
    - qué sigue;
    - «Cómo va»: Enviaste tu solicitud → En revisión → Aprobada → Llega a casa, o cómo terminó;
    - el mensaje de quien cuida al animal;
    - lo que respondió;
    - acciones: Editar (solo «Enviada»), Ver ficha, Retirar y Ver su cartilla al adoptar.
  - **Editar**: es el mismo formulario, prellenado. Solo mientras nadie la ponga en revisión; al guardar se avisa a quien cuida al animal.
  - En la ficha, el aviso «Tu solicitud» tiene **Ver solicitud**.
  - Los avisos de su solicitud (`adoption.application_updated`) abren el detalle.
- Archivos:
  - Nuevos: `src/components/adoption/MyAdoptionApplicationsSection.tsx` y `MyAdoptionApplicationDetail.tsx`.
  - Adopción (`src/components/adoption/`): `AdoptionApplicationModal.tsx` (modo edición), `AdoptionApplyBanner.tsx`, `format.ts`, `queries.ts`, `types.ts`, `hooks/useAdoptionActions.ts`, `index.ts` y `README.md`.
  - Perfil: `src/app/(cuenta)/perfil/page.tsx`, `src/components/profile/shell/profileNav.ts` y `ProfileShell.tsx`.
  - Además: `src/core/routes.ts` (`profileAdoptions`, `profileAdoption`) y `src/utils/activity/clientContext.ts` (`solicitud`).
- GraphQL (kadesh-back, sin migración):
  - Mutación nueva `editAdoptionApplication(applicationId, input)`. No es `updateAdoptionApplication`, que es el CRUD de Keystone.
  - Regla de límite `adoption_application_edit_user`: 20 ediciones al día.
  - Los avisos a quien la envió llevan a `/perfil?tab=adopciones&solicitud=<id>`.
  - Operaciones nuevas del front: `MyAdoptionApplications`, `MyAdoptionApplicationDetail` y `EditAdoptionApplication`.
- Móvil: [prompt](../mobile-sync/2026-11-06-mis-solicitudes-de-adopcion.md)

## 2026-11-06 · fix: errores legibles en toda la web y «Guardar perfil» del espacio de rescate
- Rama: feat/espacios-de-rescate
- Qué cambió y por qué: al verificar un espacio desde Operaciones salió el error crudo de Keystone («RescueOrganization.name: value must not be empty…»). Al guardar el perfil del espacio salió «'other' is not an accepted option». La causa del primero estaba en el backend, que ya quedó corregido. El segundo era de la web:
  - **Perfil del espacio**: los espacios activados con los chips viejos tienen `species` con `other`. El formulario ya no lo mostraba, pero lo reenviaba, y Keystone rechaza el guardado entero (valida lo que llega, antes de los hooks). Ahora `knownRescueSpecies` deja solo los tipos de `ANIMAL_TYPE_OPTIONS`, al cargar y al guardar.
  - **Un solo traductor de errores**, `kadesh/utils/errorText` (`friendlyErrorText`, igual al de kadesh-business):
    - quita la etiqueta «Lista.campo:» de cada viñeta;
    - muestra solo mensajes que parezcan español y no sean técnicos;
    - cambia los de Keystone por uno genérico («Falta un dato obligatorio.», «Una de las opciones elegidas ya no existe…»), y sin red dice «No hay conexión…».
  - Lo usan `petErrorMessage`, `adoptionErrorMessage`, `claimErrorMessage`, `graphqlErrorMessage` (citas), `friendlyAuthError` (su último caso), los formularios de reporte (nuevo y editar), los eventos, el alta de veterinaria, las bitácoras, los avisos (WhatsApp y zona), el blog, la ubicación recordada y las secciones de ventas que mostraban `err.message`.
  - Stripe (planes) va con `locale: "es"`: sus errores de tarjeta llegan en español y se muestran tal cual.
  - El README de rescate dice que la verificación se hace en Operaciones de kadesh-business.
- Archivos:
  - Nuevo: `src/utils/errorText.ts`.
  - Rescate: `src/components/rescue/RescueProfileForm.tsx`, `src/components/rescue/constants.ts` y `src/components/rescue/README.md`.
  - Mascotas y adopción: `src/components/pets/utils.ts` y `src/components/adoption/format.ts`.
  - Auth: `src/components/auth/authErrors.ts`.
  - Animales: `src/components/animals/nuevo/NewAnimalForm.tsx`, `EditAnimalForm.tsx`, `claim/useAnimalClaims.ts`, `detail/AddLogModal.tsx` y `hooks/useLostAnimals.ts`.
  - Veterinarias: `src/components/veterinaries/appointments.ts` y `RegisterVeterinaryForm.tsx`.
  - Eventos: `src/components/events/form/EventForm.tsx`.
  - Avisos: `src/components/notifications/WhatsappNotificationsCard.tsx` y `AlertSettingsForm.tsx`.
  - Blog: `src/components/blog/BlogSection.tsx` y `CategorySection.tsx`.
  - Ubicación: `src/utils/useRememberedLocation.ts`.
  - Ventas: `src/components/profile/sales/SalesSection.tsx`, `agregar-vendedor/AgregarVendedorSection.tsx`, `obtener-clientes/ObtenerClientesSection.tsx`, `planes/hooks/useSubscriptionPayment.ts` y `planes/StripeSubscriptionWrapper.tsx`.
  - Docs móvil: `docs/mobile-sync/2026-11-05-espacios-de-rescate.md` (regla de `species`).
- GraphQL: ninguna
- Móvil: [prompt](../mobile-sync/2026-11-06-errores-legibles.md)

## 2026-11-05 · feat: solicitudes de adopción y traspaso de mascotas con código
- Rama: feat/espacios-de-rescate
- Qué cambió y por qué: Fase 3 de los espacios de rescate, más una forma de pasar una mascota de cuenta que sirve a cualquiera.
  - **Solicitudes de adopción** (`components/adoption`):
    - En un animal «En adopción», **Quiero adoptarlo** abre un cuestionario corto: vivienda, si es propia o rentada (y si permiten mascotas), patio, niños, horas solo, otros animales, experiencia y dos compromisos. Sin sesión, pide entrar y vuelve al formulario.
    - Quien la envió ve su estado en la ficha y puede retirarla.
    - Quien publicó al animal (o su equipo) las ve en la ficha («Solicitudes de adopción») y en la nueva vista **Solicitudes** del espacio. Las pone en revisión, las aprueba o las rechaza con un mensaje que le llega a la persona, y **completa la adopción**.
    - Al completar, la cartilla del animal (o una nueva con los datos del reporte) pasa a la cuenta del adoptante, el reporte queda «Adoptado» y las demás solicitudes se cierran con un aviso amable.
  - **Traspaso con código** (`components/pets`):
    - El dueño principal (**Traspasar** en la cartilla) o admin/coordinación de un espacio (**Entregar con código** en la ficha) generan un código como «7KQ2-M9XA», que vale 7 días y se usa una vez. Se copia, se manda por WhatsApp o va como enlace.
    - Quien la recibe usa **Recibir con código** en Mis mascotas (o abre el enlace), ve qué mascota es y quién se la da, y la acepta. La mascota llega con su cartilla completa y deja la cuenta anterior (y su familia, o el espacio).
    - Así el espacio entrega en adopción sin necesitar el correo de quien adopta. El backend limita los intentos para que nadie adivine códigos.
  - Avisos nuevos en la campana: `adoption.application_received`, `adoption.application_updated` y `pet.transfer_redeemed`.
- Archivos:
  - `src/components/adoption/` (carpeta nueva): `constants.ts`, `types.ts`, `queries.ts`, `format.ts`, `hooks/useAdoptionActions.ts`, `hooks/useMyAdoptionApplication.ts`, `AdoptionApplyBanner.tsx`, `AdoptionApplicationModal.tsx`, `AdoptionApplicationsPanel.tsx`, `AdoptionApplicationList.tsx`, `AdoptionApplicationCard.tsx`, `AdoptionDecisionModal.tsx`, `index.ts` y `README.md`.
  - `src/components/rescue/`: `RescueApplicationsView.tsx` (nuevo), `RescueManagePanel.tsx`, `RescuePetPanel.tsx`, `RescueSummaryView.tsx`, `constants.ts` y `README.md`.
  - `src/components/pets/`: `TransferPetModal.tsx`, `ReceivePetModal.tsx` y `transferCode.ts` (nuevos), más `PetDetail.tsx`, `MyPetsSection.tsx`, `queries.ts`, `types.ts`, `index.ts` y `README.md`.
  - `src/components/notifications/`: `constants.ts`, `inbox.ts` y `NotificationList.tsx`.
  - Además: `src/app/animales/[slug]/page.tsx` y `src/core/routes.ts`.
- GraphQL (kadesh-back, requiere `yarn migrate`):
  - Listas nuevas `AdoptionApplication` y `PetTransfer`.
  - Mutaciones nuevas: `submitAdoptionApplication`, `reviewAdoptionApplication`, `withdrawAdoptionApplication`, `completeAdoptionApplication`, `createPetTransferCode`, `cancelPetTransferCode`, `previewPetTransferCode` y `redeemPetTransferCode`.
  - Operaciones del front: `MyAdoptionApplication`, `AnimalAdoptionApplications`, `RescueAdoptionApplications`, `SubmitAdoptionApplication`, `ReviewAdoptionApplication`, `WithdrawAdoptionApplication`, `CompleteAdoptionApplication`, `PetTransferCodes`, `CreatePetTransferCode`, `CancelPetTransferCode`, `PreviewPetTransferCode` y `RedeemPetTransferCode`.
- Móvil: [solicitudes](../mobile-sync/2026-11-05-solicitudes-de-adopcion.md) · [traspaso con código](../mobile-sync/2026-11-05-traspaso-de-mascotas-con-codigo.md)

## 2026-11-05 · feat: fichas de rescate con cartilla, «Se quedó conmigo» y adopción
- Rama: feat/espacios-de-rescate
- Qué cambió y por qué: Fase 2 de los espacios de rescate. El equipo de un espacio lleva la cartilla de cada animal a su cargo y, al adoptarse, la cartilla pasa a la familia.
  - **Fichas** (`/perfil?tab=rescate&org=<id>&vista=fichas`):
    - Cada ficha es la cartilla de siempre (fotos, vacunas y demás registros, recordatorios) sin dueños: la ve el equipo, y quien es hogar temporal solo ve las suyas.
    - Lista con etapa, hogar temporal, estado de su reporte y próximo recordatorio. Filtro por etapa y «Nueva ficha».
    - En la ficha se cambian la etapa, la fecha de llegada y el hogar temporal, se publica en adopción o como rescatado, y se completa la adopción.
    - La sección «Animales» se renombró «Publicados»; cada reporte ahí tiene «Crear ficha» o «Ver ficha».
  - **Publicar desde la ficha**: si ya tiene reporte, solo le agrega la bitácora; si no, pide la zona y crea el reporte a nombre del espacio con los datos y fotos de la ficha.
  - **Completar adopción**: por correo de una cuenta existente. La cartilla, con vacunas y recordatorios, pasa a quien adopta como dueño principal, sale del espacio y el reporte queda «Adoptado». En su cartilla se ve «Adoptado con <espacio>» y le llega `pet.adoption_completed`.
  - **«Se quedó conmigo»** en la ficha pública: quien publicó un reporte sin espacio lo pasa a su cartilla y el reporte se cierra «En familia».
  - Los recordatorios de una ficha les llegan a admin, coordinación y al hogar temporal, con enlace a la ficha.
- Archivos: src/components/rescue/{RescuePetsView.tsx,RescuePetPanel.tsx,PublishRescuePetModal.tsx,CompleteAdoptionModal.tsx (nuevos),RescueManagePanel.tsx,RescueAnimalsView.tsx,RescueSummaryView.tsx,constants.ts,queries.ts,types.ts,README.md}, src/components/pets/{PetDetail.tsx,PetFormModal.tsx,queries.ts,types.ts,index.ts,README.md}, src/components/animals/{queries.ts,detail/KeepAnimalButton.tsx (nuevo),detail/index.ts,detail/hooks/useAnimalDetail.ts}, src/app/animales/[slug]/page.tsx, src/components/notifications/{constants.ts,inbox.ts,NotificationList.tsx}, src/core/routes.ts
- GraphQL (kadesh-back, requiere `yarn migrate`):
  - `Pet` gana `organization`, `stage`, `intakeDate`, `fosterMember`, `publicReport`, `adoptedFromOrganization`, `adoptedAt` y `viewerRole`; `RescueOrganization.pets`.
  - Mutaciones nuevas: `convertAnimalToPet`, `publishRescuePet` y `completeRescueAdoption`.
  - En el front, queries y mutaciones nuevas: `RescuePets`, `ConvertAnimalToPet`, `KeepAnimal`, `PublishRescuePet` y `CompleteRescueAdoption`. `PetDetail` pide los campos de la ficha; `GetAnimal` y `RescueOrganizationAnimals` piden `pet { id }`.
- Móvil: [prompt](../mobile-sync/2026-11-05-fichas-de-rescate-y-adopcion.md)

## 2026-11-05 · fix: tarjeta para compartir de organizaciones en la zona segura
- Rama: feat/espacios-de-rescate
- Qué cambió y por qué: la tarjeta de `/organizaciones/<slug>` pasa a las piezas comunes de `kadesh/core/og-card`, igual que las de animales, veterinarias y eventos en el hotfix `fix/ficha-animal-og-y-lint`. El contenido va centrado en la columna de 760 px (Facebook en móvil recorta los lados): logo arriba, nombre (máx. 2 líneas), «Verificado» con la ciudad y las cifras, y el pie «KADESH · pet.kadesh.com.mx». WhatsApp recibe la variante de 600×315 (94–255 KB) y la tarjeta queda 10 min en la caché del edge. `?formato=logo` (512×512 para el JSON-LD) sigue igual.
- Archivos: src/app/organizaciones/[slug]/og/route.tsx
- GraphQL: ninguna.
- Móvil: no aplica (imagen OG para compartir).

## 2026-11-05 · chore: ESLint instalado y en verde (el CI ya lo pedía)
- Rama: fix/ficha-animal-og-y-lint (hotfix)
- Qué cambió y por qué: el CI corre `pnpm lint` en cada PR, pero ESLint nunca estuvo instalado ni configurado: `next lint` no revisaba nada. Ahora:
  - `eslint` 9 + `eslint-config-next` 15.5.28 (misma versión que `next`) + `@eslint/eslintrc`, con `eslint.config.mjs` en formato plano (`next/core-web-vitals` y `next/typescript`). Se quedó en ESLint 9 porque `eslint-config-next` 15 no soporta la 10.
  - `pnpm lint` pasa de `next lint` (obsoleto desde Next 15.5) a `eslint .`. Se excluyen `.claude/` y `.cursor/` (scripts de skills de terceros).
  - `next.config.ts`: `eslint.ignoreDuringBuilds`. Con ESLint instalado, `next build` también lo correría y cualquier aviso nuevo podría tumbar un deploy desde local. El lint es un paso propio del CI.
  - Se corrigieron los 19 errores que ya había, sin cambiar comportamiento: `any` con tipos reales (`useLostAnimals`, `useSubscriptionPayment`, `getAuthUser` → `AuthenticatedItem`, `blog/types` → tipo del `DocumentRenderer`, `AutocompleteOption` → `unknown` con un helper `optionText`), comillas escapadas (`&quot;`, mismo glifo), `<a href="/blog">` → `<Link>` en Conócenos, `@ts-ignore` → `@ts-expect-error`, `let` → `const`, interfaz vacía → alias.
  - Resultado: 0 errores, 38 avisos (variables sin usar y dependencias de hooks; no bloquean).
- Archivos: package.json, pnpm-lock.yaml, eslint.config.mjs (nuevo), next.config.ts, CLAUDE.md, src/app/conocenos/page.tsx, src/components/animals/{detail/AddLogModal.tsx,hooks/useLostAnimals.ts}, src/components/blog/types.ts, src/components/landing/Testimonials.tsx, src/components/profile/sales/planes/hooks/useSubscriptionPayment.ts, src/components/shared/{Autocomplete.tsx,free-map.ts}, src/providers/apollo-client.ts, src/utils/{activity/track.ts,getAuthUser.ts}
- GraphQL: ninguna.
- Móvil: no aplica (herramientas de la web).

## 2026-11-05 · fix: tarjetas para compartir — vista previa de WhatsApp vacía y recorte de Facebook
- Rama: fix/ficha-animal-og-y-lint (hotfix)
- Qué cambió y por qué:
  - **WhatsApp**: el enlace de una ficha salía solo con el dominio (sin foto ni título); en Facebook sí. El HTML ya traía bien los metadatos (`og:*` en el `<head>` también para el agente de WhatsApp). El problema era la imagen OG: PNG de 1200×630 de **925 KB** que se regeneraba en cada petición (~4 s: pedir los datos, bajar la foto original de S3 y renderizar). WhatsApp arma la vista previa en el teléfono de quien comparte, con poco tiempo y un tope de peso (~300 KB). Ahora a WhatsApp (agente `WhatsApp/…`; Signal se presenta igual) se le sirve la misma tarjeta a la mitad, 600×315. Se maqueta directo a ese tamaño escalando cada medida del JSX: con `transform: scale()` Satori recortaba mal los textos con elipsis. Facebook y los demás siguen recibiendo 1200×630. `?v=wa` fuerza la variante. Respuesta con `Vary: User-Agent`.
  - **Caché**: cada tarjeta se guarda 10 min en la caché del edge de Cloudflare (Cache API, una entrada por variante y parámetros). Un reporte se comparte muchas veces seguidas y ya no se vuelve a renderizar cada vez. En `next dev` no hay caché.
  - **Recorte de Facebook**: en móvil Facebook muestra la tarjeta a ~1.3:1 y se perdían ~190 px por lado (se leía «ido» y «rmes» en vez de «Perdido» y «Hermes»). Ahora todo va centrado en una columna de 760 px; los lados solo llevan fondo. La marca pasó de la esquina a un pie «KADESH · pet.kadesh.com.mx». Títulos con `lineClamp` y tamaño según el largo, y lugares largos con elipsis, para que nada se salga de la columna.
  - Las tres tarjetas (animales, veterinarias, eventos) usan las piezas comunes de `kadesh/core/og-card` (variante, render, caché, foto, pie). La descarga de foto que estaba copiada en dos rutas quedó en un solo lugar. La de organizaciones se migra igual en `feat/espacios-de-rescate`, que todavía no sale.
  - Probado con las rutas reales empaquetadas y datos simulados (cortos y muy largos): con el recorte de Facebook no se pierde nada. Las versiones de WhatsApp pesan 117–276 KB, contra 320–860 KB las de 1200×630. Las siguientes peticiones salen de caché sin llamar a la API.
  - Pendiente de comprobar en WhatsApp y Facebook después de desplegar. WhatsApp guarda en el teléfono la vista previa de cada URL, así que hay que probar con otra ficha o con la URL más `?w=1`. En Facebook, «Volver a extraer» en el Depurador de contenido compartido.
- Archivos: src/core/og-card.tsx (nuevo), src/app/{animales,veterinarias,eventos}/[slug]/og/route.tsx
- GraphQL: ninguna.
- Móvil: no aplica (imágenes OG para compartir; las genera la web para cualquier enlace).

## 2026-11-05 · fix: historial y mapa siempre visibles en la ficha del animal; señas con «Ver más»
- Rama: fix/ficha-animal-og-y-lint (hotfix)
- Qué cambió y por qué: en escritorio la ficha ocupa la pantalla y la fila de datos tomaba todo el alto que pedía su contenido. Con señas particulares largas, el historial y el mapa (lo más importante del reporte) quedaban aplastados a unos pocos píxeles.
  - **Señas particulares** recortadas a 4 líneas (3 en escritorio) con «Ver más / Ver menos». El botón solo aparece si el texto de verdad no cabe (se mide con `ResizeObserver`).
  - **Grid de escritorio**: el historial y el mapa tienen alto mínimo (20rem) y la ficha cede espacio antes que ellos. Si no le alcanza, hace scroll dentro de su tarjeta y el borde inferior se desvanece para avisar que hay más (`.kadesh-scroll-fade`, animación ligada al scroll, sin JS). Con el anuncio lateral (xl) la fila no baja de 284px.
  - **Veterinarias cercanas** pasan bajo la foto en escritorio, para dejarle al historial y al mapa todo el alto de la columna derecha. En móvil siguen después del mapa (el orden del DOM no cambia, solo la colocación en el grid).
  - Columna derecha un poco más ancha (1fr : 1.4fr): con la ficha más ancha, «Color» y el aviso de comunidad ocupan menos líneas y en 1920×1050 o 1797×938 cabe completa sin scroll.
  - En pantallas bajas (laptops de 768px) el alto de la vista tiene un piso de 48rem: la página hace scroll en vez de aplastar el contenido.
- Archivos: src/app/animales/[slug]/page.tsx, src/components/animals/detail/{AnimalInfoSection.tsx,NearbyVeterinariesRow.tsx (acepta `className`)}, src/app/globals.css
- GraphQL: ninguna.
- Móvil: [prompt](../mobile-sync/2026-11-05-senas-ver-mas.md) (solo el «Ver más» de las señas; el reacomodo del grid es exclusivo de escritorio).

## 2026-11-05 · fix: las especies de un espacio de rescate son los tipos de animal
- Rama: develop
- Qué cambió y por qué: «¿Qué animales rescatan?» tenía su propia lista (Perros, Gatos, Otros). Ahora usa los tipos de animal de los reportes, `ANIMAL_TYPE_OPTIONS`: Perro, Gato, Ave, Pez, Reptil y Mamífero. El backend también (kadesh-back: `RescueOrganization.species` y su validación usan `ANIMAL_TYPE_OPTIONS`), para que coincidan con los animales que publica. En el perfil público y en la descripción SEO van en plural («Rescata: perros, gatos y aves»).
- Archivos: src/components/animals/constants.ts (`ANIMAL_TYPE_OPTIONS` y `animalTypePlural`, nuevos), src/components/rescue/{constants.ts (`rescueSpeciesPhrase` reemplaza a `RESCUE_SPECIES_OPTIONS` y `rescueSpeciesLabel`),rescue-seo.ts,RescueProfile.tsx,RescueOnboardingForm.tsx,RescueProfileForm.tsx}, docs/mobile-sync/2026-11-05-espacios-de-rescate.md
- GraphQL: ninguna (el campo sigue siendo `[String!]`; solo cambian los valores aceptados).
- Móvil: [prompt](../mobile-sync/2026-11-05-espacios-de-rescate.md) (sigue pendiente; ahí se corrigió la lista de especies).

## 2026-11-05 · feat: espacios de rescate (organizaciones) y Aliados KADESH
- Rama: develop
- Qué cambió y por qué: rescatistas, refugios, hogares temporales, colectivos y asociaciones no tenían dónde organizar a sus animales; publicaban como «voluntario» sin equipo ni perfil. Fase 1 del plan:
  - **Panel** (`/perfil?tab=rescate`, grupo «Rescate»): lista de espacios de la persona, activación en 3 pasos (`/perfil/rescate/activar`) que deja el espacio «En revisión» con la persona como admin, y administración por espacio con Resumen, Animales, Equipo (agregar por correo de una cuenta existente, roles admin/coordinador/voluntario/hogar temporal, quitar o salirse) y Perfil público (logo, portada, contacto, redes, cómo ayudar). Verificación por WhatsApp; la aprueba un admin en Keystone.
  - **Reportes**: «Publicar como» en el nuevo reporte (`?org=<id>` lo preselecciona) y «Publicado por» en la ficha con «Ver perfil» y WhatsApp. El equipo edita los animales del espacio (`viewerCanEdit` del backend). Mientras el espacio está en revisión el público ve el reporte con el autor, sin la organización.
  - **Inicio del panel**: «Requiere atención» avisa al admin si su espacio sigue en revisión o lo rechazaron. Notificaciones nuevas `rescue.submitted`, `rescue.verified`, `rescue.rejected`, `rescue.member_added`.
  - **Público**: directorio `/organizaciones`, perfil `/organizaciones/<slug>` (animales en adopción, rescatados, historias con final feliz, cómo ayudar, contacto) con imagen OG y JSON-LD `NGO`, y `/aliados`. Solo los verificados existen; los demás dan 404.
  - **Aliados en la portada** (`AlliesSection`, después de Historias): muro de logos al estilo de los contribuidores de GitHub, con etiqueta al pasar o enfocar y burbuja «+N». Los marca un admin (`isAlly`) entre los verificados; sin aliados no se pinta.
  - «Cómo funciona» ahora invita a rescatistas a activar su espacio. Sitemap con `/organizaciones`, `/aliados` y cada perfil verificado.
- Archivos: src/components/rescue/ (carpeta nueva: constants.ts, types.ts, queries.ts, server.ts, rescue-seo.ts, rescueWhatsApp.ts, hooks/usePublishableRescueOrgs.ts, RescueSection.tsx, RescueManagePanel.tsx, RescueSummaryView.tsx, RescueAnimalsView.tsx, RescueTeamView.tsx, RescueProfileForm.tsx, RescueOnboardingForm.tsx, RescueByline.tsx, RescueAvatar.tsx, AlliesWall.tsx, AlliesWallFrame.tsx, RescueProfile.tsx, RescueDirectory.tsx, RescueDirectoryFilters.tsx, index.ts, README.md), src/app/(cuenta)/perfil/{page.tsx,rescate/activar/layout.tsx,rescate/activar/page.tsx}, src/app/organizaciones/{page.tsx,[slug]/page.tsx,[slug]/og/route.tsx}, src/app/aliados/page.tsx, src/app/{page.tsx,sitemap.ts}, src/app/animales/nuevo/page.tsx, src/components/home/{AlliesSection.tsx,AlliesWallReveal.tsx,index.ts,HowItWorksSection.tsx,README.md}, src/components/animals/{queries.ts,canEditAnimal.ts,detail/AnimalInfoSection.tsx,detail/hooks/useAnimalDetail.ts,nuevo/NewAnimalForm.tsx}, src/components/notifications/{constants.ts,inbox.ts,NotificationList.tsx}, src/components/profile/{README.md,home/homeModel.ts,home/queries.ts,home/useProfileHome.ts,shell/ProfileShell.tsx,shell/profileNav.ts}, src/core/routes.ts, src/utils/activity/clientContext.ts
- GraphQL (kadesh-back, requiere `yarn migrate`): listas nuevas `RescueOrganization` y `RescueOrganizationMember`; `Animal.organization` y `Animal.viewerCanEdit`; mutaciones `activateRescueOrganization`, `addRescueOrganizationMember`, `setRescueOrganizationMemberRole`, `removeRescueOrganizationMember` (más `updateRescueOrganization` de Keystone); query `rescueAllies`; `petLandingStats.rescueOrganizations`. Queries del front: `MyRescueOrganizations`, `RescueOrganizationDetail`, `RescueOrganizationAnimals`, y de servidor `PublicRescueOrganization`, `PublicRescueAnimals`, `RescueAllies`, `RescueDirectory`, `RescueOrganizationsForSitemap`; `GetAnimal` pide `viewerCanEdit` y `organization`; `ProfileHome` pide `myRescueOrgs`.
- Móvil: [prompt](../mobile-sync/2026-11-05-espacios-de-rescate.md) (panel, equipo, «Publicar como», «Publicado por», notificaciones). Las páginas públicas, los aliados de la portada, el SEO y la OG no aplican: la app abre el perfil en el navegador.

## 2026-11-05 · fix: SEO y GEO de animales y veterinarias (el blog ya estaba bien)
- Rama: feat/eventos
- Qué cambió y por qué (revisión con el HTML real de producción):
  - **Blog**: bien. Lista y posts llegan completos del servidor con título, descripción, canonical, OG y JSON-LD. Sin cambios.
  - **Fichas de animal y de veterinaria**: tenían buenos metadatos, pero el HTML llegaba vacío (se pintan en el navegador): sin texto ni JSON-LD para buscadores e IA que no ejecutan JavaScript. Ahora el `layout` de servidor agrega:
    - Veterinaria: JSON-LD `VeterinaryCare` (dirección, CP, coordenadas, teléfono y, solo con reseñas de KADESH, `aggregateRating`) + migas, y un resumen visible «Datos de la veterinaria».
    - Animal: JSON-LD `WebPage` (foto, fecha) + migas, y un resumen visible «Resumen del reporte» (especie, raza, rasgos, estado y desde cuándo, última ubicación; sin teléfono ni dirección exacta).
  - **Sitemap**: no tenía ninguna ficha de animal (87 en producción) ni de veterinaria (593). Ahora entran todas (menos los reportes unidos a otro), más `/animales/nuevo` y `/veterinarias/registro`.
  - **`/animales` y `/veterinarias`**: usaban el título y la descripción genéricos de la portada y no tenían canonical. Ahora tienen los suyos y JSON-LD (`CollectionPage` + migas): los directorios de cliente se movieron a `AnimalsDirectory.tsx` / `VeterinariesDirectory.tsx` y `page.tsx` quedó como envoltorio de servidor. `/animales/nuevo` («Reporta gratis una mascota perdida o encontrada») y `/veterinarias/registro` («Registra tu veterinaria gratis») tienen metadatos propios.
  - **Descripción en inglés** de las veterinarias importadas de Google («Place located at… Rating: 4.2/5»): ya no se usa en metadatos; el backend ahora la escribe en español («Ubicada en …», kadesh-back `utils/helpers/nearby_petplaces.ts`).
- Archivos: src/app/animales/{page.tsx (envoltorio nuevo),[slug]/layout.tsx,nuevo/layout.tsx (nuevo)}, src/app/veterinarias/{page.tsx (envoltorio nuevo),[slug]/layout.tsx,registro/layout.tsx (nuevo)}, src/components/animals/{AnimalsDirectory.tsx (movido desde app/animales/page.tsx),animal-seo.ts,server.ts,README.md}, src/components/veterinaries/{VeterinariesDirectory.tsx (movido desde app/veterinarias/page.tsx),pet-place-seo.ts,server.ts,README.md}, src/components/shared/PageSummary.tsx (nuevo), src/app/sitemap.ts
- GraphQL: queries de servidor nuevas `AnimalsForSitemap` y `PetPlacesForSitemap`; `GetPetPlaceForShare` pide además `website`, `cp`, `lat` y `lng`.
- Móvil: no aplica (SEO; la app no usa estas páginas).

---

## 2026-11-05 · feat: SEO de eventos — títulos buscables, páginas por estado y municipio, IndexNow
- Rama: feat/eventos
- Qué cambió y por qué:
  - **Títulos**: la ficha se titula con lo que la gente busca: «Campaña de esterilización en Morelia · Gratis · 10 nov» (agrega «Gratis» y la fecha si caben en ~60 caracteres con « | KADESH» y si el título no los dice ya). El `<h1>` sigue siendo el de quien organiza.
  - **Páginas por lugar con URL propia**: `/eventos/en/michoacan` y `/eventos/en/michoacan/morelia`, con título («Eventos para mascotas en Morelia, Michoacán»), un texto con datos (cuántos eventos hay, en cuántos municipios y cuál es el próximo, con fecha y año), JSON-LD `CollectionPage` + `ItemList` + migas y enlaces entre niveles («Eventos por estado» en `/eventos`, «Eventos por municipio» en cada estado). Sin eventos próximos llevan `noindex`. Entran al sitemap las que tienen eventos. Los filtros de estado y municipio ahora navegan a estas rutas y `/eventos?estado=…` redirige (308). La ficha del evento enlaza a su estado y municipio en las migas (visibles y JSON-LD).
  - **IndexNow**: la web sirve la clave en `/indexnow-key.txt`; el backend avisa a Bing al publicar, cancelar o cambiar un evento (ver kadesh-back@feat/pet-events, `utils/seo/indexNow.ts`).
- Archivos: src/components/events/{EventsListingPage.tsx (nuevo),events-seo.ts,searchParams.ts,EventsIndexClient.tsx,EventDetail.tsx,README.md}, src/app/eventos/{page.tsx,en/page.tsx,en/[estado]/page.tsx,en/[estado]/[ciudad]/page.tsx}, src/app/indexnow-key.txt/route.ts, src/core/indexnow.ts, src/app/sitemap.ts, src/core/routes.ts (`events.place`)
- GraphQL: ninguna nueva.
- Móvil: no aplica (SEO). En el backend `en` quedó reservado como slug de evento (no cambia nada para la app).

---

## 2026-11-05 · feat: tarjeta para compartir de eventos como la de animales; SEO y GEO de eventos
- Rama: feat/eventos
- Qué cambió y por qué:
  - Al compartir un evento (WhatsApp, Facebook, X) la tarjeta era solo texto sobre azul. Ahora es como la de animales: la foto o el cartel de portada de fondo con degradado, el tipo de evento (pastilla de su color), el título, la próxima fecha y «y N fechas más», el costo corto («Gratis», «$100») y el lugar. Sin foto, el fondo va del color del tipo; «Cancelado» o «Terminó» cuando aplica. Si la foto no se puede dibujar, se sirve la portada tal cual (mismo plan B que animales).
  - GEO: la ficha lleva bajo el título una frase que se entiende sola: qué, dónde, fecha con año, costo, quién organiza y cupo.
  - SEO: el JSON-LD del organizador lleva `url` (su sitio o su primer perfil), que Google recomienda. `/eventos` suma 4 preguntas frecuentes visibles con su `FAQPage`. La portada suma «¿Dónde encuentro campañas de esterilización o vacunación?» y el JSON-LD de la organización nombra campañas y ferias de adopción.
  - Arreglos: «Síguelos» mostraba «@profile.php» con perfiles de Facebook por número (ahora «Facebook»); «Ciudad de México, Ciudad de México» se muestra una sola vez.
- Archivos: src/app/eventos/[slug]/og/route.tsx, src/app/eventos/page.tsx, src/components/events/{events-seo.ts,format.ts,socialLinks.ts,EventDetail.tsx,README.md}, src/components/home/{constants.ts,HomeJsonLd.tsx}, docs/mobile-sync/2026-11-04-eventos-ver-y-asistir.md
- GraphQL: ninguna
- Móvil: la tarjeta, el JSON-LD y las preguntas no aplican (SEO). Las dos reglas de texto (perfil de Facebook por número y la ciudad repetida) se agregaron al prompt pendiente de [ver y asistir](../mobile-sync/2026-11-04-eventos-ver-y-asistir.md).

---

## 2026-11-05 · feat: cifra de eventos en el hero y cifras con enlace
- Rama: feat/eventos
- Qué cambió y por qué:
  - El hero solo mostraba «20+ veterinarias» como texto. Ahora cada cifra es un enlace: veterinarias → `/veterinarias`; y una nueva de eventos → la sección `#eventos` de la portada.
  - La de eventos es «N eventos registrados»: todos los publicados, también los que ya pasaron. Sale desde 1 (con 0 no aparece) y se redondea hacia abajo con «+» desde 100. Veterinarias sigue redondeada y oculta debajo de 10.
- Archivos: src/components/home/{HeroSection.tsx,README.md}, src/components/events/server.ts (`publishedTotal` en `fetchHomeEvents`), src/app/page.tsx
- GraphQL: `HomeEventsWeek` agrega `publishedEvents: petEventsCount(where: { status: { equals: "approved" } })`.
- Móvil: no aplica (hero de la portada web).

---

## 2026-11-05 · feat: «Los próximos 7 días» de eventos en la portada
- Rama: feat/eventos
- Qué cambió y por qué:
  - La sección de eventos de la portada mostraba solo 3 tarjetas. Ahora tiene una tira de 7 días (HOY, VIE, SÁB…) con **todos** los eventos publicados de México de la semana, sin filtro: puntitos del color de cada tipo por día y, abajo, las tarjetas del día elegido (arranca en el primer día con eventos). Una fecha de varios días sale en cada día que toca.
  - Si la semana viene vacía muestra los 3 siguientes eventos; si no hay ninguno, invita a publicar.
  - Botón **Ver eventos cerca de ti** → `/eventos?cerca=1`: la lista abre con «Cerca de mí» y pide la ubicación (la persona ya lo pidió). «Cerca de mí» ahora también queda en la URL (`cerca=1`) para recargar o compartir.
  - Todo sale del servidor (SEO) y revalida cada 10 min; la ventana es de día completo en hora de CDMX y al hidratar «hoy» se ajusta al día del navegador.
- Archivos: src/components/events/{week.ts (nuevo),server.ts,searchParams.ts,EventsIndexClient.tsx,README.md}, src/components/home/{HomeEventsWeek.tsx (nuevo),UpcomingEventsSection.tsx,README.md}, src/app/page.tsx
- GraphQL: query de servidor nueva `HomeEventsWeek` (`petEventsFeed` con `to` a 7 días y las fechas de la semana con `sessions(where: …)`).
- Móvil: no aplica (portada web; en la app, la lista de eventos ya tiene «Cerca de mí» y la semana va en el Inicio del perfil).

---

## 2026-11-05 · feat: «Los próximos 7 días» en el Inicio del panel
- Rama: feat/eventos
- Qué cambió y por qué:
  - El Inicio no mostraba qué viene en la semana. Ahora, bajo el saludo, hay 7 fichas (hoy y los 6 días siguientes) con puntitos por tipo: azul = citas, verde = sus eventos (organiza, asistirá o le interesa), morado = eventos para descubrir. Al tocar un día se ve la lista de ese día (hora, título, lugar y etiqueta) con enlace a la ficha o a «Citas».
  - Los eventos para descubrir salen cerca del centro de sus alertas de zona (50 km); si no tiene zona, de la ubicación ya compartida; si tampoco, de todo México, con «Elegir mi zona».
  - Una fecha de varios días aparece en cada día que toca; un evento que la persona sigue y que además está cerca sale una sola vez, como suyo. Las horas van en la zona horaria del evento.
  - No incluye anuncios: el backend solo deja leerlos a los admins.
- Archivos: src/components/profile/home/{WeekStrip.tsx,weekAgenda.ts,useWeekAgenda.ts (nuevos),queries.ts,ProfileHome.tsx}, src/components/profile/README.md, docs/mobile-sync/2026-11-03-inicio-perfil.md
- GraphQL: queries nuevas `ProfileWeek` (`petPlaceAppointments`, `petEventInterests`, `petEvents` de la semana, con `sessions(where: …)`) y `ProfileWeekFeed` (`petEventsFeed` con las fechas de la semana).
- Móvil: agregado al prompt pendiente de [Inicio del perfil](../mobile-sync/2026-11-03-inicio-perfil.md).

---

## 2026-11-05 · fix: «Me interesa» / «Asistiré» no se veían marcados; atajo «Eventos» en el panel
- Rama: feat/eventos
- Qué cambió y por qué:
  - Al tocar «Me interesa» o «Asistiré» se guardaba (el conteo subía), pero el botón no cambiaba: `cn` solo concatena clases y los colores del estado normal (`bg-white`, `dark:bg-night`, `dark:text-white`) le ganaban a los del activo. Ahora cada estado lleva su juego completo de colores: «Me interesa» marcado va relleno azul y «Asistiré» relleno verde, con palomita, y abajo dice «Vas a ir. Te recordamos un día antes. Tócalo otra vez para quitarlo.».
  - El mismo choque de clases en los cuadros de texto del formulario de eventos (descripción, requisitos) y en el motivo de cancelación de «Mis eventos»: ahora usan clases propias (`textareaClass`, `dashTextareaClass`).
  - Inicio del panel: atajo nuevo **Eventos** («Campañas y jornadas», a `/eventos`) entre «Alertas de zona» y «Reportar animal». Son 5 atajos: una fila en escritorio; en 2 columnas el último ocupa la fila completa.
- Archivos: src/components/events/{EventActions.tsx,MyEventsSection.tsx,form/EventForm.tsx,form/styles.ts}, src/components/profile/home/ProfileHome.tsx, src/components/profile/README.md, docs/mobile-sync/2026-11-03-inicio-perfil.md
- GraphQL: ninguna
- Móvil: el atajo se agregó al prompt pendiente de [Inicio del perfil](../mobile-sync/2026-11-03-inicio-perfil.md). Lo de los botones marcados ya está en el prompt de eventos («alternan; tocar el activo lo quita»); el choque de clases es propio de la web.

---

## 2026-11-05 · feat: redes sociales del evento
- Rama: feat/eventos
- Qué cambió y por qué:
  - Quien publica un evento puede poner sus redes (Facebook, Instagram, TikTok, X) y su sitio web en «¿Quién lo organiza?», para que la gente siga a la organización y vea novedades del evento.
  - Se acepta el link o el usuario (`@refugio.morelia`) y se guarda el link completo. Un link de otra red se rechaza («El link de Instagram debe ser de instagram.com.»). Las mismas reglas en el backend (`normalizeSocialUrl`).
  - La ficha muestra un bloque «Síguelos» en la tarjeta lateral, con el usuario o el dominio en cada botón (`rel="nofollow ugc"`). El JSON-LD agrega los perfiles como `sameAs` del organizador.
  - Operaciones muestra las redes en el modal de revisión (kadesh-business@feat/pet-events-admin), para revisar que sean de quien organiza.
- Archivos: src/components/events/{socialLinks.ts (nuevo),types.ts,fields.ts,EventDetail.tsx,events-seo.ts,form/EventForm.tsx,form/eventFormModel.ts}, docs/mobile-sync/{2026-11-04-eventos-ver-y-asistir.md,2026-11-04-eventos-publicar.md}
- GraphQL: campos nuevos de `PetEvent` y de `PetEventInput`: `facebookUrl`, `instagramUrl`, `tiktokUrl`, `xUrl`, `websiteUrl` (kadesh-back@feat/pet-events; entran en la misma migración pendiente).
- Móvil: los dos prompts de eventos seguían pendientes; se actualizaron con los campos y las reglas ([ver y asistir](../mobile-sync/2026-11-04-eventos-ver-y-asistir.md) · [publicar](../mobile-sync/2026-11-04-eventos-publicar.md)).

---

## 2026-11-04 · feat: eventos (campañas, jornadas, ferias de adopción) con revisión y avisos por zona
- Rama: feat/eventos
- Qué cambió y por qué:
  - La comunidad no tenía dónde anunciar campañas de esterilización, vacunación, ferias de adopción, colectas, etc. Ahora cualquiera con sesión publica un evento; el equipo lo revisa en Operaciones (kadesh-business) antes de que sea público.
  - `/eventos`: próximos eventos con filtros por estado y municipio (solo los que tienen eventos, de `petEventFacets`), tipo, «Esta semana» / «Este mes» y «Cerca de mí» (100 km). La primera página llega del servidor; «Cerca de mí» y «Ver más» piden en el navegador.
  - Ficha `/eventos/<slug>`: galería, descripción, requisitos, mapa y «Cómo llegar», fechas en la zona horaria del estado del evento, costo, cupo, a quién va dirigido, registro (link o WhatsApp), «Me interesa» / «Asistiré» (con cupo: «Asistiré» se cierra al llenarse), Google Calendar y `.ics`, compartir y «Editar» para quien lo publicó. Si no es público, quien lo publicó lo ve como vista previa con su estado y el motivo del rechazo.
  - Publicar y editar (`/eventos/nuevo`, `/eventos/<slug>/editar`): formulario en 5 partes; fechas múltiples, de varios días y «Repetir cada semana»; alcance zona (5–50 km) / municipio / estado (nacional solo admins); hasta 6 fotos. Editar uno publicado lo regresa a revisión.
  - Panel: «Mis eventos» (`/perfil?tab=events`) con estado de revisión, asistentes, editar y cancelar (con motivo).
  - Portada: «Campañas y jornadas para tus mascotas» después de las alertas de zona (3 próximos, del servidor, revalida cada 10 min). «Eventos» en el menú, el pie y el panel.
  - Avisos: tipos `event.*` con ícono de calendario en la campana; «Avisos de eventos» (`eventAlertsEnabled`) en Alertas de zona, con la misma zona y el municipio/estado que detecta el backend.
- Archivos: src/components/events/** (nuevo), src/app/eventos/{page.tsx,nuevo/page.tsx,[slug]/page.tsx,[slug]/editar/page.tsx}, src/components/home/{UpcomingEventsSection.tsx,index.ts,README.md}, src/app/page.tsx, src/app/(cuenta)/perfil/page.tsx, src/components/profile/shell/profileNav.ts, src/components/layout/{Navigation.tsx,Footer.tsx}, src/components/changelog/RoadmapSection.tsx («Calendario» pasa a completado), src/components/notifications/{constants.ts,inbox.ts,NotificationList.tsx,AlertSettingsForm.tsx,NotificationChannelsSummary.tsx,queries.ts,types.ts,hooks/useAlertSettings.ts}, src/core/routes.ts
- GraphQL: nuevas `petEventsFeed`, `petEventFacets`, `submitPetEvent`, `updateMyPetEvent`, `cancelPetEvent`, `setPetEventInterest`; lists `PetEvent`, `PetEventSession`, `PetEventMultimedia` (fotos con `createPetEventMultimedias`), `PetEventInterest`; campos nuevos de `User`: `eventAlertsEnabled`, `alertCity`, `alertStateCode`. Backend en kadesh-back@feat/pet-events (requiere `yarn migrate`).
- Móvil: [ver y asistir](../mobile-sync/2026-11-04-eventos-ver-y-asistir.md) · [publicar](../mobile-sync/2026-11-04-eventos-publicar.md)

---

## 2026-11-04 · feat: SEO de eventos (JSON-LD, tarjeta para compartir, calendario y sitemap)
- Rama: feat/eventos
- Qué cambió y por qué:
  - Ficha con JSON-LD `Event` por cada fecha próxima (máx. 10): estado (programado / cancelado), lugar con dirección y coordenadas, oferta en MXN (`SoldOut` con cupo lleno), organizador y migas. El índice lleva `CollectionPage` + `ItemList`.
  - Metadatos: «<título> en <municipio>», descripción con fecha, lugar y costo. Los cancelados y los que ya pasaron quedan `noindex`. El filtro por estado tiene su canónica (`/eventos?estado=…`) y su título («Eventos para mascotas en Michoacán»).
  - Tarjeta para compartir `/eventos/<slug>/og` (como la de veterinarias) y archivo `.ics` en `/eventos/<slug>/calendario`.
  - Sitemap: `/eventos` (diario) y los eventos publicados próximos o de los últimos 30 días. `llms.txt` describe la sección.
- Archivos: src/components/events/events-seo.ts, src/app/eventos/[slug]/og/route.tsx, src/app/eventos/[slug]/calendario/route.ts, src/app/sitemap.ts, public/llms.txt
- GraphQL: `petEvents` (sitemap) y `petEvent(where: { slug })` desde el servidor.
- Móvil: no aplica (SEO, OG y sitemap).

---

## 2026-11-04 · feat: sección «Alertas de zona» en la portada
- Rama: develop (sin rama propia todavía)
- Qué cambió y por qué:
  - Las alertas de zona no se veían en la portada: solo había una invitación para quien tenía sesión sin alertas, y los buscadores y las IA no tenían texto sobre la función.
  - Nueva sección `#alertas` entre «Reportes recientes» y «Cómo funciona». Va ahí porque quien no encontró a su mascota en los reportes sigue con «te avisamos cuando aparezca una cerca».
  - Explica la función con una respuesta directa bajo el H2 (GEO) y tres reglas reales: radio de 1 a 50 km, al momento, máximo 5 al día.
  - Lista de alertas recientes renderizada en el servidor: las 5 más recientes de México, con enlace a su ficha y `<time dateTime>`. Revalida cada 10 min, así que la portada se regenera cada 10 min en vez de cada hora.
  - En el navegador la lista cambia a la zona de quien la ve: la de sus alertas si las tiene activas, o su ubicación (30 km) si ya la compartió. Muestra cuántos perdidos y encontrados hay ahí.
  - Botón «Activar alertas de mi zona»: sin sesión abre el modal de cuenta. Con alertas activas dice el radio y ofrece «Cambiar zona».
  - SEO/GEO: pregunta nueva en la FAQ y su JSON-LD. «¿Quién ve mi reporte?» menciona las alertas. `HOME_DEFINITION` y `knowsAbout` nombran las alertas de zona, `llms.txt` las describe y la FAQ dice «Actualizado en noviembre de 2026».
  - Se borró `ZoneAlertsInvite`: la sección cubre su caso.
- Archivos: src/app/page.tsx, src/components/home/{ZoneAlertsSection.tsx,ZoneAlertsFeed.tsx,ZoneAlertsCta.tsx,zoneAlerts.ts,hooks/useZoneAlerts.ts,server.ts,constants.ts,FaqSection.tsx,HomeJsonLd.tsx,index.ts,README.md}, src/components/notifications/{ZoneAlertsInvite.tsx (borrado),index.ts}, src/core/routes.ts (`navigation.zoneAlerts`), public/llms.txt
- GraphQL: query de servidor nueva `HomeZoneAlerts` (`animalLogs` perdidos/encontrados con la última bitácora de cada animal). En el navegador se reutiliza `getNearbyAnimals` (`status: lost` y `status: found`).
- Móvil: no aplica (sección de la portada web; la app ya tiene sus alertas de zona y no usa la portada).

---

## 2026-11-04 · feat: errores, pantalla y actividad de Kadesh Pet en Operaciones
- Rama: feat/control-actividad
- Qué cambió y por qué:
  - Cada petición al back lleva la app (`x-kadesh-app: pet-web`) y la pantalla (`x-kadesh-page`, con solo `tab`/`vista`/`clinic`/`pet` de la URL). El back las guarda en cada evento de Operaciones → Actividad, junto con la IP y el navegador, para saber dónde y desde qué dispositivo le pasó algo a alguien.
  - Interceptor de Apollo (`requestErrorLink`): reporta como `app.client_error` los errores de red que el back no ve (sin respuesta, 5xx, 413, 429, respuesta no JSON). Los errores de GraphQL ya los registra el back.
  - Pantallas caídas: `src/app/error.tsx` y `global-error.tsx` (antes no había) muestran "Reintentar" y reportan el error. `useClientErrorListener` reporta errores de código no atrapados, sin el ruido de extensiones y scripts de terceros.
  - Sin sesión solo se mandan errores (el back los acepta con tope por IP). Con sesión, la landing ahora registra qué pantallas abre la persona y su tiempo activo (`usePetActivity`, latido cada 5 min), y la salida (`trackLogout`).
  - Ante `RATE_LIMITED` (límites contra abuso) o `IP_BLOCKED`, se muestra el mensaje del back en un aviso.
  - Perfil: si un post con like, favorito o comentario vuelve a borrador, ya no rompe la pestaña de publicaciones (el back ahora oculta borradores y programados).
- Archivos: src/utils/activity/{track.ts,clientContext.ts,reportClientError.ts,requestErrorLink.ts,useClientErrorListener.ts,usePetActivity.ts,index.ts,README.md}, src/providers/apollo-client.ts, src/app/{ClientProviders.tsx,error.tsx,global-error.tsx}, src/components/shared/PetActivityTracker.tsx, src/components/auth/hooks/useLogout.ts, src/components/profile/hooks/{useUserFavoritePosts.ts,useUserLikedPosts.ts,useUserComments.ts}
- GraphQL: `trackEvents` acepta `app.client_error` (también sin sesión). Headers nuevos `x-kadesh-app` y `x-kadesh-page`. Cambios del back en kadesh-back@feat/control-actividad: accesos cerrados en 25 listas, límites contra abuso y bloqueo de IP.
- Móvil: [prompt](../mobile-sync/2026-11-04-errores-contexto-y-abuso.md)

---

## 2026-11-04 · feat: bandeja y Ajustes de avisos por separado
- Rama: feat/panel-cuenta
- Qué cambió y por qué:
  - En `/notificaciones` la configuración (tarjeta de WhatsApp) quedaba arriba de los avisos y se mezclaba con ellos. Además, a la derecha sobraba espacio.
  - La configuración pasa a su propia página, **Ajustes de avisos** (`/notificaciones/ajustes`, `Routes.notifications.settings`). A la izquierda va la tarjeta de WhatsApp; a la derecha, sticky, el estado de las alertas de zona y "¿No te llega el WhatsApp?". En las migas es el detalle de Notificaciones.
  - La bandeja usa el ancho: en escritorio, la lista y una columna "Cómo te avisamos" con el estado de la campana, WhatsApp (N de M avisos) y la zona, más el botón a los ajustes. En teléfono y tableta, una franja arriba de la lista con el mismo estado.
  - Los enlaces y el toast de Alertas de zona ahora dicen "Ajustes de avisos".
- Archivos: src/core/routes.ts, src/app/(cuenta)/notificaciones/{page.tsx,ajustes/page.tsx,ajustes/layout.tsx}, src/components/notifications/{NotificationChannelsSummary.tsx,NotificationsShell.tsx,AlertSettingsForm.tsx,index.ts,README.md}, docs/mobile-sync/2026-11-03-avisos-whatsapp.md (texto)
- GraphQL: ninguna (usa las consultas de WhatsApp y alertas que ya existían)
- Móvil: no aplica (organización de pantallas propia de la web). El prompt pendiente de WhatsApp ya dice que la tarjeta vive en Ajustes de avisos.

---

## 2026-11-04 · fix: publicar reporte se ve ocupado y no se publica dos veces
- Rama: feat/panel-cuenta
- Qué cambió y por qué:
  - Al publicar un reporte el botón se veía igual y, tras crearlo, volvía a "Publicar reporte" mientras abría la ficha (`router.push` no espera la navegación). Parecía que no pasaba nada y se podía publicar dos veces.
  - Ahora un candado evita el doble envío, y el botón dice en qué va con spinner: Revisando, Publicando, Subiendo fotos y Abriendo tu reporte.
  - Los campos quedan inertes, "Atrás" se deshabilita y aparece una barra de progreso.
  - Si sale bien, el botón sigue ocupado hasta que abre la ficha.
  - En el teléfono, la ayuda de WhatsApp ya no tapa el botón de las pantallas con pie fijo.
- Archivos: src/components/animals/nuevo/{NewAnimalForm.tsx,EditAnimalForm.tsx}, src/components/veterinaries/RegisterVeterinaryForm.tsx, src/components/ui/skeleton/LoadingBar.tsx (prop `label`), src/app/globals.css, src/components/animals/README.md
- GraphQL: ninguna
- Móvil: [prompt](../mobile-sync/2026-11-04-publicar-reporte-ocupado.md)

---

## 2026-11-03 · feat: avisos por WhatsApp (opt-in y por tipo) en notificaciones
- Rama: feat/panel-cuenta
- Qué cambió y por qué:
  - `/notificaciones` tiene la tarjeta **Avisos por WhatsApp**, con un interruptor que guarda `User.whatsappNotifications`.
    - Con él, los avisos importantes también llegan por WhatsApp al teléfono del perfil: animal cerca, recordatorio de la cartilla, posible coincidencia, comentarios y solicitudes de los reportes.
    - Sin un teléfono válido no se puede encender y manda a Datos del perfil. Se guarda al tocar, con toast.
  - En kadesh-back hay siete plantillas `kadesh_pet_*` nuevas, con sus variables en cada aviso (ver su `models/Notification/README.md`).
    - **Hay que darlas de alta y aprobarlas en Meta**; hasta entonces el envío falla en el log y la campana sigue igual.
  - El recordatorio sale por WhatsApp con el canal Notificación, sin duplicarse si también trae `whatsapp`.
  - La vista de Notificaciones queda alineada a la izquierda, como las demás del panel.
  - **Por tipo**: con el interruptor general encendido, cada aviso tiene su propio interruptor (las respuestas aceptada y rechazada van juntas; los admins ven además sus tres avisos).
    - Lo apagado se guarda en el campo nuevo `User.whatsappMutedTypes` y el envío lo respeta.
    - **Falta la migración en kadesh-back (`yarn migrate`).**
  - **Alertas de zona integradas**:
    - La pantalla de alertas tiene "Cómo te avisamos" (campana siempre y WhatsApp con interruptor), que se guarda con el mismo botón. Si WhatsApp estaba apagado del todo, encenderlo ahí activa solo las alertas de zona.
    - En la tarjeta de WhatsApp, la fila de zona dice el radio o, si falta, "Te falta configurar tu zona para que te lleguen" y lleva a configurarla.
    - Cada aviso lleva ícono y cada grupo, su contador. Con WhatsApp apagado, la lista se ve atenuada en vez de ocultarse.
    - El centro de la zona también se elige tocando el mapa, y el radio usa los chips del kit.
    - Nuevo `DashSwitch` en el kit.
- Archivos: src/components/notifications/{WhatsappNotificationsCard.tsx (nuevo),hooks/useWhatsappNotifications.ts (nuevo),hooks/index.ts,queries.ts,constants.ts,index.ts,NotificationsShell.tsx,AlertSettingsForm.tsx,AlertZoneMap.tsx,README.md (nuevo)}, src/components/app-shell/{ui.tsx,index.ts,README.md}, src/components/shared/free-map.ts (solo tipos), src/components/profile/shell/profileNav.ts, src/app/(cuenta)/notificaciones/page.tsx, src/components/pets/{constants.ts,README.md}; kadesh-back: models/User/{User.ts,whatsappPrefs.ts (nuevo)}, utils/notifications/{whatsapp.ts,nearbyAnimalAlerts.ts,animalReportAlerts.ts,possibleMatchAlerts.ts}, utils/pet/petReminders.ts, models/Notification/README.md, docs/cartilla/README.md, schema.graphql, schema.prisma
- GraphQL: nuevas `WhatsappNotifications` (query) y `UpdateWhatsappNotifications` (mutación sobre `updateUser` con `UserUpdateInput`), con `whatsappNotifications` (ya existía) y `whatsappMutedTypes` (nuevo)
- Móvil: [prompt](../mobile-sync/2026-11-03-avisos-whatsapp.md)

---

## 2026-11-03 · feat: chip «No verificada» en la ficha de veterinaria
- Rama: feat/panel-cuenta
- Qué cambió y por qué:
  - Si la clínica no está verificada, la ficha muestra el chip **No verificada** junto a Abierto/Cerrado. Al tocarlo, la ficha baja con scroll suave a **¿Es tu clínica?**. Con «reducir movimiento», el salto no se anima. Antes no había nada que avisara al dueño de que podía reclamarla.
  - El chip y el check del nombre usan la misma regla que la sección de reclamo: está verificada si `verified` **o** `claimStatus === "verified"`. Antes el check solo miraba `verified`.
  - La sección de reclamo tiene `id="reclamar"` (`CLAIM_SECTION_ID`) en todos sus estados y `scroll-mt` para no quedar debajo de la barra fija.
  - Solo va en la ficha: en el directorio sería ruido, porque la mayoría no están verificadas.
- Archivos: src/components/veterinaries/UnverifiedChip.tsx (nuevo), src/components/veterinaries/{ClaimPetPlaceSection.tsx,constants.ts,index.ts,README.md}, src/app/veterinarias/[slug]/page.tsx
- GraphQL: ninguna (usa `verified` y `claimStatus`, que la ficha ya pedía)
- Móvil: [prompt](../mobile-sync/2026-11-03-chip-no-verificada.md)

---

## 2026-11-03 · style: barrido del panel con sesión (perfil, mascotas, clínicas, notificaciones)
- Rama: feat/panel-cuenta
- Qué cambió y por qué:
  - **Colores:**
    - 307 parejas de hex claro + `dark:` pasan a tokens `dash-*` con un codemod. Solo cambia un token si su pareja está en la misma cadena; se verificó que solo cambiaran clases. Quedan los colores de estatus y el azul de marca.
    - Tarjetas de 24 px con sombra suave.
  - **Botones:** degradado solo en la acción principal, tinta en las acciones de fila y contorno neutro en los secundarios. Los chips elegidos van en tinta.
  - **Componentes del kit:**
    - Las subpestañas de Publicaciones pasan a `DashSegmented`.
    - Los modales de la cartilla (`PetSheet`), los de cancelar cita y `ConfirmModal` dentro del panel pasan a `DashModal`: foco, Escape, scroll bloqueado y animación también al cerrar.
  - **Clínica:** "Administrar" es una vista propia (`?tab=clinics&clinic=<id>&vista=`) con migas, el nombre como título y un segmentado. El calendario ya tiene todo el ancho.
  - **Movimiento:** perfil y mascotas usan la curva del panel, con escalón de 50 ms y tope de 8.
  - **Sitio público:** las piezas compartidas (`NotificationList`, `ConfirmModal`, `ChoiceChip`) solo cambian dentro del panel (`useInDash`). Los selectores del alta de animales toman los neutros del panel por variables CSS.
- Archivos: src/components/profile/{ProfileData,UserAnimalsSection,UserPostsSection,UserVeterinariesSection}.tsx, src/components/profile/motion.ts, src/components/profile/clinics/** (incl. formStyles.ts y README.md), src/components/pets/**, src/components/notifications/{NotificationList,AlertSettingsForm,AlertZoneMap}.tsx, src/components/veterinaries/UserAppointmentsSection.tsx, src/components/shared/ConfirmModal.tsx, src/components/animals/nuevo/ChoiceChip.tsx, src/components/app-shell/{ui.tsx,useLatched.ts,index.ts}, src/app/(cuenta)/perfil/page.tsx, src/app/globals.css, src/components/profile/README.md
- GraphQL: ninguna
- Móvil: no aplica (estilos y navegación propios de la web; la vista de clínica en la app tiene su propia navegación)

---

## 2026-11-03 · fix: tarjetas para compartir (OG) rotas en Cloudflare
- Rama: feat/panel-cuenta
- Qué cambió y por qué:
  - En el worker de Cloudflare, `readFile(new URL('./poppins-700.woff', import.meta.url))` devolvía un buffer vacío (sin error) y Satori fallaba con `RangeError: Offset is outside the bounds of the DataView`.
  - En `/animales/[slug]/og` se servía la foto tal cual en vez de la tarjeta, y cada petición dejaba un error "Animal share card failed with photo". En `/veterinarias/[slug]/og` siempre caía a `/og-image.png`.
  - Las fuentes (Poppins 700/800, subconjunto latin de `@fontsource/poppins`, ~10 KB cada una) ahora van en base64 en `src/core/og-fonts.ts`, que comparten ambas rutas. Ya no se lee nada del disco.
  - Probado con `opennextjs-cloudflare build` + `wrangler dev`: las dos rutas devuelven PNG 1200×630 sin errores.
- Archivos: src/core/og-fonts.ts (nuevo), src/app/animales/[slug]/og/route.tsx, src/app/veterinarias/[slug]/og/route.tsx; borrados src/app/{animales,veterinarias}/[slug]/og/poppins-{700,800}.woff
- GraphQL: ninguna
- Móvil: no aplica (imágenes OG para compartir en redes; la app no las genera)

---

## 2026-11-03 · feat: Inicio del perfil y kit del panel
- Rama: feat/panel-cuenta
- Qué cambió y por qué:
  - **Kit del panel** (`app-shell/ui.tsx`): KPIs oscuro/tintado con pastilla de cambio y sparkline, chips en tinta, segmentados con indicador que se desliza, botones, modal y cajón (portal, Escape, foco y scroll bloqueado), tarjetas, estados y clases de campos y tablas.
  - **Inicio** (`/perfil` sin `tab`):
    - Saludo con el resumen en una frase y cuatro atajos.
    - "Requiere atención": recordatorios vencidos o de los próximos 7 días, citas por confirmar en sus clínicas, su cita en menos de 48 h, reclamos de sus reportes en revisión, clínicas en revisión, teléfono faltante y alertas de zona apagadas.
    - KPIs: Mascotas, Próximas citas, Reportes activos (por el último estado) y Sin leer (con el cambio frente a los 7 días anteriores).
    - Con una clínica verificada, la fila "Mi veterinaria": hoy, por confirmar, pacientes y barras de citas por semana.
  - **Correcciones del shell:**
    - La tabla oculta de las gráficas ensanchaba la página en el teléfono.
    - "Reducir movimiento" no apagaba los fundidos de opacidad.
    - El foco no entraba al cajón móvil.
    - La barra no quedaba fija en el teléfono: el `overflow-x: hidden` del `body` rompía el `sticky`.
- Archivos: src/components/app-shell/ui.tsx, src/components/app-shell/{index.ts,charts.tsx,Reveal.tsx,AppSidebar.tsx,AppShell.tsx,UserMenu.tsx,README.md}, src/components/profile/home/{ProfileHome.tsx,homeModel.ts,useProfileHome.ts,queries.ts}, src/components/profile/shell/dates.ts, src/components/notifications/NotificationBell.tsx, src/app/(cuenta)/perfil/page.tsx, src/app/(cuenta)/notificaciones/page.tsx, src/app/globals.css, src/components/profile/README.md
- GraphQL: nuevas `ProfileHome` (alias de `petsCount`, `petReminders(Count)`, `petPlaceAppointments(Count)`, `animalClaimsCount`, `petPlaces`, `user`, `notificationsCount` ×8) y `ProfileClinicHome` (`petPlaceAppointmentsCount` ×10, `petPlaces { patientsCount }`)
- Móvil: [prompt](../mobile-sync/2026-11-03-inicio-perfil.md)

---

## 2026-11-03 · feat: panel con sesión (shell, tokens e Inter variable)
- Rama: feat/panel-cuenta
- Qué cambió y por qué:
  - `/perfil` y `/notificaciones` dejan la barra del sitio y viven en un panel propio con el mismo lenguaje que los paneles de kadesh-business, en azul de Kadesh Pet.
  - El panel tiene menú lateral agrupado (Mi cuenta, Mis animales, Mis publicaciones, Mis veterinarias, Kadesh) con globos de pendientes. Se colapsa a iconos en escritorio y en móvil es un cajón.
  - Barra flotante con migas, "Reportar animal", campana, tamaño de texto, tema y menú de cuenta. El menú conserva Mi perfil, Mis citas, el sitio y Cerrar sesión.
  - Tokens `--dash-*` en `globals.css` (neutros cálidos y acento derivado de `--color-kadesh`). Inter pasa a variable.
  - Las rutas pasan al grupo `app/(cuenta)` para compartir el shell; las URLs no cambian.
  - `/perfil` sin `tab` abre Inicio (por ahora un esqueleto) y Datos pasa a `?tab=profile`. Se quita `ProfileTabs`.
  - La guarda de sesión queda en el shell.
  - `ThemeToggle` sale de `Navigation`. Sin cambio visual; su `aria-label` pasa al español.
- Archivos: src/app/globals.css, src/app/layout.tsx, src/app/(cuenta)/layout.tsx, src/app/(cuenta)/perfil/page.tsx (movido), src/app/(cuenta)/notificaciones/** (movido), src/components/app-shell/**, src/components/profile/shell/**, src/components/profile/home/ProfileHome.tsx, src/components/profile/ProfileTabs.tsx (borrado), src/components/notifications/NotificationsShell.tsx, src/components/notifications/NotificationBell.tsx, src/components/layout/ThemeToggle.tsx, src/components/layout/Navigation.tsx, src/components/layout/FontSizeSlider.tsx, src/components/layout/KadeshHelpWhatsApp.tsx, src/core/routes.ts, DESIGN.md
- GraphQL: nueva `ProfileNavCounts` (alias de `petRemindersCount` y `petPlaceAppointmentsCount`) para los globos del menú
- Móvil: no aplica (layout, navegación y estilos propios de la web; los contadores se documentan en el prompt del Inicio del perfil)

---

## 2026-10-30 · chore: Preview URLs del Worker
- Rama: migracion-cloudflare
- Qué cambió y por qué: con `"preview_urls": true`, cada versión subida (`pnpm run upload`) tiene su propia URL de prueba antes de promoverla. `"workers_dev": false` queda explícito: el sitio solo se sirve en `pet.kadesh.com.mx` y wrangler ya no avisa del valor por defecto. `"keep_names": false` se mantiene.
- Archivos: wrangler.jsonc
- GraphQL: ninguna
- Móvil: no aplica (configuración de hosting de la web)

## 2026-10-29 · chore: migrar el hosting de Vercel a Cloudflare Workers (OpenNext)
- Rama: migracion-cloudflare
- Qué cambió y por qué: dejar de pagar el Fast Origin Transfer de Vercel. La app se empaqueta con `@opennextjs/cloudflare` y corre como el worker `kadesh-pet` en `pet.kadesh.com.mx`.
  - `next` 15.5.25 → 15.5.28 (el adaptador lo pide en la rama 15) y `wrangler` en dev.
  - Fuera `@vercel/analytics` y `@vercel/speed-insights`, con `<Analytics />` y `<SpeedInsights />`.
  - Caché ISR en R2 (`kadesh-pet-cache`) y cola de revalidación en un Durable Object, porque blog, home y OG usan `revalidate`.
  - Scripts `preview`, `deploy`, `upload` y `cf-typegen`.
  - `"keep_names": false` en `wrangler.jsonc`, para que esbuild no envuelva las funciones con `__name(...)` al empaquetar el worker.
  - Verificado con `pnpm run preview`: todas las rutas probadas responden bien y `/comunidad` da 308 a `/conocenos`. Worker de 3.7 MB en gzip (límite: 10 MB).
  - Primero se probó en `workers.dev` sin el bloque `routes`. Luego se desplegó con el dominio.
  - Desde el 2026-10-29, `pet.kadesh.com.mx` lo sirve el Worker. El deploy cambió los registros A hacia Vercel (`64.29.17.65` y `216.198.79.1`) por la conexión al Worker, y `workers.dev` quedó apagado. Para regresar a Vercel: quitar el dominio del Worker y volver a crear esos registros A, solo DNS.
  - Las variables se bajaron de Vercel a `.env.production.local`, solo las `NEXT_PUBLIC_*`. Con `.env.production`, `.env.local` le gana y el build usa `localhost`.
- Archivos: package.json, pnpm-lock.yaml, src/app/ClientProviders.tsx, open-next.config.ts (nuevo), wrangler.jsonc (nuevo), .gitignore, CLAUDE.md
- GraphQL: ninguna
- Móvil: no aplica (hosting/infra de la web y analítica de Vercel)

## 2026-10-28 · feat: reportes parecidos, comentar en vez de duplicar y pedir el reporte
- Rama: feat/reportes-duplicados (aquí y en kadesh-back)
- Qué cambió y por qué: tres personas publicaron al mismo perro (Chaneque, Morelia) y la revisión anterior (mismo enlace o mismo teléfono + nombre) no lo detectó.
  - **Detección mientras se llena:** en el paso «Dónde», en cuanto hay ubicación, se consultan reportes parecidos. Un puntaje del backend compara nombre, cercanía (5 km), sexo, color, raza, señas y fecha, sin comparar ciudad. Aparece un aviso que no frena y, al publicar, la revisión se abre sola si hay uno «muy probable».
  - **En la revisión:** se puede dejar un comentario en el reporte existente (`duplicate_report`) o pedir que el reporte pase a tu nombre si es tu mascota (`AnimalClaim`, con mensaje, teléfono y foto opcional). Con un comentario o una solicitud ya no hace falta publicar otro reporte.
  - **Cruce perdido ↔ encontrado:** las coincidencias del otro lado salen en una sección aparte con «Es el mío: avisar» (`possible_match`) y no impiden publicar. El backend también avisa solo cuando se publica uno nuevo muy parecido.
  - **Ficha:** «Es mi mascota» para reportes de la comunidad o de encontrados. Panel de solicitudes para quien atiende el reporte (aprobar o rechazar). Insignias «También lo reportó» y «Posible coincidencia» en comentarios. Ancla `#comentarios`.
  - **Reporte unido a otro** (`duplicateOf`, lo pone un admin): la ficha redirige con 308 a la principal.
  - **Notificaciones:** siete tipos nuevos con su ícono y tono.
  - **Corrección:** «Quien reportó» ya no sale en todos los comentarios cuando la ficha no trae al dueño.
  - Nuevo `Sheet` compartido (hoja modal montada en `body`).
- Archivos: src/components/animals/queries.ts, src/components/animals/server.ts, src/components/animals/similarReportsCopy.ts (nuevo), src/components/animals/nuevo/NewAnimalForm.tsx, src/components/animals/nuevo/hooks/useSimilarReports.ts (nuevo), src/components/animals/nuevo/SimilarReportsNotice.tsx (nuevo), src/components/animals/nuevo/SimilarReportsSheet.tsx (nuevo), src/components/animals/claim/* (nuevo), src/components/animals/detail/ClaimReportButton.tsx (nuevo), src/components/animals/detail/AnimalClaimsPanel.tsx (nuevo), src/components/animals/detail/AnimalCommentsSection.tsx, src/components/animals/detail/hooks/useAnimalDetail.ts, src/components/animals/detail/index.ts, src/app/animales/[slug]/page.tsx, src/app/animales/[slug]/layout.tsx, src/components/shared/Sheet.tsx (nuevo), src/components/shared/index.ts, src/components/notifications/constants.ts, src/components/notifications/inbox.ts, src/components/notifications/NotificationList.tsx, src/components/animals/README.md
- GraphQL:
  - `FindAnimalReportDuplicates` extendida (ubicación, estatus y señas; regresa puntaje, nivel, tipo, razones, distancia, portada e `isMine`).
  - `kind` en `CreateAnimalComment` y `GetAnimalComments`.
  - `duplicateOf` en la ficha y en la consulta del servidor.
  - Nuevas: `GetAnimalClaims`, `CreateAnimalClaim`, `ResolveAnimalClaim` y `CancelAnimalClaim`.
  - Requiere desplegar primero kadesh-back con su migración.
- Móvil: [prompt](../mobile-sync/2026-10-28-reportes-duplicados-y-reclamos.md)

## 2026-10-28 · feat: animación de entrada en el formulario de reporte
- Rama: feat/report-auth-modal
- Qué cambió y por qué: `/animales/nuevo` aparecía de golpe al cargar.
  - Ahora entra en cascada: título, círculos de los pasos, bloques del paso, chips (con un leve escalado) y botones.
  - Al cambiar de paso, además del deslizamiento del panel, sus bloques entran en cascada.
  - Sin animación si el sistema pide menos movimiento.
- Archivos: src/components/animals/nuevo/NewAnimalForm.tsx, src/components/animals/README.md
- GraphQL: ninguna
- Móvil: no aplica (pulido visual de la web; la app maneja su propia animación de pantallas)

## 2026-10-28 · feat: reactivar «Continuar con Google»
- Rama: feat/report-auth-modal
- Qué cambió y por qué: el botón de Google estaba oculto desde el 2026-09-24. Volvió a `/auth/login` (las dos pestañas) y al modal de cuenta al reportar, donde va primero porque crea la cuenta o entra en un toque.
  - Nuevo `GoogleAuthSection` (separador + botón + carga + error).
  - `useGoogleLogin` inicializa Google una sola vez con un despachador. Con varios modales en el home, el clic podía responder con el `redirectTo` de otro.
  - El ancho del botón se ajusta al contenedor (200–400 px). Antes se cortaba en la tarjeta del login en teléfonos.
  - Requiere que el cliente OAuth tenga como orígenes autorizados `https://pet.kadesh.com.mx` y `http://localhost:3000`. En local hoy Google responde "origin is not allowed".
- Archivos: src/components/auth/GoogleAuthSection.tsx (nuevo), src/components/auth/hooks/useGoogleLogin.ts, src/app/auth/login/page.tsx, src/components/auth/AuthGateModal.tsx, src/components/auth/README.md
- GraphQL: ninguna (usa `AuthenticateUserWithGoogle`, ya existente)
- Móvil: se agregó al prompt [cuenta al reportar](../mobile-sync/2026-10-28-cuenta-al-reportar.md) (Google primero en la hoja, si la app lo tiene)

## 2026-10-28 · feat: crear cuenta en un modal al reportar
- Rama: feat/report-auth-modal
- Qué cambió y por qué: sin sesión, los botones de reportar (perdida, encontrada, en adopción, rescate) mandaban a `/auth/login` y la persona perdía el contexto. Ahora se abre un modal (`AuthGateModal`) sin salir de la página.
  - Explica por qué pedimos cuenta y 3 beneficios según el tipo de reporte.
  - Deja **crear cuenta** o **entrar** ahí mismo y luego lleva al formulario con el mismo `?status=`.
  - Lo usan el hero, Cómo funciona, Reportes recientes, Primeras horas y el cierre del home, y el botón Reportar de `/animales`, que antes mostraba un aviso y mandaba al login.
  - Si alguien entra directo a `/animales/nuevo` sin sesión, ve el mismo modal sobre el formulario.
  - El modal se monta en `<body>` con un portal, porque dentro de las secciones animadas del home el `fixed` quedaba encerrado.
- Archivos: src/components/auth/AuthGateModal.tsx (nuevo), src/components/animals/ReportLink.tsx (nuevo), src/components/animals/reportAuthCopy.ts (nuevo), src/components/animals/index.ts, src/components/home/{HeroSection,HowItWorksSection,RecentReportsSection,FirstHoursSection,ClosingSection}.tsx, src/app/animales/page.tsx, src/app/animales/nuevo/page.tsx, src/components/auth/README.md, src/components/animals/README.md
- GraphQL: ninguna (usa `CreateUser` y `AuthenticateUserWithPassword`, ya existentes)
- Móvil: [prompt](../mobile-sync/2026-10-28-cuenta-al-reportar.md)

## 2026-10-23 · feat: pestaña Mascotas con la cartilla digital
- Rama: feat/pet-health-card
- Qué cambió y por qué: el perfil tiene una pestaña nueva, **Mascotas** (`/perfil?tab=pets`), para la cartilla digital que agregó el backend.
  - Lista de mascotas con su próximo recordatorio. **Registrar mascota** abre una hoja con fotos (hasta 3), especie, raza, sexo, fecha de nacimiento o edad aproximada, color, peso, esterilización, microchip y señas.
  - Cartilla de cada mascota (`&pet=<id>`): datos; registros de salud con veterinaria, próxima fecha y fotos; recordatorios (los de la cartilla se crean solos); y familia (el principal agrega por correo, un familiar se puede salir).
  - Si el correo del familiar no tiene cuenta, **Registrar a esta persona** abre un formulario donde el principal le crea la cuenta y elige su contraseña. A la persona le llega un correo avisándole que su familiar la tiene (sin la contraseña).
  - Quedan pendientes, anotados en `src/components/auth/README.md`: **olvidé mi contraseña** en el login y **cambiar contraseña** en el perfil.
  - **Marcar como perdida** publica el reporte con los datos y fotos de la cartilla (mapa, fecha y teléfono). **Ya regresó a casa** lo cierra como «En familia».
  - Depende de `kadesh-back@feat/pet-health-card` desplegado y migrado; antes de eso la pestaña muestra "No pudimos cargar tus mascotas".
- Archivos: src/components/pets/* (nuevo), src/components/profile/ProfileTabs.tsx, src/app/perfil/page.tsx, src/components/profile/README.md, src/components/auth/README.md
- GraphQL: nuevas `MyPets`, `PetDetail`, `SearchVeterinaries`, `CreatePet`, `UpdatePet`, `DeletePet`, `CreatePetPhotos`, `DeletePetPhotos`, `CreatePetHealthRecord`, `UpdatePetHealthRecord`, `DeletePetHealthRecord`, `CreatePetHealthRecordAttachments`, `DeletePetHealthRecordAttachments`, `CreatePetReminder`, `UpdatePetReminder`, `DeletePetReminder`, `MarkPetAsLost`, `MarkPetAsFound`, `AddPetFamilyMember`, `RegisterPetFamilyMember` y `DeletePetOwner` (en `src/components/pets/queries.ts`)
- Móvil: [prompt](../mobile-sync/2026-10-23-cartilla-mascotas.md)

## 2026-10-16 · feat: campana de notificaciones y alertas de zona
- Rama: develop
- Qué cambió y por qué: viene del prompt `kadesh-pet-mobile/docs/web-sync/2026-10-16-campana-y-alertas.md`.
  - Con sesión, el header muestra una campana con el contador de no leídas de Pet (se refresca cada minuto). En desktop abre un panel; en móvil lleva a `/notificaciones`.
  - La bandeja muestra 20 por página, agrupadas en Hoy / Ayer / Esta semana / Antes. Se puede marcar una o todas como leídas. Cada notificación tiene ícono verde si es de un animal encontrado y rojo si es otra alerta de zona.
  - `/notificaciones/alertas` permite configurar el interruptor, el centro (mapa con pin fijo y círculo) y el radio (1–50 km). No deja activarlas sin centro.
  - En la portada aparece la invitación «Alertas de tu zona» para quien tiene sesión y aún no las activó.
  - Depende de que `kadesh-back@feat/pet-push-alerts` esté desplegado: antes de eso la página de alertas falla y la invitación no aparece.
- Archivos: src/components/notifications/* (nuevo), src/app/notificaciones/{layout,page}.tsx, src/app/notificaciones/alertas/page.tsx, src/components/layout/Navigation.tsx, src/app/page.tsx, src/core/routes.ts, src/components/shared/free-map.ts
- GraphQL: nuevas `NotificationInbox`, `NotificationUnreadCount`, `MarkNotificationRead`, `MarkAllNotificationsRead`, `PetAlertSettings` y `UpdatePetAlertSettings` (en `src/components/notifications/queries.ts`)
- Móvil: no aplica (viene de móvil)

## 2026-10-16 · feat: esqueletos de carga con la forma del contenido
- Rama: develop
- Qué cambió y por qué: viene del prompt `kadesh-pet-mobile/docs/web-sync/2026-10-16-skeletons-con-forma.md`.
  - Nuevo kit `src/components/ui/skeleton` (`Bone`, `SkeletonRegion`, `LoadingBar`) con barrido de 1.4s, latido con reduce-motion y aviso de lentitud a los 10s.
  - Cada tarjeta exporta su esqueleto con sus mismas medidas: `AnimalCardSkeleton`, `VeterinaryCardSkeleton`, `HomeVeterinaryCardSkeleton`, `BlogCardSkeleton` y el de reportes de la portada.
  - Aplicado en Inicio (reportes y veterinarias), en los directorios de mascotas y veterinarias, y en el blog (categorías y artículos).
  - Al cambiar filtro, radio, categoría o página, lo anterior se queda atenuado al 50% con la barra de espera (`previousData` en los hooks).
  - Las cifras del Inicio no cambian: se renderizan en el servidor y no tienen estado de carga.
- Archivos: src/components/ui/skeleton/*, src/app/globals.css, src/app/animales/page.tsx, src/app/veterinarias/page.tsx, src/components/animals/{AnimalCard.tsx,index.ts,hooks/useLostAnimals.ts}, src/components/veterinaries/{VeterinaryCard.tsx,index.ts,hooks/useNearbyPetPlaces.ts}, src/components/home/{RecentReportsSection.tsx,VeterinariansSection.tsx,HomeVeterinaryCard.tsx,hooks/useRecentReports.ts}, src/components/blog/{BlogCardSkeleton.tsx,BlogSection.tsx,CategorySection.tsx,hooks/useBlogPosts.ts}
- GraphQL: ninguna
- Móvil: no aplica (viene de móvil)

## 2026-10-16 · fix: relacionados del blog con solo etiquetas o solo categoría
- Rama: develop
- Qué cambió y por qué: viene del prompt `kadesh-pet-mobile/docs/web-sync/2026-10-16-related-posts-filter.md`. `useRelatedPosts` solo filtraba si el post tenía etiquetas **y** categoría; ahora arma el `OR` con lo que exista.
- Archivos: src/components/blog/hooks/useRelatedPosts.ts
- GraphQL: ninguna (solo cambia el `where`)
- Móvil: no aplica (viene de móvil)

## 2026-10-16 · fix: borrar reseña de veterinaria usaba una mutación inexistente
- Rama: develop
- Qué cambió y por qué: viene del prompt `kadesh-pet-mobile/docs/web-sync/2026-10-15-delete-review-mutation.md`. `DELETE_PET_PLACE_REVIEW_MUTATION` llamaba `deletePetPlaceReview`, que no existe en el schema; ahora usa `deleteReview(where: ReviewWhereUniqueInput!)`.
- Archivos: src/components/veterinaries/queries.ts
- GraphQL: `DeletePetPlaceReview` usa `deleteReview`
- Móvil: no aplica (viene de móvil)

## 2026-10-16 · fix: cerrar sesión también en el backend (`endSession`)
- Rama: develop
- Qué cambió y por qué: viene del prompt `kadesh-pet-mobile/docs/web-sync/2026-10-15-logout-end-session.md`. Nuevo hook `useLogout`, que hace lo siguiente en orden: `endSession` → borrar token y cookies → `clearStore()` → `setUser(undefined)` → ir a home. Si `endSession` falla, el cierre local sigue igual. `Navigation` lo usa en desktop y en móvil.
- Archivos: src/components/auth/hooks/useLogout.ts (nuevo), src/components/auth/hooks/index.ts, src/utils/queries.ts, src/components/layout/Navigation.tsx
- GraphQL: nueva `EndSession`
- Móvil: no aplica (viene de móvil)

## 2026-10-16 · fix: agregar registro a un animal fallaba por el teléfono
- Rama: develop
- Qué cambió y por qué: el modal "Registro de …" mandaba `contactNumber` en `createAnimalLog`, pero `AnimalLogCreateInput` no tiene ese campo (el teléfono vive en `Animal`), así que guardar fallaba con "Field contactNumber is not defined". Se quita el campo Teléfono del modal y de la mutación.
- Archivos: src/components/animals/detail/AddLogModal.tsx, src/components/animals/detail/hooks/useCreateLog.ts, src/components/animals/queries.ts
- GraphQL: `CreateAnimalLogVariables` ya no incluye `contactNumber` (la operación no cambia)
- Móvil: no aplica (la app guarda el teléfono en `Animal` y su codegen tipado no permite mandarlo en `AnimalLog`)

## 2026-10-15 · docs: dirección inversa de la sincronización (móvil → web)
- Rama: develop
- Qué cambió y por qué: ya existe `kadesh-pet-mobile` (Expo + Clean Architecture). Se añade a `CLAUDE.md` cómo revisar e implementar los prompts de `../kadesh-pet-mobile/docs/web-sync/`, y se actualiza la plantilla de `mobile-sync` para que no prescriba la estructura antigua de la app (`kadesh/components/<feature>/queries.ts`).
- Archivos: CLAUDE.md, docs/mobile-sync/_TEMPLATE.md, docs/changes/CHANGELOG.md
- GraphQL: ninguna
- Móvil: no aplica (documentación del proceso)

## 2026-10-15 · docs: regla de registro de cambios y sincronización con móvil
- Rama: develop
- Qué cambió y por qué: se añade la regla de registrar cada cambio y generar prompts para la futura app `kadesh-pet-mobile` (Expo), para que la app no se quede atrás de la web.
- Archivos: CLAUDE.md, docs/changes/CHANGELOG.md, docs/mobile-sync/README.md, docs/mobile-sync/_TEMPLATE.md
- GraphQL: ninguna
- Móvil: no aplica (es documentación del proceso, no una funcionalidad)
