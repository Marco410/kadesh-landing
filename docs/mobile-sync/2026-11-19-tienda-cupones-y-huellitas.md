---
estado: pendiente
fecha: 2026-11-19
origen: kadesh-landing@feat/pet-store-coupons
feature: shared
---

# Prompt para kadesh-pet-mobile: Tienda (cupones y huellitas por comprar y reseñar)

Depende de [Tienda: carrito, pago y pedidos](2026-11-19-tienda-carrito-y-pedidos.md). Impleméntalo después.

## Contexto
La tienda ahora acepta un cupón de descuento por pedido y da huellitas: 10 por cada producto distinto que la persona compra y recibe, y 5 por reseñar un producto que compró. Al entregarse el pedido se invita a reseñar.

## Qué implementar en la app
- **Cupón en el carrito y en el checkout**: un enlace «¿Tienes un cupón?» que abre un campo con botón «Aplicar». El código se guarda en el teléfono junto al carrito y viaja en `storeCartQuote(couponCode)`.
  - El campo pasa el código a mayúsculas, sin espacios ni acentos, máximo 40 caracteres, mínimo 3 para aplicar.
  - Respuesta con `couponApplied: true`: mostrar en el resumen la fila «Cupón {couponCode}» con `−couponDiscountCents` (o «Envío gratis» si `couponDiscountCents` es 0), el texto de `couponMessage` y un botón «Quitar».
  - Respuesta con `couponApplied: false` y `couponCode` no nulo: mostrar `couponMessage` como error bajo el campo y **borrar el código guardado**, para no mandarlo otra vez en la siguiente cotización.
  - Si la persona cambia el carrito y el cupón deja de aplicar (ya no llega al mínimo), pasa lo mismo: se quita y se dice por qué.
- **Comprar con cupón**: mandar `couponCode` en `placeStoreOrder` solo si la última cotización lo aplicó, y `expectedTotalCents` con el total ya descontado.
  - `code: "COUPON_INVALID"`: el cupón dejó de aplicar (se agotó, venció). No se creó el pedido. Mostrar `message`, borrar el código guardado y volver a cotizar.
  - Al crear el pedido, borrar el código guardado junto con el carrito.
- **Detalle del pedido**: si `couponCode` no es nulo, una fila «Cupón {couponCode}» con `−couponDiscountCents` (o «Envío gratis») entre el subtotal y el envío.
- **Huellitas**: dos acciones nuevas en el historial y en «Cómo se ganan»:
  - `purchase`: «Recibiste tu compra de la tienda» / «Comprar en la tienda de Kadesh», 10 huellitas.
  - `product_review`: «Reseñaste un producto que compraste» / «Reseñar un producto que compraste», 5 huellitas.
- **Invitación a reseñar**: el push `store.order_delivered` ahora dice «Cuéntanos qué te parecieron tus productos». Al tocarlo se abre el pedido, como antes; ahí cada producto entregado tiene «Reseñar este producto y ganar huellitas».
- **Orden de publicación**: los campos de cupón son nuevos en el back. Hasta que el back esté publicado, una versión de la app que los pida falla en la cotización. Publicar el back primero; si la app sale antes, pedir los campos de cupón en una consulta aparte.

## GraphQL

```graphql
query StoreCartQuote($items: [StoreCartItemInput!]!, $couponCode: String) {
  storeCartQuote(items: $items, couponCode: $couponCode) {
    lines { variantId productId slug name variantTitle coverUrl unitPriceCents compareAtPriceCents quantity requestedQuantity lineTotalCents maxQuantity issue }
    itemsCount subtotalCents shippingCents totalCents
    couponCode couponApplied couponDiscountCents couponMessage
    currency freeShippingMinCents missingForFreeShippingCents canCheckout messages paymentMethods returnPolicy
  }
}

# StorePlaceOrderInput gana un campo opcional: couponCode: String
mutation PlaceStoreOrder($input: StorePlaceOrderInput!) {
  placeStoreOrder(input: $input) {
    success message code orderNumber totalCents stripeClientSecret sessionToken
    transfer { bankName beneficiary clabe note reference amountCents expiresAt }
    quote { subtotalCents shippingCents totalCents couponCode couponApplied couponDiscountCents couponMessage canCheckout messages paymentMethods }
  }
}

query MyStoreOrder($number: String!) {
  myStoreOrder(number: $number) {
    # …lo mismo que antes, más:
    couponCode couponDiscountCents
  }
}
```

## Reglas y constantes
- **Un cupón por pedido.** El descuento es sobre los productos, nunca sobre el envío: `totalCents = subtotalCents − couponDiscountCents + shippingCents`.
- **Un cupón de envío gratis** llega con `shippingCents: 0` y `couponDiscountCents: 0`.
- **El servidor decide si aplica y cuánto descuenta.** La app no calcula descuentos ni valida fechas o límites.
- **Sin sesión**, los límites por persona («ya usaste ese cupón», «solo primera compra») se revisan al comprar, no al cotizar: por eso puede llegar `COUPON_INVALID` aunque la cotización lo haya aplicado.
- **Probar códigos tiene tope**: 20 códigos que no aplicaron cada 10 min por IP. Después, `couponMessage` dice «Probaste demasiados cupones…» y ningún código aplica hasta que pase el tiempo. Un cupón que sí aplica no cuenta.
- **Huellitas por comprar**: 10 por línea del pedido (no por pieza), solo líneas de $100 o más ya con descuento, cuando el paquete se marca entregado. Hasta 3 al día. Los productos de Mercado Libre no dan.
- **Huellitas por reseñar**: 5 con cualquier calificación, solo si la persona compró y recibió ese producto. Hasta 3 al día. Se quitan si borra la reseña o el equipo la oculta.
- Se quitan las de la compra si el pedido se reembolsa o el paquete se devuelve.
- No cuentan para la racha semanal ni para el tope de 60 al día.
- La app no suma huellitas por su cuenta: después de reseñar, el saldo se refresca al abrir la pantalla de huellitas.

## Referencia web
`src/components/store/cart/CouponField.tsx`, `cart/cartStore.ts` (`setCoupon`, `useCartCoupon`), `cart/useCartQuote.ts`, `cart/CartSummary.tsx`, `orders/OrderDetail.tsx` y `src/components/paws/constants.ts`.

## Criterios de aceptación
- [ ] Aplicar un cupón válido muestra el descuento y el total nuevo; «Quitar» lo regresa.
- [ ] Un código que no aplica muestra el motivo del servidor y no se vuelve a mandar.
- [ ] El cupón sobrevive a cerrar la app mientras el carrito siga ahí, y se borra al comprar.
- [ ] `COUPON_INVALID` no deja un pedido a medias: se muestra el motivo y el total sin cupón.
- [ ] El detalle del pedido muestra el cupón usado.
- [ ] El historial de huellitas reconoce `purchase` y `product_review`, también cuando es una reversa.
- [ ] Una sola cotización por pausa; ninguna en segundo plano.
- [ ] Funciona en iOS y Android, en modo claro y oscuro.
- [ ] Maneja carga, error y vacío.
