"use client";

import { useState } from 'react';
import { useMutation } from '@apollo/client';
import {
  CREATE_PET_PLACE_REVIEW_MUTATION,
  CreatePetPlaceReviewVariables,
  CreatePetPlaceReviewResponse,
  DELETE_PET_PLACE_REVIEW_MUTATION,
  DeletePetPlaceReviewVariables,
  DeletePetPlaceReviewResponse,
} from '../queries';
import { useUser } from 'kadesh/utils/UserContext';

export function usePetPlaceReviews(
  petPlaceId: string,
  refetchPlace: () => void
) {
  const { user } = useUser();
  const [review, setReview] = useState('');
  const [rating, setRating] = useState<number>(0);
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [createReview, { loading: isCreatingReview }] = useMutation<
    CreatePetPlaceReviewResponse,
    CreatePetPlaceReviewVariables
  >(CREATE_PET_PLACE_REVIEW_MUTATION, {
    onCompleted: () => {
      setReview('');
      setRating(0);
      setIsSubmitting(false);
      refetchPlace();
    },
    onError: (err) => {
      console.error('Error al crear reseña:', err);
      setIsSubmitting(false);
    },
  });

  const [deleteReview, { loading: isDeletingReview }] = useMutation<
    DeletePetPlaceReviewResponse,
    DeletePetPlaceReviewVariables
  >(DELETE_PET_PLACE_REVIEW_MUTATION, {
    onCompleted: () => {
      refetchPlace();
    },
    onError: (err) => {
      console.error('Error al eliminar reseña:', err);
    },
  });

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!petPlaceId || !user?.id || rating < 1 || isSubmitting || isCreatingReview) return;
    setIsSubmitting(true);
    try {
      await createReview({
        variables: {
          data: {
            rating,
            review: review.trim() || undefined,
            pet_place: { connect: { id: petPlaceId } },
            user: { connect: { id: user.id } },
            
          },
        },
      });
    } catch {
      // onError already handles state
    }
  };

  const handleDelete = async (reviewId: string) => {
    if (isDeletingReview || !reviewId) return;
    try {
      await deleteReview({
        variables: { where: { id: reviewId } },
      });
    } catch {
      // onError already handles state
    }
  };

  return {
    review,
    setReview,
    rating,
    setRating,
    hoverRating,
    setHoverRating,
    isSubmitting,
    isCreatingReview,
    isDeletingReview,
    handleSubmit,
    handleDelete,
  };
}
