"use client";

import { useState } from 'react';
import { useQuery, useMutation } from '@apollo/client';
import { 
  CREATE_POST_COMMENT_MUTATION, 
  CreatePostCommentVariables, 
  CreatePostCommentResponse,
  GET_POST_COMMENTS_QUERY,
  GetPostCommentsResponse,
  GetPostCommentsVariables,
  DELETE_POST_COMMENT_MUTATION,
  DeletePostCommentVariables,
  DeletePostCommentResponse
} from '../queries';
import { useUser } from 'kadesh/utils/UserContext';

export const POST_COMMENTS_PAGE_SIZE = 20;

export function usePostComments(postId: string) {
  const { user } = useUser();
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [isLoadingMore, setIsLoadingMore] = useState(false);

  const { data: commentsData, loading: commentsLoading, refetch: refetchComments, fetchMore } = useQuery<
    GetPostCommentsResponse,
    GetPostCommentsVariables
  >(GET_POST_COMMENTS_QUERY, {
    variables: {
      where: {
        post: {
          id: {
            equals: postId,
          },
        },
      },
      orderBy: [
        {
          createdAt: 'desc',
        },
      ],
      take: POST_COMMENTS_PAGE_SIZE,
      skip: 0,
    },
    skip: !postId,
  });

  // Se traen de 20 en 20 (los más nuevos primero); el total sale de `postCommentsCount`.
  const comments = commentsData?.postComments || [];
  const commentsCount = commentsData?.postCommentsCount ?? comments.length;
  const hasMoreComments = comments.length < commentsCount;

  const loadMoreComments = async () => {
    if (isLoadingMore || !hasMoreComments) return;
    setIsLoadingMore(true);
    try {
      await fetchMore({
        variables: { skip: comments.length },
        updateQuery: (previous, { fetchMoreResult }) => {
          if (!fetchMoreResult) return previous;
          const seen = new Set(previous.postComments.map((item) => item.id));
          return {
            ...fetchMoreResult,
            postComments: [
              ...previous.postComments,
              ...fetchMoreResult.postComments.filter((item) => !seen.has(item.id)),
            ],
          };
        },
      });
    } catch (error) {
      console.error('Error al cargar más comentarios:', error);
    } finally {
      setIsLoadingMore(false);
    }
  };

  const [createPostComment, { loading: isCreatingComment }] = useMutation<
    CreatePostCommentResponse,
    CreatePostCommentVariables
  >(CREATE_POST_COMMENT_MUTATION, {
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

  const [deletePostComment, { loading: isDeletingComment }] = useMutation<
    DeletePostCommentResponse,
    DeletePostCommentVariables
  >(DELETE_POST_COMMENT_MUTATION, {
    onCompleted: () => {
      refetchComments();
    },
    onError: (error) => {
      console.error('Error al eliminar comentario:', error);
    },
  });

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (!comment.trim() || isSubmitting || isCreatingComment || !postId) return;

    setIsSubmitting(true);

    try {
      await createPostComment({
        variables: {
          data: {
            comment: comment.trim(),
            post: {
              connect: {
                id: postId,
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
      await deletePostComment({
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
    hasMoreComments,
    isLoadingMore,
    loadMoreComments,
    handleSubmit,
    handleDelete,
    refetchComments,
  };
}

