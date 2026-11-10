# Blog

Listado de artículos publicados y detalle de cada post. La promesa es la misma en el índice y en cada URL: historias y consejos de bienestar animal en México, sin vender la plataforma como “el único” recurso.

## Cómo se presenta

- **Índice (`/blog`)**: grid de artículos publicados, filtro opcional `?tab=` no aplica aquí; el filtro es `?category=<url-de-categoría>`. Sin categoría es el default. Vacío: estado `EmptyBlogState`.
- **Columna derecha (`BlogSidebar`)**: en el índice, «Lo más leído» (5, por `post_viewsCount`); en el detalle, «Artículos relacionados» (comparten etiqueta o categoría; sin ninguno, «Lo más reciente»). Debajo, la publicidad (`AdSlot` con `BLOG_AD_SLOT`) y las categorías con su conteo de publicados. Todo se pide en el servidor (`fetchMostViewedPosts`, `fetchRelatedPosts`, `fetchBlogCategories` en `server.ts`) y entra en el caché de 60 s. En móvil va después del contenido.
- **Fechas**: siempre en hora de México con `formatLongDateMx` / `formatShortDateMx` (`kadesh/utils/format-date`). El servidor corre en UTC: un `toLocaleDateString` sin zona pinta otro día que el navegador y React falla al hidratar (#418).
- **Detalle (`/blog/<url>`)**: artículo completo, autor, fechas, etiquetas, comentarios y relacionados. Si el post no existe o no está publicado, es **404** con `noindex` (no la pantalla genérica de “en construcción”, ni un 200 con “no encontrado”).
- **Autor**: se pide como `author: authorProfile { … }`, no como `author { … }`. `Post.author` apunta a `User` y un visitante no puede leer `User`, así que `author` siempre le llegaba `null` y el blog nunca mostraba quién escribió el artículo (ni en la ficha, ni en tarjetas, ni en el JSON-LD para Google). `authorProfile` (kadesh-back, `models/Blog/Post/Post.authorProfile.ts`) da solo nombre, apellido, usuario, verificado, foto y fecha de alta, sin `id` ni correo. Requiere ese back desplegado.
- La paginación es de cliente (`take`/`skip`). Solo la **página 1** se hidrata con el HTML del servidor; cambiar de página no reutiliza esos cards. El total sale de `postsCount` con el mismo filtro de publicados (y categoría, si hay). Cambiar `?category=` vuelve a la página 1.

## Contenido compartido con Kadesh Negocios

El backend es el mismo que usa el blog del SaaS (`kadesh.com.mx/blog`). `Post`, `Category` y `BlogSubscription` tienen `product`. Este blog **solo muestra `pet` y `all`** (`BLOG_PRODUCT_FILTER` en `constants.ts`); el filtro va en **toda** lectura (índice, detalle, sitemap, relacionados, categorías). Si se agrega una consulta nueva de posts sin el filtro, se cuelan artículos del SaaS. Un post de otro producto en `/blog/<url>` es 404. La suscripción al newsletter se guarda con `product: 'pet'`.

## SEO y descubrimiento

- El sitemap incluye cada post **publicado**, con `lastmod` de `updatedAt` o `publishedAt`. No se listan borradores.
- El HTML del post (título, fechas, cuerpo) sale del servidor. Likes, comentarios y vistas siguen siendo islas de cliente.
- Schema: `Blog` + `ItemList` en el índice; `BlogPosting` + `BreadcrumbList` en el detalle. El publisher apunta a la Organization de KADESH (`/#organization`).
- Canonical del índice: `/blog` (también con `?category=`). Canonical del post: `/blog/<url>` en `pet.kadesh.com.mx`.
- Open Graph tipo `article` (fechas, autor, imagen). La portada del CMS es una URL firmada (caduca), así que el share apunta a `/blog/<url>/og` (route handler que descarga la portada vigente y la sirve con caché). Sin portada o si falla la descarga, redirige a `/og-image.png`.
- `public/llms.txt` debe enlazar **solo** `https://pet.kadesh.com.mx/...`. Nunca `www.kadesh.com.mx` ni el apex B2B (ese host es Negocios).

### Search Console

Propiedad en `pet.kadesh.com.mx`: enviar `https://pet.kadesh.com.mx/sitemap.xml`, inspeccionar 2–3 posts de `/blog/...` y solicitar indexación. AI Overviews / GEO solo después de que Google indexe.

## Copy

- Hablamos de **artículos**, **blog** y **bienestar animal**. Nunca nombramos el CMS, GraphQL ni el almacenamiento de imágenes.
- No inventamos métricas (“el más leído”, cifras de alcance) en metadata ni en schema.

## Archivos que deben quedar alineados

- Metadata y JSON-LD: `blog-seo.ts`.
- Fetch de publicados (sitemap, índice, detalle): `server.ts`.
- Layout compartido de `/blog`: keywords y OG genérico, **sin** canonical propio (si no, los posts heredarían `/blog`).
