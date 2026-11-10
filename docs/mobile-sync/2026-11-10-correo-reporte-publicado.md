---
estado: pendiente
fecha: 2026-11-10
origen: kadesh-landing@feat/correo-reporte-publicado
feature: animals
---

# Prompt para kadesh-pet-mobile: enlaces del correo «Tu reporte ya está publicado»

## Contexto
Cuando alguien termina de publicar un reporte (el primer registro y las fotos ya se guardaron), kadesh-back le manda un correo con los datos del animal y lo que puede hacer después: compartirlo, agregar registros, editarlo, activar alertas de zona y avisos por WhatsApp, y, si está perdido o encontrado, impulsarlo en Facebook. **El correo lo manda el backend**: sale igual si el reporte se publicó desde la app y la app no tiene que hacer nada para que salga.

Los botones del correo son enlaces a `https://pet.kadesh.com.mx/...`. La app tiene applinks para `/animales` y `/notificaciones` (`app.json`: `associatedDomains` en iOS, `intentFilters` en Android), así que en un teléfono con la app instalada esos enlaces la abren a ella y no a la web. Hay que asegurarse de que cada uno lleve a una pantalla que funcione.

## Qué implementar en la app

### Enlaces que manda el correo
| Botón del correo | Enlace | Qué debe pasar en la app |
|---|---|---|
| Ver reporte / foto | `/animales/{slug}` | La ficha (ya funciona). |
| Agregar un registro | `/animales/{slug}?accion=registro` | La ficha y luego la pantalla de nuevo registro (ver 1). |
| Editar reporte | `/animales/{slug}/editar` | Pantalla de edición (ya existe). |
| Impulsar en Facebook (solo `lost`/`found`) | `/animales/{slug}?accion=impulsar` | Ver 2. |
| Alertas de zona | `/notificaciones/alertas` | Pantalla de alertas (ya existe). |
| Avisos por WhatsApp | `/notificaciones/ajustes` | **Hoy no existe en la app** (ver 3). |
| Ver todos tus reportes | `/perfil?tab=animals` | El perfil; si la app tiene la pestaña de reportes, abrirla. |

### 1. `?accion=registro` en la ficha
- Al abrir la ficha con `accion=registro`, espera a que carguen la sesión y el animal.
- **Sin sesión**: manda al login y, al entrar, vuelve a la ficha con el mismo `accion` para que se abra la pantalla.
- **Con sesión y permiso de edición** (autor `animal.user.id === usuario.id`, `animal.viewerCanEdit === true` si es de un espacio de rescate en el que participa, o admin): abre la pantalla de nuevo registro con el `id` y el `name` del animal, solo una vez. Hoy la ruta `animales/[slug]/registro` redirige a la ficha si no recibe `id`. Puede navegarse desde la ficha con esos parámetros o resolver el `id` por `slug` (query de abajo).
- **Sin permiso**: muestra la ficha normal, sin error.
- Quita el parámetro después de usarlo (por ejemplo, `router.setParams({ accion: undefined })`), para que al volver a la ficha no se vuelva a abrir.

### 2. `?accion=impulsar`
- Si la app ya tiene la hoja «Impulsar en Facebook e Instagram» (prompt `2026-11-09-difusion-pagada.md`), ábrela con las mismas reglas que el aviso. Debe poder editar, el estado actual (log más reciente) debe ser `lost` o `found` y `duplicateOf` debe ser null. Sin sesión, primero el login.
- Si todavía no la tiene, muestra la ficha normal. No debe dar error ni pantalla en blanco.

### 3. `/notificaciones/ajustes`
Hoy la app abre ese enlace (applink de `/notificaciones`), pero no tiene la ruta: cae en not-found. Elige una:
- **Recomendado**: una pantalla «Ajustes de avisos» con el interruptor «Avisos por WhatsApp» (GraphQL y reglas abajo).
- **Mínimo**: una ruta `notificaciones/ajustes` que abra `https://pet.kadesh.com.mx/notificaciones/ajustes` en el navegador del sistema (`WebBrowser.openBrowserAsync`) y regrese.

## GraphQL

Resolver el animal por slug (si hace falta el `id` y el `name` para la pantalla de registro):

```graphql
query AnimalIdBySlug($slug: String!) {
  animal(where: { slug: $slug }) {
    id
    name
    slug
    viewerCanEdit
    duplicateOf { id }
    user { id }
    logs(orderBy: [{ date_status: desc }, { createdAt: desc }], take: 1) { status }
  }
}
```

Avisos por WhatsApp (para la opción recomendada de 3):

```graphql
query WhatsappNotifications($id: ID!) {
  user(where: { id: $id }) {
    id
    phone
    whatsappNotifications
    whatsappMutedTypes
  }
}

mutation UpdateWhatsappNotifications($id: ID!, $data: UserUpdateInput!) {
  updateUser(where: { id: $id }, data: $data) {
    id
    whatsappNotifications
    whatsappMutedTypes
  }
}
```

```ts
type AnimalDetailAction = 'registro' | 'impulsar';

interface WhatsappNotificationsUser {
  id: string;
  phone: string | null;
  whatsappNotifications: boolean | null;
  /** Tipos de aviso que no quiere por WhatsApp; vacío = todos. */
  whatsappMutedTypes: string[] | null;
}

// Variables de UpdateWhatsappNotifications: solo se manda lo que cambia.
// { id: usuario.id, data: { whatsappNotifications: true } }
// { id: usuario.id, data: { whatsappMutedTypes: ['animal.commented'] } }
```

## Reglas y constantes
- Parámetro: `accion`. Valores: `registro` (agregar registro) e `impulsar` (impulsar en Facebook). Son los mismos que usa la web (`ANIMAL_DETAIL_ACTION`) y el backend. Si cambian, tienen que cambiar en los tres.
- Un valor desconocido de `accion` se ignora.
- **WhatsApp es opt-in**: nunca activarlo por la persona ni por defecto (Meta exige que cada quien acepte).
  - Hace falta un teléfono válido en el perfil: 10 dígitos de México, o 11+ con lada de otro país. Sin él, el interruptor no se puede encender y se manda a editar los datos del perfil. Apagarlo siempre se puede.
  - El teléfono se consulta con la query, no se toma de la sesión, porque puede estar viejo.
  - Se guarda al tocar el interruptor (respuesta optimista y toast si falla). No hay botón Guardar.
- Tipos que se pueden silenciar por separado (`whatsappMutedTypes`), con el texto de la web:

  | Tipo | Nombre | Descripción |
  |---|---|---|
  | `animal.nearby` | Alertas de zona | Un animal perdido o encontrado cerca de ti. |
  | `pet.reminder_due` | Recordatorios de la cartilla | Vacunas, desparasitaciones y otros pendientes de tus mascotas. |
  | `animal.possible_match` | Posibles coincidencias | Un reporte nuevo se parece a uno tuyo. |
  | `animal.commented` | Comentarios en tus reportes | Alguien comenta en un reporte que publicaste. |
  | `animal.claim_requested` | Solicitudes de tus reportes | Alguien dice que el animal de tu reporte es su mascota. |
  | `animal.claim_approved` + `animal.claim_rejected` | Respuestas a tus solicitudes | Aceptaron o rechazaron tu solicitud para quedarte con un reporte. |

## Referencia web
- `src/components/animals/detail/hooks/useDetailAction.ts`: lee `?accion=` una vez y lo quita de la URL.
- `src/app/animales/[slug]/page.tsx`: login si no hay sesión, ignora si no hay permiso.
- `src/components/animals/detail/LogTimeline.tsx` y `src/components/animals/promotion/PromoteReportBanner.tsx`: abren el modal o la hoja.
- `src/components/notifications/WhatsappNotificationsCard.tsx` y `src/components/notifications/README.md` (sección «Avisos por WhatsApp»).
- Correo: kadesh-back `models/Pet/Animal/Animal.publishedEmail.ts` y `utils/helpers/sendgrid.ts` (`buildAnimalPublishedEmailHtml`).

## Criterios de aceptación
- [ ] Con la app instalada, «Agregar un registro» del correo abre la ficha y luego la pantalla de nuevo registro de ese animal (dueño con sesión).
- [ ] Sin sesión, el mismo enlace pide entrar y después abre la pantalla de registro.
- [ ] Con otra cuenta, el enlace solo muestra la ficha.
- [ ] Al volver de la pantalla de registro, no se vuelve a abrir sola.
- [ ] «Impulsar en Facebook» abre la hoja si existe; si no, la ficha. Nunca error.
- [ ] `/notificaciones/ajustes` ya no cae en not-found.
- [ ] Funciona en iOS y Android, en modo claro y oscuro.
- [ ] Maneja carga, error y vacío.
