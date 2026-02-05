"use client";

import { useState } from 'react';
import { useQuery, useMutation } from '@apollo/client';
import { 
  CREATE_ANIMAL_COMMENT_MUTATION, 
  CreateAnimalCommentVariables, 
  CreateAnimalCommentResponse,
  GET_ANIMAL_COMMENTS_QUERY,
  GetAnimalCommentsResponse,
  GetAnimalCommentsVariables,
  DELETE_ANIMAL_COMMENT_MUTATION,
  DeleteAnimalCommentVariables,
  DeleteAnimalCommentResponse
} from '../../queries';
import { useUser } from 'kadesh/utils/UserContext';

export function useAnimalComments(animalId: string) {
  const { user } = useUser();
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { data: commentsData, loading: commentsLoading, refetch: refetchComments } = useQuery<
    GetAnimalCommentsResponse,
    GetAnimalCommentsVariables
  >(GET_ANIMAL_COMMENTS_QUERY, {
    variables: {
      where: {
        animal: {
          id: {
            equals: animalId,
          },
        },
      },
      orderBy: [
        {
          createdAt: 'desc',
        },
      ],
    },
    skip: !animalId,
  });

  const comments = commentsData?.animalComments || [];
  const commentsCount = comments.length;

  const [createAnimalComment, { loading: isCreatingComment }] = useMutation<
    CreateAnimalCommentResponse,
    CreateAnimalCommentVariables
  >(CREATE_ANIMAL_COMMENT_MUTATION, {
    onCompleted: () => {
      setComment('');
      setIsSubmitting(false);
      refetchComments();
    },
    onError: (error) => {
      console.error('Error al crear comentario:', error);
      setIsSubmitting(false);
    },
  });

  const [deleteAnimalComment, { loading: isDeletingComment }] = useMutation<
    DeleteAnimalCommentResponse,
    DeleteAnimalCommentVariables
  >(DELETE_ANIMAL_COMMENT_MUTATION, {
    onCompleted: () => {
      refetchComments();
    },
    onError: (error) => {
      console.error('Error al eliminar comentario:', error);
    },
  });

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (!comment.trim() || isSubmitting || isCreatingComment || !animalId) return;

    setIsSubmitting(true);

    try {
      await createAnimalComment({
        variables: {
          data: {
            comment: comment.trim(),
            animal: {
              connect: {
                id: animalId,
              },
            },
            user: user?.id
              ? {
                  connect: {
                    id: user.id,
                  },
                }
              : null,
          },
        },
      });
    } catch (error) {
      console.error('Error al crear comentario:', error);
    }
  };

  const handleDelete = async (commentId: string) => {
    if (isDeletingComment || !commentId) return;

    try {
      await deleteAnimalComment({
        variables: {
          where: {
            id: commentId,
          },
        },
      });
    } catch (error) {
      console.error('Error al eliminar comentario:', error);
    }
  };

  return {
    comments,
    commentsCount,
    comment,
    setComment,
    loading: commentsLoading,
    isSubmitting,
    isCreatingComment,
    isDeletingComment,
    handleSubmit,
    handleDelete,
    refetchComments,
  };
}
