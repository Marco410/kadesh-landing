"use client";

import { useState } from 'react';
import Link from 'next/link';
import { HugeiconsIcon } from '@hugeicons/react';
import { StarIcon, Delete02Icon, UserIcon } from '@hugeicons/core-free-icons';
import { useUser } from 'kadesh/utils/UserContext';
import { Routes } from 'kadesh/core/routes';
import { ConfirmModal } from 'kadesh/components/shared';
import { usePetPlaceReviews } from './hooks/usePetPlaceReviews';
import type { PetPlaceDetail } from './types';

const cardClass =
  'bg-white dark:bg-[#1a1a1a] rounded-2xl border border-gray-200/80 dark:border-gray-800 shadow-sm dark:shadow-none overflow-hidden';

interface PetPlaceReviewsSectionProps {
  place: PetPlaceDetail;
  refetchPlace: () => void;
}

export default function PetPlaceReviewsSection({ place, refetchPlace }: PetPlaceReviewsSectionProps) {
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

  return (
    <div className={cardClass}>
      <div className="p-6">
        <p className="text-xs font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500 mb-4">
          Reseñas {reviewsCount > 0 && `(${reviewsCount})`}
        </p>

        {user ? (
          <form onSubmit={handleSubmit} className="mb-6">
            <div className="p-4 rounded-xl bg-gray-50 dark:bg-white/[0.03] border border-gray-100 dark:border-gray-800">
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Calificación
              </p>
              <div className="flex items-center gap-1 mb-3">
                {[1, 2, 3, 4, 5].map((value) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setRating(value)}
                    onMouseEnter={() => setHoverRating(value)}
                    onMouseLeave={() => setHoverRating(0)}
                    className="p-0.5 rounded focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900"
                    aria-label={`${value} estrella${value !== 1 ? 's' : ''}`}
                  >
                    <HugeiconsIcon
                      icon={StarIcon}
                      size={28}
                      className={`transition-colors ${
                        value <= (hoverRating || rating)
                          ? 'fill-amber-500 text-amber-500'
                          : 'text-gray-300 dark:text-gray-600'
                      }`}
                      strokeWidth={1.5}
                    />
                  </button>
                ))}
              </div>
              <textarea
                value={review}
                onChange={(e) => setReview(e.target.value)}
                placeholder="Escribe tu reseña (opcional)..."
                className="w-full min-h-[100px] p-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#121212] text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500 dark:focus:ring-orange-400 resize-none text-sm"
                rows={3}
                disabled={isSubmitting || isCreatingReview}
              />
              <div className="flex justify-end mt-3">
                <button
                  type="submit"
                  disabled={rating < 1 || isSubmitting || isCreatingReview}
                  className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white font-semibold text-sm rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting || isCreatingReview ? 'Publicando...' : 'Publicar reseña'}
                </button>
              </div>
            </div>
          </form>
        ) : (
          <div className="flex flex-col items-center justify-center py-8 mb-6 bg-gray-50 dark:bg-white/[0.03] rounded-xl border border-gray-100 dark:border-gray-800">
            <p className="text-center text-gray-600 dark:text-gray-400 text-sm mb-3">
              Inicia sesión para dejar tu reseña y calificación.
            </p>
            <Link
              href={Routes.auth.login}
              className="inline-block px-5 py-2.5 bg-orange-500 hover:bg-orange-600 text-white font-semibold text-sm rounded-lg transition-colors"
            >
              Iniciar sesión
            </Link>
          </div>
        )}

        <ul className="space-y-4">
          {reviews.length === 0 ? (
            <li className="text-center py-8 text-gray-500 dark:text-gray-400 text-sm">
              No hay reseñas aún. ¡Sé el primero en opinar!
            </li>
          ) : (
            reviews.map((rev) => (
              <li
                key={rev.id}
                className="p-4 rounded-xl bg-gray-50 dark:bg-white/[0.03] border border-gray-100 dark:border-gray-800"
              >
                <div className="flex gap-3">
                  {rev.user?.profileImage?.url ? (
                    <img
                      src={rev.user.profileImage.url}
                      alt=""
                      width={44}
                      height={44}
                      className="rounded-full object-cover flex-shrink-0 w-11 h-11"
                    />
                  ) : (
                    <span className="w-11 h-11 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center flex-shrink-0">
                      <HugeiconsIcon icon={UserIcon} size={22} className="text-gray-400" strokeWidth={1.5} />
                    </span>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-900 dark:text-white">
                      {rev.user ? [rev.user.name, rev.user.lastName].filter(Boolean).join(' ') : rev.google_user ? rev.google_user : 'Anónimo'}
                    </p>
                    {rev.rating != null && (
                      <p className="flex items-center gap-1 text-amber-500 text-sm mt-0.5">
                        <HugeiconsIcon icon={StarIcon} size={14} className="fill-amber-500 text-amber-500" strokeWidth={1.5} />
                        {rev.rating.toFixed(1)}
                      </p>
                    )}
                    {rev.review && (
                      <p className="text-gray-600 dark:text-gray-400 text-sm mt-2 leading-relaxed">{rev.review}</p>
                    )}
                    <div className="flex items-center justify-between mt-2">
                      {rev.createdAt && (
                        <p className="text-xs text-gray-400 dark:text-gray-500">
                          {new Date(rev.createdAt).toLocaleDateString('es-MX', {
                            day: 'numeric',
                            month: 'long',
                            year: 'numeric',
                          })}
                        </p>
                      )}
                      {rev.user?.id === user?.id && (
                        <button
                          type="button"
                          onClick={() => openDeleteModal(rev.id)}
                          disabled={isDeletingReview}
                          className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors disabled:opacity-50"
                          title="Eliminar reseña"
                        >
                          <HugeiconsIcon icon={Delete02Icon} size={18} />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </li>
            ))
          )}
        </ul>
      </div>

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
