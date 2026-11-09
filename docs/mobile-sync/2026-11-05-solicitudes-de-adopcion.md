---
estado: pendiente
fecha: 2026-11-05
origen: kadesh-landing@feat/espacios-de-rescate (sin commit)
feature: animals
---

# Prompt para kadesh-pet-mobile: Solicitudes de adopción («Quiero adoptarlo»)

## Contexto
Un animal «En adopción» ahora recibe **solicitudes**. Quien quiere adoptarlo llena un cuestionario corto. Quien lo publicó, o el equipo de su espacio de rescate, la revisa, la aprueba o la rechaza con un mensaje, y al final **completa la adopción**. Con eso, la cartilla del animal (o una nueva, creada con los datos del reporte) pasa a la cuenta de quien adoptó, el reporte queda «Adoptado» y las demás solicitudes se cierran con un aviso amable. Funciona para animales de un espacio y de personas. Depende de la Fase 2 (fichas, `2026-11-05-fichas-de-rescate-y-adopcion.md`) y se complementa con el traspaso por código (`2026-11-05-traspaso-de-mascotas-con-codigo.md`).

## Qué implementar en la app

### 1. «Quiero adoptarlo» en la ficha pública de un animal
**Cuándo se muestra.** Solo si se cumplen todas:
- el último estado del reporte es `in_adoption`;
- el reporte no está unido a otro (`duplicateOf`);
- quien mira no puede editarlo (no es su autor ni de su equipo; usa `viewerCanEdit` o el autor).

**Qué muestra según el caso:**
- **Sin sesión**: pide iniciar sesión y, al volver, abre el formulario.
- **Con una solicitud abierta** (`submitted`, `in_review` o `approved`): «Tu solicitud: <estado>», un texto según el estado (si está aprobada: «Te contactarán para coordinar la entrega») y **Retirar solicitud**, con confirmación.
- **Si la última quedó `rejected`, `withdrawn` o `closed`**: muéstrala con su `decisionNote`, si tiene, y deja **Enviar otra solicitud**.
- **Si no tiene ninguna**: el botón **Quiero adoptarlo** (o «Quiero adoptarla», según el sexo del animal).

### 2. Formulario de solicitud
Hoja modal con estos campos:
- **Teléfono**: obligatorio, 10 dígitos de México, prellenado con el del perfil.
- **«¿Por qué quieres adoptar a <nombre>?»**: obligatorio, de 20 a 1000 caracteres.
- **Vivienda**: chips Casa, Departamento u Otro (`house`, `apartment`, `other`). Obligatorio.
- **«Tu vivienda es»**: Propia, Rentada o De mi familia (`own`, `rent`, `family`). Obligatorio. Si es `rent`, pregunta además «¿Te permiten tener mascotas?» Sí/No (`petsAllowed`), también obligatorio.
- **«¿Tiene patio o jardín?»** Sí/No (`hasYard`) y **«¿Hay niños en casa?»** Sí/No (`hasChildren`).
- **«¿Tienes otros animales?»**: opcional, hasta 500 caracteres.
- **«¿Cuántas horas al día estaría solo?»**: obligatorio, de 0 a 24.
- **«Experiencia con mascotas»**: opcional, hasta 500 caracteres.
- **Dos casillas obligatorias**: «Me comprometo a esterilizarlo si aún no lo está» y «Acepto que me contacten para dar seguimiento después de la adopción».
- **Aviso de privacidad**: «Compartiremos tu nombre, correo y teléfono con quien cuida a <nombre> para que pueda contactarte».

Al enviar, llama a `SubmitAdoptionApplication`:
- Si `success` es false, muestra `message` arriba del formulario.
- Si sale bien, muestra un toast con `message` y vuelve a consultar la solicitud propia.
- Conserva lo escrito si se cierra sin enviar.

### 3. Solicitudes recibidas
Se muestran en dos lugares:
- **En la ficha del animal**: solo para quien puede editarlo, y solo si hay alguna.
- **En el espacio de rescate**: sección nueva **Solicitudes**, entre «Publicados» y «Equipo», con filtros «Abiertas» y «Todas» (con conteo) y de 30 en 30.

Si el enlace de la notificación trae `?solicitud=<id>`, abre y resalta esa solicitud.

**Cada tarjeta muestra:**
- nombre, pastilla de estado y fecha;
- en el espacio, el nombre del animal con enlace a su ficha;
- el mensaje;
- las respuestas en español: «Casa, rentada (sí permiten mascotas)», «Patio: sí», «Niños: no», «Solo 4 h al día», otros animales, experiencia y los dos compromisos;
- la `decisionNote`, si existe;
- contacto: **Llamar** (`tel:+52…`), **WhatsApp** (`https://wa.me/52<10 dígitos>` con un saludo) y **Correo**.

**Acciones según el estado:**
- `submitted`: Poner en revisión · Aprobar · No aprobar.
- `in_review`: Aprobar · No aprobar.
- `approved`: **Completar adopción** · No aprobar.
- Estados finales: sin acciones.

**Detalle de las acciones:**
- «Poner en revisión» se aplica directo.
- «Aprobar» y «No aprobar» piden un mensaje opcional de hasta 500 caracteres, aclarando que le llega a la persona.
- **Completar adopción** confirma antes: «Su cartilla (o una nueva con los datos del reporte) pasará a la cuenta de <nombre> y el reporte quedará como Adoptado. Las demás solicitudes se cerrarán». Si sale bien, recarga el animal y la lista.

**Permisos en el espacio** (los aplica el backend; la app solo decide qué mostrar según `org.viewerRole`):
- `admin` y `coordinator`: todo.
- `volunteer`: revisa, y ve la nota «La adopción la completa coordinación».
- `foster`: solo lee.

En la ficha pública del animal, muestra los botones a quien puede editarlo, y si el backend se niega, enseña su `message`.

### 4. Notificaciones
- `adoption.application_received`: alguien pidió adoptar tu animal. Su `url` lleva a la ficha con `?solicitud=<id>`.
- `adoption.application_updated`: tu solicitud cambió (en revisión, aprobada, no aprobada o cerrada).
- `pet.adoption_completed` (ya existe): la mascota ya está en tu cartilla.

Usa el ícono de rescate.

## GraphQL

```graphql
# La solicitud propia más reciente para un animal (abierta o no)
query MyAdoptionApplication($animalId: ID!, $userId: ID!) {
  adoptionApplications(
    where: { animal: { id: { equals: $animalId } }, applicant: { id: { equals: $userId } } }
    orderBy: [{ createdAt: desc }]
    take: 1
  ) { id status decisionNote decidedAt createdAt }
}

fragment AdoptionApplicationFields on AdoptionApplication {
  id status applicantName applicantEmail phone message
  answers        # JSON: { housing, housingOwnership, petsAllowed, hasYard, hasChildren, otherPets, hoursAlone, experience, commitSterilization, acceptsFollowUp }
  decisionNote decidedAt createdAt updatedAt
  animal { id name slug organization { id name } }
  pet { id }
}

# Solicitudes de un animal (ficha pública, quien puede editarlo)
query AnimalAdoptionApplications($animalId: ID!, $take: Int!, $skip: Int!) {
  adoptionApplications(
    where: { animal: { id: { equals: $animalId } } }
    orderBy: [{ createdAt: desc }]
    take: $take
    skip: $skip
  ) { ...AdoptionApplicationFields }
  adoptionApplicationsCount(where: { animal: { id: { equals: $animalId } } })
}

# Solicitudes de un espacio. where = { animal: { organization: { id: { equals: $orgId } } } }
# (+ status: { in: ["submitted","in_review","approved"] } para «Abiertas»)
query RescueAdoptionApplications(
  $where: AdoptionApplicationWhereInput!
  $openWhere: AdoptionApplicationWhereInput!
  $allWhere: AdoptionApplicationWhereInput!
  $take: Int!
  $skip: Int!
) {
  adoptionApplications(where: $where, orderBy: [{ createdAt: desc }], take: $take, skip: $skip) {
    ...AdoptionApplicationFields
  }
  openCount: adoptionApplicationsCount(where: $openWhere)
  allCount: adoptionApplicationsCount(where: $allWhere)
}

# input AdoptionApplicationInput {
#   phone: String!  message: String!  housing: String!  housingOwnership: String!
#   petsAllowed: Boolean  hasYard: Boolean!  hasChildren: Boolean!  otherPets: String
#   hoursAlone: Int!  experience: String  commitSterilization: Boolean!  acceptsFollowUp: Boolean!
# }
mutation SubmitAdoptionApplication($animalId: ID!, $input: AdoptionApplicationInput!) {
  submitAdoptionApplication(animalId: $animalId, input: $input) {
    success message application { id status decisionNote decidedAt updatedAt }
  }
}

# status: in_review | approved | rejected. note le llega a quien la envió.
mutation ReviewAdoptionApplication($applicationId: ID!, $status: String!, $note: String) {
  reviewAdoptionApplication(applicationId: $applicationId, status: $status, note: $note) {
    success message application { id status decisionNote decidedAt updatedAt }
  }
}

mutation WithdrawAdoptionApplication($applicationId: ID!) {
  withdrawAdoptionApplication(applicationId: $applicationId) {
    success message application { id status decisionNote decidedAt updatedAt }
  }
}

mutation CompleteAdoptionApplication($applicationId: ID!) {
  completeAdoptionApplication(applicationId: $applicationId) { success message petId }
}
```

Tipos TypeScript:

```ts
type AdoptionApplicationStatus =
  | 'submitted' | 'in_review' | 'approved'            // abiertas
  | 'rejected' | 'withdrawn' | 'completed' | 'closed'; // finales

interface AdoptionAnswers {
  housing: 'house' | 'apartment' | 'other';
  housingOwnership: 'own' | 'rent' | 'family';
  petsAllowed: boolean | null; // solo si rent
  hasYard: boolean;
  hasChildren: boolean;
  otherPets: string;
  hoursAlone: number;
  experience: string;
  commitSterilization: boolean;
  acceptsFollowUp: boolean;
}

interface AdoptionApplication {
  id: string;
  status: AdoptionApplicationStatus;
  applicantName?: string | null;
  applicantEmail?: string | null;
  phone?: string | null;
  message?: string | null;
  answers?: AdoptionAnswers | null;
  decisionNote?: string | null;
  decidedAt?: string | null;
  createdAt?: string | null;
  updatedAt?: string | null;
  animal?: { id: string; name: string; slug?: string | null; organization?: { id: string; name: string } | null } | null;
  pet?: { id: string } | null;
}
```

## Reglas y constantes
- **Etiquetas de estado**:
  - `submitted` → Enviada
  - `in_review` → En revisión
  - `approved` → Aprobada
  - `rejected` → No aprobada (en tono neutro, no rojo)
  - `withdrawn` → Retirada
  - `completed` → Adoptó
  - `closed` → Cerrada, porque el animal encontró otra familia
- **Reglas del backend** (las cuatro mutaciones responden `success: false` con un `message` listo para mostrar):
  - Para solicitar se necesita sesión.
  - Quien publicó el animal, o su equipo, no puede solicitarlo.
  - Una solicitud abierta por persona y animal, y un máximo de 10 al día.
  - Revisa quien puede editar al animal.
  - Completar solo es posible desde «Aprobada»: en un espacio lo hacen admin y coordinación; si no, el autor.
- **Al completar**:
  - Si el animal tiene ficha en un espacio, esa ficha pasa al adoptante.
  - Si es cartilla de su autor, pasa al adoptante.
  - Si no tiene cartilla, se crea una con los datos y fotos del reporte.
  - El reporte queda «Adoptado». Las demás solicitudes pasan a «Cerrada» y a cada persona le llega un aviso.
- **Privacidad**: nombre, correo y teléfono del solicitante solo los ven quien la envió y quien atiende al animal.

## Referencia web
- `src/components/adoption/` (`AdoptionApplyBanner`, `AdoptionApplicationModal`, `AdoptionApplicationsPanel`, `AdoptionApplicationList`, `AdoptionApplicationCard`, `AdoptionDecisionModal`, `format.ts`, `README.md`)
- `src/components/rescue/RescueApplicationsView.tsx`

## Criterios de aceptación
- [ ] En un animal «En adopción», alguien sin sesión toca «Quiero adoptarlo», inicia sesión y vuelve directo al formulario.
- [ ] Al enviar, el banner cambia a «Tu solicitud: Enviada» y se puede retirar.
- [ ] El autor (o el equipo) ve la solicitud, la aprueba con un mensaje, y quien la envió recibe el aviso.
- [ ] Al completar la adopción, la cartilla aparece en la cuenta del adoptante, el reporte queda «Adoptado» y las otras solicitudes quedan «Cerrada».
- [ ] En el espacio, `volunteer` revisa pero no completa, y `foster` solo lee.
- [ ] Funciona en iOS y Android, en modo claro y oscuro.
- [ ] Maneja carga, error y vacío.
