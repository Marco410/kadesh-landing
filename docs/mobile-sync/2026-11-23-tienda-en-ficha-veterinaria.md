---
estado: pendiente
fecha: 2026-11-23
origen: kadesh-landing@develop
feature: veterinaries
---

# Prompt para kadesh-pet-mobile: productos de la tienda en la ficha de la veterinaria y en el blog

## Contexto
La ficha de una veterinaria en la web ahora muestra, al final, una caja discreta «De la tienda Kadesh» con 3 productos destacados de la tienda (foto pequeña, nombre y precio) y un enlace «Ver tienda». La idea es dar a conocer la tienda sin estorbar: no es publicidad de terceros ni compite con los botones de la ficha.

## Qué implementar en la app
- En la pantalla de detalle de veterinaria, debajo de las reseñas, una tarjeta con el mismo estilo que las demás secciones de la ficha (Horarios, Servicios):
  - Encabezado: «De la tienda Kadesh» a la izquierda y «Ver tienda ›» a la derecha (abre la pantalla de la tienda).
  - Lista de hasta 3 productos, uno por fila: miniatura cuadrada de 56 px con esquinas redondeadas, a la derecha el nombre (máximo 2 líneas, texto pequeño) y el precio en negritas. Tocar un producto abre su ficha en la tienda.
  - Sin foto: un fondo gris claro con el ícono `ShoppingBag01Icon`.
- En el detalle de un artículo del blog, la misma caja al final del artículo (antes de los comentarios o de los artículos relacionados, donde quede menos invasiva), con los mismos 3 productos y la misma consulta en memoria. En la web va en la columna derecha del índice y del artículo; si la app tiene una lista del blog, no hace falta ponerla ahí.
- Si la tienda está cerrada, la consulta falla o no devuelve productos, la tarjeta no se muestra (nada de estado de error ni de vacío). Mientras carga, tampoco se muestra (no reserves espacio).
- Una sola consulta, que es la misma para todas las veterinarias: guárdala en memoria durante la sesión (o con caché de 10 min). No la repitas al entrar a otra veterinaria ni en cada render. Si la app ya tiene el interruptor de la tienda (tienda oculta), no hagas la consulta cuando esté apagado.
- Precio: centavos MXN → formato `es-MX` en pesos, sin decimales si son pesos enteros (`$249`), con decimales si no (`$249.50`), igual que en el resto de la tienda de la app.

## GraphQL

```graphql
query StoreShowcase($input: StoreCatalogInput) {
  storeCatalog(input: $input) {
    items {
      id
      slug
      name
      priceCents
      compareAtPriceCents
      coverUrl
      coverAlt
    }
  }
}
```

Variables: `{ "input": { "featured": true, "sort": "featured", "take": 3, "skip": 0 } }` (solo productos marcados como destacados; sin destacados, la caja no se muestra)

```ts
type StoreShowcaseItem = {
  id: string;
  slug: string;
  name: string;
  priceCents: number;            // MXN en centavos
  compareAtPriceCents: number | null; // precio anterior, solo si es mayor (en oferta)
  coverUrl: string | null;       // URL firmada 1 h: llave de caché de la imagen = id, no la URL
  coverAlt: string | null;
};
```

## Reglas y constantes
- Hasta 3 productos, solo los marcados como destacados en el admin (`featured: true`).
- Título fijo: «De la tienda Kadesh». Enlace: «Ver tienda».
- Si `compareAtPriceCents > priceCents`, el lector de pantalla debe oír «(en oferta)» después del precio; visualmente no cambia nada (es una caja discreta).

## Referencia web
`src/components/store/StoreShowcase.tsx`, `src/components/store/server.ts` (`fetchStoreShowcase`), `src/app/veterinarias/[slug]/page.tsx`, `src/components/blog/BlogSidebar.tsx`.

## Criterios de aceptación
- [ ] La tarjeta aparece debajo de las reseñas con 3 productos y abre la ficha del producto y la tienda.
- [ ] Con la tienda cerrada o sin red no aparece y la ficha se ve igual que antes.
- [ ] La caja aparece también al final del detalle de un artículo del blog.
- [ ] Entrar a varias veterinarias o artículos seguidos no repite la consulta.
- [ ] Funciona en iOS y Android, en modo claro y oscuro.
