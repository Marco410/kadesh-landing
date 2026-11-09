---
estado: pendiente
fecha: 2026-11-06
origen: kadesh-landing@feat/espacios-de-rescate
feature: profile
---

# Prompt para kadesh-pet-mobile: «Adopciones» en el perfil (ver, seguir y editar mis solicitudes)

## Contexto
Quien envía una solicitud de adopción («Quiero adoptarlo») antes solo veía su estado en la ficha del animal. Ahora, en el perfil, la sección **Adopciones** lista todas sus solicitudes. Cada una tiene un detalle con:
- cómo va el proceso;
- el mensaje de quien cuida al animal;
- lo que respondió;
- acciones: editarla mientras siga «Enviada», retirarla y, si ya adoptó, ir a la cartilla.

En la ficha del animal, el aviso «Tu solicitud» ahora tiene **Ver solicitud**, que abre ese detalle.

Depende del prompt `2026-11-05-solicitudes-de-adopcion.md` (enviar, retirar y estados).

## Qué implementar en la app
1. **Entrada en el perfil**: «Adopciones» en el grupo «Mis animales» (después de Reportes), con ícono de corazón (`FavouriteIcon`).
2. **Lista**:
   - Las solicitudes que envió la persona, de la más nueva a la más vieja.
   - Cada fila lleva la foto del animal (la primera de `multimedia`) o el corazón si no tiene, su nombre («Sin nombre» si viene vacío o «Sin nombre»), el chip de estado y la línea «Enviada el 6 nov 2026 · Lo cuida <espacio>» («La cuida» si `sex` es `female`; sin espacio, solo la fecha).
   - Si ya terminó y tiene `decidedAt`, la línea dice «Actualizada el <decidedAt>».
   - Filtros **Abiertas** / **Todas** con conteo. Sin elegir, Abiertas si hay alguna; si no, Todas.
   - Vacía: «Aún no envías solicitudes de adopción» con el botón «Ver animales».
3. **Detalle** (al tocar una fila, desde «Ver solicitud» del aviso de la ficha o desde la notificación):
   - **Encabezado**: foto, nombre, chip de estado, «Enviada el … · editada el … · Lo cuida …» y el texto de qué sigue (ver «Reglas»).
   - **Acciones**:
     - **Editar solicitud**: solo si `status === 'submitted'`.
     - **Ver ficha de <nombre>**, o «Ver su ficha» si no tiene nombre.
     - **Retirar solicitud**: si está abierta (`submitted`, `in_review` o `approved`), con confirmación «¿Retirar tu solicitud?».
     - **Ver su cartilla**: si `completed` y viene `pet.id`.
   - **Mensaje de quien lo cuida**: si `decisionNote` tiene texto y el estado no es `withdrawn`; con la fecha `decidedAt`.
   - **Cómo va**: pasos verticales con estado `done`, `current`, `upcoming` o `stopped` (ver «Reglas»).
   - **Lo que enviaste**:
     - El mensaje («Por qué quieres adoptarlo»), vivienda, renta (si aplica), patio, niños, horas solo, otros animales, experiencia, teléfono y los dos compromisos.
     - Nota bajo el título: si es editable, «La puedes editar mientras quien lo cuida no la ponga en revisión»; si está abierta pero ya no es editable, «Ya la están revisando, así que ya no se puede editar. Si algo cambió, cuéntaselo cuando te contacten».
   - Si la solicitud no es de la persona (`applicant.id` distinto) o no existe: «No encontramos esta solicitud».
4. **Editar**:
   - Es el mismo formulario de «Quiero adoptarlo», prellenado con lo que envió (los compromisos ya marcados).
   - Título «Editar tu solicitud», botón «Guardar cambios» y texto «Corrige lo que necesites. Quien cuida a <nombre> verá la versión nueva y le avisamos que la actualizaste.».
   - Llama a `editAdoptionApplication`. Si `success` es false, muestra `message` arriba del formulario.
   - Al guardar: toast «Guardamos los cambios» y recarga el detalle, la lista y el aviso de la ficha.
5. **Aviso de la ficha del animal**: si hay solicitud, agrega «Ver solicitud» (abre el detalle) junto a «Retirar solicitud» o «Enviar otra solicitud».
6. **Notificaciones**: `adoption.application_updated` ahora trae `url` `https://pet.kadesh.com.mx/perfil?tab=adopciones&solicitud=<id>`. En la app, abre el detalle de esa solicitud (`entityId` es el id de la solicitud).

## GraphQL

```graphql
query MyAdoptionApplications(
  $where: AdoptionApplicationWhereInput!
  $openWhere: AdoptionApplicationWhereInput!
  $allWhere: AdoptionApplicationWhereInput!
  $take: Int!
) {
  adoptionApplications(where: $where, orderBy: [{ createdAt: desc }], take: $take) {
    id
    status
    decidedAt
    createdAt
    updatedAt
    animal {
      id
      name
      slug
      sex
      multimedia(orderBy: [{ order: asc }], take: 1) { image { url } }
      organization { id name slug }
    }
  }
  openCount: adoptionApplicationsCount(where: $openWhere)
  allCount: adoptionApplicationsCount(where: $allWhere)
}
# where / allWhere: { applicant: { id: { equals: $userId } } }
# openWhere: { applicant: { id: { equals: $userId } }, status: { in: ["submitted", "in_review", "approved"] } }
# take: 100 (se filtra Abiertas/Todas en la app)

query MyAdoptionApplicationDetail($id: ID!) {
  adoptionApplication(where: { id: $id }) {
    id
    status
    phone
    message
    answers
    decisionNote
    decidedAt
    createdAt
    updatedAt
    applicant { id }
    pet { id }
    animal {
      id
      name
      slug
      sex
      multimedia(orderBy: [{ order: asc }], take: 1) { image { url } }
      organization { id name slug }
    }
  }
}

# Ojo: NO es `updateAdoptionApplication` (ese es el CRUD de Keystone, solo admin).
mutation EditAdoptionApplication($applicationId: ID!, $input: AdoptionApplicationInput!) {
  editAdoptionApplication(applicationId: $applicationId, input: $input) {
    success
    message
    application { id status decisionNote decidedAt updatedAt }
  }
}
```

```ts
// AdoptionApplicationInput: el mismo de submitAdoptionApplication.
interface AdoptionApplicationInput {
  phone: string; // 10 dígitos
  message: string; // 20 a 1000
  housing: 'house' | 'apartment' | 'other';
  housingOwnership: 'own' | 'rent' | 'family';
  petsAllowed: boolean | null; // solo si rent
  hasYard: boolean;
  hasChildren: boolean;
  otherPets: string | null; // ≤ 500
  hoursAlone: number; // 0 a 24
  experience: string | null; // ≤ 500
  commitSterilization: boolean; // debe ser true
  acceptsFollowUp: boolean; // debe ser true
}

interface MyAdoptionApplicationRow {
  id: string;
  status: 'submitted' | 'in_review' | 'approved' | 'rejected' | 'withdrawn' | 'completed' | 'closed';
  decidedAt?: string | null;
  createdAt: string;
  updatedAt?: string | null;
  animal?: {
    id: string;
    name: string;
    slug?: string | null;
    sex?: string | null;
    multimedia?: Array<{ image?: { url?: string | null } | null }> | null;
    // Solo si el espacio está verificado; si no, null.
    organization?: { id: string; name: string; slug?: string | null } | null;
  } | null;
}

interface MyAdoptionApplicationDetail extends MyAdoptionApplicationRow {
  phone?: string | null;
  message?: string | null;
  answers?: AdoptionAnswers | string | null; // JSON
  decisionNote?: string | null;
  applicant?: { id: string } | null;
  pet?: { id: string } | null;
}
```

## Reglas y constantes
- **Editar**:
  - Solo quien la envió y solo con `status === 'submitted'`.
  - En cuanto quien cuida al animal la pone «En revisión» (o decide), el backend responde con `success: false` y este `message`: «Quien cuida a X ya la está revisando, así que ya no se puede editar…».
  - Tope: 20 ediciones al día.
  - Al editar, el backend avisa a quien cuida al animal («<Nombre> actualizó su solicitud para adoptar a X»).
- **Editada**: se muestra «editada el <updatedAt>» solo si sigue `submitted` y `updatedAt − createdAt > 60 s`.
- **Pasos de «Cómo va»**:
  - Normales: «Enviaste tu solicitud» (fecha `createdAt`) → «En revisión» → «Aprobada» → «Llega a casa».
  - Los pasos hasta el estado actual van `done`, el siguiente `current` y los demás `upcoming`. Solo el paso del estado actual lleva fecha (`decidedAt`).
  - Textos de cada paso:
    - Enviada: «Mientras nadie la revise, la puedes editar.», solo mientras siga `submitted`.
    - En revisión: «Quien cuida a X lee tu solicitud y puede llamarte o escribirte para conocerte.»
    - Aprobada: «Te contactan para coordinar la entrega.»
    - Llega a casa: «Al entregártelo, su cartilla pasa a tu cuenta.»
  - `rejected`, `withdrawn` y `closed`: solo dos pasos, «Enviaste tu solicitud» y uno final `stopped` con fecha `decidedAt`:
    - «No la aprobaron»: «Gracias por querer darle un hogar a X. Hay más animales esperando familia.»
    - «La retiraste»: «Si cambias de opinión, puedes enviar otra mientras siga en adopción.»
    - «Se cerró»: «X encontró familia por otra vía.»
- **Texto de qué sigue** (también en el aviso de la ficha; X es el nombre o «este animal»):
  - `submitted`: «Enviaste tu solicitud. Te avisaremos cuando quien cuida a X la revise.»
  - `in_review`: «Quien cuida a X está revisando tu solicitud. Puede que te llame o te escriba para conocerte.»
  - `approved`: «¡Aprobaron tu solicitud! Quien cuida a X te contactará para coordinar la adopción.»
  - `rejected`: «Esta vez no aprobaron tu solicitud. Gracias por querer darle un hogar a X.»
  - `withdrawn`: «Retiraste tu solicitud. Si cambias de opinión, puedes enviar otra.»
  - `closed`: «Tu solicitud se cerró. Gracias por querer darle un hogar a X.»
  - `completed`: «¡Adoptaste a X! Gracias por darle un hogar.»
- **Chips de estado**: Enviada (accent), En revisión (warning), Aprobada (ok), No aprobada (neutral), Retirada (neutral), Adoptó (ok), Cerrada (neutral).
- **Errores**: nunca `error.message` crudo (ver `2026-11-06-errores-legibles.md`).

## Referencia web
`src/components/adoption/MyAdoptionApplicationsSection.tsx`, `MyAdoptionApplicationDetail.tsx`, `AdoptionApplicationModal.tsx` (modo edición), `format.ts` (`adoptionSteps`, `adoptionApplicantCopy`), `AdoptionApplyBanner.tsx`.

## Criterios de aceptación
- [ ] «Adopciones» aparece en el perfil y lista las solicitudes de la persona con filtros Abiertas/Todas.
- [ ] El detalle muestra los pasos correctos para cada estado, el mensaje de quien cuida al animal y lo que envió.
- [ ] Con «Enviada» se puede editar; tras guardar se ven los cambios. Con «En revisión» ya no aparece «Editar».
- [ ] «Retirar solicitud» funciona con confirmación y actualiza el estado.
- [ ] «Ver solicitud» en el aviso de la ficha y la notificación `adoption.application_updated` abren el detalle.
- [ ] Funciona en iOS y Android, en modo claro y oscuro.
- [ ] Maneja carga, error y vacío.
