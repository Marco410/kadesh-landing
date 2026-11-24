---
estado: pendiente
fecha: 2026-11-23
origen: kadesh-landing@feat/page-views
feature: shared
---

# Prompt para kadesh-pet-mobile: contador de vistas en productos de la tienda y en veterinarias

## Contexto
La web ahora cuenta cuántas personas abren la página de un producto de la tienda y la de una veterinaria, y muestra el total junto a las estrellas («👁 1,234 vistas»). El back decide qué visita cuenta y cuándo enseñar el número; la app solo avisa que se abrió la pantalla y pinta lo que le devuelven.

## Qué implementar en la app
- Al abrir el detalle de un producto de la tienda, llamar **una vez** a `recordStoreProductView(productId)`. Al abrir el detalle de una veterinaria, **una vez** a `recordPetPlaceView(placeId)`. No volver a llamarla al jalar para refrescar ni al regresar a la pantalla desde otra que se abrió encima; sí al entrar de nuevo desde la lista.
- Si responde `viewsCount` con un número mayor que 0, mostrar junto a las estrellas (producto) o junto a «Abierto/Cerrado» (veterinaria): ícono de ojo (`ViewIcon`) + «1 vista» / «1,234 vistas» (formato `es-MX`), en texto pequeño gris.
- Si responde `viewsCount: null`, falla o no hay red: no mostrar nada ni reservar espacio. La pantalla funciona igual.
- Es una mutación: nunca se reintenta sola. No va en la petición de arranque ni en las listas.

## GraphQL

```graphql
mutation RecordStoreProductView($id: ID!) {
  result: recordStoreProductView(productId: $id) { counted viewsCount }
}

mutation RecordPetPlaceView($id: ID!) {
  result: recordPetPlaceView(placeId: $id) { counted viewsCount }
}
```

```ts
type RecordViewResult = {
  counted: boolean;          // si esta visita sumó (informativo; la app no lo usa)
  viewsCount: number | null; // null = no mostrar número
};
```

## Reglas (las aplica el back)
- La misma persona (o IP + navegador sin sesión) suma una vista cada 30 min por producto o ficha.
- No cuentan los admins, los bots ni el dueño de la veterinaria.
- Al público el número llega solo desde 10 vistas; al dueño de la veterinaria y a los admins siempre.

## Referencia web
`src/components/shared/RecordedViews.tsx`, `src/components/store/ProductDetail.tsx`, `src/app/veterinarias/[slug]/VeterinaryDetailClient.tsx`.

## Orden de despliegue
Back antes que la app: las dos mutaciones son nuevas.

## Criterios de aceptación
- [ ] Abrir un producto o una veterinaria manda una sola petición de vista.
- [ ] Con menos de 10 vistas (cuenta normal) no aparece el número; desde 10 sí.
- [ ] Sin red, la pantalla se ve igual que antes.
- [ ] Funciona en iOS y Android, en modo claro y oscuro.
