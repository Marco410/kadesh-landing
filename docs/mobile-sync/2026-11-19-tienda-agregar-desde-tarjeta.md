---
estado: implementado
fecha: 2026-11-19
origen: kadesh-landing@feat/pet-store
feature: shared
---

# Prompt para kadesh-pet-mobile: Tienda (agregar al carrito desde la tarjeta)

Depende de [Tienda: carrito, pago y pedidos](2026-11-19-tienda-carrito-y-pedidos.md).

## Contexto
En la web, las tarjetas del catálogo, de relacionados y de la lista de deseos ya agregan al carrito sin abrir la ficha cuando no hay nada que elegir.

## Qué implementar en la app
- En `ProductCard`, debajo del precio:
  - Si `singleVariantId` no es nulo: botón «Agregar al carrito» que suma una pieza de esa variante al carrito guardado en el teléfono (sin petición) y avisa «Agregado a tu carrito». Si ya hay de ese producto: «Agregar otro (N en tu carrito)». Tope de 20 piezas por línea.
  - Si `singleVariantId` es nulo, el producto lo vende Kadesh, hay stock y `variantsCount` es 2 o más: botón «Elegir opción» que abre la ficha.
  - Mercado Libre (con `affiliateUrl`): botón amarillo «Comprar en Mercado Libre» que abre el enlace de afiliado en el navegador.
  - Agotado: sin botón.
- Destacados (`isFeatured`): etiqueta «Destacado» con estrella y borde ámbar en la tarjeta.
- Tras pagar con PaymentSheet, abrir el pedido basta: el back ya lo marca pagado consultando a Stripe. Si «Pagar» responde `success: true` sin `stripeClientSecret`, el pedido ya está pagado: refrescarlo, sin mensaje de error.
- Pedir los dos campos nuevos en el fragmento de la tarjeta.

## GraphQL
```graphql
# Campos nuevos de StoreCatalogItem (storeCatalog, storeCatalogProduct.related, myStoreWishlist)
variantsCount     # Int!: variantes a la venta; 0 en Mercado Libre
singleVariantId   # ID: solo si lo vende Kadesh, hay stock y tiene una sola variante a la venta
```

## Reglas
- El back decide si se puede agregar directo; la app no cuenta variantes.
- Orden de publicación: back antes que app (son campos nuevos).

## Criterios de aceptación
- [ ] Agregar desde la tarjeta no hace ninguna petición y el globo del carrito sube.
- [ ] Productos con opciones llevan a la ficha.
- [ ] Funciona en modo claro y oscuro, con objetivo táctil de 44 pt o más.
