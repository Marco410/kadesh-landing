"use client";

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { HugeiconsIcon } from '@hugeicons/react';
import { ArrowDown01Icon, ArrowUp01Icon, Delete02Icon, StarIcon, UserIcon } from '@hugeicons/core-free-icons';
import { useUser } from 'kadesh/utils/UserContext';
import { Routes } from 'kadesh/core/routes';
import { ConfirmModal } from 'kadesh/components/shared';
import { usePetPlaceReviews } from './hooks/usePetPlaceReviews';
import { PlaceSection } from './detail/PlaceSections';
import type { PetPlaceDetail } from './types';

const REVIEWS_PREVIEW = 4;

interface PetPlaceReviewsSectionProps {
  place: PetPlaceDetail;
  refetchPlace: () => void;
}

function StarRow({ value, size = 14 }: { value: number; size?: number }) {
  const filled = Math.round(value);
  return (
    <span className="inline-flex items-center gap-0.5" aria-hidden>
      {[1, 2, 3, 4, 5].map((star) => (
        <HugeiconsIcon
          key={star}
          icon={StarIcon}
          size={size}
          strokeWidth={1.5}
          className={star <= filled ? 'fill-amber-500 text-amber-500' : 'text-[#c9ced6] dark:text-[#4a5262]'}
        />
      ))}
    </span>
  );
}

function authorName(review: PetPlaceDetail['pet_place_reviews'][number]): string {
  if (review.user) return [review.user.name, review.user.lastName].filter(Boolean).join(' ');
  return review.google_user || 'Anónimo';
}

/** Average, how the stars split, the person's own review form (on demand) and the list. */
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
  const [expanded, setExpanded] = useState(false);
  const [writing, setWriting] = useState(false);
  const firstStarRef = useRef<HTMLButtonElement>(null);

  const reviews = place.pet_place_reviews ?? [];
  const reviewsCount = place.reviewsCount ?? reviews.length;
  const rated = reviews.filter((item) => item.rating != null);
  const average =
    place.averageRating ?? (rated.length ? rated.reduce((sum, item) => sum + (item.rating ?? 0), 0) / rated.length : null);
  const distribution = [5, 4, 3, 2, 1].map((stars) => ({
    stars,
    count: rated.filter((item) => Math.round(item.rating ?? 0) === stars).length,
  }));
  const visibleReviews = expanded ? reviews : reviews.slice(0, REVIEWS_PREVIEW);
  const canToggle = reviews.length > REVIEWS_PREVIEW;
  const busy = isSubmitting || isCreatingReview;
  const loginHref = `${Routes.auth.login}?redirect=${encodeURIComponent(
    typeof window === 'undefined' ? Routes.veterinaries.index : `${window.location.pathname}#resenas`,
  )}`;

  useEffect(() => {
    if (writing) firstStarRef.current?.focus();
  }, [writing]);

  // The hook clears the form once the review is saved: close it then.
  const submittedRef = useRef(false);
  useEffect(() => {
    if (busy) submittedRef.current = true;
    else if (submittedRef.current && rating === 0) {
      submittedRef.current = false;
      setWriting(false);
    }
  }, [busy, rating]);

  const confirmDelete = () => {
    if (reviewToDelete) handleDelete(reviewToDelete);
    setDeleteModalOpen(false);
    setReviewToDelete(null);
  };

  const writeButton = user ? (
    !writing ? (
      <button
        type="button"
        onClick={() => setWriting(true)}
        className="inline-flex min-h-11 items-center justify-center rounded-xl border-2 border-kadesh px-4 text-sm font-semibold text-kadesh transition-colors hover:bg-kadesh hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-kadesh dark:border-kadesh-400 dark:text-kadesh-300 dark:hover:text-white"
      >
        Escribir una reseña
      </button>
    ) : null
  ) : (
    <Link
      href={loginHref}
      className="inline-flex min-h-11 items-center justify-center rounded-xl border-2 border-kadesh px-4 text-sm font-semibold text-kadesh transition-colors hover:bg-kadesh hover:text-white dark:border-kadesh-400 dark:text-kadesh-300 dark:hover:text-white"
    >
      Inicia sesión para reseñar
    </Link>
  );

  return (
    <PlaceSection id="resenas" title="Reseñas">
      {reviews.length > 0 ? (
        <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:gap-10">
          <div className="shrink-0">
            <p className="text-5xl font-black leading-none tracking-[-0.04em] text-[#121212] tabular-nums dark:text-white">
              {average != null ? average.toFixed(1) : '—'}
            </p>
            <div className="mt-2">
              <StarRow value={average ?? 0} size={16} />
            </div>
            <p className="mt-1 text-sm text-[#5a5a5a] dark:text-[#9aa3b2]">
              {reviewsCount} {reviewsCount === 1 ? 'reseña' : 'reseñas'}
            </p>
          </div>
          <ul className="w-full max-w-sm space-y-1.5" aria-label="Reseñas por estrellas">
            {distribution.map((row) => {
              const share = rated.length ? (row.count / rated.length) * 100 : 0;
              return (
                <li key={row.stars} className="flex items-center gap-3 text-sm">
                  <span className="w-3 text-right tabular-nums text-[#3a3a3a] dark:text-[#c3c9d3]">{row.stars}</span>
                  <span className="h-2 flex-1 overflow-hidden rounded-full bg-[#eceff3] dark:bg-white/10">
                    <span className="block h-full rounded-full bg-amber-500" style={{ width: `${share}%` }} />
                  </span>
                  <span className="w-6 tabular-nums text-[#5a5a5a] dark:text-[#9aa3b2]">{row.count}</span>
                  <span className="sr-only">
                    {row.count} {row.count === 1 ? 'reseña' : 'reseñas'} de {row.stars} estrellas
                  </span>
                </li>
              );
            })}
          </ul>
          <div className="sm:ml-auto sm:self-start">{writeButton}</div>
        </div>
      ) : (
        <div className="flex flex-col items-start gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-[0.9375rem] text-[#3a3a3a] dark:text-[#c3c9d3]">
            Aún no hay reseñas. Si ya llevaste a tu mascota, cuéntale a otros cómo te fue.
          </p>
          {writeButton}
        </div>
      )}

      {user && writing ? (
        <form
          onSubmit={handleSubmit}
          className="mt-6 rounded-2xl border border-[#e6e9ee] p-4 dark:border-white/10 sm:p-5"
          aria-label="Tu reseña"
        >
          <fieldset>
            <legend className="text-sm font-semibold text-[#121212] dark:text-white">Tu calificación</legend>
            <div className="mt-2 flex items-center gap-1" onMouseLeave={() => setHoverRating(0)}>
              {[1, 2, 3, 4, 5].map((value) => (
                <button
                  key={value}
                  ref={value === 1 ? firstStarRef : undefined}
                  type="button"
                  onClick={() => setRating(value)}
                  onMouseEnter={() => setHoverRating(value)}
                  aria-pressed={rating === value}
                  className="inline-flex h-11 w-11 items-center justify-center rounded-lg focus-visible:outline focus-visible:outline-2 focus-visible:outline-kadesh"
                  aria-label={`${value} estrella${value !== 1 ? 's' : ''}`}
                >
                  <HugeiconsIcon
                    icon={StarIcon}
                    size={26}
                    strokeWidth={1.5}
                    className={`transition-colors ${
                      value <= (hoverRating || rating) ? 'fill-amber-500 text-amber-500' : 'text-[#c9ced6] dark:text-[#4a5262]'
                    }`}
                  />
                </button>
              ))}
            </div>
          </fieldset>
          <label className="mt-3 block">
            <span className="text-sm font-semibold text-[#121212] dark:text-white">Cuéntanos cómo te fue (opcional)</span>
            <textarea
              value={review}
              onChange={(event) => setReview(event.target.value)}
              className="mt-2 w-full resize-y rounded-xl border border-[#dfe3e8] bg-white p-3 text-[0.9375rem] text-[#121212] placeholder:text-[#6b7280] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-kadesh dark:border-white/15 dark:bg-night dark:text-white dark:placeholder:text-[#9aa3b2]"
              rows={3}
              placeholder="La atención, el trato, los precios…"
              disabled={busy}
            />
          </label>
          <div className="mt-3 flex flex-wrap justify-end gap-2">
            <button
              type="button"
              onClick={() => setWriting(false)}
              className="inline-flex min-h-11 items-center rounded-xl px-4 text-sm font-semibold text-[#3a3a3a] hover:bg-[#f2f4f7] dark:text-[#c3c9d3] dark:hover:bg-white/[0.06]"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={rating < 1 || busy}
              className="inline-flex min-h-11 items-center rounded-xl bg-kadesh px-5 text-sm font-semibold text-white transition-colors hover:bg-kadesh-600 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {busy ? 'Publicando…' : 'Publicar reseña'}
            </button>
          </div>
        </form>
      ) : null}

      {reviews.length > 0 ? (
        <ul className="mt-8 divide-y divide-[#eef0f3] dark:divide-white/10">
          {visibleReviews.map((item) => (
            <li key={item.id} className="py-5 first:pt-0">
              <div className="flex items-start gap-3">
                {item.user?.profileImage?.url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={item.user.profileImage.url} alt="" width={40} height={40} className="h-10 w-10 shrink-0 rounded-full object-cover" />
                ) : (
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#eef1f5] text-[#5a5a5a] dark:bg-white/[0.06] dark:text-[#9aa3b2]">
                    <HugeiconsIcon icon={UserIcon} size={18} strokeWidth={1.5} aria-hidden />
                  </span>
                )}
                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="truncate text-[0.9375rem] font-semibold text-[#121212] dark:text-white">{authorName(item)}</p>
                      <p className="mt-0.5 flex flex-wrap items-center gap-x-2 text-xs text-[#5a5a5a] dark:text-[#9aa3b2]">
                        {item.rating != null ? (
                          <>
                            <StarRow value={item.rating} size={13} />
                            <span className="sr-only">{item.rating} de 5 estrellas</span>
                          </>
                        ) : null}
                        {item.createdAt ? (
                          <time dateTime={item.createdAt}>
                            {new Date(item.createdAt).toLocaleDateString('es-MX', { day: 'numeric', month: 'short', year: 'numeric' })}
                          </time>
                        ) : null}
                      </p>
                    </div>
                    {user?.id && item.user?.id === user.id ? (
                      <button
                        type="button"
                        onClick={() => {
                          setReviewToDelete(item.id);
                          setDeleteModalOpen(true);
                        }}
                        disabled={isDeletingReview}
                        className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-lg text-[#5a5a5a] hover:bg-red-50 hover:text-red-600 disabled:opacity-50 dark:hover:bg-red-900/20"
                        aria-label="Eliminar mi reseña"
                        title="Eliminar mi reseña"
                      >
                        <HugeiconsIcon icon={Delete02Icon} size={16} aria-hidden />
                      </button>
                    ) : null}
                  </div>
                  {item.review ? (
                    <p className="mt-2 max-w-[65ch] whitespace-pre-line text-[0.9375rem] leading-relaxed text-[#3a3a3a] [overflow-wrap:anywhere] dark:text-[#c3c9d3]">
                      {item.review}
                    </p>
                  ) : null}
                </div>
              </div>
            </li>
          ))}
        </ul>
      ) : null}

      {canToggle ? (
        <button
          type="button"
          aria-expanded={expanded}
          onClick={() => setExpanded((open) => !open)}
          className="mt-2 inline-flex min-h-11 items-center gap-1.5 rounded-xl px-3 text-sm font-semibold text-kadesh transition-colors hover:bg-kadesh-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-kadesh dark:text-kadesh-300 dark:hover:bg-kadesh/15"
        >
          {expanded ? 'Ver menos' : `Ver las ${reviews.length} reseñas`}
          <HugeiconsIcon icon={expanded ? ArrowUp01Icon : ArrowDown01Icon} size={16} strokeWidth={2} aria-hidden />
        </button>
      ) : null}

      <ConfirmModal
        isOpen={deleteModalOpen}
        onClose={() => {
          setDeleteModalOpen(false);
          setReviewToDelete(null);
        }}
        onConfirm={confirmDelete}
        title="Eliminar reseña"
        message="¿Seguro que quieres eliminar tu reseña? No se puede deshacer."
        confirmText="Eliminar"
        cancelText="Cancelar"
        isLoading={isDeletingReview}
        confirmButtonColor="red"
      />
    </PlaceSection>
  );
}
