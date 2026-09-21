# Blog

Listado de artículos publicados y detalle de cada post. La promesa es la misma en el índice y en cada URL: historias y consejos de bienestar animal en México, sin vender la plataforma como “el único” recurso.

## Cómo se presenta

- **Índice (`/blog`)**: grid de artículos publicados, filtro opcional `?tab=` no aplica aquí; el filtro es `?category=<url-de-categoría>`. Sin categoría es el default. Vacío: estado `EmptyBlogState`.
- **Detalle (`/blog/<url>`)**: artículo completo, autor, fechas, etiquetas, comentarios y relacionados. Si el post no existe o no está publicado, es **404** con `noindex` (no la pantalla genérica de “en construcción”, ni un 200 con “no encontrado”).
- La paginación es de cliente (`take`/`skip`). Solo la **página 1** se hidrata con el HTML del servidor; cambiar de página no reutiliza esos cards. El total sale de `postsCount` con el mismo filtro de publicados (y categoría, si hay). Cambiar `?category=` vuelve a la página 1.

## Contenido compartido con Kadesh Negocios

El backend es el mismo que usa el blog del SaaS (`kadesh.com.mx/blog`). `Post`, `Category` y `BlogSubscription` tienen `product`. Este blog **solo muestra `pet` y `all`** (`BLOG_PRODUCT_FILTER` en `constants.ts`); el filtro va en **toda** lectura (índice, detalle, sitemap, relacionados, categorías). Si se agrega una consulta nueva de posts sin el filtro, se cuelan artículos del SaaS. Un post de otro producto en `/blog/<url>` es 404. La suscripción al newsletter se guarda con `product: 'pet'`.

## SEO y descubrimiento

- El sitemap incluye cada post **publicado**, con `lastmod` de `updatedAt` o `publishedAt`. No se listan borradores.
- El HTML del post (título, fechas, cuerpo) sale del servidor. Likes, comentarios y vistas siguen siendo islas de cliente.
- Schema: `Blog` + `ItemList` en el índice; `BlogPosting` + `BreadcrumbList` en el detalle. El publisher apunta a la Organization de KADESH (`/#organization`).
- Canonical del índice: `/blog` (también con `?category=`). Canonical del post: `/blog/<url>` en `pet.kadesh.com.mx`.
- Open Graph tipo `article` (fechas, autor, imagen). La portada del CMS es una URL firmada (caduca), así que el share apunta a `/blog/<url>/og` (route handler que descarga la portada vigente y la sirve con caché). Sin portada o si falla la descarga, redirige a `/og-image.png`.

## Copy

- Hablamos de **artículos**, **blog** y **bienestar animal**. Nunca nombramos el CMS, GraphQL ni el almacenamiento de imágenes.
- No inventamos métricas (“el más leído”, cifras de alcance) en metadata ni en schema.

## Archivos que deben quedar alineados

- Metadata y JSON-LD: `blog-seo.ts`.
- Fetch de publicados (sitemap, índice, detalle): `server.ts`.
- Layout compartido de `/blog`: keywords y OG genérico, **sin** canonical propio (si no, los posts heredarían `/blog`).
