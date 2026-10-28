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
