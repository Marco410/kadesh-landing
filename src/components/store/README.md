# Store (tienda)

`/tienda`, `/tienda/<slug>`, `/tienda/carrito`, `/tienda/pagar` y «Pedidos» en Mi cuenta: la tienda de Kadesh Pet. Un catálogo con dos tipos de producto a ojos de la persona:

| `seller` | Qué ve | Qué puede hacer |
|---|---|---|
| `kadesh` | «Vendido por Kadesh» | Agregar al carrito y comprar aquí, guardar en su lista y reseñar. |
| `mercado_libre` | «En Mercado Libre», precio aproximado con fecha | Ir a Mercado Libre por el enlace de afiliado, guardar y reseñar. |

Los productos de Kadesh pueden ser propios o de un proveedor que surte por nosotros; eso es interno y el API nunca lo dice. No nombrar al proveedor en ningún texto.

El back está en `kadesh-back/models/Pet/Store/` (ver su README). Se administra en kadesh-business → Operaciones → Kadesh Pet → Tienda.

## Encendido

Dos interruptores, los dos apagados por defecto:

- `STORE_ENABLED=true` en kadesh-back: abre el API. Apagado, `/tienda` y cada producto responden 404.
- `NEXT_PUBLIC_STORE_ENABLED=true` aquí: muestra «Tienda» y el carrito en el menú, y «Pedidos» y «Lista de deseos» en Mi cuenta.

Para cobrar con tarjeta hace falta `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` (la misma cuenta de Stripe que el back).

Enciende primero el back, revisa `/tienda` y luego el del menú.

## Piezas

| Qué | Dónde |
|---|---|
| Tipos del API | `types.ts` |
| Tamaños de página, caché, textos fijos | `constants.ts` |
| Datos desde el servidor (10 min) | `server.ts` |
| Operaciones del navegador | `queries.ts` (campos compartidos en `fields.ts`) |
| Filtros ↔ URL | `searchParams.ts` |
| Listado | `StoreListingPage.tsx` (servidor) + `StoreIndexClient.tsx` (filtros y «Ver más») |
| Tarjeta | `ProductCard.tsx` |
| Ficha | `ProductDetail.tsx` (servidor) + `ProductGallery.tsx`, `ProductBuyBox.tsx`, `ProductReviews.tsx` |
| Lista de deseos | `StoreWishlist.tsx` (proveedor y corazón), `MyWishlistSection.tsx` (`/perfil?tab=deseos`) |
| Carrito | `cart/cartStore.ts` (en `localStorage`; también guarda el código del cupón), `cart/useCartQuote.ts` (cotización del servidor), `cart/CartPage.tsx`, `cart/CartSummary.tsx`, `cart/CouponField.tsx` (campo del cupón, en carrito y checkout), `cart/CartLink.tsx` (menú) |
| Checkout | `checkout/CheckoutPage.tsx`, `checkout/AddressFields.tsx`, `checkout/StripePayStep.tsx` |
| Pedidos | `orders/MyOrdersSection.tsx` (`/perfil?tab=pedidos`), `orders/OrderDetail.tsx` (`&pedido=<folio>`) |
| Metadata y JSON-LD | `store-seo.ts` |

## Reglas

- **Precios en centavos** de MXN; se formatean con `formatPrice`.
- **Estrellas**: todo producto empieza en cero. Solo cuentan las reseñas escritas aquí; no se muestran calificaciones de otros sitios.
- **Una reseña por persona y producto**, de 1 a 5 estrellas; título y texto son opcionales. Se puede editar o borrar. Si el equipo de Kadesh la oculta, su autor ve el aviso y no puede volver a publicarla.
- **«Compra verificada»** sale cuando el back lo marca (llega con los pedidos).
- **Enlace de afiliado**: siempre con `rel="sponsored nofollow noopener"`, en pestaña nueva y con el aviso `AFFILIATE_DISCLOSURE` a la vista. El precio dice «aproximado» y la fecha en que se revisó.
- **El carrito solo guarda qué y cuánto** (`variantId`, `quantity`), en `localStorage`. Nombres, precios, envío y total salen de `storeCartQuote` cada vez. Si el servidor baja una cantidad o quita una línea, el carrito guardado se corrige y se explica por qué.
- **Cupón**: uno por pedido. El código vive junto al carrito (`cart.setCoupon`) y viaja en cada cotización; el servidor dice si aplica (`couponApplied`), cuánto descuenta y por qué (`couponMessage`). Aquí no se calcula ningún descuento ni se revisan fechas o límites.
- **Un código que no aplica no se guarda**: se muestra el motivo y se borra del carrito, así la siguiente cotización va sin él. El back cuenta los códigos que no aplicaron (20 cada 10 min por IP).
- **El campo del cupón no es un `<form>`**: vive dentro del formulario del checkout. Enter en el campo aplica el código; no hace el pedido.
- **Huellitas por comprar y reseñar**: las da el back (10 por producto distinto recibido, 5 por reseñar lo comprado). Aquí solo están sus textos, en `src/components/paws/constants.ts`.
- **El total que se paga lo fija el servidor.** El checkout manda el total que la persona vio (`expectedTotalCents`); si cambió, no se crea el pedido y se muestra el nuevo.
- **Comprar sin cuenta**: el checkout pide nombre, correo, teléfono y una contraseña, y la cuenta se crea con el pedido, ya con sesión. No hay recuperación de contraseña en el sitio, por eso la contraseña la elige la persona. Si el correo ya tiene cuenta, se le pide iniciar sesión.
- **Tarjeta**: el pedido se crea primero y luego se paga en el formulario de Stripe, en la misma página. El pedido pasa a pagado cuando Stripe le avisa al back; al llegar del pago, el pedido puede decir unos segundos «Estamos confirmando tu pago» con un botón para actualizar. Si se cierra la página, se paga después desde el pedido.
- **Transferencia**: el pedido muestra banco, beneficiario, CLABE, monto y concepto (el folio) con botón de copiar, y recibe el comprobante (JPG, PNG o WEBP de hasta 8 MB). Si el equipo lo rechaza, se muestra el motivo y se puede subir otro.
- **Un pedido sin pagar se cancela solo** a la hora que dice (60 min con tarjeta, 48 h con transferencia) y también lo puede cancelar la persona.
- **El pedido no nombra a quien surte**: cada paquete dice su estado, paquetería y guía.
- **Mercado Libre no entra al carrito**: su único botón es el enlace de afiliado.
- **Agotado**: se muestra, no se oculta. Con stock bajo la ficha dice cuántos quedan.
- **Filtros en la URL** (`?q=&categoria=&marca=&vende=&oferta=1&orden=`): cambiar uno navega y el servidor pinta de nuevo. Las vistas filtradas llevan `noindex` y su canónica es `/tienda`.

## Carga al back

| Momento | Peticiones |
|---|---|
| Abrir `/tienda` | Ninguna del navegador sin sesión; el servidor pide catálogo y filtros una vez cada 10 min por combinación de filtros. Con sesión, una (`MyStoreWishlistIds`) para todos los corazones. |
| «Ver más» | Una (`StoreCatalogMore`). |
| Escribir en el buscador | Una navegación por pausa de 350 ms, con 2 letras o más. |
| Abrir un producto | El servidor pide ficha y primeras reseñas cada 10 min. Con sesión, dos del navegador: los corazones y `StoreProductReviewsList` (trae la reseña propia). |
| Guardar o quitar de la lista | Una mutación; el corazón se corrige con la respuesta, sin volver a pedir la lista. |
| Reseñar | Una mutación y una consulta de reseñas. |
| Agregar al carrito, ver el globo del menú | Ninguna: es `localStorage`. |
| Abrir el carrito o cambiarlo | Una (`StoreCartQuote`) por pausa de 350 ms. |
| Aplicar o quitar un cupón | Una (`StoreCartQuote`, la misma, con el código). Un código rechazado no dispara otra. |
| Abrir el checkout | La cotización y, con sesión, `MyStoreAddresses`. |
| Comprar | Una mutación (`PlaceStoreOrder`). Con tarjeta, lo demás va directo a Stripe. |
| Abrir «Pedidos» | Una (`MyStoreOrders`). Abrir un pedido: una (`MyStoreOrder`), sin polling; se vuelve a pedir tras subir el comprobante, pagar o cancelar. |

Sin polling. Las fotos subidas llevan URL firmada por 1 h: por eso la caché es de 10 min y las páginas no se prerenderizan.

Las fotos van con `<img>`, no con `next/image`: pueden venir de cualquier host (subidas o enlazadas).

## Decisiones

### 2026-11-19 — tienda: catálogo, ficha, lista de deseos y reseñas

Qué: listado y ficha pintados por el servidor, con la lista de deseos y las reseñas en el navegador.

Por qué:
- **Tono**: Kadesh es un santuario de bienestar animal, no un marketplace. La tienda dice quién vende cada cosa y de dónde salen las estrellas, sin urgencias ni contadores.
- **Un corazón por tarjeta sin una petición por tarjeta**: `StoreWishlistProvider` pide todos los ids guardados una vez (mismo modelo que `MyPostFavorites` del blog).
- **Reseñas con dos fuentes**: la primera página llega del servidor (cacheada y visible sin JS); la reseña propia depende de la sesión y la pide el navegador.
- **Sin imagen en Open Graph**: la URL firmada de la foto caduca en 1 h y una tarjeta compartida la guardaría. Pendiente una ruta `/tienda/<slug>/og` como la de eventos.

Qué no hacer:
- No pedir datos del producto otra vez en el navegador: ya vienen del servidor.
- No guardar precios en el carrito ni mandar montos al back.
- No marcar un pedido como pagado en el front: lo dice el back.
- No consultar el estado del pedido en un temporizador.
- No subir la caché arriba de 1 h ni prerenderizar fichas mientras las fotos sean firmadas.

### 2026-11-19 — carrito, pago y pedidos

Qué: carrito en el navegador con cotización del servidor, checkout de una página, pago con Stripe Elements o transferencia, y «Pedidos» en Mi cuenta.

Por qué:
- **Carrito sin proveedor de React ni tabla en el back**: un almacén de módulo leído con `useSyncExternalStore`. Cualquier componente lo usa, el menú muestra el globo sin pedir nada y dos pestañas quedan iguales por el evento `storage`.
- **Checkout en una sola página**: datos, dirección y pago se ven juntos con el total a un lado. Menos pasos donde abandonar.
- **Pedidos dentro de Mi cuenta** (`/perfil?tab=pedidos`): ahí ya está la sesión y el resto de lo que la persona sigue. Por eso el checkout espera a que la sesión nueva esté lista antes de mandarla ahí.
- **Sin polling del estado**: el cambio llega por correo y por la campana; la pantalla se actualiza al abrirla.

### 2026-11-19 — cupones y huellitas

Qué: campo de cupón en carrito y checkout, fila del cupón en el resumen y en el pedido, y los textos de las dos acciones nuevas de huellitas.

Por qué:
- **El código en el mismo almacén que el carrito**: una sola escritura cambia líneas y cupón, así `useCartQuote` cotiza una vez. Con dos almacenes, corregir el carrito y quitar el cupón en la misma respuesta disparaba una cotización de más.
- **Quitar el código rechazado en vez de dejarlo**: dejarlo lo mandaría en cada cambio del carrito y el back lo contaría como un intento más de adivinar códigos.
- **Mandar `couponCode` al comprar solo si la cotización lo aplicó**: el total esperado y el cupón salen de la misma respuesta.

Qué no hacer:
- No restar el descuento en el navegador ni mostrar un total que no venga de la cotización.
- No envolver `CouponField` en un `<form>`.

## Pendientes

- Editar y borrar direcciones guardadas desde Mi cuenta (hoy se guardan al comprar y se eligen en el checkout).
- Productos en `sitemap.xml` y tarjeta para compartir (`/og`).
- Registrar los clics al enlace de afiliado (hoy solo los cuenta el portal de Mercado Libre).
