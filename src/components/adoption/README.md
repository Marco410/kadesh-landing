# Solicitudes de adopción (`kadesh/components/adoption`)

Quien quiere adoptar a un animal «En adopción» envía una solicitud corta desde su ficha pública. Quien lo cuida (su autor o el equipo de su espacio de rescate) la revisa, contacta a la persona y, al final, completa la adopción: la cartilla pasa a la cuenta de quien adoptó.

Backend: list `AdoptionApplication` de kadesh-back. Solo lectura por CRUD; se escribe con cuatro mutaciones que no lanzan error por reglas de negocio: regresan `{ success, message }` y la web muestra `message` tal cual.

## Estados

| Valor | Etiqueta | |
|---|---|---|
| `submitted` | Enviada | abierta |
| `in_review` | En revisión | abierta |
| `approved` | Aprobada | abierta |
| `rejected` | No aprobada | final |
| `withdrawn` | Retirada | final |
| `completed` | Adoptó | final |
| `closed` | Cerrada (el animal encontró otra familia) | final |

«No aprobada» va en tono neutro, no rojo: no es un error de nadie.

## Flujos

1. **Quiero adoptarlo** (`AdoptionApplyBanner`, en `/animales/<slug>` bajo «Se quedó conmigo»). Solo si el último estado del reporte es `in_adoption`, no es un duplicado y quien mira **no** puede editarlo.
   - Sin sesión: `AuthGateModal` con regreso a `?adoptar=1`, que abre el formulario solo.
   - Con una solicitud abierta: «Tu solicitud: <estado>», texto según el estado y «Retirar solicitud» (con confirmación).
   - Si la última quedó no aprobada, retirada o cerrada: la muestra (con el mensaje que le dejaron) y deja enviar otra.
2. **Formulario** (`AdoptionApplicationModal`, hoja `Sheet` del sitio): mensaje (20–1000), vivienda, propia/rentada/de su familia (si renta: ¿permiten mascotas?), patio, niños, horas solo (0–24), otros animales y experiencia (opcionales, ≤500), teléfono (10 dígitos, prellenado del perfil) y los dos compromisos obligatorios. Lo escrito se conserva si se cierra sin querer; se limpia al enviarse.
3. **Panel de la ficha** (`AdoptionApplicationsPanel`, bajo las solicitudes de reclamo): solo para quien puede editar el animal y si hay alguna. Se abre solo si hay abiertas o si el enlace trae `?solicitud=<id>` (la notificación), que se resalta. En escritorio la lista tiene alto máximo y scroll propio para no aplastar la ficha.
4. **Espacio de rescate** (`RescueApplicationsView`, `/perfil?tab=rescate&org=<id>&vista=solicitudes`): todas las del espacio, filtros Abiertas/Todas con conteo, 30 por página.

Las tarjetas y acciones (`AdoptionApplicationList` → `AdoptionApplicationCard`) son las mismas en los dos paneles; toman los colores del panel (`useInDash`) o del sitio.

## Acciones

| Estado | Acciones |
|---|---|
| Enviada | Poner en revisión · Aprobar · No aprobar |
| En revisión | Aprobar · No aprobar |
| Aprobada | Completar adopción · No aprobar |
| Finales | ninguna (se ve el mensaje que recibió, si hay) |

- **Poner en revisión** va directo. **Aprobar** y **No aprobar** piden un mensaje opcional (≤500) que le llega a la persona (`AdoptionDecisionModal`).
- **Completar adopción** confirma antes: la cartilla del animal (o una nueva con los datos del reporte) pasa a la cuenta de quien adopta, el reporte queda «Adoptado» y las demás solicitudes se cierran. Después se recarga el animal (ficha) o las cifras, publicados y fichas del espacio.

## Permisos (los aplica el backend; aquí solo se decide qué mostrar)

- Enviar: con sesión, animal `in_adoption`, sin poder editarlo, una abierta por persona y animal, máximo 10 al día.
- Revisar: quien puede editar el animal. En el espacio: admin, coordinación y voluntariado (`canPublishForRescue`); hogar temporal solo ve.
- Completar: solo desde `approved`. Animal de un espacio: admin y coordinación (`canManageRescueAnimals`); si no, el autor. En la ficha pública el front no conoce el rol: muestra el botón a quien edita y, si el backend se niega, su `message`.

## Archivos

- `constants.ts`: estados, etiquetas y tonos, opciones de vivienda, límites, parámetros de URL (`adoptar`, `solicitud`).
- `types.ts`, `queries.ts`: tipos y operaciones `MyAdoptionApplication`, `AnimalAdoptionApplications`, `RescueAdoptionApplications`, `SubmitAdoptionApplication`, `ReviewAdoptionApplication`, `WithdrawAdoptionApplication`, `CompleteAdoptionApplication`.
- `format.ts`: respuestas en español para quien revisa, teléfono, WhatsApp (`wa.me/52…` con saludo) y mensajes de error.
- `hooks/useAdoptionActions.ts`, `hooks/useMyAdoptionApplication.ts`.
- Componentes: `AdoptionApplyBanner`, `AdoptionApplicationModal`, `AdoptionApplicationsPanel`, `AdoptionApplicationList`, `AdoptionApplicationCard`, `AdoptionDecisionModal`.

## Avisos

`adoption.application_received` (a quien cuida, enlace a la ficha con `?solicitud=<id>`) y `adoption.application_updated` (a quien la envió). Los manda el backend; los íconos viven en `components/notifications`.
