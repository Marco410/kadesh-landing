---
estado: pendiente
fecha: 2026-11-12
origen: kadesh-landing@feat/cerrar-caso-reencuentros
feature: animals
---

# Prompt para kadesh-pet-mobile: seguimiento de casos (recordatorios, casos inactivos y WhatsApp al reportar)

## Contexto
kadesh-back ahora le recuerda a quien atiende un caso abierto que lo cierre o lo actualice: primero a la semana sin registros y otra vez a las 3 semanas. El aviso llega por campana, push, correo y, si lo activó, WhatsApp. Si no hay respuesta, a los 45 días el caso queda **inactivo** y deja de salir en el mapa. Los reportes sin dueño quedan inactivos a los 30 días. Un registro nuevo reactiva el caso. Para que el WhatsApp sí llegue, la web ahora ofrece al publicar un reporte una casilla «Avísame por WhatsApp sobre este reporte». Depende del prompt anterior, [«Cerrar caso»](2026-11-12-cerrar-caso-y-reencuentros.md), que es el que agrega `?accion=cerrar`.

## Qué implementar en la app
1. **Tipo de notificación nuevo `animal.follow_up`.**
   - Título: «¿{nombre} ya volvió a casa?». Cuerpo: según si es el aviso de la semana o el de las 3 semanas.
   - `url`: la ficha (`/animales/{slug}`). Al tocarlo, abre la ficha.
   - Ícono: casa (`Home01Icon`).
   - Si la app tiene una lista de tipos con ícono o texto, agrégalo ahí.
2. **Push con enlace profundo.** El push de este tipo abre la ficha. El correo trae `/animales/{slug}?accion=cerrar` («Ya volvió: cerrar el caso») y `/animales/{slug}?accion=registro` («Sigo buscando: agregar registro»). Si la app abre esos enlaces (universal links), deben abrir la hoja correspondiente.
3. **Caso inactivo en la ficha.** El aviso de «Cerrar caso» (del prompt anterior) cambia de texto cuando `inactiveAt` tiene valor: «Este reporte ya no sale en el mapa porque lleva semanas sin novedades. Ciérralo, o agrega un registro para que vuelva a salir.». Sin `inactiveAt`, el texto sigue igual: «Cierra el caso para que deje de salir como activo en el mapa.»
4. **Casilla al publicar un reporte**, en el paso de los teléfonos, debajo del segundo teléfono:
   - Solo aparece cuando ya cargó el estado de WhatsApp de la persona y aún no le llegan por WhatsApp los avisos de sus reportes. «Le llegan» = `whatsappNotifications` activo y ninguno de los tipos de `OWN_REPORT_TYPES` en `whatsappMutedTypes`.
   - Empieza **desmarcada**. Meta exige que la persona lo acepte.
   - Texto: «Avísame por WhatsApp sobre este reporte», y debajo «Seguimiento, coincidencias y comentarios al {teléfono}. Puedes apagarlos en Notificaciones.».
   - {teléfono} es el del perfil (`User.phone`). Si el perfil no tiene uno válido, se usa el del reporte y el texto agrega «(lo guardamos en tu perfil)».
   - Si no hay ningún teléfono válido, la casilla se deshabilita con el texto «Escribe un teléfono de 10 dígitos para activarlo.»
   - **Después de publicar con éxito**, si estaba marcada, manda `UpdateWhatsappNotifications`:
     - `whatsappNotifications: true`.
     - `whatsappMutedTypes`: la lista actual sin `OWN_REPORT_TYPES`. Si WhatsApp estaba apagado del todo, agrega además los demás tipos de Pet (`animal.nearby`, `pet.reminder_due`, `animal.claim_approved`, `animal.claim_rejected`), para no encenderle todo de golpe.
     - `phone`: solo si el perfil no tenía un teléfono válido.
   - Si esa mutación falla, el reporte ya salió. Muestra el error «No pudimos activar los avisos por WhatsApp. Tu reporte sí se publicó. Actívalos desde Notificaciones.» y sigue a la ficha.
5. **Ajustes de WhatsApp en Notificaciones.** Nueva categoría entre «Posibles coincidencias» y «Comentarios»: «Seguimiento de tus reportes», con la descripción «Un reporte tuyo lleva semanas sin novedades: ciérralo o actualízalo.», tipos `['animal.follow_up']` e ícono de casa.

## GraphQL

La ficha pide además `inactiveAt`:

```graphql
query GetAnimal($where: AnimalWhereUniqueInput!, $orderBy: [AnimalLogOrderByInput!]!) {
  animal(where: $where) {
    id
    inactiveAt
    # …los campos que ya pide la app
  }
}
```

Estado y cambio de los avisos por WhatsApp (ya existían; la mutación ahora puede llevar `phone` y devuelve `phone`):

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
    phone
    whatsappNotifications
    whatsappMutedTypes
  }
}
```

```ts
export const OWN_REPORT_TYPES = [
  'animal.follow_up',
  'animal.possible_match',
  'animal.commented',
  'animal.claim_requested',
] as const;

export interface UpdateWhatsappNotificationsVariables {
  id: string;
  data: { whatsappNotifications?: boolean; whatsappMutedTypes?: string[]; phone?: string };
}

// En el tipo de la ficha:
inactiveAt?: string | null;
```

## Reglas y constantes
- Recordatorios: a los 7 días sin registros y a los 21 (al menos 7 días después del primero). Inactivo a los 45 días (al menos 14 después del segundo); sin dueño, a los 30. Todo esto lo decide el back; la app no calcula nada.
- Cualquier registro nuevo reinicia los recordatorios y reactiva el caso. La app no necesita hacer nada extra.
- Los casos inactivos ya no salen en `getNearbyAnimals`, así que el mapa y la lista de la app los dejan de mostrar solos. La ficha sigue accesible por su enlace.
- Teléfono válido para WhatsApp: 10 dígitos de México, o 11 o más con lada de otro país.
- Nunca actives WhatsApp sin la casilla marcada.

## Referencia web
- `src/components/animals/nuevo/NewAnimalForm.tsx` (casilla y activación después de publicar)
- `src/components/notifications/hooks/useWhatsappNotifications.ts` (`enableForReports`, `OWN_REPORT_TYPES`, `ownReportsOn`)
- `src/components/notifications/constants.ts` (`WHATSAPP_CATEGORIES`, `FOLLOW_UP`)
- `src/components/animals/detail/CloseCaseBanner.tsx`
- Back: `kadesh-back/models/Pet/Animal/Animal.followUp.ts`, `kadesh-back/graphql/customs/mutations/pet/sendAnimalFollowUps.ts`

## Criterios de aceptación
- [ ] El aviso `animal.follow_up` se ve con su ícono y abre la ficha.
- [ ] La ficha de un caso inactivo muestra el texto de inactivo a quien lo atiende.
- [ ] La casilla de WhatsApp sale desmarcada, solo si hace falta, y activa únicamente los avisos de los reportes propios.
- [ ] Si falla la activación, el reporte queda publicado y se avisa.
- [ ] En Notificaciones aparece «Seguimiento de tus reportes».
- [ ] Funciona en iOS y Android, en modo claro y oscuro.
- [ ] Maneja carga, error y vacío.
