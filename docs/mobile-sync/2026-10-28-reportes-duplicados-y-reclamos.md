---
estado: pendiente
fecha: 2026-10-28
origen: kadesh-landing@feat/reportes-duplicados (sin commit)
feature: animals
---

# Prompt para kadesh-pet-mobile: reportes parecidos, comentar en vez de duplicar y pedir el reporte

## Contexto
Varias personas publicaron al mismo perro (mismo nombre, a menos de 1 km) con teléfonos distintos, y la revisión anterior (mismo enlace o mismo teléfono + nombre) no lo detectó. Ahora el backend califica qué tan parecido es un reporte nuevo a los que ya existen y también cruza perdidos con encontrados.

En la web, mientras se llena el reporte:
- se avisa si el animal ya podría estar reportado;
- quien reporta puede dejar un comentario en el reporte existente en vez de duplicarlo;
- el dueño puede pedir que un reporte que subió otra persona pase a su nombre;
- quien atiende el reporte recibe notificación de todo esto.

## Qué implementar en la app

### 1. Revisión en el formulario de reporte
- **Cuándo consultar:** en el paso donde se elige la ubicación, en cuanto hay lat/lng y tipo de animal, con `FindAnimalReportDuplicates`. Espera ~600 ms después del último cambio.
- **Qué mandar:** tipo, nombre (`"Sin nombre"` si no tiene), estatus, sexo, color, raza, señas, lat/lng, el teléfono de contacto (solo si ya es válido, 10 dígitos), el enlace de la publicación (si viene de redes) y el día elegido a las 12:00 en ISO.
  - El día no debe cambiar cada segundo: «Hoy» es la fecha de hoy, no `now()`.
- **Cuándo repetir la consulta:** solo si cambian esas variables (guarda una «huella» de lo consultado).
- **Aviso que no frena** (bajo el mapa), con un botón **Revisar** que abre la hoja de revisión. El texto depende de lo que haya:
  - si hay algún `kind: duplicate`: «Encontramos un reporte parecido cerca» o «Encontramos N reportes parecidos cerca», con «Puede que ya esté reportado. Revísalo antes de publicar para no repetirlo.»;
  - si solo hay `match` y el reporte es perdido: «Alguien reportó uno encontrado parecido», con «Revisa si es tu mascota: podrías encontrarla más rápido.»;
  - si solo hay `match` y el reporte no es perdido: «Una familia busca uno parecido» (o «Hay familias buscando uno parecido»), con «Revisa si es el que encontraste para avisarles.».
- **Al tocar Publicar:** si la persona aún no vio la hoja y hay algún resultado que cumpla esto, abre la hoja en vez de publicar:
  - `level: "likely"`, o
  - `reasons` incluye `same_source` o `same_phone`.
- **Si la consulta falla:** no frena la publicación.

### 2. Hoja de revisión (bottom sheet)
- **Título y texto:** título «Antes de publicar». Un texto corto explica que, si es el mismo animal, conviene dejar la información ahí.
- **Dos secciones:**
  - «Puede que ya esté reportado» (`kind: duplicate`).
  - Coincidencias (`kind: match`): «Reportaron uno encontrado parecido» si el reporte nuevo es perdido; «Su familia podría estar buscándolo» si no.
- **Tarjeta:**
  - portada (`coverUrl`, o «Sin foto»), nombre, chip del estatus, y el chip «Muy parecido» si es `likely`;
  - lugar (`placeLabel` o `city`) · distancia («a 400 m» si es menos de 1 km, «a 1.4 km» si no);
  - fecha relativa de `reportedAt` («Hace 1 semana») · «Reportado por la comunidad» / «Reportado por su familia», solo si el otro está `lost`;
  - hasta 4 chips de `reasons` con las etiquetas de abajo;
  - **Ver reporte**, que abre la ficha.
- **Acciones según el caso:**
  - Si `isMine`: el texto «Ya lo reportaste tú. Puedes actualizar ese reporte en vez de publicar otro.» y solo **Ver mi reporte**.
  - Si es `duplicate` y se puede pedir (regla abajo): **Es mi mascota: pedir el reporte** (principal) y **Dejar comentario**.
  - Si es `duplicate` y no se puede pedir: **Es el mismo: dejar comentario**.
  - Si es `match`: **Es el mío: avisar** (si el reporte nuevo es perdido) o **Es este: avisar a su familia** (si no). Si se puede pedir, también **Pedir el reporte**.
- **Pie:** **No es ninguno, publicar mi reporte** (o **Publicar mi reporte** si solo hay coincidencias) y **Seguir editando**.
- **Al publicar de todos modos,** agrega al `createAnimal` el campo `duplicateCheck: { candidates: [{ id, score }] }` con los `duplicate` que no son `isMine`. El backend solo guarda ids y puntajes, y solo un admin lo lee.

### 3. «Dejar comentario» desde la hoja
- **Pantalla:** cambia a «Agregar información al reporte» con un textarea precargado que la persona puede editar:
  - `duplicate` + reporte perdido + es su mascota: «Yo también estoy buscando a {nombre}. »
  - otro `duplicate`: «Yo también iba a reportar a {nombre}. » (o «a este animal» si no tiene nombre).
  - `match` + reporte perdido: «Creo que es mi mascota (la busco como {nombre}). »
  - `match` + reporte no perdido: «Creo que lo encontré. Está conmigo y se ve igual al de tu reporte. »
- **Envío:** con `CreateAnimalComment`, con `kind: "duplicate_report"` o `kind: "possible_match"` (en coincidencias).
  - Mínimo 5 caracteres. Si no: «Escribe qué sabes: cuándo y dónde lo viste, o cómo contactarte.»
- **Al terminar:** toast «Listo, dejaste tu información» / «Le avisamos a quien lo reportó.». Luego **borra el borrador del reporte** y abre la ficha de ese reporte en la sección de comentarios.

### 4. «Es mi mascota» (pedir el reporte)
- **Cuándo se puede pedir desde la hoja:** la persona dijo que es su mascota, el reporte nuevo es `lost`, el otro no es `isMine`, y además el otro es `match` o tiene `reportedBy: "volunteer"`.
- **Formulario:**
  - mensaje obligatorio (10 a 500 caracteres, con contador), con el label «¿Cómo sabe que es tu mascota?» y el placeholder «Ej.: Se llama Chaneque, se salió el 11 de octubre. Tiene una mancha café en la oreja y su collar es rojo.»;
  - **Tu teléfono** obligatorio (10 dígitos de México, normalizado; precargado con el del formulario o el del perfil);
  - **foto opcional** con su mascota (galería o cámara, convertida a JPG, máximo 5 MB), con la nota «Solo la ven quien reportó y el equipo de Kadesh.».
- **Envío:** con `CreateAnimalClaim`; la foto va en `evidence: { upload }`, igual que las fotos del reporte.
  - Toast «Le avisamos a quien lo reportó» / «Te avisaremos cuando responda tu solicitud.».
  - Desde la hoja, además borra el borrador y abre la ficha.
- **Errores:** el backend los manda como error de validación de Keystone. Muestra el texto que viene después de `- AnimalClaim: ` y, si no hay, «No se pudo enviar la solicitud. Inténtalo de nuevo.». Pueden llegar:
  - «Este reporte ya es tuyo.»
  - «Ya enviaste una solicitud para este reporte. Espera la respuesta.»
  - «Llegaste al máximo de solicitudes por hoy. Intenta mañana.»
  - «Este reporte se unió a otro. Reclama el reporte principal.»

### 5. Ficha del animal
- **Reporte unido:** si `animal.duplicateOf` no es null, reemplaza la navegación por la ficha de `duplicateOf.slug` (o `id`).
- **Botón «Es mi mascota» (visitantes):**
  - Aparece si la persona no puede editar el reporte y además el reporte tiene `reportedBy: "volunteer"` o su estatus actual es `found`, `rescued` o `abandoned`.
  - Texto: «¿Es tu mascota? Si este reporte lo publicó otra persona, pide que pase a tu nombre.»
  - Sin sesión pide cuenta (mismo flujo de cuenta al reportar) y al volver abre la solicitud.
  - Si ya tiene una solicitud `pending` propia (`GetAnimalClaims`, con `claimant.id` igual al suyo): «Pediste que este reporte pase a tu nombre. Te avisaremos cuando quien lo reportó responda.» y **Cancelar solicitud** (`CancelAnimalClaim`).
- **Panel de solicitudes (quien atiende el reporte o admin):**
  - Muestra las `pending` de otras personas: `claimantName` (o «Alguien»), fecha, mensaje, foto (`evidence.url`, se abre completa), **Llamar** (`tel:`), **Aprobar** y **Rechazar**.
  - Encabezado: «Alguien dice que es su mascota», o «N personas dicen que es su mascota».
  - Texto: «Llámale antes de decidir. Si apruebas, el reporte pasa a su nombre, su teléfono queda como contacto principal y tú ya no podrás editarlo.»
  - Confirmación al aprobar: «¿Pasar el reporte a {nombre}?».
  - Usa `ResolveAnimalClaim`, muestra su `message` como toast y, al aprobar, recarga la ficha porque cambió de dueño.
  - Si la ficha se abrió desde la notificación con `reclamo=<id>`, resalta esa solicitud.
- **Comentarios:** pide `kind` y muestra una insignia:
  - `duplicate_report` → «También lo reportó» (ámbar);
  - `possible_match` → «Posible coincidencia» (verde).
- **Corrección de la insignia «Quien reportó»:** ahora solo sale si `animal.user.id` existe y coincide con el autor del comentario. Antes salía en todos cuando los dos eran null.

### 6. Notificaciones
Hay 7 tipos nuevos (campana y push). Todos llevan un `url` absoluto a `https://pet.kadesh.com.mx/animales/{slug}`, y algunos con sufijo:
- `#comentarios`: abre la ficha en los comentarios.
- `?reclamo=<id>`: abre la ficha con esa solicitud resaltada.

Mapéalos a la pantalla de la ficha. Ícono y tono sugeridos:

| Tipo | Cuándo llega | Ícono | Tono |
|---|---|---|---|
| `animal.commented` | alguien comentó en tu reporte | burbuja de chat | marca |
| `animal.duplicate_reported` | alguien iba a reportar el mismo animal y comentó | burbuja de chat | marca |
| `animal.possible_match` | un reporte del otro lado se parece al tuyo | búsqueda | verde |
| `animal.claim_requested` | alguien pide quedarse con tu reporte | usuario con check | marca |
| `animal.claim_approved` | aprobaron tu solicitud: el reporte ya es tuyo | usuario con check | marca |
| `animal.claim_rejected` | rechazaron tu solicitud | usuario con check | marca |
| `animal.merged` | un admin unió tu reporte repetido con el principal | enlace | marca |

## GraphQL

```graphql
query FindAnimalReportDuplicates(
  $phone: String
  $phone2: String
  $animalTypeId: ID
  $name: String
  $sourceUrl: String
  $lat: Float
  $lng: Float
  $status: String
  $sex: String
  $color: String
  $breedId: ID
  $description: String
  $lostDate: DateTime
  $excludeAnimalId: ID
) {
  findAnimalReportDuplicates(
    phone: $phone
    phone2: $phone2
    animalTypeId: $animalTypeId
    name: $name
    sourceUrl: $sourceUrl
    lat: $lat
    lng: $lng
    status: $status
    sex: $sex
    color: $color
    breedId: $breedId
    description: $description
    lostDate: $lostDate
    excludeAnimalId: $excludeAnimalId
  ) {
    id
    name
    slug
    url
    score
    level
    kind
    reasons
    distanceKm
    status
    placeLabel
    city
    reportedAt
    coverUrl
    reportedBy
    isMine
  }
}

# Requiere sesión. `kind` es opcional (default "comment").
mutation CreateAnimalComment($data: AnimalCommentCreateInput!) {
  createAnimalComment(data: $data) {
    id
    comment
    kind
    createdAt
  }
}
# data: { comment, kind: "duplicate_report" | "possible_match" | "comment", animal: { connect: { id } } }

query GetAnimalComments($where: AnimalCommentWhereInput!, $orderBy: [AnimalCommentOrderByInput!]) {
  animalComments(where: $where, orderBy: $orderBy) {
    id
    comment
    kind
    createdAt
    user { id name lastName username verified profileImage { url } }
  }
}

# Agregar a la query de la ficha:
#   duplicateOf { id slug }

# Solo regresa las que te tocan: las tuyas, las del reporte que atiendes, o todas si eres admin.
query GetAnimalClaims($animalId: ID!) {
  animalClaims(where: { animal: { id: { equals: $animalId } } }, orderBy: [{ createdAt: desc }]) {
    id
    status
    message
    phone
    claimantName
    rejectReason
    createdAt
    evidence { url }
    claimant { id }
  }
}

# Requiere sesión. El backend pone quién la pide, el estatus y a quién se le pidió.
mutation CreateAnimalClaim($data: AnimalClaimCreateInput!) {
  createAnimalClaim(data: $data) {
    id
    status
  }
}
# data: { animal: { connect: { id } }, message, phone (10 dígitos), evidence?: { upload } }

mutation ResolveAnimalClaim($claimId: ID!, $approve: Boolean!, $reason: String) {
  resolveAnimalClaim(claimId: $claimId, approve: $approve, reason: $reason) {
    success
    message
    animalSlug
  }
}

mutation CancelAnimalClaim($claimId: ID!) {
  cancelAnimalClaim(claimId: $claimId) {
    success
    message
    animalSlug
  }
}
```

Tipos TypeScript:

```ts
export type SimilarReportKind = 'duplicate' | 'match';
export type SimilarReportReason =
  | 'same_source' | 'same_phone' | 'same_name' | 'similar_name' | 'very_close' | 'close'
  | 'same_sex' | 'same_color' | 'same_breed' | 'similar_description' | 'same_date';

export interface SimilarReport {
  id: string;
  name: string;
  slug: string | null;
  url: string;
  score: number;               // 0–100
  level: 'likely' | 'possible'; // likely ≥ 70, possible ≥ 45
  kind: SimilarReportKind;
  reasons: SimilarReportReason[]; // de mayor a menor peso
  distanceKm: number | null;
  status: string | null;        // estatus actual del otro reporte
  placeLabel: string | null;    // dónde se perdió/encontró
  city: string | null;
  reportedAt: string | null;    // fecha en que se perdió/encontró
  coverUrl: string | null;
  reportedBy: 'owner' | 'volunteer' | null;
  isMine: boolean;
}

export type AnimalCommentKind = 'comment' | 'duplicate_report' | 'possible_match';
export type AnimalClaimStatus = 'pending' | 'approved' | 'rejected' | 'cancelled';

export interface AnimalClaim {
  id: string;
  status: AnimalClaimStatus;
  message: string;
  phone?: string | null;
  claimantName?: string | null; // el User del solicitante no es legible para quien atiende el reporte
  rejectReason?: string | null;
  createdAt: string;
  evidence?: { url: string } | null;
  claimant?: { id: string } | null;
}

export interface AnimalClaimResult {
  success: boolean;
  message: string;
  animalSlug: string | null;
}
```

## Reglas y constantes

**Etiquetas de `reasons`:**

| `reason` | Etiqueta |
|---|---|
| `same_source` | Misma publicación |
| `same_phone` | Mismo teléfono |
| `same_name` | Mismo nombre |
| `similar_name` | Nombre parecido |
| `very_close` | Muy cerca |
| `close` | Cerca |
| `same_sex` | Mismo sexo |
| `same_color` | Mismo color |
| `same_breed` | Misma raza |
| `similar_description` | Señas parecidas |
| `same_date` | Misma fecha |

**Qué hace el backend** (no se replica en la app):
- Busca candidatos a 5 km o menos: perdidos con actividad en 90 días, el resto en 30.
- Excluye los cerrados (`in_family`, `adopted`) y los unidos a otro.
- Máximo 3 resultados por `kind`.

**Estatus y `kind`:**

| Estatus del reporte nuevo | `duplicate` | `match` |
|---|---|---|
| `lost` | `lost` | `found` / `rescued` / `abandoned` |
| `found` / `rescued` / `abandoned` | ese mismo grupo | `lost` |
| `in_adoption` | `in_adoption` | ninguno |

**Solicitudes:**
- Las responde quien atiende el reporte. Si el reporte lo subió la cuenta de automatización de Kadesh, solo un admin.
- Máximo 3 por persona en 24 h y una pendiente por reporte. No se puede pedir un reporte propio ni uno unido a otro.
- **Al aprobar:**
  - el reporte pasa al solicitante, con `reportedBy: owner`;
  - su teléfono queda como `contactNumber`, y el anterior pasa a `contactNumber2` si estaba libre;
  - las demás pendientes se rechazan y se les avisa.

**Privacidad:**
- `findAnimalReportDuplicates` nunca regresa teléfonos ni nombres de quien reportó.
- La foto de evidencia solo la ven quien atiende el reporte, quien lo pidió y los admins.

**Unir reportes:** lo hace un admin en el Admin UI de Keystone poniendo `duplicateOf`. Al unirlos:
- los comentarios y favoritos pasan al principal;
- el repetido deja de salir en `getNearbyAnimals`;
- se rechazan sus solicitudes pendientes;
- quien lo hizo recibe `animal.merged`.

## Referencia web
- `src/components/animals/nuevo/hooks/useSimilarReports.ts`, `SimilarReportsNotice.tsx`, `SimilarReportsSheet.tsx` y la integración en `NewAnimalForm.tsx`.
- `src/components/animals/similarReportsCopy.ts` (textos y etiquetas).
- `src/components/animals/claim/` (formulario, modal y hooks de solicitudes).
- `src/components/animals/detail/ClaimReportButton.tsx`, `AnimalClaimsPanel.tsx` y `AnimalCommentsSection.tsx` (insignias).
- `src/components/animals/queries.ts` (operaciones) y `src/components/notifications/` (tono e íconos por tipo).

## Criterios de aceptación
- [ ] En el reporte, al elegir la ubicación cerca de un reporte parecido, aparece el aviso sin bloquear y **Revisar** abre la hoja.
- [ ] Al publicar con un parecido «muy probable» sin revisar, se abre la hoja; después de verla se puede publicar igual y se manda `duplicateCheck`.
- [ ] «Es el mismo: dejar comentario» publica el comentario con `kind`, borra el borrador y abre la ficha en los comentarios. Quien reportó recibe `animal.duplicate_reported`.
- [ ] «Es mi mascota» manda la solicitud con mensaje, teléfono y foto opcional, y quien atiende el reporte recibe `animal.claim_requested`.
- [ ] En la ficha, quien atiende el reporte ve las solicitudes y aprueba o rechaza. Al aprobar, el solicitante puede editar el reporte y recibe `animal.claim_approved`.
- [ ] El solicitante ve su solicitud pendiente y la puede cancelar.
- [ ] Un reporte con `duplicateOf` abre la ficha principal.
- [ ] Los 7 tipos de notificación nuevos abren la ficha correcta (con comentarios o la solicitud resaltada).
- [ ] Funciona en iOS y Android, en modo claro y oscuro.
- [ ] Maneja carga, error y vacío.
