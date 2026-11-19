---
estado: pendiente
fecha: 2026-11-19
origen: kadesh-landing@feat/pet-store-checkout
feature: shared
---

# Prompt para kadesh-pet-mobile: Tienda (carrito, pago y pedidos)

Depende de [Tienda: catálogo, ficha, lista de deseos y reseñas](2026-11-19-tienda-catalogo.md). Impleméntalo después.

## Contexto
La tienda de la web ya vende: carrito, pago con tarjeta (Stripe) o transferencia bancaria con comprobante, y «Mis pedidos» con el seguimiento de cada paquete. Los productos «Vendido por Kadesh» ahora tienen «Agregar al carrito»; los de Mercado Libre siguen saliendo por su enlace de afiliado y no entran al carrito.

## Qué implementar en la app
- **Carrito** guardado en el teléfono: solo `variantId` y `quantity` por línea. Nunca precios. Máximo 50 líneas y 20 piezas por línea.
- **Cotización**: al abrir el carrito y una pausa (300 a 400 ms) después de cada cambio, pedir `storeCartQuote`. De ahí salen nombres, fotos, precios, envío y total. Si `messages` trae algo, el servidor ajustó cantidades o quitó líneas: actualizar el carrito guardado con las `lines` cuya `quantity` sea mayor a 0 y mostrar los mensajes. Sin temporizadores ni consultas en segundo plano.
- **Botón de compra** en la ficha de un producto de Kadesh: selector de variante, cantidad y «Agregar al carrito». Con `inStock: false`, «Agotado» deshabilitado. Con `stockLeft`, no dejar pedir más de eso.
- **Checkout** en una pantalla: datos de quien compra, dirección, forma de pago y resumen.
  - Con sesión: mostrar nombre y correo; direcciones guardadas (`myStoreAddresses`) para elegir, u otra nueva.
  - Sin sesión: nombre, apellido, correo, teléfono y **una contraseña** (8 caracteres o más). Con esos datos el servidor crea la cuenta junto con el pedido y devuelve `sessionToken`: guardarlo como la sesión y refrescar al usuario antes de salir del checkout. Si responde `EMAIL_EXISTS`, ofrecer iniciar sesión.
  - Formas de pago: las de `quote.paymentMethods` (`stripe_card`, `bank_transfer`).
  - Enviar `expectedTotalCents` con el total de la cotización que la persona vio.
- **Respuesta de `placeStoreOrder`**:
  - `success: false` con `code` `CART_CHANGED` o `PRICE_CHANGED`: no se creó nada; trae `quote` nueva. Mostrar `message` y el carrito actualizado.
  - `success: true`: vaciar el carrito guardado.
  - Con `stripeClientSecret`: confirmar el pago con el SDK de Stripe para React Native (PaymentSheet con ese `clientSecret`). El pedido se marca pagado cuando Stripe le avisa al servidor, no cuando la app lo dice: al terminar, abrir el pedido y, si aún sale sin pagar, mostrar «Estamos confirmando tu pago» con un botón para actualizar.
  - Con `transfer`: abrir el pedido, que muestra los datos bancarios.
- **Mis pedidos** (`myStoreOrders`, paginado de 10) y **detalle** (`myStoreOrder`):
  - Estado en una frase (regla abajo), total y fecha.
  - Si `transfer` no es nulo: monto, banco, beneficiario, CLABE y concepto, cada uno con copiar; fecha límite `transfer.expiresAt`; subir comprobante (foto o captura JPG, PNG o WEBP de hasta 8 MB) con `uploadStoreTransferProof`. Con `proofUploaded`, decir que está en revisión. Con `proofRejectedReason`, mostrar el motivo y dejar subir otro.
  - Si `canPay`: botón «Pagar con tarjeta» → `resumeStoreOrderPayment` → PaymentSheet.
  - Paquetes (`shipments`): `statusLabel`, productos, paquetería, guía y, si hay `trackingUrl`, «Rastrear» en el navegador.
  - Productos, dirección, línea de tiempo (`timeline`), política de devoluciones y «Ayuda con este pedido» por WhatsApp a `supportWhatsapp` (10 dígitos; anteponer 52).
  - Si `canCancel`: «Cancelar pedido» con confirmación.
  - Con el pedido entregado, enlace «Reseñar este producto» por cada línea con `productSlug`.
- Refrescar un pedido al abrirlo o al jalar; nada de polling. Los cambios de estado llegan por push con los tipos `store.order_paid`, `store.order_shipped`, `store.order_delivered`, `store.order_cancelled` y `store.transfer_rejected`; al tocar el aviso, abrir ese pedido (`entityType: "StoreOrder"`; el número viene en la `url`, parámetro `pedido`).

## GraphQL

```graphql
query StoreCartQuote($items: [StoreCartItemInput!]!) {
  storeCartQuote(items: $items) {
    lines { variantId productId slug name variantTitle coverUrl unitPriceCents compareAtPriceCents quantity requestedQuantity lineTotalCents maxQuantity issue }
    itemsCount subtotalCents shippingCents totalCents currency
    freeShippingMinCents missingForFreeShippingCents canCheckout messages paymentMethods returnPolicy
  }
}

query MyStoreAddresses {
  myStoreAddresses { id label recipientName phone street exteriorNumber interiorNumber neighborhood city stateCode stateName postalCode references isDefault }
}

mutation PlaceStoreOrder($input: StorePlaceOrderInput!) {
  placeStoreOrder(input: $input) {
    success message code orderNumber totalCents stripeClientSecret sessionToken
    transfer { bankName beneficiary clabe note reference amountCents expiresAt }
    quote { lines { variantId name quantity requestedQuantity lineTotalCents maxQuantity issue } subtotalCents shippingCents totalCents canCheckout messages paymentMethods }
  }
}

query MyStoreOrders($take: Int, $skip: Int) {
  myStoreOrders(take: $take, skip: $skip) {
    total
    items { number createdAt status paymentStatus fulfillmentStatus paymentMethod totalCents itemsCount firstItemName coverUrl expiresAt }
  }
}

query MyStoreOrder($number: String!) {
  myStoreOrder(number: $number) {
    summary { number createdAt status paymentStatus fulfillmentStatus paymentMethod totalCents itemsCount firstItemName coverUrl expiresAt }
    subtotalCents shippingCents customerNote cancelReason
    address { recipientName phone street exteriorNumber interiorNumber neighborhood city stateCode stateName postalCode references }
    items { id productId productSlug name variantTitle coverUrl quantity unitPriceCents totalCents }
    shipments { id status statusLabel carrier trackingCode trackingUrl shippedAt deliveredAt items }
    timeline { type message createdAt }
    transfer { bankName beneficiary clabe note reference amountCents expiresAt }
    proofUploaded proofRejectedReason canCancel canPay returnPolicy supportWhatsapp
  }
}

mutation UploadStoreTransferProof($orderNumber: String!, $file: Upload!, $reference: String) {
  uploadStoreTransferProof(orderNumber: $orderNumber, file: $file, reference: $reference) { success message }
}

mutation ResumeStoreOrderPayment($orderNumber: String!) {
  resumeStoreOrderPayment(orderNumber: $orderNumber) { success message stripeClientSecret totalCents }
}

mutation CancelMyStoreOrder($orderNumber: String!) {
  cancelMyStoreOrder(orderNumber: $orderNumber) { success message }
}

mutation SaveMyStoreAddress($id: ID, $input: StoreShippingAddressInput!, $isDefault: Boolean) {
  saveMyStoreAddress(id: $id, input: $input, isDefault: $isDefault) { success message address { id label recipientName street exteriorNumber postalCode city stateName isDefault } }
}

mutation DeleteMyStoreAddress($id: ID!) {
  deleteMyStoreAddress(id: $id) { success message }
}
```

Entradas:

```ts
type StoreCartItemInput = { variantId: string; quantity: number };

type StorePlaceOrderInput = {
  items: StoreCartItemInput[];
  paymentMethod: 'stripe_card' | 'bank_transfer';
  address: StoreShippingAddressInput;
  saveAddress?: boolean;          // guardar la dirección en la cuenta
  customerNote?: string | null;   // hasta 500 caracteres
  expectedTotalCents: number;     // total de la cotización que la persona vio
  channel: 'app';
  guest?: { name: string; lastName?: string; email: string; phone: string; password: string; turnstileToken?: string | null } | null; // solo sin sesión
};

type StoreShippingAddressInput = {
  label?: string;
  recipientName: string;   // 3 caracteres o más
  phone: string;           // 10 dígitos
  street: string;
  exteriorNumber: string;  // o «S/N»
  interiorNumber?: string;
  neighborhood: string;    // colonia
  city: string;            // municipio o alcaldía
  state: string;           // clave INEGI de dos dígitos ("16" = Michoacán), nombre o slug
  postalCode: string;      // 5 dígitos
  references?: string;
};
```

## Reglas y constantes
- **El servidor calcula todo el dinero.** La app nunca manda precios; solo variantes, cantidades, dirección y forma de pago.
- `issue` de una línea: `unavailable` (ya no se vende), `out_of_stock`, `quantity_reduced` (hay menos de lo pedido).
- Envío: `shippingCents` (0 = gratis). Si `missingForFreeShippingCents` es mayor a 0, mostrar «Te faltan $X para que el envío sea gratis».
- Códigos de `placeStoreOrder.code`: `STORE_CLOSED`, `LOGIN_REQUIRED`, `EMAIL_EXISTS`, `INVALID` (mostrar `message`), `CART_CHANGED`, `PRICE_CHANGED`, `PAYMENT_UNAVAILABLE`, `PAYMENT_ERROR`.
- **Las mutaciones no se reintentan solas**, sobre todo `placeStoreOrder`: un reintento crearía otro pedido.
- **Estado del pedido en una frase**, en este orden:
  1. `paymentStatus: refunded` → «Reembolsado».
  2. `status: cancelled` → «Cancelado».
  3. `paymentStatus: in_review` → «Revisando tu comprobante».
  4. `paymentStatus` distinto de `paid` → «Falta tu transferencia» (transferencia) o «Falta el pago» (tarjeta).
  5. `fulfillmentStatus`: `delivered` → «Entregado»; `shipped` → «En camino»; `partial` → «Una parte va en camino»; `returned` → «Devuelto»; lo demás → «Preparando tu pedido».
- `shipments.status` para la persona: `preparing`, `ready`, `in_transit`, `delivered`, `exception`, `returned`, `cancelled`. Usar `statusLabel` como texto. El API nunca dice quién surte un paquete: no inventarlo.
- Un pedido sin pagar se cancela solo en `expiresAt` (tarjeta: 60 min; transferencia: 48 h; valores del servidor).
- Límites: 15 pedidos por hora por IP; 30 acciones sobre pedidos por hora por persona. Al pasarse, el back responde `RATE_LIMITED` con un mensaje.
- La llave de caché de las fotos es el `id` del producto, nunca la URL (caduca en 1 h).

## Referencia web
`src/components/store/cart/`, `src/components/store/checkout/`, `src/components/store/orders/` y el README de `src/components/store/`.

## Criterios de aceptación
- [ ] El carrito sobrevive a cerrar la app y nunca guarda precios.
- [ ] Una sola petición de cotización por pausa; ninguna en segundo plano.
- [ ] Comprar sin sesión crea la cuenta y deja a la persona con sesión.
- [ ] Pago con tarjeta con PaymentSheet, incluida una tarjeta que pide autenticación.
- [ ] Transferencia: ver datos, copiar, subir comprobante, y volver a subir si lo rechazan.
- [ ] Si el total cambió, no se cobra y se muestra el nuevo.
- [ ] El detalle del pedido se refresca al abrir y al jalar, sin polling.
- [ ] Funciona en iOS y Android, en modo claro y oscuro.
- [ ] Maneja carga, error y vacío.
