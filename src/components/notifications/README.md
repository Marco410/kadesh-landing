# Notificaciones

Campana de la barra, `/notificaciones` (bandeja), `/notificaciones/ajustes` (Ajustes de avisos) y `/notificaciones/alertas` (alertas de zona). Las tres páginas viven en el panel con sesión (`app/(cuenta)`, `NotificationsShell`); la campana del sitio público es `NotificationBell` con `tone` `onLight`/`onDark`, y la del panel `tone="dash"`.

- **No leídas**: `useUnreadNotifications`, cada 60 s. Badge "9+".
- **Bandeja**: `useNotificationInbox`, de 20 en 20, agrupada en Hoy / Ayer / Esta semana / Antes (`inbox.ts`).
  - Solo muestra lo que llegó. La configuración vive aparte, en Ajustes de avisos: antes la tarjeta de WhatsApp quedaba arriba de la lista y se mezclaba con los avisos.
  - El estado de los canales lo resume `NotificationChannelsSummary`, que es también el acceso a los ajustes:
    - `rail`: tarjeta "Cómo te avisamos" en una columna lateral sticky de 320 px, desde `xl`. Muestra campana (siempre), WhatsApp (encendido con N de M avisos, apagado o falta teléfono) y zona (radio o "Te falta configurar tu zona"), más el botón "Ajustes de avisos".
    - `strip`: franja arriba de la lista por debajo de `xl`, con WhatsApp y zona en una línea cada uno, para que no se corten.
  - El encabezado no lleva botón "Ajustes": repetiría el de la columna o la franja.
- **Ajustes de avisos** (`/notificaciones/ajustes`): la tarjeta de WhatsApp (general y por tipo) a la izquierda. A la derecha, sticky: el estado de las alertas de zona con su botón y "¿No te llega el WhatsApp?" con tres consejos. En las migas es el detalle de Notificaciones (`useProfileDetailCrumb`), y el menú sigue marcando Notificaciones.
- **Alertas de zona**: `AlertSettingsForm` guarda `petAlertsEnabled`, `alertLat`, `alertLng` y `alertRadiusKm` del propio usuario.
  - **Centro**: se elige arrastrando el mapa o tocando un punto. Al tocar, el mapa se desliza hasta ahí (sin animación con "reducir movimiento") y el centro se confirma al terminar, porque confirmarlo antes cortaría la animación.
  - **Radio**: chips del kit (`DashFilterChips`), con el elegido en tinta. `DirectoryRadiusChips` es de los directorios públicos y no se usa aquí.
  - **"Cómo te avisamos"**: campana y celular (siempre) y WhatsApp (interruptor). Lo de WhatsApp se guarda con el mismo botón Guardar; solo se manda la mutación de lo que cambió.
    - Si WhatsApp estaba apagado del todo, encenderlo aquí activa **solo** las alertas de zona: los demás avisos de Pet quedan silenciados hasta que la persona los elija en Ajustes de avisos. El toast se lo dice, y el enlace de la sección lleva ahí.
    - Con WhatsApp ya encendido, solo quita o pone `animal.nearby` en `whatsappMutedTypes`.
    - Con "Recibir alertas" apagado, la sección se ve atenuada.
- El barril (`index.ts`) exporta `NotificationsShell`, que usa el shell del panel. Por eso la barra del sitio y el shell importan `NotificationBell` y los hooks por su archivo, no por el barril: si no, se forma un ciclo.

## Avisos por WhatsApp

`WhatsappNotificationsCard`, en Ajustes de avisos (`/notificaciones/ajustes`). Es el opt-in de `User.whatsappNotifications`: con él activo, los avisos de la campana también llegan por WhatsApp al `phone` del perfil, desde el número de Kadesh.

- **Qué llega**: animales perdidos o encontrados cerca (alertas de zona), recordatorios de la cartilla, posibles coincidencias, comentarios y solicitudes de los reportes. Cada uno tiene su plantilla `kadesh_pet_*` en kadesh-back (`utils/notifications/whatsapp.ts`, texto en `models/Notification/README.md`). Los demás avisos, como el reporte unido o el duplicado, solo van a la campana.
- **Teléfono**: hace falta uno válido (10 dígitos de México, o 11+ con lada de otro país; la misma regla que el backend). Sin él, el interruptor no se puede encender y la tarjeta manda a Datos del perfil. Apagarlo siempre se puede.
- **Guardado**: al tocar el interruptor (`updateUser`, respuesta optimista), con toast de éxito o error. No hay botón Guardar.
- **Por tipo**: con el interruptor general encendido, "Qué te llega por WhatsApp" muestra un interruptor por aviso (`WHATSAPP_CATEGORIES` en `constants.ts`).
  - Lo apagado se guarda en `User.whatsappMutedTypes` (lista de tipos); vacío = todos. Así un tipo nuevo con plantilla llega sin pedir nada.
  - Las respuestas a una solicitud (aceptada y rechazada) van en un solo interruptor.
  - Los admins ven además "Administración": animales nuevos, servicios solicitados y datos bancarios.
  - Al cambiar uno no hay toast, solo si falla. Si se apagan todos, se avisa que no llegará nada.
  - Cada aviso lleva su ícono y cada grupo, su contador ("6 de 6").
  - Con WhatsApp apagado o sin teléfono, la lista se ve atenuada en vez de desaparecer: se entiende qué se podrá elegir.
  - La fila de Alertas de zona lee las alertas (`useAlertSettings`). Si están activas, dice el radio y ofrece "Cambiar zona".
  - Si la fila está encendida pero las alertas no están listas (sin zona, o con "Recibir alertas" apagado), dice "Te falta configurar tu zona para que te lleguen. **Configurar zona**", con un punto ámbar.
  - Nada de "apagadas" ni "activar": junto a un interruptor encendido se leía como contradicción.
  - Con la fila apagada va la descripción normal.
  - Para agregar un tipo: su plantilla en kadesh-back y una entrada en `WHATSAPP_CATEGORIES`.
- **Recordatorios**: no hace falta elegir un canal "WhatsApp" en cada recordatorio. Salen por WhatsApp con el canal Notificación a quien activó el opt-in.

Qué no hacer:
- No activarlo por la persona ni por defecto: Meta exige que cada quien acepte.
- No prometer en el texto un aviso que no tiene plantilla aprobada.
- No leer el teléfono del `UserContext`: puede estar viejo si se cambió en Datos. La tarjeta lo consulta.
