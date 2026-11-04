---
estado: pendiente
fecha: 2026-11-03
origen: kadesh-landing@feat/panel-cuenta
feature: notifications
---

# Prompt para kadesh-pet-mobile: Avisos por WhatsApp (opt-in, y por tipo de aviso)

## Contexto
En la web, `/notificaciones` tiene ahora una tarjeta **Avisos por WhatsApp** con un interruptor. Quien lo activa recibe por WhatsApp, además de en la campana y en el push, los avisos importantes de Kadesh Pet: animales perdidos o encontrados cerca, recordatorios de la cartilla, posibles coincidencias, y comentarios y solicitudes de sus reportes. Los manda el backend desde el número de Kadesh, con una plantilla aprobada por Meta por cada tipo de aviso. La app solo tiene que ofrecer el mismo interruptor.

En la web la tarjeta ya no está arriba de la bandeja: vive en su propia pantalla, **Ajustes de avisos**, a la que se llega desde la bandeja. Ahí se ve el estado de WhatsApp y de la zona. En la app ponla donde encaje (por ejemplo, un engrane en la pantalla de notificaciones) y usa el nombre de esa pantalla en los textos que la mencionan; abajo dice «Ajustes de avisos».

## Qué implementar en la app
En la pantalla de notificaciones (o en sus ajustes), una tarjeta **Avisos por WhatsApp**:
- Encabezado con el ícono de WhatsApp (`WhatsappIcon` de `@hugeicons/react-native`, en verde de datos), el título "Avisos por WhatsApp" y un interruptor (`Switch`) a la derecha.
- Texto: "Además de aquí, te mandamos por WhatsApp los avisos importantes: animales perdidos o encontrados cerca de ti, recordatorios de la cartilla, posibles coincidencias, comentarios y solicitudes de tus reportes. Puedes apagarlos cuando quieras."
- **Con teléfono válido**: "Llegan al **44 3521 5638** · Cambiar". "Cambiar" lleva a editar el perfil.
- **Sin teléfono válido**: "Para activarlos, agrega tu teléfono a tu perfil." y un botón de contorno "Agregar teléfono" que lleva a editar el perfil. El interruptor no se puede **encender** (deshabilitado); si ya estaba encendido, sí se puede apagar.
- Al tocar el interruptor se guarda al instante (respuesta optimista; si falla, regresa al valor anterior) y se muestra un toast:
  - Encendido: "Avisos por WhatsApp activados · Te escribiremos al {teléfono}."
  - Apagado: "Avisos por WhatsApp desactivados · Seguirás viéndolos aquí, en la campana."
  - Error: "No pudimos guardar · Intenta de nuevo en un momento."
- **Por tipo de aviso**: con el interruptor general encendido y teléfono válido, el texto cambia a "Además de aquí, te mandamos por WhatsApp los avisos que elijas. Puedes cambiarlos cuando quieras." y debajo aparece "Qué te llega por WhatsApp": una lista con un interruptor por aviso (título y descripción):

  | id | Título | Descripción | Tipos (`NOTIFICATION_TYPE`) |
  |---|---|---|---|
  | `nearby` | Alertas de zona | Un animal perdido o encontrado cerca de ti. | `animal.nearby` |
  | `reminders` | Recordatorios de la cartilla | Vacunas, desparasitaciones y otros pendientes de tus mascotas. | `pet.reminder_due` |
  | `matches` | Posibles coincidencias | Un reporte nuevo se parece a uno tuyo. | `animal.possible_match` |
  | `comments` | Comentarios en tus reportes | Alguien comenta en un reporte que publicaste. | `animal.commented` |
  | `claims` | Solicitudes de tus reportes | Alguien dice que el animal de tu reporte es su mascota. | `animal.claim_requested` |
  | `claim-answers` | Respuestas a tus solicitudes | Aceptaron o rechazaron tu solicitud para quedarte con un reporte. | `animal.claim_approved`, `animal.claim_rejected` |

  Si la persona tiene el rol `admin` (`authenticatedItem.roles[].name === "admin"`), un segundo bloque "Administración": Animales nuevos (`animal.created`) · Servicios solicitados (`petplace.service_requested`) · Datos bancarios (`user.bank_details_updated`).

  Cada interruptor se guarda al tocar (optimista), sin toast salvo si falla. Si se apagan todos: "Apagaste todos: no te llegará ningún aviso por WhatsApp." (en ámbar).
- La fila **Alertas de zona** lee las alertas de zona del usuario (`petAlertsEnabled`, `alertRadiusKm`):
  - Si están activas: "Un animal perdido o encontrado a menos de {radio} km de tu zona. **Cambiar zona**", que abre la pantalla de alertas.
  - Si la fila está encendida pero las alertas no están listas (sin centro, o `petAlertsEnabled` falso): "Te falta configurar tu zona para que te lleguen. **Configurar zona**", con un punto ámbar (para lectores de pantalla, "Pendiente:").
  - No decir "apagadas" ni "activar": junto a un interruptor encendido se lee como contradicción.
  - Con la fila apagada, la descripción normal.
- Cada fila lleva un ícono:
  - `RadarIcon` alertas de zona, `InjectionIcon` recordatorios, `SearchVisualIcon` coincidencias.
  - `BubbleChatIcon` comentarios, `UserSearch01Icon` solicitudes, `CheckmarkCircle02Icon` respuestas.
  - Admin: `Megaphone01Icon`, `Stethoscope02Icon` y `CreditCardIcon`.
- Cada grupo muestra su contador ("6 de 6").
- Con WhatsApp apagado o sin teléfono, la lista se ve atenuada y deshabilitada (no oculta), con "Enciende «Avisos por WhatsApp» para elegir cuáles te llegan." o "Cuando agregues tu teléfono podrás elegir cuáles te llegan.".
- Debajo del título, el estado en una palabra: "Encendidos", "Apagados" o "Falta tu teléfono".
- **En la pantalla de Alertas de zona**: después del mapa y el radio, una sección **Cómo te avisamos** con dos filas.
  - "Campana y celular · En Notificaciones y en la app de Kadesh Pet, si la tienes." con "✓ Siempre".
  - "WhatsApp · También al {teléfono}." con un interruptor. Sin teléfono, en lugar del interruptor va el botón "Agregar teléfono".
  - Debajo: "Los demás avisos por WhatsApp (cartilla, comentarios, solicitudes de tus reportes) los eliges en **Ajustes de avisos**."
  - Con "Recibir alertas" apagado, la sección se ve atenuada.
  - El interruptor de WhatsApp se guarda con el mismo botón **Guardar** de la pantalla.
  - Si WhatsApp estaba apagado del todo, encenderlo aquí manda `{ whatsappNotifications: true, whatsappMutedTypes: [todos los tipos de Pet menos animal.nearby] }`. Así solo se activan las alertas de zona y no todo de golpe. El toast termina con "Los demás avisos por WhatsApp los eliges en Ajustes de avisos."
  - Con WhatsApp ya encendido, solo quita o agrega `animal.nearby` en `whatsappMutedTypes`.
- **Centro de la zona**: además de arrastrar el mapa, tocar un punto lo vuelve el centro. El mapa se desliza hasta ahí; sin animación si el sistema pide reducir movimiento. El texto de ayuda es "Toca un punto del mapa o arrástralo para poner el centro, o usa tu ubicación."
- Carga: un esqueleto con la forma de la tarjeta. Error al cargar: no se muestra la tarjeta (la bandeja sigue funcionando).

## GraphQL

```graphql
query WhatsappNotifications($id: ID!) {
  user(where: { id: $id }) {
    id
    phone
    whatsappNotifications
    whatsappMutedTypes
  }
}

# El interruptor general manda { whatsappNotifications }; uno por tipo, { whatsappMutedTypes }.
mutation UpdateWhatsappNotifications($id: ID!, $data: UserUpdateInput!) {
  updateUser(where: { id: $id }, data: $data) {
    id
    whatsappNotifications
    whatsappMutedTypes
  }
}
```

`$id` es el id del usuario con sesión (`authenticatedItem.id`). La persona solo puede cambiar el suyo. `whatsappMutedTypes` es JSON: una lista de tipos; el backend rechaza tipos desconocidos.

```ts
type WhatsappNotificationsUser = {
  id: string;
  phone: string | null;               // "" si no tiene
  whatsappNotifications: boolean | null;
  whatsappMutedTypes: string[] | null; // tipos que NO quiere por WhatsApp; [] = todos
};

/** Encendida si ninguno de sus tipos está silenciado. */
const isCategoryOn = (types: string[], muted: string[]) => !types.some((t) => muted.includes(t));
/** Al apagar se agregan sus tipos; al encender se quitan. Sin duplicados. */
const mutedAfter = (types: string[], muted: string[], on: boolean) => {
  const rest = muted.filter((t) => !types.includes(t));
  return on ? rest : [...rest, ...types];
};
```

## Reglas y constantes
- **Teléfono válido**, la misma regla que usa el backend para mandar:
  - Quitando todo lo que no sea dígito, 10 dígitos de México. Se aceptan con `+52` o `521`, que se quitan.
  - O 11 o más dígitos, con lada de otro país.
  - Formato para mostrar: `XX XXXX XXXX` (México) o `+<dígitos>`.
- Leer el teléfono de la consulta, no de la sesión guardada: pudo cambiar en el perfil.
- Nunca encenderlo por la persona ni por defecto: Meta exige que cada quien lo acepte.
- Se guarda lo **apagado** (`whatsappMutedTypes`), no lo encendido: un tipo nuevo llega por defecto a quien ya tiene el interruptor general activo.
- **Recordatorios de la cartilla**: no hay que elegir un canal "WhatsApp" en cada recordatorio. Con el canal **Notificación** (push) ya llega por WhatsApp a quien activó esto. No mostrar "WhatsApp" como canal nuevo en el formulario de recordatorios.
- **Qué llega por WhatsApp** (una plantilla aprobada por tipo; los demás tipos solo van a la campana):
  - `animal.nearby`
  - `pet.reminder_due`
  - `animal.possible_match`
  - `animal.commented`
  - `animal.claim_requested`, `animal.claim_approved` y `animal.claim_rejected`

## Referencia web
`src/components/notifications/WhatsappNotificationsCard.tsx`, `src/components/notifications/hooks/useWhatsappNotifications.ts` y `src/components/notifications/queries.ts` (`WHATSAPP_NOTIFICATIONS_QUERY`, `UPDATE_WHATSAPP_NOTIFICATIONS_MUTATION`). Backend: `kadesh-back/utils/notifications/whatsapp.ts` y `kadesh-back/models/Notification/README.md`.

## Criterios de aceptación
- [ ] Sin teléfono: el interruptor no se puede encender y "Agregar teléfono" abre la edición del perfil.
- [ ] Con teléfono: se ve formateado; al encender se guarda `whatsappNotifications: true` y sale el toast con el número.
- [ ] Apagarlo funciona aunque se haya borrado el teléfono.
- [ ] Si falla el guardado, el interruptor regresa a su valor anterior.
- [ ] Apagar "Comentarios en tus reportes" guarda `whatsappMutedTypes: ["animal.commented"]`; "Respuestas a tus solicitudes" agrega los dos tipos de respuesta; volver a encender quita solo los suyos.
- [ ] El bloque "Administración" solo aparece a admins.
- [ ] Con la fila de zona encendida y la zona sin configurar, dice "Te falta configurar tu zona…" y lleva a configurarla, sin "apagadas" ni "activar".
- [ ] En Alertas de zona, con WhatsApp apagado del todo, encender WhatsApp y guardar deja encendidas solo las alertas de zona.
- [ ] Tocar un punto del mapa de alertas mueve el centro y habilita Guardar.
- [ ] Funciona en iOS y Android, en modo claro y oscuro.
- [ ] Maneja carga, error y vacío.
