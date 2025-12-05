"use client";

import { useQuery } from '@apollo/client';
import { useState } from 'react';
import { GET_POSTS_QUERY, GetPostsQueryResult, GetPostsQueryVariables } from '../queries';
import { PostOrderByInput, PostWhereInput } from '../types';

const DEFAULT_POSTS_PER_PAGE = 12;

export function useBlogPosts(
  initialWhere?: PostWhereInput | null,
  initialOrderBy?: PostOrderByInput[] | null,
  postsPerPage?: number
) {
  const POSTS_PER_PAGE = postsPerPage || DEFAULT_POSTS_PER_PAGE;
  const [currentPage, setCurrentPage] = useState(1);
  const [where, setWhere] = useState<PostWhereInput | null>(initialWhere || null);
  const [orderBy, setOrderBy] = useState<PostOrderByInput[] | null>(
    initialOrderBy || [{ publishedAt: 'desc' }]
  );

  const skip = (currentPage - 1) * POSTS_PER_PAGE;

  const { data, loading, error, refetch } = useQuery<GetPostsQueryResult, GetPostsQueryVariables>(
    GET_POSTS_QUERY,
    {
      variables: {
        take: POSTS_PER_PAGE,
        skip,
        where: where || ({} as any),
        orderBy: orderBy || ([{ publishedAt: 'desc' }] as any),
      },
      fetchPolicy: 'cache-and-network',
    }
  );

  const posts = data?.posts || [];
  const totalPosts = data?.postsCount || 0;
  const totalPages = Math.ceil(totalPosts / POSTS_PER_PAGE);

  const goToPage = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const nextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage((prev) => prev + 1);
    }
  };

  const previousPage = () => {
    if (currentPage > 1) {
      setCurrentPage((prev) => prev - 1);
    }
  };

  const updateFilters = (newWhere: PostWhereInput | null, newOrderBy: PostOrderByInput[] | null) => {
    setWhere(newWhere);
    setOrderBy(newOrderBy);
    setCurrentPage(1);
    refetch({
      //where: newWhere || {},
      orderBy: newOrderBy || [{ publishedAt: 'desc' }],
      skip: 0,
      take: POSTS_PER_PAGE,
    });
  };

  return {
    posts,
    loading,
    error,
    currentPage,
    totalPages,
    goToPage,
    nextPage,
    previousPage,
    updateFilters,
    hasNextPage: currentPage < totalPages,
    hasPreviousPage: currentPage > 1,
  };
}

