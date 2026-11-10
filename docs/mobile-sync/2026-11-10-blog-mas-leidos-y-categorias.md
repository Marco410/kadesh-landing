---
estado: pendiente
fecha: 2026-11-10
origen: kadesh-landing@fix/blog
feature: blog
---

# Prompt para kadesh-pet-mobile: blog con «Lo más leído», relacionados, categorías y fechas en hora de México

## Contexto
El blog web ahora tiene una columna con «Lo más leído» en la lista y «Artículos relacionados» en cada artículo, y debajo las categorías con cuántos artículos publicados tiene cada una. Las fechas del blog se muestran siempre en hora de la Ciudad de México: antes, un artículo publicado de noche salía con otro día según dónde se viera.

## Qué implementar en la app
1. **Lo más leído** (pantalla de lista del blog): los 5 artículos publicados con más vistas.
   - Cada fila lleva un número de posición (1–5), una miniatura, el título y «N vistas».
   - Al tocar una fila se abre el artículo.
2. **Artículos relacionados** (pantalla del artículo): hasta 5 artículos publicados que compartan alguna etiqueta o la categoría con el actual, sin incluirlo a él, los más recientes primero.
   - Si no hay ninguno, se muestran los 5 más recientes con el título «Lo más reciente» en vez de «Artículos relacionados».
   - Cada fila lleva miniatura, título y fecha corta.
3. **Categorías**: lista de categorías del blog con el número de artículos publicados de cada una.
   - Las categorías con 0 publicados no aparecen.
   - Orden: de más a menos artículos y, en empate, alfabético.
   - Al tocar una, la lista del blog se filtra por esa categoría, y la categoría activa se ve marcada.
4. **Fechas en hora de México**: toda fecha del blog (publicación, actualización, comentarios, «Se unió el» del autor) se calcula en la zona `America/Mexico_City`, no en la del teléfono.
   - Formato largo: «9 de noviembre de 2026».
   - Formato corto: «9 nov 2026», con los meses «ene feb mar abr may jun jul ago sep oct nov dic».
   - «Actualizado el» solo aparece si cae en otro día de México que la publicación.

## GraphQL
Artículos para las listas (más leídos y relacionados). `where` base: publicados, ya en fecha y del producto Pet.

```graphql
query GetSidebarPosts($take: Int, $where: PostWhereInput!, $orderBy: [PostOrderByInput!]!) {
  posts(take: $take, where: $where, orderBy: $orderBy) {
    id
    title
    url
    publishedAt
    createdAt
    image { url }
    category { name url }
    post_viewsCount
  }
}
```

- `where` base: `{ published: { equals: true }, publishedAt: { lte: <ahora ISO> }, product: { in: ["pet", "all"] } }`.
- `orderBy`: `[{ publishedAt: desc }]`.
- **Más leídos:** `take: 200` con el `where` base; ordenar en la app por `post_viewsCount` descendente (el empate queda por fecha) y tomar 5. Keystone no puede ordenar por un conteo.
- **Relacionados:** `take: 5`, el `where` base más `id: { not: { equals: <id actual> } }` y `OR: [{ tags: { some: { name: { in: <etiquetas del actual> } } } }, { category: { url: { equals: <categoría del actual> } } }]`. Incluye solo las condiciones que el artículo tenga. Sin resultados, repetir la consulta sin `OR`: son los más recientes.

Categorías con conteo de publicados:

```graphql
query GetBlogCategories($now: DateTime!) {
  categories(where: { product: { in: ["pet", "all"] } }) {
    id
    name
    url
    postsCount(
      where: {
        published: { equals: true }
        publishedAt: { lte: $now }
        product: { in: ["pet", "all"] }
      }
    )
  }
}
```

Tipos:

```ts
type BlogSidebarPost = {
  id: string;
  title: string;
  url: string;
  publishedAt: string | null;
  createdAt: string;
  image: { url: string } | null;
  category: { name: string; url: string } | null;
  post_viewsCount: number;
};

type BlogSidebarCategory = { id: string; name: string; url: string; postsCount: number };
```

## Reglas y constantes
- Las etiquetas de categoría que se muestran salen de traducir `name`, igual que en la lista del blog actual: `news` → «Noticias», `tips` → «Consejos», `adoption` → «Adopción», `care_health` → «Cuidado y Salud»; un nombre sin traducción se muestra tal cual.
- 5 elementos en «Lo más leído» y en relacionados.
- «1 vista» / «N vistas», con separador de miles de es-MX (`1,234`).
- Fechas: zona `America/Mexico_City`; nombres de meses propios, no los del sistema.

## Referencia web
`src/components/blog/server.ts` (`fetchMostViewedPosts`, `fetchRelatedPosts`, `fetchBlogCategories`), `src/components/blog/BlogSidebar.tsx`, `src/utils/format-date.tsx` (`formatLongDateMx`, `formatShortDateMx`, `dayKeyMx`).

## Criterios de aceptación
- [ ] La lista del blog muestra los 5 más leídos con posición y vistas.
- [ ] Un artículo muestra relacionados; sin coincidencias, «Lo más reciente».
- [ ] Las categorías muestran el conteo de publicados, ocultan las vacías y filtran al tocarlas.
- [ ] Un artículo publicado a las 21:00 de México muestra ese día, con el teléfono en cualquier zona horaria.
- [ ] Funciona en iOS y Android, en modo claro y oscuro.
- [ ] Maneja carga, error y vacío.
