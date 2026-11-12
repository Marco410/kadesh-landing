---
estado: pendiente
fecha: 2026-11-12
origen: kadesh-landing@develop (sin commit)
feature: shared
---

# Prompt para kadesh-pet-mobile: menos peticiones al backend (campana, blog y listado de animales)

## Contexto
El backend (Keystone en Railway) y su Postgres cobran por RAM y estaban recibiendo peticiones de más desde la web. Se quitó lo repetido sin cambiar lo que ve la persona: el contador de la campana se refresca menos y solo con la app a la vista, el blog ya no trae listas completas para contar, y el listado de animales no pide dos veces lo mismo. La app debe seguir las mismas reglas para no volver a generar esa carga.

## Qué implementar en la app
Revisa cada punto contra lo que la app hace hoy; si ya lo cumple, no hay nada que cambiar.

1. **Contador de notificaciones no leídas y globos del menú**
   - Refrescar cada **5 minutos** (antes 60 s), y solo con la app en primer plano (`AppState === 'active'`). En segundo plano no se pide nada.
   - Al volver a primer plano, volver a pedir si la app estuvo en segundo plano **60 s o más**.
   - Después de marcar una notificación como leída (o todas), volver a pedir el contador en ese momento.
   - Si una pantalla vive dentro de otra que ya tiene el contador, que lo lea de la caché en lugar de pedirlo otra vez.

2. **Favoritos del blog**
   - Una sola consulta con los favoritos de la persona (`MyPostFavorites`), compartida por todas las tarjetas y por la ficha del post. Nunca una consulta por tarjeta.
   - Sin sesión no se pide nada.
   - Al agregar o quitar un favorito, volver a pedir esa consulta.

3. **Likes del post**
   - Pedir el total (`postLikesCount`) y, solo con sesión, el like propio (`take: 1`). No traer la lista de likes.

4. **Comentarios del post**
   - De 20 en 20, los más nuevos primero, con botón «Ver más comentarios» mientras haya más. El total que se muestra («Comentarios (N)») sale de `postCommentsCount`, no del largo de la lista.
   - Al publicar o borrar un comentario se vuelve a pedir la primera página.

5. **Listado de animales con mapa**
   - La lista y el mapa usan la misma respuesta de `getNearbyAnimals`. No lanzar una segunda consulta con un límite mayor para el mapa.
   - `getNearbyAnimals` es cara en el backend (recorre todos los reportes en cada llamada, sin importar `limit`): no la pidas en cada render ni en cada regreso a la pantalla si los filtros no cambiaron.
   - El catálogo de tipos de animal casi no cambia: léelo de la caché si ya está.

## GraphQL

```graphql
query NotificationUnreadCount {
  notificationsCount(where: { product: { equals: "pet" }, readAt: { equals: null } })
}

query MyPostFavorites($userId: ID!, $take: Int!) {
  postFavorites(
    where: { user: { id: { equals: $userId } } }
    orderBy: [{ createdAt: desc }]
    take: $take
  ) {
    id
    post {
      id
    }
  }
}

query GetPostLikes(
  $countWhere: PostLikeWhereInput!
  $mineWhere: PostLikeWhereInput!
  $withMine: Boolean!
) {
  postLikesCount(where: $countWhere)
  postLikes(where: $mineWhere, take: 1) @include(if: $withMine) {
    id
  }
}

query GetPostComments(
  $where: PostCommentWhereInput!
  $orderBy: [PostCommentOrderByInput!]
  $take: Int
  $skip: Int
) {
  postCommentsCount(where: $where)
  postComments(where: $where, orderBy: $orderBy, take: $take, skip: $skip) {
    id
    comment
    post {
      id
    }
    user {
      id
      name
      lastName
      username
      verified
      profileImage {
        url
      }
    }
    createdAt
  }
}

query GetNearbyAnimals($input: NearbyAnimalsInput!) {
  getNearbyAnimals(input: $input) {
    success
    message
    total
    animals {
      id
      slug
      name
      distance
      sex
      lat
      lng
      address
      city
      state
      country
      status
      animal_breed {
        id
        breed
      }
      animal_type {
        id
        name
      }
      createdAt
      multimedia {
        id
        url
        order
      }
    }
  }
}
```

Variables:

```ts
// MyPostFavorites
{ userId: string; take: 500 }

// GetPostLikes
{
  countWhere: { post: { id: { equals: postId } } };
  // Con sesión, el mismo filtro más el usuario; sin sesión se manda el del post y `withMine: false`.
  mineWhere: { post: { id: { equals: postId } }; user?: { id: { equals: userId } } };
  withMine: boolean;
}

// GetPostComments
{
  where: { post: { id: { equals: postId } } };
  orderBy: [{ createdAt: 'desc' }];
  take: 20;
  skip: number; // 0 al inicio; el número de comentarios ya cargados al pedir más
}
```

Tipos:

```ts
type MyPostFavoritesResponse = { postFavorites: Array<{ id: string; post: { id: string } | null }> };
type GetPostLikesResponse = { postLikesCount: number; postLikes?: Array<{ id: string }> };
type GetPostCommentsResponse = { postCommentsCount: number; postComments: PostComment[] };
```

`GetNearbyAnimals` ya no pide `user { name profileImage { url } }`: ninguna tarjeta lo usaba.

## Reglas y constantes
- Refresco del contador y de los globos: `5 * 60_000` ms, solo en primer plano.
- Volver a pedir al regresar: si estuvo en segundo plano `>= 60_000` ms.
- Comentarios por página: `20`. Tope de favoritos que se revisan: `500`.
- Un post es favorito si en `postFavorites` hay uno con `post.id` igual. Para quitarlo se usa el `id` de ese favorito.
- Hay like propio si `postLikes[0]` existe; su `id` es el que se borra al quitar el like.

## Referencia web
- `src/components/notifications/hooks/useUnreadNotifications.ts`, `src/components/notifications/constants.ts`, `src/utils/useRefetchOnTabReturn.ts`, `src/components/profile/shell/useProfileNavCounts.ts`
- `src/components/blog/queries.ts`, `src/components/blog/hooks/{usePostFavorites,usePostLikes,usePostComments,useBlogPosts}.ts`, `src/components/blog/post/CommentsSection.tsx`
- `src/components/animals/hooks/useLostAnimals.ts`, `src/components/animals/queries.ts`

## Criterios de aceptación
- [ ] Con la app en segundo plano no sale ninguna petición del contador; al volver después de 1 min o más, se actualiza.
- [ ] Abrir el blog con sesión dispara una sola consulta de favoritos, sin importar cuántas tarjetas haya; sin sesión, ninguna.
- [ ] La ficha del post muestra el total de likes y comentarios sin traer las listas completas.
- [ ] «Ver más comentarios» agrega 20 sin repetir y desaparece al llegar al total.
- [ ] El listado de animales hace una sola llamada a `getNearbyAnimals` por combinación de filtros.
- [ ] Funciona en iOS y Android, en modo claro y oscuro.
- [ ] Maneja carga, error y vacío.
