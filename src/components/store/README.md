# Store (tienda)

`/tienda` y `/tienda/<slug>`: la tienda de Kadesh Pet. Un catálogo con dos tipos de producto a ojos de la persona:

| `seller` | Qué ve | Qué puede hacer |
|---|---|---|
| `kadesh` | «Vendido por Kadesh» | Ver, guardar en su lista y reseñar. La compra en línea llega con el carrito (fase 2). |
| `mercado_libre` | «En Mercado Libre», precio aproximado con fecha | Ir a Mercado Libre por el enlace de afiliado, guardar y reseñar. |

Los productos de Kadesh pueden ser propios o de un proveedor que surte por nosotros; eso es interno y el API nunca lo dice. No nombrar al proveedor en ningún texto.

El back está en `kadesh-back/models/Pet/Store/` (ver su README). Se administra en kadesh-business → Operaciones → Kadesh Pet → Tienda.

## Encendido

Dos interruptores, los dos apagados por defecto:

- `STORE_ENABLED=true` en kadesh-back: abre el API. Apagado, `/tienda` y cada producto responden 404.
- `NEXT_PUBLIC_STORE_ENABLED=true` aquí: muestra «Tienda» en el menú y «Lista de deseos» en Mi cuenta.

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
| Metadata y JSON-LD | `store-seo.ts` |

## Reglas

- **Precios en centavos** de MXN; se formatean con `formatPrice`.
- **Estrellas**: todo producto empieza en cero. Solo cuentan las reseñas escritas aquí; no se muestran calificaciones de otros sitios.
- **Una reseña por persona y producto**, de 1 a 5 estrellas; título y texto son opcionales. Se puede editar o borrar. Si el equipo de Kadesh la oculta, su autor ve el aviso y no puede volver a publicarla.
- **«Compra verificada»** sale cuando el back lo marca (llega con los pedidos).
- **Enlace de afiliado**: siempre con `rel="sponsored nofollow noopener"`, en pestaña nueva y con el aviso `AFFILIATE_DISCLOSURE` a la vista. El precio dice «aproximado» y la fecha en que se revisó.
- **Sin botón de compra falso**: mientras no haya carrito, la ficha de un producto de Kadesh lo dice y ofrece guardarlo.
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
- No poner un botón de compra antes de que exista el carrito.
- No subir la caché arriba de 1 h ni prerenderizar fichas mientras las fotos sean firmadas.

## Pendientes

- Fase 2: carrito, pago y «Mis pedidos».
- Productos en `sitemap.xml` y tarjeta para compartir (`/og`).
- Registrar los clics al enlace de afiliado (hoy solo los cuenta el portal de Mercado Libre).
