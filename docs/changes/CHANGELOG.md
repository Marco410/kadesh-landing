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
