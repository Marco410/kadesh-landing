---
estado: pendiente
fecha: 2026-11-10
origen: kadesh-landing@develop (backend: kadesh-back@develop)
feature: events
---

# Prompt para kadesh-pet-mobile: eventos — vistas de la ficha y fotos en pantalla completa

## Contexto
En la ficha de un evento la portada se ve recortada: el recuadro es 16:9 y muchos eventos suben un cartel vertical. En la web ahora se toca la portada y se abre en pantalla completa, sin recortes. Además, cada evento cuenta sus **vistas**: la ficha muestra «1,234 vistas» y quien lo publicó también las ve en «Mis eventos».

**Si la app todavía no tiene eventos**, implementa primero `2026-11-04-eventos-ver-y-asistir.md` y `2026-11-04-eventos-publicar.md`, y luego este.

## Qué implementar en la app

### 1. Foto en pantalla completa
- En la ficha del evento, tocar la portada abre un visor a pantalla completa con fondo negro, la foto entera (`contentFit="contain"`), contador «2 / 4», cerrar (botón y gesto de bajar), deslizar entre fotos y pellizcar para hacer zoom.
- Abre en la foto que se estaba viendo. Al cerrar, la portada queda en la última foto vista.
- Sobre la portada, una pastilla «Ver completa» con `FullScreenIcon` (fondo negro al 65 %, texto blanco), para que se note que se puede tocar.
- Si la ficha de animal de la app ya tiene un visor así, reutilízalo.
- Accesibilidad: la portada es un botón con etiqueta «Ver foto en pantalla completa» (con varias fotos: «Ver foto 2 de 4 en pantalla completa»). El botón de cerrar dice «Cerrar».

### 2. Contar y mostrar vistas
- Al abrir la ficha de un evento, llama **una vez** a `recordPetEventView(eventId)` (no en cada render, ni al volver de otra pestaña). Con o sin sesión.
- Muestra el `viewsCount` que devuelve en la línea de números, antes de los asistentes: «1,234 vistas · 12 asistirán · 30 personas interesadas». Singular: «1 vista». Si es 0 o la mutación falla, no muestres las vistas. La ficha funciona igual.
- No muestres un indicador de carga para esto. El número aparece cuando llega.
- En «Mis eventos», cada evento publicado muestra «N vistas · N asistirán · N les interesa · cupo de N». Un cancelado con vistas muestra solo «N vistas». Pide `viewsCount` en esa consulta.
- No llames a la mutación en la vista previa de un evento que aún no es público (en revisión o rechazado). Igual no contaría.

## GraphQL

```graphql
# Nueva. Sin sesión también. Nunca devuelve error: si algo falla, { counted: false, viewsCount: 0 }.
mutation RecordPetEventView($eventId: ID!) {
  recordPetEventView(eventId: $eventId) {
    counted      # si esta visita sumó
    viewsCount   # total de vistas del evento
  }
}

# «Mis eventos»: agrega viewsCount a la consulta que ya existe
query MyPetEvents($userId: ID!) {
  petEvents(where: { user: { id: { equals: $userId } } }, orderBy: [{ createdAt: desc }]) {
    id slug title category city state stateCode timeZone status reviewNote cancelReason
    firstStartsAt lastEndsAt nextStartsAt nextEndsAt capacity interestedCount goingCount
    viewsCount
    multimedia(orderBy: [{ order: asc }], take: 1) { id order image { url } }
  }
}
```

`PetEvent.viewsCount: Int` también se puede leer en `petEvent(where: { slug })`. La web no lo pide ahí y usa el total de la mutación, que viene más fresco.

```ts
export interface RecordPetEventViewResult {
  counted: boolean;
  viewsCount: number;
}

// En el tipo de «Mis eventos»:
// viewsCount: number | null;
```

## Reglas y constantes
- Qué suma una vista (lo decide el backend; la app no filtra nada):
  - solo fichas públicas: publicado, o cancelado después de publicarse;
  - no cuentan quien lo publicó, los admins de plataforma ni los bots;
  - la misma persona suma una vez por evento cada 30 min. Sin sesión, la llave es IP + navegador.
- Aunque no sume (`counted: false`), la mutación devuelve el total para mostrarlo.
- Formato: separador de miles de México (`Intl.NumberFormat('es-MX')`: «1,234»). «vista» en singular y «vistas» en plural.

## Referencia web
- `src/components/events/hooks/useEventViews.ts`: llama a la mutación una vez y guarda el total.
- `src/components/events/EventActions.tsx`: línea «N vistas · N asistirán · …».
- `src/components/events/MyEventsSection.tsx`: vistas en cada evento del panel.
- `src/components/events/EventGallery.tsx` y `src/components/animals/detail/FullscreenCarousel.tsx`: portada que abre el visor.
- Backend: `kadesh-back/graphql/customs/mutations/pet/events/recordPetEventView.ts`, `models/Pet/PetEvent/README.md` (decisión del 2026-11-10).

## Criterios de aceptación
- [ ] Tocar la portada abre la foto completa (un cartel vertical se ve entero), con zoom, deslizar entre fotos y cerrar.
- [ ] Al abrir la ficha se manda una sola llamada a `recordPetEventView`, y el número aparece en la línea de conteos.
- [ ] «1 vista» en singular; con 0 o con error no se muestra nada y la ficha funciona igual.
- [ ] «Mis eventos» muestra las vistas de cada evento publicado.
- [ ] La vista previa de un evento en revisión no llama a la mutación.
- [ ] Funciona en iOS y Android, en modo claro y oscuro.
