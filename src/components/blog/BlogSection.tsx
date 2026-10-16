"use client";

import { Suspense, useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import { ErrorState } from "../shared";
import BlogCard from "./BlogCard";
import BlogCardSkeleton from "./BlogCardSkeleton";
import { LoadingBar, SkeletonRegion } from "kadesh/components/ui/skeleton";
import EmptyBlogState from "./EmptyBlogState";
import { useBlogPosts } from "./hooks/useBlogPosts";
import { BlogPost, PostWhereInput } from "./types";

interface BlogSectionProps {
  postsPerPage?: number;
  showPagination?: boolean;
  initialPosts?: BlogPost[];
  initialCount?: number;
  initialCategory?: string | null;
  /** Clases de la rejilla; la portada usa 3 columnas. */
  gridClassName?: string;
}

const DEFAULT_GRID = 'grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4';
const MAX_SKELETON_CARDS = 8;

function BlogGridSkeleton({ count, gridClassName }: { count: number; gridClassName: string }) {
  return (
    <SkeletonRegion label="Cargando artículos" className={gridClassName}>
      {Array.from({ length: Math.min(count || MAX_SKELETON_CARDS, MAX_SKELETON_CARDS) }).map((_, index) => (
        <BlogCardSkeleton key={index} index={index} />
      ))}
    </SkeletonRegion>
  );
}

function PaginationButton({
  children,
  onClick,
  disabled,
  isActive = false,
  ariaLabel,
}: {
  children: React.ReactNode;
  onClick: () => void;
  disabled?: boolean;
  isActive?: boolean;
  ariaLabel?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={ariaLabel}
      aria-current={isActive ? 'page' : undefined}
      className={`inline-flex min-h-11 min-w-11 items-center justify-center rounded-lg px-4 py-2 font-semibold transition-colors ${
        isActive
          ? 'bg-orange-500 text-white'
          : 'bg-[#f5f5f5] text-[#212121] hover:bg-orange-500 hover:text-white disabled:cursor-not-allowed disabled:opacity-50 dark:bg-[#1e1e1e] dark:text-[#ffffff] dark:hover:bg-orange-500'
      }`}
    >
      {children}
    </button>
  );
}

function BlogSectionContent({
  postsPerPage = 12,
  showPagination = true,
  initialPosts = [],
  initialCount = 0,
  initialCategory = null,
  gridClassName = DEFAULT_GRID,
}: BlogSectionProps) {
  const searchParams = useSearchParams();
  const categoryUrl = searchParams.get('category');
  const matchesInitialCategory =
    (categoryUrl || null) === (initialCategory || null);

  const where: PostWhereInput | null = useMemo(() => {
    return categoryUrl
      ? {
          category: {
            url: {
              equals: categoryUrl,
            },
          },
        }
      : null;
  }, [categoryUrl]);

  const {
    posts,
    loading,
    isPageLoading,
    error,
    currentPage,
    totalPages,
    nextPage,
    previousPage,
    goToPage,
    hasNextPage,
    hasPreviousPage,
  } = useBlogPosts({
    where,
    postsPerPage,
    initialPosts: matchesInitialCategory ? initialPosts : [],
    initialCount: matchesInitialCategory ? initialCount : 0,
  });

  const pageNumbers = useMemo(() => {
    const count = Math.min(totalPages, 5);
    return Array.from({ length: count }, (_, i) => {
      if (totalPages <= 5) {
        return i + 1;
      }
      if (currentPage <= 3) {
        return i + 1;
      }
      if (currentPage >= totalPages - 2) {
        return totalPages - 4 + i;
      }
      return currentPage - 2 + i;
    });
  }, [currentPage, totalPages]);

  if (loading) {
    return <BlogGridSkeleton count={postsPerPage} gridClassName={gridClassName} />;
  }

  if (error && posts.length === 0) {
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
      <LoadingBar active={isPageLoading} className="mb-4" />
      <div
        id="blog-posts"
        className={`${gridClassName} transition-opacity duration-200 ${
          isPageLoading ? 'opacity-50' : ''
        }`}
      >
        {posts.map((post, index) => (
          <BlogCard key={post.id} post={post} index={index} />
        ))}
      </div>

      {showPagination && totalPages > 1 && (
        <nav
          aria-label="Paginación del blog"
          className="mt-12 flex flex-wrap items-center justify-center gap-2"
        >
          <PaginationButton
            onClick={previousPage}
            disabled={!hasPreviousPage || isPageLoading}
            ariaLabel="Página anterior"
          >
            Anterior
          </PaginationButton>

          {pageNumbers.map((page) => (
            <PaginationButton
              key={page}
              onClick={() => goToPage(page)}
              disabled={isPageLoading}
              isActive={currentPage === page}
              ariaLabel={`Ir a la página ${page}`}
            >
              {page}
            </PaginationButton>
          ))}

          <PaginationButton
            onClick={nextPage}
            disabled={!hasNextPage || isPageLoading}
            ariaLabel="Página siguiente"
          >
            Siguiente
          </PaginationButton>
        </nav>
      )}
    </>
  );
}

export default function BlogSection({
  postsPerPage = 12,
  showPagination = true,
  initialPosts = [],
  initialCount = 0,
  initialCategory = null,
  gridClassName = DEFAULT_GRID,
}: BlogSectionProps) {
  return (
    <Suspense
      fallback={<BlogGridSkeleton count={postsPerPage} gridClassName={gridClassName} />}
    >
      <BlogSectionContent
        postsPerPage={postsPerPage}
        showPagination={showPagination}
        initialPosts={initialPosts}
        initialCount={initialCount}
        initialCategory={initialCategory}
        gridClassName={gridClassName}
      />
    </Suspense>
  );
}
