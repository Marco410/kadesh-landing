"use client";

interface DirectoryPaginationProps {
  currentPage: number;
  totalPages: number;
  onPage: (page: number) => void;
  onPrevious: () => void;
  onNext: () => void;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
}

export default function DirectoryPagination({
  currentPage,
  totalPages,
  onPage,
  onPrevious,
  onNext,
  hasPreviousPage,
  hasNextPage,
}: DirectoryPaginationProps) {
  if (totalPages <= 1) return null;

  return (
    <nav
      aria-label="Paginación"
      className="mt-6 flex items-center justify-center gap-2 border-t border-[#ececec] pt-4 dark:border-white/10"
    >
      <button
        type="button"
        onClick={onPrevious}
        disabled={!hasPreviousPage}
        className="inline-flex min-h-11 cursor-pointer items-center rounded-xl border border-[#ececec] bg-white px-3 text-sm font-medium text-[#121212] hover:bg-[#f7f8fa] disabled:cursor-not-allowed disabled:opacity-50 dark:border-white/10 dark:bg-night dark:text-white dark:hover:bg-night-raised"
      >
        Anterior
      </button>
      <div className="flex flex-wrap items-center justify-center gap-1">
        {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
          if (
            page === 1 ||
            page === totalPages ||
            (page >= currentPage - 1 && page <= currentPage + 1)
          ) {
            const selected = currentPage === page;
            return (
              <button
                key={page}
                type="button"
                aria-current={selected ? "page" : undefined}
                aria-label={`Página ${page}`}
                onClick={() => onPage(page)}
                className={`inline-flex min-h-11 min-w-11 cursor-pointer items-center justify-center rounded-xl text-sm font-medium ${
                  selected
                    ? "bg-kadesh text-white"
                    : "border border-[#ececec] bg-white text-[#121212] hover:bg-[#f7f8fa] dark:border-white/10 dark:bg-night dark:text-white"
                }`}
              >
                {page}
              </button>
            );
          }
          if (page === currentPage - 2 || page === currentPage + 2) {
            return (
              <span
                key={page}
                className="px-1 text-sm text-[#5a5a5a] dark:text-[#b0b0b0]"
              >
                …
              </span>
            );
          }
          return null;
        })}
      </div>
      <button
        type="button"
        onClick={onNext}
        disabled={!hasNextPage}
        className="inline-flex min-h-11 cursor-pointer items-center rounded-xl border border-[#ececec] bg-white px-3 text-sm font-medium text-[#121212] hover:bg-[#f7f8fa] disabled:cursor-not-allowed disabled:opacity-50 dark:border-white/10 dark:bg-night dark:text-white dark:hover:bg-night-raised"
      >
        Siguiente
      </button>
    </nav>
  );
}
