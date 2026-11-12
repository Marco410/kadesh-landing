---
estado: pendiente
fecha: 2026-11-04
origen: kadesh-landing@feat/eventos (backend: kadesh-back@feat/pet-events)
feature: events
---

# Prompt para kadesh-pet-mobile: eventos — ver, «Me interesa / Asistiré» y avisos

## Contexto
Kadesh Pet ahora tiene **eventos**: campañas de esterilización, jornadas de vacunación, ferias de adopción, colectas, etc. Los publica la comunidad y el equipo de Kadesh los revisa antes de que sean públicos. En la web hay una sección `/eventos` con filtros, una ficha por evento, un bloque en la portada y avisos a la gente de la zona. Este prompt cubre **ver y seguir** eventos; publicar va en `2026-11-04-eventos-publicar.md`.

Depende del backend `kadesh-back` rama `feat/pet-events` desplegado con su migración.

## Qué implementar en la app
1. **Lista de eventos** (pestaña o sección «Eventos»):
   - Muestra los próximos eventos publicados con `petEventsFeed`, ordenados por su próxima fecha. Paginación de 12 (`take`/`skip`, «Ver más» o scroll infinito con `total`).
   - Filtros: estado y municipio (opciones de `petEventFacets`: solo aparecen lugares con eventos, con su conteo), tipo (las 9 categorías), «Esta semana» / «Este mes» (mandar `to` = fin del domingo o del mes, 23:59 hora de CDMX) y **«Cerca de mí»** (con `expo-location`: `lat`, `lng`, `radiusKm: 100`; los eventos nacionales siempre salen).
   - Tarjeta: portada (o fondo con el color e ícono del tipo), chip del tipo, cuadrito con mes y día, rango de la próxima fecha («Sáb 8 nov · 9:00 – 14:00») y «+N fechas» si `sessionsCount > 1`, lugar, «Gratis» / costo, «N asistirán» y distancia si viene `distanceKm`. Etiqueta «Cancelado» o «Cupo lleno» cuando aplique.
   - Vacío: «Todavía no hay eventos próximos» + botones «Publicar evento» y «Avísame cuando haya uno cerca» (a la pantalla de alertas).
2. **Ficha del evento** (por `slug`; también se abre desde los avisos, cuya `url` es `https://pet.kadesh.com.mx/eventos/<slug>`):
   - Galería, chip del tipo, título, «Organiza …» (veterinaria ligada o `organizerName`) y municipio/estado.
   - «De qué se trata» (respeta saltos de línea), «Para: Perros, Gatos», recuadro «Antes de ir» con `requirements`.
   - «Dónde»: lugar, dirección, mapa con pin (MapLibre RN) y «Cómo llegar» (`Linking` a `https://www.google.com/maps/search/?api=1&query=<lat>,<lng>`).
   - Tarjeta lateral (o bloque): fechas próximas (máx. 5 visibles y «Ver las N fechas»), costo, cupo, a quién va dirigido («Zona de 10 km», «Todo Morelia», «Todo Michoacán», «Todo México»), teléfono (`tel:`).
   - **«Síguelos»**: botones con ícono para las redes que tenga el evento (`facebookUrl`, `instagramUrl`, `tiktokUrl`, `xUrl`, `websiteUrl`, en ese orden; se ocultan las vacías). El texto es el usuario («@refugio.morelia», sacado del primer segmento de la ruta) o el nombre de la red si el link es de una publicación, un evento o un perfil por número (`/events/…`, `/p/…`, `/reel/…`, `/people/…`, `profile.php?id=…`); para el sitio web, el dominio. Abren con `Linking.openURL`. Íconos: `Facebook01Icon`, `InstagramIcon`, `TiktokIcon`, `NewTwitterIcon`, `Globe02Icon`.
   - Botones: «Regístrate» (`registrationUrl`), «Regístrate por WhatsApp» (`https://wa.me/52<registrationWhatsapp>?text=…`), **«Me interesa»** y **«Asistiré»** (alternan; tocar el activo lo quita), «Agregar al calendario» (`expo-calendar` con la próxima fecha, o el link de Google Calendar), «Compartir» (`Share`, con la URL web) y «Editar evento» si la persona es quien lo publicó.
   - Sin sesión, «Me interesa» / «Asistiré» abren el flujo de cuenta y regresan a la ficha.
   - Avisos en la ficha: «Este evento se canceló» (+ motivo), «Este evento ya pasó» (si `lastEndsAt` < ahora; se ocultan los botones de interés y calendario).
   - Si el evento no es público pero es de la persona (en revisión o rechazado), se ve igual con un aviso «En revisión — solo tú ves esta página» o «Necesita cambios» + `reviewNote`.
3. **Fechas y horas**: todas vienen en UTC. Muéstralas en la zona horaria del evento (`timeZone`, p. ej. `America/Tijuana`), no la del teléfono. Si no es `America/Mexico_City`, añade «Horario de Tijuana» (Mazatlán, Hermosillo, Chihuahua, Cancún, Mérida, Monterrey).
4. **Avisos**: tipos nuevos en la campana (todos `product: "pet"`), con ícono de calendario y el link `url`:
   - `event.nearby` (evento en su zona), `event.reminder` (un día antes), `event.updated` (cambió fecha o lugar), `event.submitted` (solo admins), `event.approved` (verde), `event.rejected` y `event.cancelled` (rojo).
   - El push llega igual que las alertas de zona (Expo, mismo `TokenNotification`).
5. **Pantalla de alertas de zona**: agrega un interruptor **«Avisos de eventos»** (`eventAlertsEnabled`, encendido por defecto) con el texto «Campañas de esterilización, vacunación y ferias de adopción en tu zona, tu municipio o tu estado. Como máximo 3 al día.». Usa la **misma zona** (centro y radio) que las alertas de mascotas; si no hay centro, añade «Para recibirlos, elige el centro de tu zona en el mapa.». Bajo el mapa muestra «Tu zona está en Morelia, Michoacán» con `alertCity` + nombre del estado de `alertStateCode` (o «Al guardar ubicamos el municipio y el estado de este punto» si se movió el centro). Se guarda con el mismo `updateUser`.

## GraphQL

```graphql
fragment EventCard on PetEvent {
  id
  slug
  title
  category
  city
  state
  stateCode
  timeZone
  placeLabel
  neighborhood
  scope
  reachKm
  isFree
  price
  priceNote
  capacity
  status
  firstStartsAt
  lastEndsAt
  nextStartsAt
  nextEndsAt
  sessionsCount
  interestedCount
  goingCount
  isFull
  multimedia(orderBy: [{ order: asc }], take: 1) { id order image { url } }
}

query PetEventsFeed($input: PetEventsFeedInput!) {
  petEventsFeed(input: $input) {
    total
    items {
      nextStartsAt
      nextEndsAt
      distanceKm
      event { ...EventCard }
    }
  }
}
# input PetEventsFeedInput {
#   state: String      # slug ("michoacan") o clave INEGI ("16")
#   city: String       # llave del municipio ("morelia", "san-luis-potosi")
#   category: String
#   to: String         # ISO: la próxima fecha empieza antes de esto
#   lat: Float  lng: Float  radiusKm: Float
#   sort: String       # "date" (default) | "distance"
#   past: Boolean      # eventos que ya terminaron
#   take: Int = 12  skip: Int = 0
# }

query PetEventFacets {
  petEventFacets {
    code
    slug
    name
    count
    cities { key name count }
  }
}

query PetEventBySlug($slug: String!) {
  petEvent(where: { slug: $slug }) {
    id slug title category species description requirements organizerName contactPhone
    lat lng placeLabel address neighborhood city state stateCode timeZone
    scope reachKm isFree price priceNote capacity registrationUrl registrationWhatsapp
    facebookUrl instagramUrl tiktokUrl xUrl websiteUrl
    status reviewNote cancelReason firstStartsAt lastEndsAt nextStartsAt nextEndsAt
    interestedCount goingCount isFull myInterest createdAt updatedAt
    user { id }
    petPlace { id name slug }
    sessions(orderBy: [{ startsAt: asc }]) { id startsAt endsAt }
    multimedia(orderBy: [{ order: asc }]) { id order image { url } }
  }
}

mutation SetPetEventInterest($eventId: ID!, $kind: String) {
  # kind: "interested" | "going" | null (quitar)
  setPetEventInterest(eventId: $eventId, kind: $kind) {
    success
    message
    kind
    interestedCount
    goingCount
    isFull
  }
}

query PetAlertSettings($id: ID!) {
  user(where: { id: $id }) {
    id
    petAlertsEnabled
    alertLat
    alertLng
    alertRadiusKm
    eventAlertsEnabled
    alertCity
    alertStateCode
  }
}

mutation UpdatePetAlertSettings($id: ID!, $data: UserUpdateInput!) {
  # data: { petAlertsEnabled, alertLat, alertLng, alertRadiusKm, eventAlertsEnabled }
  # alertCity / alertStateCode los calcula el backend: no se mandan.
  updateUser(where: { id: $id }, data: $data) {
    id petAlertsEnabled alertLat alertLng alertRadiusKm eventAlertsEnabled alertCity alertStateCode
  }
}
```

```ts
export type EventStatus = 'pending' | 'approved' | 'rejected' | 'cancelled';
export type EventScope = 'zone' | 'city' | 'state' | 'national';
export type EventInterestKind = 'interested' | 'going';
export type EventCategory =
  | 'esterilizacion' | 'vacunacion' | 'adopcion' | 'desparasitacion' | 'consulta'
  | 'colecta' | 'voluntariado' | 'taller' | 'otro';

export interface EventSession { id: string; startsAt: string; endsAt: string }

export interface PetEvent {
  id: string; slug: string | null; title: string; category: EventCategory; species: string[] | null;
  description: string; requirements: string | null; organizerName: string | null; contactPhone: string | null;
  lat: number; lng: number; placeLabel: string | null; address: string | null; neighborhood: string | null;
  city: string | null; state: string | null; stateCode: string | null; timeZone: string | null;
  scope: EventScope; reachKm: number | null; isFree: boolean; price: number | null; priceNote: string | null;
  capacity: number | null; registrationUrl: string | null; registrationWhatsapp: string | null;
  facebookUrl: string | null; instagramUrl: string | null; tiktokUrl: string | null; xUrl: string | null; websiteUrl: string | null;
  status: EventStatus; reviewNote?: string | null; cancelReason: string | null;
  firstStartsAt: string | null; lastEndsAt: string | null; nextStartsAt: string | null; nextEndsAt: string | null;
  sessionsCount?: number | null; interestedCount: number | null; goingCount: number | null; isFull: boolean | null;
  myInterest?: EventInterestKind | null; user?: { id: string } | null;
  petPlace: { id: string; name: string | null; slug: string | null } | null;
  sessions: EventSession[]; multimedia: Array<{ id: string; order: number | null; image: { url: string | null } | null }>;
}
```

## Reglas y constantes
- **Categorías** (valor → etiqueta / título para avisos / color de fondo con texto blanco / ícono hugeicons):
  `esterilizacion` Esterilización / Campaña de esterilización / #7c3aed / MedicalMaskIcon · `vacunacion` Vacunación / Jornada de vacunación / #0369a1 / VaccineIcon · `adopcion` Adopción / Feria de adopción / #e11d48 / Home01Icon · `desparasitacion` Desparasitación / Jornada de desparasitación / #0f766e / MedicineBottle01Icon · `consulta` Consulta médica / Jornada médica / #4f46e5 / Stethoscope02Icon · `colecta` Colecta / Colecta / #b45309 / GiftIcon · `voluntariado` Voluntariado / Voluntariado / #15803d / UserGroupIcon · `taller` Taller o plática / Taller / #a21caf / TeacherIcon · `otro` Otro / Evento / #475569 / Calendar03Icon.
- **Especies** (actualizado el 2026-11-10; antes eran `dog`, `cat`, `other`): los mismos tipos de animal que un reporte (`ANIMAL_TYPE_OPTIONS` del backend), en este orden y con etiqueta en plural: `dog` Perros, `cat` Gatos, `bird` Aves, `fish` Peces, `reptil` Reptiles, `mammal` Mamíferos. En la ficha: «Para: Perros, Gatos, Aves». Hay eventos viejos con `other`: muéstralo como «Otros» al final, pero **no lo reenvíes al editar** (filtra `species` a los seis valores antes de mandar `updateMyPetEvent`; el backend lo descarta de todos modos).
- **Estados del evento**: `pending` «En revisión», `approved` «Publicado», `rejected` «Necesita cambios», `cancelled` «Cancelado». El público ve `approved` y los `cancelled` que llegaron a publicarse; quien lo publicó ve los suyos en cualquier estado.
- **Lugar**: municipio y estado como «Morelia, Michoacán»; si son iguales («Ciudad de México»), una sola vez.
- **Costo**: `isFree` → «Gratis»; si no, «$150» y/o `priceNote` («Cuota de recuperación»).
- **Cupo**: con `capacity`, «Asistiré» se deshabilita y dice «Cupo lleno» cuando `isFull` (salvo que la persona ya esté en «Asistiré»). «Me interesa» siempre se puede. La mutación responde `success: false` con mensaje si ya no hay lugar: muéstralo y usa los conteos que devuelve.
- **Recordatorio**: a quien marcó cualquiera de los dos le llega `event.reminder` ~24 h antes de cada fecha (lo manda el backend).
- **Avisos de zona** (los aplica el backend): `event.nearby` llega si la zona de la persona toca el área del evento, o si el evento es de su municipio, su estado o nacional. Máximo 3 al día, nunca el mismo evento dos veces, nunca a quien lo organiza; sale al publicarse, o 14 días antes si falta más.
- **Estados de México**: el filtro usa el slug (`michoacan`, `ciudad-de-mexico`, `estado-de-mexico`, `nuevo-leon`, `san-luis-potosi`, `quintana-roo`, `baja-california`, `baja-california-sur`…), y `alertStateCode` es la clave INEGI ("01"–"32"). Zonas horarias por estado: BC `America/Tijuana`; BCS, Nayarit y Sinaloa `America/Mazatlan`; Sonora `America/Hermosillo`; Chihuahua `America/Chihuahua`; Q. Roo `America/Cancun`; Campeche y Yucatán `America/Merida`; Coahuila, Durango, Nuevo León y Tamaulipas `America/Monterrey`; el resto `America/Mexico_City`.

## Referencia web
`src/components/events/` (EventCard, EventsIndexClient, EventDetail, EventActions, format.ts, constants.ts, mexicoStates.ts, queries.ts), `src/app/eventos/`, `src/components/notifications/AlertSettingsForm.tsx`, `src/components/notifications/{constants.ts,inbox.ts,NotificationList.tsx}`.

## Criterios de aceptación
- [ ] La lista muestra los próximos eventos y los filtros por estado, municipio, tipo, fecha y «Cerca de mí» cambian los resultados.
- [ ] La ficha muestra las fechas en la hora del lugar del evento.
- [ ] «Me interesa» / «Asistiré» guardan, se pueden quitar, actualizan los conteos y respetan el cupo.
- [ ] Un aviso `event.*` abre la ficha correcta.
- [ ] El interruptor «Avisos de eventos» se guarda y se ve el municipio y estado de la zona.
- [ ] Funciona en iOS y Android, en modo claro y oscuro.
- [ ] Maneja carga, error y vacío.
