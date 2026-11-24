---
estado: implementado
fecha: 2026-11-20
origen: kadesh-landing@feat/pet-store
feature: shared
---

# Prompt para kadesh-pet-mobile: tienda sin doble cobro, carrito sin clics perdidos, stock en la tarjeta y comprobante por WhatsApp

## Contexto
En la prueba de la tienda web, tres toques casi a la vez en «Continuar al pago» crearon tres pedidos y el cobro de Stripe cayó en uno distinto del que se veía: la persona terminó pagando dos veces. El back ahora acepta una llave por intento de pago y responde el mismo pedido a cada repetición. También salieron errores de carrito y de la tarjeta de producto que la app puede tener igual.

## Qué implementar en la app
1. **Una llave por intento de pago.** Al tocar «Continuar al pago» se genera `checkoutKey` (por ejemplo `Crypto.randomUUID()` de `expo-crypto`; 16 a 64 letras, dígitos, `-` o `_`) y se manda en `placeStoreOrder`. Se reutiliza en cada reintento del mismo intento (timeout, error de red) y se descarta solo cuando la respuesta trae `success: false`. Si la respuesta es `success: true` con tarjeta pero sin `stripeClientSecret`, el pedido ya estaba pagado: ir directo al pedido como pagado.
2. **El botón de pagar se bloquea en el mismo toque**, con una referencia (`useRef`) además del estado: dos toques en el mismo frame ven el estado viejo.
3. **Carrito: «−» y «+» parten de la cantidad guardada en el carrito local, no de la última cotización** (que llega una pausa después). Tres toques rápidos deben bajar tres piezas.
4. **Tarjeta de producto**: con `singleVariantId`, no agregar más de `singleVariantMaxQuantity` piezas de esa variante. Al llegar al tope, el botón se desactiva y dice «Ya tienes todas (N) en tu carrito».
5. **Reseñas**: `storeCatalogReviews` trae `ratingAverage` y `ratingCount` actuales; úsalos para las estrellas del encabezado de reseñas en vez de los del producto, que pueden venir de caché.
6. **Al cerrar sesión** vaciar el carrito y su cupón guardados en el teléfono.
7. **Teléfono en checkout y direcciones**: aceptar espacios, guiones y lada `+52` (o `+52 1`); mandar los 10 dígitos.
8. **Errores del formulario**: marcar cada campo con problema con su mensaje y llevar el foco/scroll al primero, no un solo mensaje junto al botón.
9. **Comprobante por WhatsApp.** En un pedido con transferencia sin pagar y con `supportWhatsapp` en el detalle, el botón principal es «Mandar comprobante» (verde WhatsApp, ícono `WhatsappIcon`). Abre con `Linking.openURL` `https://wa.me/52<10 dígitos>?text=<mensaje>`, con este mensaje (saltos de línea reales):

   ```
   Hola, te mando el comprobante de mi transferencia del pedido KP-XXXXXXXX.

   Total: $258
   Concepto: KP-XXXXXXXX
   A nombre de: <address.recipientName>

   Productos:
   • 2 × Croquetas (Adulto 3 kg)

   Adjunto la foto del comprobante.
   ```

   Debajo: «Se abre WhatsApp con los datos de tu pedido. Adjunta la foto o captura de tu comprobante y envíalo. Te avisamos por correo en cuanto confirmemos tu pago.» Subir el comprobante en la app queda detrás de «Prefiero subirlo aquí». Sin `supportWhatsapp`, se ve como hoy.
10. **La tarjeta revisa el stock antes de agregar.** El catálogo puede venir de caché. Al tocar «Agregar al carrito» en una tarjeta, pedir `storeCartQuote(items: [{ variantId, quantity: <en el carrito> + 1 }])` (una petición por toque, nunca al montar). Si la línea no viene, trae `issue` `unavailable` u `out_of_stock`, o su `quantity` no sube, no agregar: avisar «Se acaba de agotar» (o «Ya tienes todas las que quedan (N)») y dejar el botón en «Agotado». Si la petición falla, agregar igual: el carrito vuelve a cotizar.
11. **«+» y «−» con toques muy seguidos**: calcular desde el valor guardado en ese momento (actualización funcional del estado), no desde el valor que pintó la pantalla.
12. **Un aviso de tarjeta rechazada se borra al cambiar la tarjeta** (evento `onChange` del formulario de Stripe).
13. **Checkout con el carrito vacío** (por ejemplo, al volver justo después de pagar): mostrar un enlace a «Mis pedidos» además de «Ir a la tienda».

## GraphQL

```graphql
# placeStoreOrder: input con el campo nuevo
mutation PlaceStoreOrder($input: StorePlaceOrderInput!) {
  placeStoreOrder(input: $input) {
    success message code orderNumber totalCents stripeClientSecret sessionToken
    transfer { bankName beneficiary clabe note reference amountCents expiresAt }
  }
}
# StorePlaceOrderInput.checkoutKey: String

# En los campos de StoreCatalogItem que pide la app:
#   singleVariantMaxQuantity   # Int, solo con singleVariantId

# En storeCatalogReviews:
#   ratingAverage   # Float!
#   ratingCount     # Int!
```

```ts
type StorePlaceOrderInput = { /* …lo de antes… */ checkoutKey?: string | null };
type StoreCatalogItem = { /* … */ singleVariantMaxQuantity: number | null };
type StoreCatalogReviewsResult = { total: number; items: StoreReview[]; mine: StoreReview | null; ratingAverage: number; ratingCount: number };
```

Orden de despliegue: el back con estos campos va antes que la versión de la app que los pide.

## Reglas y constantes
- Tope por línea del carrito: 20 piezas.
- La llave se rechaza si no cumple el formato (`code: INVALID`): genera una nueva.
- Un pedido con esa llave que ya se canceló responde `success: false`: nueva llave y otro intento.

## Referencia web
`src/components/store/checkout/CheckoutPage.tsx` (`checkoutKeyRef`, `submittingRef`), `src/components/store/cart/CartPage.tsx` (`CartRow` con `quantity`), `src/components/store/cart/CardCartButton.tsx`, `src/components/store/ProductReviews.tsx` (`applyPage`), `src/components/auth/hooks/useLogout.ts`.

## Criterios de aceptación
- [ ] Tres toques rápidos en «Continuar al pago» crean un solo pedido y un solo cobro.
- [ ] Un reintento tras perder la red responde el mismo pedido.
- [ ] Tres toques rápidos en «−» bajan tres piezas.
- [ ] La tarjeta no deja agregar más que el stock.
- [ ] Un producto que se agotó después de cargar el catálogo dice «Se acaba de agotar» al tocarlo y no entra al carrito.
- [ ] Al cerrar sesión el carrito queda vacío.
- [ ] «Mandar comprobante» abre WhatsApp con el mensaje del pedido.
- [ ] Funciona en iOS y Android, en modo claro y oscuro.
