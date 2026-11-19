---
estado: pendiente
fecha: 2026-11-19
origen: kadesh-landing@feat/pet-store
feature: shared
---

# Prompt para kadesh-pet-mobile: Tienda (catálogo, ficha, lista de deseos y reseñas)

## Contexto
La web estrenó la tienda de Kadesh Pet en `/tienda`: un catálogo de productos para mascotas con ficha, lista de deseos y reseñas. Todavía no hay carrito ni pago (llegan después). Hay dos tipos de producto a ojos de la persona: los que vende Kadesh y los que llevan a Mercado Libre por un enlace de afiliado.

## Qué implementar en la app
- **Tienda** (lista): rejilla de productos con foto, marca, nombre, estrellas, precio, precio anterior tachado y porcentaje de descuento si lo hay, y «Agotado» cuando `inStock` es `false`. Debajo del precio: «Vendido por Kadesh» o «En Mercado Libre · precio aproximado».
- **Filtros**: buscador (pausa de 300 a 400 ms, mínimo 2 letras), categorías (dos niveles: `parentSlug` vacío = principal), marca, «Quién vende» (Todos / Vende Kadesh / En Mercado Libre), «En oferta» y orden. Paginado con `take: 24` y `skip`.
- **Ficha**: galería, marca, nombre, estrellas, descripción corta, precio, opciones (variantes) si hay más de una, disponibilidad («Disponible», «quedan N» con `stockLeft`, «Agotado por ahora»), descripción, reseñas y relacionados.
  - Producto de Kadesh: todavía **no** hay botón de compra. Mostrar el texto «Lo vende Kadesh. La compra en línea llega muy pronto: guárdalo en tu lista de deseos para tenerlo a la mano.»
  - Producto de Mercado Libre: botón «Ver en Mercado Libre» que abre `affiliateUrl` en el navegador externo (`Linking`). Mostrar «Precio aproximado, revisado el <fecha de priceCheckedAt>. El precio final lo ves en Mercado Libre.» y el aviso de afiliado (texto abajo). Sin variantes ni disponibilidad.
- **Lista de deseos**: corazón en cada tarjeta y en la ficha. Sin sesión, manda a iniciar sesión. Con sesión, pide **una vez** todos los ids guardados (`myStoreWishlistIds`) para pintar los corazones; nunca una consulta por tarjeta. Al tocar, cambia al instante y se corrige con la respuesta de la mutación. Pantalla «Lista de deseos» en la cuenta, paginada.
- **Reseñas**: promedio, total y barras por número de estrellas (`ratingBreakdown`, en orden 1 a 5). Lista paginada de 10. Con sesión, formulario de 1 a 5 estrellas con título y texto opcionales; si la persona ya reseñó (`mine`), mostrar la suya con Editar y Borrar. Si `mine.status` es `hidden`, mostrar «El equipo de Kadesh retiró tu reseña de este producto.» y no dejar escribir otra.
- La tienda puede estar cerrada: si `storeCatalogFacets.enabled` es `false`, no mostrar la entrada a la tienda.
- Guardar en memoria durante la sesión las categorías y marcas; no pedirlas en cada apertura.

## GraphQL

```graphql
query StoreCatalog($input: StoreCatalogInput) {
  storeCatalog(input: $input) {
    total
    items {
      id slug name shortDescription seller priceCents compareAtPriceCents currency inStock
      coverUrl coverAlt ratingAverage ratingCount isFeatured
      category { slug name } brand { slug name }
      affiliateUrl priceCheckedAt
    }
  }
}

query StoreCatalogFacets {
  storeCatalogFacets {
    enabled total
    categories { id slug name parentSlug imageUrl count }
    brands { id slug name logoUrl count }
    minPriceCents maxPriceCents
  }
}

query StoreCatalogProduct($slug: String!) {
  storeCatalogProduct(slug: $slug) {
    item { id slug name shortDescription seller priceCents compareAtPriceCents currency inStock coverUrl coverAlt ratingAverage ratingCount isFeatured category { slug name } brand { slug name } affiliateUrl priceCheckedAt }
    description
    images { url alt }
    variants { id title sku priceCents compareAtPriceCents inStock stockLeft }
    animalTypes
    ratingBreakdown
    related { id slug name seller priceCents compareAtPriceCents inStock coverUrl ratingAverage ratingCount brand { slug name } }
  }
}

query StoreProductReviewsList($productId: ID!, $take: Int, $skip: Int) {
  storeCatalogReviews(productId: $productId, take: $take, skip: $skip) {
    total
    items { id rating title body verifiedPurchase adminReply status createdAt author { name username avatarUrl level { level key label } } }
    mine { id rating title body verifiedPurchase adminReply status createdAt }
  }
}

mutation SubmitStoreProductReview($input: StoreProductReviewInput!) {
  submitStoreProductReview(input: $input) { success message reviewId ratingAverage ratingCount }
}

mutation DeleteMyStoreProductReview($productId: ID!) {
  deleteMyStoreProductReview(productId: $productId) { success message reviewId ratingAverage ratingCount }
}

query MyStoreWishlistIds { myStoreWishlistIds }

query MyStoreWishlist($take: Int, $skip: Int) {
  myStoreWishlist(take: $take, skip: $skip) {
    total
    items { id slug name seller priceCents compareAtPriceCents inStock coverUrl ratingAverage ratingCount brand { slug name } }
  }
}

mutation SetStoreWishlist($productId: ID!, $saved: Boolean!) {
  setStoreWishlist(productId: $productId, saved: $saved) { success message saved }
}
```

Entradas:

```ts
type StoreCatalogInput = {
  search?: string | null;
  categorySlug?: string | null; // una categoría principal incluye a sus subcategorías
  brandSlug?: string | null;
  seller?: 'kadesh' | 'mercado_libre' | null;
  onSale?: boolean | null;
  /** featured (por defecto) | newest | price_asc | price_desc | rating | best_selling */
  sort?: string | null;
  take?: number; // máximo 48
  skip?: number;
};

type StoreProductReviewInput = { productId: string; rating: number; title?: string; body?: string };
```

## Reglas y constantes
- **Dinero en centavos de MXN** (`priceCents: 25000` = $250). `compareAtPriceCents` solo viene cuando es mayor que el precio.
- `seller`: `kadesh` o `mercado_libre`. El API nunca dice de qué proveedor es un producto de Kadesh; no inventar ese dato en ningún texto.
- **Estrellas**: todo producto empieza con `ratingCount: 0`; mostrar «Sin reseñas todavía». No hay calificaciones de otros sitios.
- **Reseña**: `rating` entero de 1 a 5 (obligatorio), título hasta 120 caracteres, texto hasta 2000. Una por persona y producto: mandar otra la edita. Las mutaciones devuelven `success` y `message` (mostrar el mensaje) y el promedio y total nuevos del producto.
- **«Compra verificada»**: mostrar la insignia cuando `verifiedPurchase` es `true`.
- **Aviso de afiliado** (siempre visible junto al botón): «Enlace de afiliado: si compras, Kadesh recibe una comisión de Mercado Libre sin costo extra para ti.»
- **Fotos**: `coverUrl` e `images.url` pueden ser URL firmadas que caducan en 1 h. La llave de caché de imagen es el `id` del producto (y la posición de la foto), nunca la URL.
- **Lista de deseos**: máximo 500 productos; si se llena, la mutación responde `success: false` con su mensaje.
- Las mutaciones nunca se reintentan solas.
- Límite contra abuso: 20 reseñas al día y 120 cambios de lista de deseos por hora por persona; al pasarse, el back responde `RATE_LIMITED` con un mensaje para mostrar.

## Referencia web
`src/components/store/` (README con las reglas), `src/app/tienda/page.tsx`, `src/app/tienda/[slug]/page.tsx`.

## Criterios de aceptación
- [ ] La lista pagina con `take`/`skip` y busca en el servidor con pausa.
- [ ] Los corazones de una lista salen de una sola consulta.
- [ ] Un producto de Mercado Libre abre el enlace de afiliado en el navegador y muestra el aviso.
- [ ] Un producto de Kadesh no muestra botón de compra.
- [ ] Reseñar, editar y borrar actualizan estrellas y lista sin recargar la ficha completa.
- [ ] Con la tienda cerrada (`enabled: false`) no hay entrada a la tienda.
- [ ] Funciona en iOS y Android, en modo claro y oscuro.
- [ ] Maneja carga, error y vacío.
