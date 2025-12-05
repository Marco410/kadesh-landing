"use client";

import { Suspense, useEffect, useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import { ErrorState } from "../shared";
import BlogCard from "./BlogCard";
import BlogCardSkeleton from "./BlogCardSkeleton";
import EmptyBlogState from "./EmptyBlogState";
import { useBlogPosts } from "./hooks/useBlogPosts";
import { PostWhereInput } from "./types";

interface BlogSectionProps {
  postsPerPage?: number;
  showPagination?: boolean;
}

function BlogSectionContent({ 
  postsPerPage = 12,
  showPagination = true,
}: BlogSectionProps) {
    const searchParams = useSearchParams();
    const categoryUrl = searchParams.get('category');
    
    const where: PostWhereInput | null = useMemo(() => {
      return categoryUrl 
        ? {
            category: {
              url: {
                equals: categoryUrl
              }
            }
          }
        : null;
    }, [categoryUrl]);
    
    const {
        posts,
        loading,
        error,
        currentPage,
        totalPages,
        nextPage,
        previousPage,
        goToPage,
        hasNextPage,
        hasPreviousPage,
        updateFilters,
    } = useBlogPosts(where, undefined, postsPerPage);

    useEffect(() => {
        updateFilters(where, null);
    }, [where, updateFilters]);

    if (loading) {
    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {Array.from({ length: postsPerPage || 8 }).map((_, index) => (
            <BlogCardSkeleton key={index} />
        ))}
        </div>
    );
    }

    if (error) {
        return (
        <ErrorState 
            message={error?.message || 'Error desconocido al cargar los posts'}
            title="Error al cargar los posts"
        />
        );
    }

    if (posts.length === 0) {
        return <EmptyBlogState />;
    }
    
  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {posts.map((post, index) => (
          <BlogCard key={post.id} post={post} index={index} />
        ))}
      </div>

      {showPagination && totalPages > 1 && (
        <div className="mt-12 flex justify-center gap-2">
          <button
            onClick={previousPage}
            disabled={!hasPreviousPage}
            className="px-4 py-2 rounded-lg bg-[#f5f5f5] dark:bg-[#1e1e1e] text-[#212121] dark:text-[#ffffff] font-semibold hover:bg-orange-500 hover:text-white dark:hover:bg-orange-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Anterior
          </button>
          
          {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
            let page;
            if (totalPages <= 5) {
              page = i + 1;
            } else if (currentPage <= 3) {
              page = i + 1;
            } else if (currentPage >= totalPages - 2) {
              page = totalPages - 4 + i;
            } else {
              page = currentPage - 2 + i;
            }
            return (
              <button
                key={page}
                onClick={() => goToPage(page)}
                className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
                  currentPage === page
                    ? 'bg-orange-500 text-white'
                    : 'bg-[#f5f5f5] dark:bg-[#1e1e1e] text-[#212121] dark:text-[#ffffff] hover:bg-orange-500 hover:text-white dark:hover:bg-orange-500'
                }`}
              >
                {page}
              </button>
            );
          })}
          
          <button
            onClick={nextPage}
            disabled={!hasNextPage}
            className="px-4 py-2 rounded-lg bg-[#f5f5f5] dark:bg-[#1e1e1e] text-[#212121] dark:text-[#ffffff] font-semibold hover:bg-orange-500 hover:text-white dark:hover:bg-orange-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Siguiente
          </button>
        </div>
      )}
    </>
  );
}

export default function BlogSection({ 
  postsPerPage = 12,
  showPagination = true,
}: BlogSectionProps) {
  return (
    <Suspense fallback={
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {Array.from({ length: postsPerPage || 8 }).map((_, index) => (
          <BlogCardSkeleton key={index} />
        ))}
      </div>
    }>
      <BlogSectionContent postsPerPage={postsPerPage} showPagination={showPagination} />
    </Suspense>
  );
}

