"use client";

import { useState } from 'react';
import Link from 'next/link';
import { HugeiconsIcon } from '@hugeicons/react';
import {
  ArrowDown01Icon,
  ArrowUp01Icon,
  StarIcon,
  Delete02Icon,
  UserIcon,
} from '@hugeicons/core-free-icons';
import { useUser } from 'kadesh/utils/UserContext';
import { Routes } from 'kadesh/core/routes';
import { ConfirmModal } from 'kadesh/components/shared';
import { usePetPlaceReviews } from './hooks/usePetPlaceReviews';
import type { PetPlaceDetail } from './types';

const REVIEWS_PREVIEW = 3;

interface PetPlaceReviewsSectionProps {
  place: PetPlaceDetail;
  refetchPlace: () => void;
}

export default function PetPlaceReviewsSection({
  place,
  refetchPlace,
}: PetPlaceReviewsSectionProps) {
  const { user } = useUser();
  const {
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
  } = usePetPlaceReviews(place.id, refetchPlace);

  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [reviewToDelete, setReviewToDelete] = useState<string | null>(null);
  const [expanded, setExpanded] = useState(false);

  const openDeleteModal = (reviewId: string) => {
    setReviewToDelete(reviewId);
    setDeleteModalOpen(true);
  };

  const closeDeleteModal = () => {
    setDeleteModalOpen(false);
    setReviewToDelete(null);
  };

  const confirmDelete = () => {
    if (reviewToDelete) {
      handleDelete(reviewToDelete);
      closeDeleteModal();
    }
  };

  const reviews = place.pet_place_reviews ?? [];
  const reviewsCount = place.reviewsCount ?? reviews.length;
  const visibleReviews = expanded ? reviews : reviews.slice(0, REVIEWS_PREVIEW);
  const canToggle = reviews.length > REVIEWS_PREVIEW;

  return (
    <div className="flex min-h-0 flex-col lg:h-full">
      <h2 className="mb-3 shrink-0 text-sm font-bold text-[#121212] dark:text-white">
        Reseñas {reviewsCount > 0 ? `(${reviewsCount})` : ''}
      </h2>

      {user ? (
        <form onSubmit={handleSubmit} className="mb-3 shrink-0">
          <div className="flex items-center gap-1">
            {[1, 2, 3, 4, 5].map((value) => (
              <button
                key={value}
                type="button"
                onClick={() => setRating(value)}
                onMouseEnter={() => setHoverRating(value)}
                onMouseLeave={() => setHoverRating(0)}
                className="rounded p-0.5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-kadesh"
                aria-label={`${value} estrella${value !== 1 ? 's' : ''}`}
              >
                <HugeiconsIcon
                  icon={StarIcon}
                  size={22}
                  className={`transition-colors ${
                    value <= (hoverRating || rating)
                      ? 'fill-amber-500 text-amber-500'
                      : 'text-[#d0d0d0] dark:text-[#5a5a5a]'
                  }`}
                  strokeWidth={1.5}
                />
              </button>
            ))}
          </div>
          <textarea
            value={review}
            onChange={(e) => setReview(e.target.value)}
            placeholder="Escribe tu reseña (opcional)"
            className="mt-2 w-full resize-none rounded-xl border border-[#ececec] bg-white p-2.5 text-sm text-[#121212] placeholder:text-[#5a5a5a] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-kadesh dark:border-white/10 dark:bg-night dark:text-white"
            rows={2}
            disabled={isSubmitting || isCreatingReview}
          />
          <div className="mt-2 flex justify-end">
            <button
              type="submit"
              disabled={rating < 1 || isSubmitting || isCreatingReview}
              className="rounded-xl bg-kadesh px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-kadesh-600 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isSubmitting || isCreatingReview ? 'Publicando…' : 'Publicar'}
            </button>
          </div>
        </form>
      ) : (
        <p className="mb-3 shrink-0 text-sm text-[#5a5a5a] dark:text-[#b0b0b0]">
          <Link href={Routes.auth.login} className="font-semibold text-kadesh hover:underline">
            Inicia sesión
          </Link>{' '}
          para dejar una reseña.
        </p>
      )}

      <ul className="space-y-2 lg:min-h-0 lg:flex-1 lg:overflow-y-auto">
        {reviews.length === 0 ? (
          <li className="py-6 text-center text-sm text-[#5a5a5a] dark:text-[#b0b0b0]">
            Aún no hay reseñas.
          </li>
        ) : (
          visibleReviews.map((rev) => (
            <li
              key={rev.id}
              className="rounded-xl border border-[#ececec] p-3 dark:border-white/10 dark:bg-night/40"
            >
              <div className="flex gap-2.5">
                {rev.user?.profileImage?.url ? (
                  <img
                    src={rev.user.profileImage.url}
                    alt=""
                    width={36}
                    height={36}
                    className="h-9 w-9 flex-shrink-0 rounded-full object-cover"
                  />
                ) : (
                  <span className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-[#eef3f8] dark:bg-night">
                    <HugeiconsIcon
                      icon={UserIcon}
                      size={16}
                      className="text-[#5a5a5a]"
                      strokeWidth={1.5}
                    />
                  </span>
                )}
                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-2">
                    <p className="truncate text-sm font-semibold text-[#121212] dark:text-white">
                      {rev.user
                        ? [rev.user.name, rev.user.lastName].filter(Boolean).join(' ')
                        : rev.google_user
                          ? rev.google_user
                          : 'Anónimo'}
                    </p>
                    {user?.id && rev.user?.id === user.id && (
                      <button
                        type="button"
                        onClick={() => openDeleteModal(rev.id)}
                        disabled={isDeletingReview}
                        className="rounded-lg p-1 text-[#5a5a5a] hover:bg-red-50 hover:text-red-500 disabled:opacity-50 dark:hover:bg-red-900/20"
                        title="Eliminar reseña"
                      >
                        <HugeiconsIcon icon={Delete02Icon} size={16} />
                      </button>
                    )}
                  </div>
                  {rev.rating != null && (
                    <p className="mt-0.5 flex items-center gap-1 text-xs font-semibold text-amber-500">
                      <HugeiconsIcon
                        icon={StarIcon}
                        size={12}
                        className="fill-amber-500 text-amber-500"
                        strokeWidth={1.5}
                      />
                      {rev.rating.toFixed(1)}
                    </p>
                  )}
                  {rev.review && (
                    <p className="mt-1 text-sm leading-relaxed text-[#5a5a5a] dark:text-[#b0b0b0]">
                      {rev.review}
                    </p>
                  )}
                  {rev.createdAt && (
                    <p className="mt-1 text-xs text-[#5a5a5a] dark:text-[#8a8a8a]">
                      {new Date(rev.createdAt).toLocaleDateString('es-MX', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </p>
                  )}
                </div>
              </div>
            </li>
          ))
        )}
      </ul>

      {canToggle && (
        <button
          type="button"
          aria-expanded={expanded}
          onClick={() => setExpanded((open) => !open)}
          className="mt-3 inline-flex min-h-11 shrink-0 items-center justify-center gap-1.5 rounded-xl text-sm font-semibold text-kadesh transition-colors hover:bg-kadesh-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-kadesh dark:hover:bg-kadesh/20"
        >
          {expanded ? 'Menos reseñas' : 'Más reseñas'}
          <HugeiconsIcon
            icon={expanded ? ArrowUp01Icon : ArrowDown01Icon}
            size={16}
            strokeWidth={2}
            aria-hidden
          />
        </button>
      )}

      <ConfirmModal
        isOpen={deleteModalOpen}
        onClose={closeDeleteModal}
        onConfirm={confirmDelete}
        title="Eliminar reseña"
        message="¿Estás seguro de que deseas eliminar esta reseña? Esta acción no se puede deshacer."
        confirmText="Eliminar"
        cancelText="Cancelar"
        isLoading={isDeletingReview}
        confirmButtonColor="red"
      />
    </div>
  );
}
