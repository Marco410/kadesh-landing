"use client";

import { useQuery, useMutation } from "@apollo/client";
import { useUser } from "kadesh/utils/UserContext";
import {
  GET_PET_PLACE_LIKES_QUERY,
  CREATE_PET_PLACE_LIKE_MUTATION,
  DELETE_PET_PLACE_LIKE_MUTATION,
  type GetPetPlaceLikesResponse,
  type GetPetPlaceLikesVariables,
  type CreatePetPlaceLikeResponse,
  type CreatePetPlaceLikeVariables,
  type DeletePetPlaceLikeResponse,
  type DeletePetPlaceLikeVariables,
} from "../queries";

const EMPTY_MINE_ID = "__none__";

export function usePetPlaceLikes(petPlaceId: string, initialCount = 0) {
  const { user } = useUser();

  const { data, loading, refetch } = useQuery<
    GetPetPlaceLikesResponse,
    GetPetPlaceLikesVariables
  >(GET_PET_PLACE_LIKES_QUERY, {
    variables: {
      countWhere: { pet_place: { id: { equals: petPlaceId } } },
      mineWhere: {
        AND: [
          { pet_place: { id: { equals: petPlaceId } } },
          { user: { id: { equals: user?.id ?? EMPTY_MINE_ID } } },
        ],
      },
    },
    skip: !petPlaceId,
    fetchPolicy: "cache-and-network",
  });

  const userLike = data?.petPlaceLikes[0] ?? null;
  const isLiked = Boolean(user?.id && userLike);
  const likesCount = data?.petPlaceLikesCount ?? initialCount;

  const [createLike, { loading: isCreatingLike }] = useMutation<
    CreatePetPlaceLikeResponse,
    CreatePetPlaceLikeVariables
  >(CREATE_PET_PLACE_LIKE_MUTATION, {
    onCompleted: () => {
      refetch();
    },
    onError: (error) => {
      console.error("Error al guardar la veterinaria:", error);
    },
  });

  const [deleteLike, { loading: isDeletingLike }] = useMutation<
    DeletePetPlaceLikeResponse,
    DeletePetPlaceLikeVariables
  >(DELETE_PET_PLACE_LIKE_MUTATION, {
    onCompleted: () => {
      refetch();
    },
    onError: (error) => {
      console.error("Error al quitar el like:", error);
    },
  });

  const isBusy = isCreatingLike || isDeletingLike;

  const handleLike = async () => {
    if (isBusy || !petPlaceId || !user?.id) return;

    try {
      if (isLiked && userLike) {
        await deleteLike({ variables: { where: { id: userLike.id } } });
        return;
      }

      await createLike({
        variables: {
          data: {
            pet_place: { connect: { id: petPlaceId } },
            user: { connect: { id: user.id } },
          },
        },
      });
    } catch {
      // onError already logs
    }
  };

  return {
    likesCount,
    isLiked,
    loading,
    isBusy,
    handleLike,
  };
}
