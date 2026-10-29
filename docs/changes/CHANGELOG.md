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

## 2026-10-29 · chore: migrar el hosting de Vercel a Cloudflare Workers (OpenNext)
- Rama: migracion-cloudflare
- Qué cambió y por qué: dejar de pagar el Fast Origin Transfer de Vercel. La app se empaqueta con `@opennextjs/cloudflare` y corre como el worker `kadesh-pet` en `pet.kadesh.com.mx`.
  - `next` 15.5.25 → 15.5.28 (el adaptador lo pide en la rama 15) y `wrangler` en dev.
  - Fuera `@vercel/analytics` y `@vercel/speed-insights`, con `<Analytics />` y `<SpeedInsights />`.
  - Caché ISR en R2 (`kadesh-pet-cache`) y cola de revalidación en un Durable Object, porque blog, home y OG usan `revalidate`.
  - Scripts `preview`, `deploy`, `upload` y `cf-typegen`.
  - Verificado con `pnpm run preview`: todas las rutas probadas responden bien y `/comunidad` da 308 a `/conocenos`. Worker de 3.7 MB en gzip (límite: 10 MB).
  - Aún no se despliega ni se crean recursos en Cloudflare.
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
