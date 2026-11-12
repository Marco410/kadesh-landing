---
estado: pendiente
fecha: 2026-11-04
origen: kadesh-landing@feat/eventos (backend: kadesh-back@feat/pet-events)
feature: events
---

# Prompt para kadesh-pet-mobile: eventos — publicar, «Mis eventos», editar y cancelar

## Contexto
Cualquier persona con sesión puede publicar un evento (campaña de esterilización, jornada de vacunación, feria de adopción, colecta, voluntariado, taller…). Queda **en revisión** hasta que un admin lo aprueba en Operaciones; entonces se publica y se avisa a la gente de la zona. Este prompt cubre publicar y administrar los propios eventos; verlos y seguirlos va en `2026-11-04-eventos-ver-y-asistir.md` (impleméntalo primero).

Depende del backend `kadesh-back` rama `feat/pet-events` desplegado con su migración.

## Qué implementar en la app
1. **Publicar evento** (botón en la lista de eventos y en «Mis eventos»). Sin sesión, pedir cuenta primero con el texto «Pedimos una cuenta para que cada evento tenga a alguien responsable detrás.». Un formulario en 5 partes:
   1. **Qué**: tipo (9 categorías con ícono y color), título (5–120), «De qué se trata» (20–5000, con contador), especies opcionales (los tipos de animal: Perros, Gatos, Aves, Peces, Reptiles, Mamíferos; ver «Especies» en `2026-11-04-eventos-ver-y-asistir.md`. Actualizado el 2026-11-10: antes eran Perros, Gatos, Otros) y hasta **6 fotos** (`expo-image-picker` + `expo-image-manipulator`: JPEG, lado mayor ≤ 2560 px, ≤ 5 MB; la primera es la portada).
   2. **Dónde y para quién**: buscador de dirección + mapa con pin (el mismo selector que usa «Reportar animal»), «Nombre del lugar» opcional (`placeLabel`, p. ej. «Explanada del Jardín Morelos»). **¿A quién le avisamos?**: «Una zona» (+ radio 5/10/20/50 km), «El municipio», «El estado»; «Todo México» solo para admins (rol `admin`). Debajo, explica: «Avisaremos a quienes tienen su zona de alertas en Morelia. El aviso sale al publicarse (o 14 días antes, si falta más) y cada persona recibe como máximo 3 al día.».
   3. **Cuándo**: lista de fechas (1–30). Cada una: día, «De» y «A» (hora), y «Dura varios días» que muestra «Termina el» (máx. 7 días). Botones «Agregar otra fecha» (copia la última +7 días) y «Repetir cada semana» → «hasta el [fecha]» → genera la fecha 1 cada 7 días (reemplaza las demás). Las horas se capturan en la zona horaria del **estado del pin** (ver tabla abajo) y se mandan en UTC; si no es CDMX, aviso «Las horas van en el horario de Tijuana».
   4. **Costo, cupo y registro**: «Gratis» / «Con costo o cuota» (precio entero en pesos y/o nota), cupo opcional («Al llenarse se cierra "Asistiré"»), link de registro opcional, WhatsApp de registro opcional (10 dígitos), requisitos opcionales.
   5. **Quién organiza**: si la persona tiene veterinarias verificadas, «Lo organiza mi veterinaria» (select); nombre de quien organiza y teléfono de contacto opcionales; **redes sociales del evento** (opcionales): Facebook, Instagram, TikTok, X y sitio web, con el texto «Pega el link o escribe el usuario (@tu_cuenta). Se muestran en la ficha para que la gente los siga.». Teclado de URL, sin mayúscula automática ni autocorrección.
   - Botón: «Enviar a revisión» (admins: «Publicar evento»). Mientras guarda muestra «Guardando el evento…» y luego «Subiendo fotos…»; no se puede enviar dos veces. Primero `submitPetEvent`; con el `event.id`, sube las fotos con `createPetEventMultimedias`. Al terminar, toast con el `message` del backend y abre «Mis eventos» (o la ficha si quedó `approved`).
   - Valida igual que el backend antes de mandar (abajo). Si el backend responde `success: false`, muestra su `message`. Si responde `RATE_LIMITED` (más de 5 eventos al día), muestra el mensaje del error.
2. **Mis eventos** (en el perfil, grupo «Mis publicaciones»): lista con portada, título, chip de estado («En revisión» ámbar, «Publicado» verde, «Necesita cambios» rojo, «Cancelado» gris, «Terminó» gris si ya pasó), tipo · próxima fecha · municipio, y para publicados «N asistirán · N les interesa». Si fue rechazado, recuadro rojo «Qué cambiar: <reviewNote>». Acciones: Ver, Editar (o «Corregir» si fue rechazado) y «Cancelar evento» (no en cancelados ni pasados). Vacío: «Aún no has publicado un evento» + «Publicar evento».
3. **Editar**: el mismo formulario precargado (fechas convertidas a la zona del evento). Fotos ya subidas con botón para quitarlas (`deletePetEventMultimedia`) y las nuevas se agregan con `order` siguiente. `updateMyPetEvent` manda el formulario completo. Aviso antes de guardar si estaba publicado: «Al guardar, el evento vuelve a revisión antes de publicarse otra vez.». Las fechas guardadas que ya pasaron se pueden conservar; las nuevas no pueden ser en el pasado.
4. **Cancelar**: diálogo «¿Cancelar este evento?» con motivo opcional («lo verán los interesados») y «No se puede deshacer». `cancelPetEvent`; toast «Evento cancelado».

## GraphQL

```graphql
mutation SubmitPetEvent($input: PetEventInput!) {
  submitPetEvent(input: $input) { success message event { id slug status } }
}

mutation UpdateMyPetEvent($id: ID!, $input: PetEventInput!) {
  updateMyPetEvent(id: $id, input: $input) { success message event { id slug status } }
}

mutation CancelPetEvent($id: ID!, $reason: String) {
  cancelPetEvent(id: $id, reason: $reason) { success message event { id slug status } }
}

# input PetEventSessionInput { startsAt: String!  endsAt: String! }   # ISO en UTC
# input PetEventInput {
#   title: String!  category: String!  species: [String!]  description: String!  requirements: String
#   organizerName: String  contactPhone: String  petPlaceId: ID
#   lat: Float!  lng: Float!  placeLabel: String  address: String  neighborhood: String  city: String  state: String
#   scope: String!  reachKm: Int  isFree: Boolean!  price: Int  priceNote: String  capacity: Int
#   registrationUrl: String  registrationWhatsapp: String
#   facebookUrl: String  instagramUrl: String  tiktokUrl: String  xUrl: String  websiteUrl: String   # link o @usuario
#   sessions: [PetEventSessionInput!]!
# }

mutation CreatePetEventMultimedias($data: [PetEventMultimediaCreateInput!]!) {
  # data: [{ event: { connect: { id } }, image: { upload: <archivo> }, order: 1 }]
  createPetEventMultimedias(data: $data) { id order image { url } }
}

mutation DeletePetEventMultimedia($id: ID!) {
  deletePetEventMultimedia(where: { id: $id }) { id }
}

query MyPetEvents($userId: ID!) {
  petEvents(where: { user: { id: { equals: $userId } } }, orderBy: [{ createdAt: desc }]) {
    id slug title category city state stateCode timeZone status reviewNote cancelReason
    firstStartsAt lastEndsAt nextStartsAt nextEndsAt capacity interestedCount goingCount
    multimedia(orderBy: [{ order: asc }], take: 1) { id order image { url } }
  }
}

query MyVerifiedPetPlaces($userId: ID!) {
  petPlaces(where: { user: { id: { equals: $userId } }, claimStatus: { equals: "verified" } }, take: 20) {
    id
    name
  }
}
```

Para editar se precarga con `PetEventBySlug` (prompt anterior); solo quien lo publicó (`user.id`) o un admin pueden.

```ts
export interface PetEventInput {
  title: string; category: string; species: string[]; description: string; requirements: string | null;
  organizerName: string | null; contactPhone: string | null; petPlaceId?: string | null;
  lat: number; lng: number; placeLabel: string | null; address: string | null; neighborhood: string | null;
  city: string | null; state: string | null; scope: 'zone' | 'city' | 'state' | 'national'; reachKm: number | null;
  isFree: boolean; price: number | null; priceNote: string | null; capacity: number | null;
  registrationUrl: string | null; registrationWhatsapp: string | null;
  facebookUrl: string | null; instagramUrl: string | null; tiktokUrl: string | null; xUrl: string | null; websiteUrl: string | null;
  sessions: Array<{ startsAt: string; endsAt: string }>;
}

export interface PetEventMutationResult {
  success: boolean;
  message: string;
  event: { id: string; slug: string | null; status: 'pending' | 'approved' | 'rejected' | 'cancelled' } | null;
}
```

## Reglas y constantes
Validación (Zod en la app; el backend repite todo y responde `success: false` con el mensaje):
- Título 5–120; descripción 20–5000; requisitos ≤ 1000; organizador ≤ 120; nombre del lugar ≤ 160; nota del costo ≤ 120.
- Pin obligatorio y dentro de México («Por ahora solo publicamos eventos en México.»). El backend completa municipio y estado si faltan.
- Alcance «El municipio» exige municipio reconocido; «Todo México» solo admins.
- Fechas: 1–30; fin después de inicio; cada una ≤ 7 días; ninguna nueva en el pasado (10 min de tolerancia); todas dentro de 12 meses; no dos que empiecen a la misma hora; al menos una por venir.
- Costo: con costo, precio entero ≥ 1 o nota obligatoria.
- Cupo: entero ≥ 1 o vacío. Teléfonos: 10 dígitos (acepta +52, espacios y guiones). Link: http(s) con dominio.
- Redes (todas opcionales; manda el link ya normalizado, el backend lo vuelve a validar):
  - Es **usuario** si empieza con `@` o no parece link (sin `http`, sin `/`, sin `www.` y sin el dominio de la red): debe cumplir `^[A-Za-z0-9._-]{1,60}$` («Revisa el usuario de Instagram.») y se arma el link: Facebook `https://www.facebook.com/<u>`, Instagram `https://www.instagram.com/<u>`, TikTok `https://www.tiktok.com/@<u>`, X `https://x.com/<u>`. Así «refugio.morelia» es un usuario de Instagram, no un dominio.
  - Si es **link**, el dominio (sin `www.`, `m.`, `mobile.`, `web.`) debe ser de la red: Facebook `facebook.com`, `fb.com`, `fb.me`; Instagram `instagram.com`; TikTok `tiktok.com`; X `x.com`, `twitter.com`. Si no: «El link de Instagram debe ser de instagram.com.».
  - Sitio web: cualquier link http(s) («El link del sitio web no es válido.»).
- Fotos: máx. 6 por evento en total.
- **Revisión**: si no es admin, `submitPetEvent` deja el evento `pending`. Editar uno `approved` o `rejected` lo regresa a `pending` (también subir o cambiar una foto). Cancelar no requiere revisión. Mensajes de éxito del backend: «¡Listo! Tu evento está en revisión. Te avisaremos en cuanto se publique.», «Guardamos los cambios. El evento vuelve a revisión y se publicará otra vez al aprobarse.».
- **Avisos que recibe quien lo publica**: `event.approved` («Tu evento ya está publicado»), `event.rejected` («Tu evento necesita cambios», con el motivo; su `url` es `https://pet.kadesh.com.mx/perfil?tab=events` → abrir «Mis eventos»).
- Límite: 5 eventos publicados por persona al día.
- Zona horaria por estado (para capturar horas): BC `America/Tijuana`; BCS, Nayarit y Sinaloa `America/Mazatlan`; Sonora `America/Hermosillo`; Chihuahua `America/Chihuahua`; Q. Roo `America/Cancun`; Campeche y Yucatán `America/Merida`; Coahuila, Durango, Nuevo León y Tamaulipas `America/Monterrey`; el resto `America/Mexico_City`. El estado sale del texto de la geocodificación («Michoacán de Ocampo», «CDMX», «México» = Estado de México…).

## Referencia web
`src/components/events/form/{EventForm.tsx,SessionsEditor.tsx,eventFormModel.ts,EventFormPage.tsx}`, `src/components/events/MyEventsSection.tsx`, `src/components/events/queries.ts`, `src/app/eventos/nuevo`, `src/app/eventos/[slug]/editar`.

## Criterios de aceptación
- [ ] Se publica un evento con varias fechas, «Repetir cada semana» y fotos; queda «En revisión» en «Mis eventos».
- [ ] Las horas guardadas coinciden con las capturadas en la zona del estado (prueba con un pin en Tijuana).
- [ ] Editar precarga todo, conserva las fechas pasadas y regresa a revisión si estaba publicado.
- [ ] Las redes aceptan link o @usuario, rechazan un link de otra red y se ven en la ficha.
- [ ] Cancelar pide confirmación y el evento queda «Cancelado».
- [ ] Un rechazo muestra el motivo y «Corregir» abre el formulario.
- [ ] Funciona en iOS y Android, en modo claro y oscuro.
- [ ] Maneja carga, error y vacío.
