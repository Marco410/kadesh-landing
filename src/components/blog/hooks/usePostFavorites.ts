"use client";

import { useMemo } from 'react';
import { useQuery, useMutation } from '@apollo/client';
import { 
  CREATE_POST_FAVORITE_MUTATION, 
  CreatePostFavoriteVariables, 
  CreatePostFavoriteResponse,
  MY_POST_FAVORITES_QUERY,
  MyPostFavoritesResponse,
  MyPostFavoritesVariables,
  DELETE_POST_FAVORITE_MUTATION,
  DeletePostFavoriteVariables,
  DeletePostFavoriteResponse
} from '../queries';
import { useUser } from 'kadesh/utils/UserContext';

/** Tope de favoritos que se revisan para marcar el corazón de cada post. */
const MY_FAVORITES_TAKE = 500;

export function usePostFavorites(postId: string) {
  const { user } = useUser();

  // Una consulta para todas las tarjetas (mismas variables: Apollo la pide una vez y la comparte).
  // Sin sesión no hay nada que preguntar.
  const { data: favoritesData, loading: favoritesLoading, refetch: refetchFavorites } = useQuery<
    MyPostFavoritesResponse,
    MyPostFavoritesVariables
  >(MY_POST_FAVORITES_QUERY, {
    variables: { userId: user?.id ?? '', take: MY_FAVORITES_TAKE },
    skip: !postId || !user?.id,
    fetchPolicy: 'cache-first',
  });

  const userFavorite = useMemo(() => {
    if (!user?.id) return null;
    return favoritesData?.postFavorites.find((favorite) => favorite.post?.id === postId) || null;
  }, [favoritesData, postId, user?.id]);

  const isFavorited = !!userFavorite;
  const postFavorite = userFavorite;

  const [createPostFavorite, { loading: isCreatingFavorite }] = useMutation<
    CreatePostFavoriteResponse,
    CreatePostFavoriteVariables
  >(CREATE_POST_FAVORITE_MUTATION, {
    onCompleted: () => {
      refetchFavorites();
    },
    onError: (error) => {
      console.error('Error al guardar en favoritos:', error);
    },
  });

  const [deletePostFavorite, { loading: isDeletingFavorite }] = useMutation<
    DeletePostFavoriteResponse,
    DeletePostFavoriteVariables
  >(DELETE_POST_FAVORITE_MUTATION, {
    onCompleted: () => {
      refetchFavorites();
    },
    onError: (error) => {
      console.error('Error al eliminar de favoritos:', error);
    },
  });

  const handleFavorite = async () => {
    if (isCreatingFavorite || isDeletingFavorite || !postId || !user?.id) return;

    try {
      if (isFavorited && postFavorite) {
        await deletePostFavorite({
          variables: {
            where: {
              id: postFavorite.id,
            },
          },
        });
      } else {
        await createPostFavorite({
          variables: {
            data: {
              post: {
                connect: {
                  id: postId,
                },
              },
              user: {
                connect: {
                  id: user.id,
                },
              },
            },
          },
        });
      }
    } catch (error) {
      console.error('Error al manejar favorito:', error);
    }
  };

  return {
    postFavorite,
    isFavorited,
    loading: favoritesLoading,
    isCreatingFavorite,
    isDeletingFavorite,
    handleFavorite,
    refetchFavorites,
  };
}
