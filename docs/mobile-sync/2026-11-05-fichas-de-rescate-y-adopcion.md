---
estado: pendiente
fecha: 2026-11-05
origen: kadesh-landing@feat/espacios-de-rescate (sin commit)
feature: profile
---

# Prompt para kadesh-pet-mobile: Fichas de rescate, «Se quedó conmigo» y adopción con cartilla

## Contexto
Es la Fase 2 de los espacios de rescate (la Fase 1 está en `2026-11-05-espacios-de-rescate.md`: activar el espacio, equipo con roles y publicar a nombre de la organización). Ahora cada animal del espacio puede tener una **ficha**: la misma cartilla de las familias (fotos, vacunas y demás registros, recordatorios), pero del espacio y no de una persona. Desde la ficha el equipo publica al animal en adopción y, cuando alguien lo adopta, **la cartilla completa pasa a la cuenta del adoptante**. Además, quien publicó un reporte y se quedó con el animal puede pasarlo a su cartilla con «Se quedó conmigo».

## Qué implementar en la app

### 1. Vista «Fichas» del espacio
Dentro del espacio de rescate, una sección nueva **Fichas**. Cambia el nombre de la sección «Animales» de la Fase 1 a **Publicados**. Orden de las secciones: Resumen, Fichas, Publicados, Equipo, Perfil público. En Resumen, agrega los atajos «Fichas y vacunas» y «Ver publicados».

- **Lista** (`RescuePets`, de 30 en 30 con «Cargar más»). Cada fila muestra:
  - foto;
  - nombre;
  - pastilla de **etapa**;
  - pastilla con el estado de su reporte público, si tiene (mismos colores y textos que los reportes);
  - «Especie · Raza · Llegó el 5 nov»;
  - «Hogar temporal: <nombre>», si tiene;
  - próximo recordatorio pendiente, en rojo si ya venció y en ámbar si vence en 7 días o menos.
- **Filtro por etapa** con chips, sobre lo cargado: «Todas» más las etapas que tengan fichas.
- **Nueva ficha**: solo admin, coordinación y voluntariado, y solo si el espacio no está rechazado ni suspendido. Usa el mismo formulario de «Registrar mascota» de la cartilla, agregando `organization: { connect: { id } }` al crear. Título: «Nueva ficha en <espacio>». Al guardar, abre la ficha.
- **Vacío**, con dos textos según el rol:
  - Si puede crear: «Aún no hay fichas», con el botón de nueva ficha.
  - Si es `foster`: «No tienes fichas asignadas. Cuando te asignen un animal en tu hogar temporal, su ficha aparecerá aquí».

### 2. Ficha de un animal del espacio
Es la pantalla de cartilla que ya existe para las mascotas (si la app aún no la tiene, esta es la referencia: datos, registros de salud y recordatorios). Si `pet.organization` no es null:
- Se ocultan **Familia** y **Marcar como perdida**.
- **Borrar** solo aparece si `viewerRole` es `admin` o `coordinator`. Texto de confirmación: «Se borrarán su ficha, cartilla, recordatorios y fotos. Sus reportes públicos se conservan».
- Debajo de los datos va una tarjeta **«En <espacio>»**, con el subtítulo «Solo tu equipo ve esta ficha». Cada cambio se guarda al momento con `UpdatePet` y avisa con un toast:
  - **Etapa**: selector, editable por admin, coordinación y voluntariado; los demás solo la leen.
  - **Llegó al espacio**: fecha, no futura. Mismos permisos que la etapa.
  - **Hogar temporal**: selector con «Sin asignar» y cada persona del equipo como «Nombre · Rol». Los miembros salen de `rescueOrganization.members` de la Fase 1. Solo lo cambian admin y coordinación. Debajo va la nota «Ve y actualiza esta ficha aunque su rol sea "Hogar temporal"».
  - **Publicación**:
    - Si tiene reporte: «Publicado como [pastilla]» y «Ver publicación», que abre `https://pet.kadesh.com.mx/animales/<slug>`.
    - Si no tiene: «Aún no está publicado. Solo tu equipo lo ve».
    - Botón «Publicar en adopción» si el reporte no está ya en adopción.
    - Botón «Publicar como rescatado» solo si aún no tiene reporte.
    - Los botones solo aparecen para admin, coordinación y voluntariado, con la ficha activa y si el reporte no está «Adoptado» ni «En familia».
  - **¿Ya tiene familia?** Solo admin y coordinación, con la ficha activa: «Su cartilla, con vacunas y recordatorios, pasa a la cuenta de quien lo adopta», y el botón **Completar adopción**.

### 3. Publicar la ficha (`PublishRescuePet`)
Hoja modal «Publicar a <nombre>»:
- Chips «En adopción» y «Rescatado», con su ayuda (ver Reglas). Botón: «Publicar como «<estado>»».
- **Si la ficha aún no tiene reporte**:
  - Pide la ubicación con el mapa y el pin, igual que en «Marcar como perdida», con la nota «Basta con la zona: la colonia o el municipio del espacio».
  - Texto: «Publicaremos un reporte a nombre del espacio con el nombre, fotos y señas de la ficha, y el WhatsApp del espacio. Vacunas y recordatorios no se publican».
- **Si ya tiene reporte**: no pide ubicación. Texto: «Actualizaremos su reporte público con el nuevo estado».
- Notas opcionales; placeholder: «Carácter, si convive con otros animales, requisitos para adoptarlo…».
- Si `success` es false, muestra `message` en el modal.
- Si sale bien, muestra un toast con `message`. Descripción: «Avisamos a quien tiene alertas en esa zona…» si `createdReport`, o «Actualizamos su reporte público» si no.

### 4. Completar adopción (`CompleteRescueAdoption`)
Hoja modal «Completar la adopción de <nombre>»:
- Texto: «La cartilla (vacunas, registros y recordatorios) pasará a la cuenta de quien lo adopta y dejará de verse en <espacio>. Su publicación quedará como «Adoptado»».
- Campo: correo de quien adopta. Ayuda: «Necesita una cuenta de KADESH (es gratis). Si no la tiene, pídele que se registre primero».
- Si el `code` es `RESCUE_ADOPTER_NOT_FOUND`, muestra `message` bajo el campo de correo.
- Si sale bien:
  - toast «¡<nombre> tiene familia!» con `message`;
  - vuelve a la lista de fichas, porque la ficha ya no es del espacio y el equipo no podrá abrirla.

### 5. Crear ficha desde un publicado
En **Publicados**, cada reporte muestra uno de estos botones, solo para admin, coordinación y voluntariado:
- **Ver ficha**, si `animal.pet` no es null.
- **Crear ficha**, si no la tiene. Llama `ConvertAnimalToPet` con el espacio. Si sale bien: toast con `message`, «Ya puedes llevar sus vacunas y recordatorios», y abre la ficha.

### 6. «Se quedó conmigo» en la ficha pública de un reporte
Solo para quien publicó el reporte (`animal.user.id === yo`), y solo si se cumple todo esto:
- el reporte no tiene espacio de rescate (`animal.organization` es null);
- no tiene cartilla (`animal.pet` es null);
- no está unido a otro reporte;
- su último estado es `rescued`, `found`, `abandoned` o `in_adoption`.

Qué muestra y qué pasa:
- Banner: «¿<nombre> se quedó contigo? Pásalo a tu cartilla para llevar sus vacunas y recordatorios», con el botón **Se quedó conmigo**.
- Confirmación: «Crearemos su cartilla con los datos y fotos del reporte, y el reporte quedará «En familia»».
- Llama `KeepAnimal`. Si sale bien, abre la cartilla de esa mascota.

### 7. Cartilla de una mascota adoptada
Si `adoptedFromOrganization` no es null, muestra bajo el nombre «Adoptado con <espacio>». Si el espacio tiene `slug`, el nombre enlaza a su perfil público (`https://pet.kadesh.com.mx/organizaciones/<slug>`).

### 8. Notificación nueva
`pet.adoption_completed`: el espacio completó tu adopción. Usa el tono verde, el ícono de rescate y el enlace a la cartilla (`url` del aviso). Los recordatorios de una ficha llegan al equipo con el `pet.reminder_due` de siempre, pero su `url` abre la ficha en el espacio (`/perfil?tab=rescate&org=<id>&vista=fichas&pet=<id>`). Esa ruta web debe llevar a la ficha correspondiente en la app.

## GraphQL

```graphql
# Lista de fichas del espacio. where = { organization: { id: { equals: $orgId } } }
query RescuePets($where: PetWhereInput!, $take: Int!, $skip: Int!) {
  pets(where: $where, orderBy: [{ createdAt: desc }], take: $take, skip: $skip) {
    id
    name
    status
    stage
    intakeDate
    animal_type { name }
    animal_breed { breed }
    multimedia(orderBy: [{ order: asc }], take: 1) { image { url } }
    fosterMember { id userName }
    publicReport { id slug logs(orderBy: [{ date_status: desc }], take: 1) { status } }
    reminders(where: { status: { equals: "pending" } }, orderBy: [{ dueDate: asc }], take: 1) { id title dueDate }
  }
  petsCount(where: $where)
}

# Campos nuevos en el detalle de la cartilla (agrégalos a tu query PetDetail existente)
query PetDetail($id: ID!) {
  pet(where: { id: $id }) {
    # …campos de siempre (name, status, sex, multimedia, owners, healthRecords, reminders…)
    viewerRole
    organization { id name }
    stage
    intakeDate
    fosterMember { id userName }
    publicReport { id slug logs(orderBy: [{ date_status: desc }], take: 1) { status } }
    adoptedFromOrganization { id name slug }
    adoptedAt
  }
}

# Crear ficha: la mutación de siempre, con organization en data.
mutation CreatePet($data: PetCreateInput!) {
  createPet(data: $data) { id }
}
# data: { name, animal_type: { connect: { id } }, …, organization: { connect: { id: $orgId } } }

# Etapa, fecha de llegada y hogar temporal
mutation UpdatePet($id: ID!, $data: PetUpdateInput!) {
  updatePet(where: { id: $id }, data: $data) { id }
}
# data: { stage: "treatment" } | { intakeDate: "2026-11-05" } |
#       { fosterMember: { connect: { id: $memberId } } } | { fosterMember: { disconnect: true } }

# «Crear ficha» (con organizationId) o «Se quedó conmigo» (sin él)
mutation ConvertAnimalToPet($animalId: ID!, $organizationId: ID) {
  convertAnimalToPet(animalId: $animalId, organizationId: $organizationId) {
    success
    message
    petId
    organizationId
  }
}

mutation KeepAnimal($animalId: ID!) {
  convertAnimalToPet(animalId: $animalId) { success message petId }
}

# status: "in_adoption" | "rescued". location solo si la ficha aún no tiene reporte.
# PetLastSeenLocationInput = { lat: String!, lng: String!, address: String }
mutation PublishRescuePet($petId: ID!, $status: String!, $location: PetLastSeenLocationInput, $notes: String) {
  publishRescuePet(petId: $petId, status: $status, location: $location, notes: $notes) {
    success
    message
    reportId
    slug
    url
    createdReport
  }
}

mutation CompleteRescueAdoption($petId: ID!, $email: String!) {
  completeRescueAdoption(petId: $petId, email: $email) {
    success
    message
    code
    petId
    adopterName
  }
}

# En la ficha pública del reporte (tu query GetAnimal), agrega:
#   pet { id }
# Llega null si quien consulta no puede ver esa cartilla.
# En la lista de Publicados (RescueOrganizationAnimals), agrega también pet { id }.
```

Tipos TypeScript:

```ts
type PetRescueStage = 'intake' | 'treatment' | 'foster' | 'available' | 'reserved' | 'sanctuary';

interface RescuePetRow {
  id: string;
  name: string;
  status: string; // active | lost | deceased | transferred
  stage?: PetRescueStage | null;
  intakeDate?: string | null; // "AAAA-MM-DD"
  animal_type?: { name?: string | null } | null;
  animal_breed?: { breed?: string | null } | null;
  multimedia: Array<{ image?: { url?: string | null } | null }>;
  fosterMember?: { id: string; userName?: string | null } | null;
  publicReport?: { id: string; slug?: string | null; logs: Array<{ status: string }> } | null;
  reminders: Array<{ id: string; title: string; dueDate: string }>;
}

// Campos nuevos de la cartilla (PetDetail)
interface PetDetailRescueFields {
  /** principal | family (dueños) o el rol en el equipo del espacio: admin | coordinator | volunteer | foster */
  viewerRole?: string | null;
  organization?: { id: string; name: string } | null;
  stage?: PetRescueStage | null;
  intakeDate?: string | null;
  fosterMember?: { id: string; userName?: string | null } | null;
  publicReport?: { id: string; slug?: string | null; logs: Array<{ status: string }> } | null;
  adoptedFromOrganization?: { id: string; name: string; slug?: string | null } | null;
  adoptedAt?: string | null;
}
```

## Reglas y constantes
- **Etapas** (valor → etiqueta):
  - `intake` → Recién llegado
  - `treatment` → En tratamiento
  - `foster` → En hogar temporal
  - `available` → Listo para adopción
  - `reserved` → Apartado
  - `sanctuary` → Se queda en el espacio

  Una ficha nueva arranca en «Recién llegado» con la fecha de hoy. «Publicar en adopción» la pasa a «Listo para adopción».
- **Publicar**, valor → etiqueta y ayuda:
  - `in_adoption` → «En adopción»: «Busca familia: aparece en adopciones y en tu perfil».
  - `rescued` → «Rescatado»: «Avisa que lo rescataron; aún no está listo para adopción».
- **Permisos de la ficha** (el backend los aplica; la app solo decide qué mostrar):

  | Rol | Ver y editar cartilla | Etapa y fecha | Hogar temporal | Publicar | Completar adopción | Borrar |
  |---|---|---|---|---|---|---|
  | admin | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
  | coordinator | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
  | volunteer | ✓ | ✓ | — | ✓ | — | — |
  | foster | solo sus fichas asignadas | — | — | — | — | — |

- **Fichas sin dueños**: una ficha no aparece en «Mis mascotas», porque esa lista filtra por dueños. Al completar la adopción, el adoptante queda como dueño principal y el equipo deja de verla.
- **Adoptante**: debe tener cuenta; no se crean cuentas a nombre de otros.
- **Recordatorios de una ficha**: les llegan a admin, coordinación y al hogar temporal asignado.
- **Errores**: las tres mutaciones de rescate responden `success: false` con un `message` listo para mostrar; no lanzan error. `UpdatePet` y `CreatePet` sí lanzan un error de GraphQL con el mensaje.

## Referencia web
- `src/components/rescue/RescuePetsView.tsx`
- `src/components/rescue/RescuePetPanel.tsx`
- `src/components/rescue/PublishRescuePetModal.tsx`
- `src/components/rescue/CompleteAdoptionModal.tsx`
- `src/components/rescue/RescueAnimalsView.tsx` (Crear o ver ficha)
- `src/components/pets/PetDetail.tsx` (modo ficha y «Adoptado con…»)
- `src/components/animals/detail/KeepAnimalButton.tsx`

## Criterios de aceptación
- [ ] Un voluntario crea una ficha, cambia su etapa y la publica en adopción. Sin reporte previo, pide la zona y el reporte sale a nombre del espacio.
- [ ] Un coordinador asigna un hogar temporal. Esa persona, con rol `foster`, ve solo esa ficha y puede agregar vacunas.
- [ ] «Completar adopción» con el correo de una cuenta existente: la ficha sale de la lista y el adoptante la ve en «Mis mascotas» con «Adoptado con <espacio>» y sus recordatorios.
- [ ] Con un correo sin cuenta, se muestra el mensaje bajo el campo de correo.
- [ ] «Crear ficha» desde Publicados abre la ficha con los datos y fotos del reporte; la fila pasa a mostrar «Ver ficha».
- [ ] «Se quedó conmigo» solo aparece al autor de un reporte sin espacio. Al usarlo, crea su cartilla y el reporte queda «En familia».
- [ ] Funciona en iOS y Android, en modo claro y oscuro.
- [ ] Maneja carga, error y vacío.
