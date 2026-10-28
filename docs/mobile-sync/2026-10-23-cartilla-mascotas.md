---
estado: pendiente
fecha: 2026-10-23
origen: kadesh-landing@feat/pet-health-card (sin commit)
feature: profile
---

# Prompt para kadesh-pet-mobile: Cartilla digital de la mascota

## Contexto

La web agregó la pestaña **Mascotas** al perfil. Cada persona registra a sus mascotas y lleva su cartilla de salud (vacunas, desparasitaciones, consultas…). Antes de cada fecha recibe un recordatorio por push y correo. Comparte la cartilla con su familia y, si la mascota se pierde, publica su reporte en un paso con los datos y fotos que ya están en la cartilla.

**Depende del backend** `kadesh-back@feat/pet-health-card` desplegado y con su migración aplicada. Antes de eso, las operaciones de abajo fallan porque los tipos no existen.

## Qué implementar en la app

Una sección **Mis mascotas** (dentro de Perfil, o donde encaje en la navegación de la app) con dos pantallas y varios formularios.

**Lista**
- Muestra las mascotas de la persona: foto principal, nombre, especie · raza · edad, la etiqueta de estado si no está activa, y su próximo recordatorio pendiente con fecha y "en N días".
- El color del recordatorio depende de la fecha: rojo si ya pasó, ámbar si falta una semana o menos, gris si falta más.
- Si no hay ninguna, muestra un vacío con el botón **Registrar mascota**. Texto: "Lleva su cartilla de vacunas y desparasitaciones, y te avisamos antes de cada fecha. Si un día se pierde, publicas su reporte en un paso con sus fotos y señas."

**Cartilla de una mascota**
- **Encabezado:** foto, nombre, estado y datos (sexo, nacimiento o edad, color, peso, esterilizada, microchip, señas particulares). Acciones:
  - **Editar**.
  - **Marcar como perdida**, solo si está `active`.
  - **Borrar**, solo si la persona es la dueña principal. Pide confirmación: "Se borrarán su cartilla, recordatorios, fotos y familia. Sus reportes y citas se conservan."
- **Si está `lost`:** aviso rojo "<nombre> está reportada como perdida" con dos botones:
  - **Ya regresó a casa:** confirma y llama a `markPetAsFound`.
  - **Ver reporte:** abre la ficha del reporte, que ya existe en la app, con el `lostReport.slug`.
- **Cartilla:** lista de registros, del más reciente al más viejo. Cada uno muestra:
  - ícono según el tipo (vacuna / consulta-cirugía / medicamento-desparasitación);
  - nombre;
  - tipo · fecha · veterinaria;
  - "Próxima: <fecha> (en N días)" con el mismo color que en la lista;
  - notas y miniaturas de las fotos adjuntas;
  - acciones Editar y Borrar (con confirmación).
- **Recordatorios:** pendientes y avisados arriba; hechos y cancelados en "Ver anteriores (N)". Cada uno muestra título, fecha, "en N días" y "Aviso 3 días antes por notificación y correo". Acciones:
  - **Hecho:** cambia el estado a `completed`.
  - **Editar**.
  - **Borrar:** solo en los recordatorios creados a mano, es decir, los que no traen `healthRecord`.
- **Familia:** cada dueño con su nombre (`userName`), "(tú)" en la propia fila y su rol (Principal / Familiar).
  - El principal ve "Agregar por correo" (`addPetFamilyMember`) y puede quitar familiares.
  - Si ese correo no tiene cuenta, el error trae `extensions.code = "PET_FAMILY_USER_NOT_FOUND"`. En vez del error, muestra "<correo> no tiene cuenta en Kadesh. Puedes registrarla tú y quedará en la familia." con el botón **Registrar a esta persona**.
  - Ese botón abre "Registrar familiar" con nombre (obligatorio), apellido, correo (prellenado, obligatorio), teléfono (opcional, 10 dígitos) y contraseña (obligatoria, mínimo 8, con mostrar/ocultar). Texto arriba: "Crearemos su cuenta de Kadesh Pet con la contraseña que elijas y la agregaremos a la cartilla de <mascota>. Le llegará un correo avisándole que tú tienes su contraseña." Llama a `registerPetFamilyMember`.
  - Si `createdAccount` es `false`, el correo ya tenía cuenta: toast "<nombre> ya tenía cuenta. La agregamos a la cartilla; su contraseña no cambió." Si es `true`: "Registramos a <nombre>. Ya ve la cartilla. Compártele su contraseña."
  - Un familiar puede **salirse** de su propia fila. Después ya no ve la mascota: hay que regresar a la lista.

**Formularios** (hojas modales o pantallas):
- **Registrar / editar mascota:**
  - Fotos: hasta 3. La primera es la principal y son las que se copian al reporte si se pierde.
  - Nombre (obligatorio).
  - Especie (obligatoria), con los mismos chips de tipo de animal que ya usa el reporte.
  - Raza: el mismo selector del reporte, opcional.
  - Sexo, con chips.
  - Edad: chips "Sé su fecha de nacimiento" / "No la sé". La primera muestra un date picker que no acepta fechas futuras; la segunda, un texto libre como "2 años".
  - Color.
  - Peso en kg (0.1–200).
  - Esterilizada, con chips Sí / No / No lo sé.
  - Microchip.
  - Señas particulares.
  - Solo al editar, y si no está `lost`: estado con chips Activa / Fallecida / Transferida.
- **Registro de la cartilla:**
  - Tipo, con chips.
  - Nombre (obligatorio). En vacunas sugiere: Rabia, Séxtuple, Parvovirus, Moquillo, Bordetella, Triple felina, Leucemia felina.
  - Fecha de aplicación: obligatoria, no futura, hoy por default.
  - Próxima fecha: opcional, no antes de la aplicación. Debajo: "Te avisaremos 3 días antes. Lo cambias en Recordatorios."
  - Veterinaria: opcional, se busca por nombre con mínimo 2 letras.
  - Notas.
  - Hasta 3 fotos de la cartilla física o de la receta.
- **Recordatorio:**
  - Si es manual: título y fecha (obligatorios).
  - Siempre: "Cuándo avisar" (chips: el mismo día, 1, 3, 7 o 14 días antes) y "Cómo avisar" (chips Notificación / Correo, al menos uno).
  - Si trae `healthRecord`, no se editan título ni fecha. En su lugar se muestra: "Sale del registro «Vacuna: Rabia». Para cambiar la fecha, edita la próxima fecha de ese registro en la cartilla."
- **Marcar como perdida:**
  - Texto: "Publicaremos un reporte con su nombre, fotos y señas de la cartilla, y avisaremos a quien tenga alertas en esa zona."
  - Fecha en que se vio por última vez: hoy por default, no futura.
  - Ubicación: el mismo mapa con pin del reporte nuevo, con "Estoy aquí".
  - Notas.
  - Teléfono: 10 dígitos, prellenado con el del perfil. Debajo: "Aparece en el reporte público para que te llamen si la ven."
  - Al terminar: toast "Publicamos el reporte de <nombre>".

**Push:** el recordatorio llega como notificación de tipo `pet.reminder_due` con `url` = `https://pet.kadesh.com.mx/perfil?tab=pets&pet=<petId>`. Al tocarla, abre la cartilla de esa mascota. También aparece en la campana, igual que los demás avisos.

Fotos: igual que en los reportes, con `expo-image-picker` + `expo-image-manipulator` (JPEG, lado máximo 2560, calidad 0.85, máximo 5 MB). Se suben multipart con `UploadHttpLink`.

## GraphQL

```graphql
query MyPets($where: PetWhereInput!) {
  pets(where: $where, orderBy: [{ name: asc }]) {
    id
    name
    status
    birthday
    approximateAge
    age
    animal_type { id name }
    animal_breed { id breed }
    multimedia(orderBy: [{ order: asc }], take: 1) { id image { url } }
    lostReport { id slug }
    reminders(where: { status: { equals: "pending" } }, orderBy: [{ dueDate: asc }], take: 1) {
      id
      title
      dueDate
    }
  }
}
# variables: { "where": { "owners": { "some": { "user": { "id": { "equals": "<authenticatedItem.id>" } } } } } }

query PetDetail($id: ID!) {
  pet(where: { id: $id }) {
    id
    name
    status
    birthday
    approximateAge
    age
    sex
    color
    distinctiveMarks
    weightKg
    sterilized
    microchipNumber
    animal_type { id name }
    animal_breed { id breed }
    multimedia(orderBy: [{ order: asc }]) { id order image { url } }
    lostReport { id slug }
    owners(orderBy: [{ createdAt: asc }]) { id role userName user { id } }
    healthRecords(orderBy: [{ appliedDate: desc }, { createdAt: desc }]) {
      id
      type
      name
      appliedDate
      nextDueDate
      notes
      verifiedByVet
      veterinary { id name }
      attachments { id image { url } }
    }
    reminders(orderBy: [{ dueDate: asc }]) {
      id
      title
      dueDate
      notifyDaysBefore
      channels
      status
      sentAt
      healthRecord { id type name }
    }
  }
}

mutation CreatePet($data: PetCreateInput!) { createPet(data: $data) { id } }
mutation UpdatePet($id: ID!, $data: PetUpdateInput!) { updatePet(where: { id: $id }, data: $data) { id } }
mutation DeletePet($id: ID!) { deletePet(where: { id: $id }) { id } }

mutation CreatePetPhotos($data: [PetMultimediaCreateInput!]!) { createPetMultimedias(data: $data) { id } }
# data: [{ "pet": { "connect": { "id": "<petId>" } }, "order": 1, "image": { "upload": <archivo> } }]
mutation DeletePetPhotos($where: [PetMultimediaWhereUniqueInput!]!) { deletePetMultimedias(where: $where) { id } }

mutation CreatePetHealthRecord($data: PetHealthRecordCreateInput!) { createPetHealthRecord(data: $data) { id } }
mutation UpdatePetHealthRecord($id: ID!, $data: PetHealthRecordUpdateInput!) {
  updatePetHealthRecord(where: { id: $id }, data: $data) { id }
}
mutation DeletePetHealthRecord($id: ID!) { deletePetHealthRecord(where: { id: $id }) { id } }

mutation CreatePetHealthRecordAttachments($data: [PetHealthRecordAttachmentCreateInput!]!) {
  createPetHealthRecordAttachments(data: $data) { id }
}
# data: [{ "healthRecord": { "connect": { "id": "<recordId>" } }, "image": { "upload": <archivo> } }]
mutation DeletePetHealthRecordAttachments($where: [PetHealthRecordAttachmentWhereUniqueInput!]!) {
  deletePetHealthRecordAttachments(where: $where) { id }
}

mutation CreatePetReminder($data: PetReminderCreateInput!) { createPetReminder(data: $data) { id } }
mutation UpdatePetReminder($id: ID!, $data: PetReminderUpdateInput!) {
  updatePetReminder(where: { id: $id }, data: $data) { id }
}
mutation DeletePetReminder($id: ID!) { deletePetReminder(where: { id: $id }) { id } }

mutation MarkPetAsLost(
  $petId: ID!
  $lastSeenLocation: PetLastSeenLocationInput!
  $lastSeenDate: String!
  $notes: String
  $contactPhone: String
) {
  markPetAsLost(
    petId: $petId
    lastSeenLocation: $lastSeenLocation
    lastSeenDate: $lastSeenDate
    notes: $notes
    contactPhone: $contactPhone
  ) {
    petId
    reportId
    slug
    url
  }
}
# PetLastSeenLocationInput: { lat: String!, lng: String!, address: String }; lastSeenDate: "AAAA-MM-DD"

mutation MarkPetAsFound($petId: ID!) { markPetAsFound(petId: $petId) { petId reportId } }

mutation AddPetFamilyMember($petId: ID!, $email: String!) {
  addPetFamilyMember(petId: $petId, email: $email) { id role userName }
}
mutation RegisterPetFamilyMember($petId: ID!, $input: RegisterPetFamilyMemberInput!) {
  registerPetFamilyMember(petId: $petId, input: $input) { id role userName createdAccount }
}
# RegisterPetFamilyMemberInput: { name: String!, lastName: String, email: String!, phone: String, password: String! }

mutation DeletePetOwner($id: ID!) { deletePetOwner(where: { id: $id }) { id } }

query SearchVeterinaries($search: String!) {
  petPlaces(
    where: {
      name: { contains: $search, mode: insensitive }
      types: { some: { value: { equals: "veterinary" } } }
    }
    orderBy: [{ name: asc }]
    take: 8
  ) {
    id
    name
    municipality
  }
}
```

Datos que manda la web al crear o editar:

```ts
// createPet / updatePet
{
  name: string;                                   // obligatorio
  animal_type: { connect: { id } };               // obligatorio
  animal_breed?: { connect: { id } } | { disconnect: true }; // disconnect solo al editar
  sex: 'male' | 'female' | 'unknown';
  birthday: 'AAAA-MM-DD' | null;                  // si "Sé su fecha"
  approximateAge: string;                         // '' si hay fecha
  color: string;
  weightKg: string | null;                        // decimal con 2 cifras, p. ej. "12.50"
  sterilized: 'yes' | 'no' | 'unknown';
  microchipNumber: string;
  distinctiveMarks: string;
  status?: 'active' | 'deceased' | 'transferred'; // solo al editar y si no está 'lost'
}

// createPetHealthRecord (+ pet: { connect: { id } }) / updatePetHealthRecord
{
  type: 'vaccine' | 'internal_deworming' | 'external_deworming' | 'consultation' | 'surgery' | 'medication' | 'other';
  name: string;
  appliedDate: 'AAAA-MM-DD';
  nextDueDate: 'AAAA-MM-DD' | null;
  notes: string;
  veterinary?: { connect: { id } } | { disconnect: true };
}

// createPetReminder (+ pet: { connect: { id } }) / updatePetReminder
{
  title?: string;          // solo si no viene de un registro
  dueDate?: 'AAAA-MM-DD';  // solo si no viene de un registro
  notifyDaysBefore: number; // 0, 1, 3, 7 o 14
  channels: string[];       // 'push' | 'email' (conserva 'whatsapp' si ya venía)
  status?: 'completed';     // botón "Hecho"
}
```

Tipos de lectura:

```ts
interface PetImage { id: string; order?: number | null; image?: { url: string } | null }

interface PetReminder {
  id: string;
  title: string;
  dueDate: string; // AAAA-MM-DD
  notifyDaysBefore: number;
  channels: string[] | null;
  status: 'pending' | 'sent' | 'completed' | 'cancelled';
  sentAt?: string | null;
  healthRecord?: { id: string; type: string; name: string } | null;
}

interface PetHealthRecord {
  id: string;
  type: string;
  name: string;
  appliedDate: string;
  nextDueDate?: string | null;
  notes?: string | null;
  verifiedByVet?: boolean | null;
  veterinary?: { id: string; name: string } | null;
  attachments: PetImage[];
}

interface PetOwner {
  id: string;
  role: 'principal' | 'family';
  userName?: string | null;
  user?: { id: string } | null; // solo viene en la propia fila
}

interface PetSummary {
  id: string;
  name: string;
  status: 'active' | 'lost' | 'deceased' | 'transferred';
  birthday?: string | null;
  approximateAge?: string | null;
  age?: string | null; // años cumplidos, calculado por el backend desde birthday
  animal_type?: { id: string; name: string } | null; // name: dog, cat, bird, fish, reptil, mammal
  animal_breed?: { id: string; breed: string } | null;
  multimedia: PetImage[];
  lostReport?: { id: string; slug?: string | null } | null;
  reminders: Pick<PetReminder, 'id' | 'title' | 'dueDate'>[];
}

interface PetDetail extends Omit<PetSummary, 'reminders'> {
  sex?: string | null;
  color?: string | null;
  distinctiveMarks?: string | null;
  weightKg?: string | null; // Decimal como string
  sterilized?: string | null;
  microchipNumber?: string | null;
  owners: PetOwner[];
  healthRecords: PetHealthRecord[];
  reminders: PetReminder[];
}
```

## Reglas y constantes

- **Permisos:**
  - Solo los dueños (`owners`) ven, crean y editan la mascota y todo lo suyo.
  - Solo el principal borra la mascota y agrega o quita familiares.
  - Un familiar solo puede borrar su propia fila (salirse).
  - La fila principal nunca se borra.
  - Quien registra la mascota queda como principal: lo hace el backend.
  - Para saber el rol propio, busca la fila de `owners` cuyo `user.id` sea el de la sesión. El `user` de los demás viene `null`.
- **`status` `lost`:** no se pone ni se quita editando. Entra con `markPetAsLost` y sale con `markPetAsFound`. El backend rechaza el cambio manual.
- **`markPetAsLost`:**
  - Exige que la mascota tenga especie y esté `active`.
  - El reporte que crea es público: lleva nombre, fotos (hasta 3), señas, edad, color, sexo y el `contactPhone`.
  - Avisa a quien tiene alertas de zona.
  - Si falla, el mensaje del error ya viene en español (p. ej. "Agrega un teléfono de contacto para el reporte.").
- **Registrar familiar:** solo el principal. La contraseña la elige él; el correo que recibe la persona nunca la lleva. Si el correo ya tenía cuenta, solo se agrega y su contraseña no cambia.
- **`markPetAsFound`:** cierra el reporte con una bitácora "En familia" y regresa la mascota a `active`.
- **Recordatorio automático:**
  - Un registro con `nextDueDate` crea su recordatorio solo: título "<Tipo>: <nombre>", 3 días antes, canales `push` + `email`.
  - Si cambia la próxima fecha, se actualiza y vuelve a `pending`. Si se quita, se cancela.
  - Ese recordatorio no se borra desde la lista.
- **Envío:** el backend manda los recordatorios una vez al día (09:00 CDMX) cuando `dueDate - notifyDaysBefore` ya llegó. Les llega a todos los dueños.
- **Canales:** la web solo ofrece `push` y `email`. `whatsapp` existe en el backend, pero aún no se envía porque falta la plantilla de Meta.
- **Etiquetas:**
  - Estado: `active` Activa, `lost` Perdida, `deceased` Fallecida, `transferred` Transferida.
  - Esterilizada: `yes` Sí, `no` No, `unknown` No lo sé.
  - Sexo: `male` Macho, `female` Hembra, `unknown` No lo sé.
  - Tipo de registro: Vacuna, Desparasitación interna, Desparasitación externa, Consulta, Cirugía, Medicamento, Otro.
  - Estado del recordatorio: `pending` Pendiente, `sent` Avisado, `completed` Hecho, `cancelled` Cancelado.
- **Errores de Keystone:** llegan como "You provided invalid data…\n  - Pet: <mensaje>". Muestra solo `<mensaje>`. Si el texto es técnico (access denied, prisma…), muestra uno genérico.

## Referencia web

`kadesh-landing/src/components/pets/` (`MyPetsSection`, `PetDetail`, `PetFormModal`, `HealthRecordFormModal`, `ReminderFormModal`, `MarkLostModal`, `FamilySection`, `queries.ts`, `constants.ts`, `README.md`) y `kadesh-back/docs/cartilla/README.md`.

## Criterios de aceptación

- [ ] Registrar una mascota con 1–3 fotos la deja en la lista, con la persona como principal.
- [ ] Un registro con próxima fecha muestra su recordatorio en la cartilla sin hacer nada más.
- [ ] "Hecho" mueve el recordatorio a "Ver anteriores"; uno de la cartilla no se puede borrar ni cambiar de fecha desde ahí.
- [ ] Marcar como perdida publica el reporte, la mascota queda "Perdida" y "Ver reporte" abre la ficha. "Ya regresó a casa" la regresa a activa.
- [ ] El principal agrega un familiar por correo y lo quita; un familiar se puede salir y la mascota desaparece de su lista.
- [ ] Con un correo sin cuenta aparece "Registrar a esta persona"; al registrarla queda en Familia y puede entrar con ese correo y la contraseña elegida.
- [ ] Tocar el push de un recordatorio abre la cartilla de esa mascota.
- [ ] Funciona en iOS y Android, en modo claro y oscuro.
- [ ] Maneja carga, error y vacío.
