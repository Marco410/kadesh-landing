'use client';

import { useEffect, useState, type FormEvent } from 'react';
import { usePublishProductStars } from './LiveStoreStars';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useApolloClient, useMutation } from '@apollo/client';
import { HugeiconsIcon } from '@hugeicons/react';
import { CheckmarkBadge01Icon, StarIcon } from '@hugeicons/core-free-icons';
import { sileo } from 'sileo';
import { ConfirmModal } from 'kadesh/components/shared';
import { Routes } from 'kadesh/core/routes';
import { cn } from 'kadesh/utils/cn';
import { useUser } from 'kadesh/utils/UserContext';
import { STORE_REVIEW_BODY_MAX, STORE_REVIEW_TITLE_MAX, STORE_REVIEWS_PAGE_SIZE } from './constants';
import { formatRating, formatStoreDate, reviewsCountText } from './format';
import {
  DELETE_STORE_REVIEW_MUTATION,
  STORE_REVIEWS_QUERY,
  SUBMIT_STORE_REVIEW_MUTATION,
  type StoreReviewResult,
  type StoreReviewsResponse,
  type StoreReviewsVariables,
} from './queries';
import { StarRow } from './StoreStars';
import type { StoreReview, StoreReviews } from './types';

const fieldClass =
  'w-full rounded-xl border border-[#d8dee8] bg-white px-3.5 text-[15px] text-[#121212] placeholder:text-[#5a5a5a] focus:outline-none focus:ring-2 focus:ring-kadesh dark:border-white/18 dark:bg-night dark:text-[#eef1f6]';

const STAR_LABELS = ['', 'Muy malo', 'Malo', 'Regular', 'Bueno', 'Excelente'];

function ReviewItem({ review }: { review: StoreReview }) {
  const author = review.author;
  return (
    <li className="border-b border-[#ececec] py-5 last:border-b-0 dark:border-[#2a2a2a]">
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
        <StarRow rating={review.rating} />
        <span className="sr-only">{review.rating} de 5 estrellas</span>
        {review.verifiedPurchase ? (
          <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 dark:text-emerald-400">
            <HugeiconsIcon icon={CheckmarkBadge01Icon} size={14} aria-hidden="true" />
            Compra verificada
          </span>
        ) : null}
      </div>
      {review.title ? <p className="mt-2 font-bold text-[#121212] dark:text-white">{review.title}</p> : null}
      {review.body ? (
        <p className="mt-1 whitespace-pre-line leading-relaxed text-[#3a3a3a] [overflow-wrap:anywhere] dark:text-[#d0d0d0]">
          {review.body}
        </p>
      ) : null}
      <p className="mt-2 text-sm text-[#5a5a5a] dark:text-[#9aa3b2]">
        {author?.username ? (
          <Link href={Routes.publicProfile(author.username)} className="font-semibold text-kadesh-700 hover:underline dark:text-kadesh-300">
            {author.name}
          </Link>
        ) : (
          <span className="font-semibold">{author?.name ?? 'Alguien de Kadesh'}</span>
        )}
        {author?.level ? ` · ${author.level.label}` : ''}
        {review.createdAt ? ` · ${formatStoreDate(review.createdAt)}` : ''}
      </p>
      {review.adminReply ? (
        <p className="mt-3 rounded-xl bg-[#f7f8fa] px-4 py-3 text-sm text-[#3a3a3a] [overflow-wrap:anywhere] dark:bg-white/5 dark:text-[#d0d0d0]">
          <span className="font-semibold text-[#121212] dark:text-white">Respuesta de Kadesh: </span>
          {review.adminReply}
        </p>
      ) : null}
    </li>
  );
}

/**
 * Reviews of a product. Every product starts with no stars: only reviews written here count.
 * The first page comes from the server; with a session the browser asks once more to bring the
 * person's own review, and again after they write, edit or delete it.
 */
export default function ProductReviews({
  productId,
  productName,
  initial,
  initialAverage,
  initialCount,
  initialBreakdown,
}: {
  productId: string;
  productName: string;
  initial: StoreReviews;
  initialAverage: number;
  initialCount: number;
  initialBreakdown: number[];
}) {
  const pathname = usePathname();
  const client = useApolloClient();
  const { user } = useUser();
  const [items, setItems] = useState<StoreReview[]>(initial.items);
  const [total, setTotal] = useState(initial.total);
  const [mine, setMine] = useState<StoreReview | null>(null);
  const [average, setAverage] = useState(initialAverage);
  const [count, setCount] = useState(initialCount);
  // The header stars at the top of the page follow these.
  usePublishProductStars(productId, average, count);
  const [rating, setRating] = useState(0);
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);

  const [submitReview] = useMutation<{ submitStoreProductReview: StoreReviewResult }>(SUBMIT_STORE_REVIEW_MUTATION);
  const [deleteReview] = useMutation<{ deleteMyStoreProductReview: StoreReviewResult }>(DELETE_STORE_REVIEW_MUTATION);

  const fetchPage = async (skip: number) => {
    const { data } = await client.query<StoreReviewsResponse, StoreReviewsVariables>({
      query: STORE_REVIEWS_QUERY,
      variables: { productId, take: STORE_REVIEWS_PAGE_SIZE, skip },
      fetchPolicy: 'network-only',
    });
    return data.storeCatalogReviews;
  };

  const applyPage = (fresh: StoreReviewsResponse['storeCatalogReviews']) => {
    setItems(fresh.items);
    setTotal(fresh.total);
    setMine(fresh.mine);
    // The product page is cached for a minute: the stars of this answer are the current ones.
    setAverage(fresh.ratingAverage);
    setCount(fresh.ratingCount);
  };

  const refresh = async () => {
    const fresh = await fetchPage(0);
    applyPage(fresh);
    return fresh;
  };

  // With a session: bring the person's own review (the server page has no session).
  useEffect(() => {
    if (!user?.id) return;
    let cancelled = false;
    fetchPage(0)
      .then((fresh) => {
        if (!cancelled) applyPage(fresh);
      })
      .catch((error) => console.error('Could not load your review:', error));
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id, productId]);

  const startEditing = () => {
    setRating(mine?.rating ?? 0);
    setTitle(mine?.title ?? '');
    setBody(mine?.body ?? '');
    setEditing(true);
  };

  const applyStars = (result: StoreReviewResult) => {
    if (result.ratingAverage != null) setAverage(result.ratingAverage);
    if (result.ratingCount != null) setCount(result.ratingCount);
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (rating < 1) {
      sileo.warning({ title: 'Elige cuántas estrellas le das.' });
      return;
    }
    setSaving(true);
    try {
      const { data } = await submitReview({
        variables: { input: { productId, rating, title: title.trim(), body: body.trim() } },
      });
      const result = data?.submitStoreProductReview;
      if (!result?.success) {
        sileo.error({ title: result?.message ?? 'No pudimos guardar tu reseña.' });
        return;
      }
      applyStars(result);
      sileo.success({ title: result.message });
      setEditing(false);
      await refresh();
    } catch {
      sileo.error({ title: 'No pudimos guardar tu reseña. Intenta de nuevo.' });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    setSaving(true);
    try {
      const { data } = await deleteReview({ variables: { productId } });
      const result = data?.deleteMyStoreProductReview;
      if (!result?.success) {
        sileo.error({ title: result?.message ?? 'No pudimos borrar tu reseña.' });
        return;
      }
      applyStars(result);
      sileo.success({ title: result.message });
      setEditing(false);
      setRating(0);
      setTitle('');
      setBody('');
      await refresh();
    } catch {
      sileo.error({ title: 'No pudimos borrar tu reseña. Intenta de nuevo.' });
    } finally {
      setSaving(false);
      setConfirmDelete(false);
    }
  };

  const loadMore = async () => {
    setLoadingMore(true);
    try {
      const page = await fetchPage(items.length);
      setItems((current) => {
        const seen = new Set(current.map((review) => review.id));
        return [...current, ...page.items.filter((review) => !seen.has(review.id))];
      });
      setTotal(page.total);
    } catch {
      sileo.error({ title: 'No pudimos cargar más reseñas. Intenta de nuevo.' });
    } finally {
      setLoadingMore(false);
    }
  };

  // The breakdown comes from the server page; it is only shown while it still matches the count.
  const breakdownTotal = initialBreakdown.reduce((sum, value) => sum + value, 0);
  const showBreakdown = count > 0 && breakdownTotal === count;
  const hidden = mine?.status === 'hidden';
  const showForm = Boolean(user?.id) && !hidden && (editing || !mine);

  return (
    <section id="resenas" aria-labelledby="resenas-titulo" className="scroll-mt-28">
      <h2 id="resenas-titulo" className="mb-6 text-2xl font-black tracking-[-0.02em] text-[#121212] dark:text-white">
        Reseñas
      </h2>

      <div className="grid grid-cols-1 gap-10 lg:grid-cols-[minmax(0,20rem)_minmax(0,1fr)]">
        <div className="flex flex-col gap-6">
          <div>
            {count > 0 ? (
              <p className="flex items-baseline gap-2">
                <span className="text-5xl font-black tracking-[-0.03em] text-[#121212] dark:text-white">
                  {formatRating(average)}
                </span>
                <span className="text-[#5a5a5a] dark:text-[#9aa3b2]">de 5</span>
              </p>
            ) : null}
            <StarRow rating={count > 0 ? average : 0} size={20} className="mt-1" />
            <p className="mt-1 text-sm text-[#5a5a5a] dark:text-[#9aa3b2]">
              {count > 0
                ? `${reviewsCountText(count)} de personas en Kadesh`
                : 'Todavía nadie lo califica. Sé la primera persona en contar cómo le fue.'}
            </p>
            {showBreakdown ? (
              <ul className="mt-4 flex flex-col gap-1.5" aria-label="Reseñas por número de estrellas">
                {[5, 4, 3, 2, 1].map((stars) => {
                  const amount = initialBreakdown[stars - 1] ?? 0;
                  return (
                    <li key={stars} className="flex items-center gap-2 text-sm text-[#5a5a5a] dark:text-[#9aa3b2]">
                      <span className="w-16 shrink-0">
                        {stars} {stars === 1 ? 'estrella' : 'estrellas'}
                      </span>
                      <span className="h-2 flex-1 overflow-hidden rounded-full bg-[#e8edf3] dark:bg-white/10" aria-hidden="true">
                        <span
                          className="block h-full rounded-full bg-amber-500"
                          style={{ width: `${Math.round((amount / count) * 100)}%` }}
                        />
                      </span>
                      <span className="w-6 shrink-0 text-right tabular-nums">{amount}</span>
                    </li>
                  );
                })}
              </ul>
            ) : null}
          </div>

          {!user?.id ? (
            <div className="rounded-2xl border border-[#ececec] p-5 dark:border-[#2a2a2a]">
              <p className="mb-3 text-[#3a3a3a] dark:text-[#d0d0d0]">¿Ya lo usaste? Cuéntale a la comunidad cómo te fue.</p>
              <Link
                href={`${Routes.auth.login}?redirect=${encodeURIComponent(`${pathname}#resenas`)}`}
                className="inline-flex min-h-12 items-center rounded-xl bg-kadesh px-6 font-semibold text-white hover:bg-kadesh-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-kadesh"
              >
                Inicia sesión para reseñar
              </Link>
            </div>
          ) : hidden ? (
            <p className="rounded-2xl border border-[#ececec] p-5 text-sm text-[#3a3a3a] dark:border-[#2a2a2a] dark:text-[#d0d0d0]">
              El equipo de Kadesh retiró tu reseña de este producto.
            </p>
          ) : mine && !editing ? (
            <div className="rounded-2xl border border-[#ececec] p-5 dark:border-[#2a2a2a]">
              <p className="mb-1 text-sm font-semibold text-[#121212] dark:text-white">Tu reseña</p>
              <StarRow rating={mine.rating} />
              {mine.title ? <p className="mt-2 font-semibold text-[#121212] dark:text-white">{mine.title}</p> : null}
              {mine.body ? (
                <p className="mt-1 line-clamp-4 text-sm text-[#3a3a3a] dark:text-[#d0d0d0]">{mine.body}</p>
              ) : null}
              <div className="mt-4 flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={startEditing}
                  disabled={saving}
                  className="inline-flex min-h-11 items-center rounded-xl border border-[#d8dee8] px-4 text-sm font-semibold text-[#121212] hover:border-kadesh dark:border-white/15 dark:text-white"
                >
                  Editar
                </button>
                <button
                  type="button"
                  onClick={() => setConfirmDelete(true)}
                  disabled={saving}
                  className="inline-flex min-h-11 items-center rounded-xl px-4 text-sm font-semibold text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-500/10"
                >
                  Borrar
                </button>
              </div>
            </div>
          ) : null}

          {showForm ? (
            <form onSubmit={handleSubmit} className="flex flex-col gap-4 rounded-2xl border border-[#ececec] p-5 dark:border-[#2a2a2a]">
              <p className="text-sm font-semibold text-[#121212] dark:text-white">
                {mine ? 'Edita tu reseña' : `¿Qué te pareció ${productName}?`}
              </p>
              <fieldset>
                <legend className="mb-1 text-sm text-[#5a5a5a] dark:text-[#9aa3b2]">Tu calificación</legend>
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      aria-pressed={rating === star}
                      aria-label={`${star} de 5: ${STAR_LABELS[star]}`}
                      className="inline-flex size-11 items-center justify-center rounded-lg focus-visible:outline focus-visible:outline-2 focus-visible:outline-kadesh"
                    >
                      <HugeiconsIcon
                        icon={StarIcon}
                        size={28}
                        strokeWidth={1.5}
                        fill={star <= rating ? 'currentColor' : 'none'}
                        className={star <= rating ? 'text-amber-500' : 'text-[#c4cad4] dark:text-white/25'}
                        aria-hidden="true"
                      />
                    </button>
                  ))}
                  <span className="ml-2 text-sm text-[#5a5a5a] dark:text-[#9aa3b2]" aria-live="polite">
                    {STAR_LABELS[rating]}
                  </span>
                </div>
              </fieldset>
              <label className="flex flex-col gap-1 text-sm text-[#5a5a5a] dark:text-[#9aa3b2]">
                Título (opcional)
                <input
                  value={title}
                  onChange={(event) => setTitle(event.target.value)}
                  maxLength={STORE_REVIEW_TITLE_MAX}
                  className={cn(fieldClass, 'min-h-11')}
                />
              </label>
              <label className="flex flex-col gap-1 text-sm text-[#5a5a5a] dark:text-[#9aa3b2]">
                Tu experiencia (opcional)
                <textarea
                  value={body}
                  onChange={(event) => setBody(event.target.value)}
                  maxLength={STORE_REVIEW_BODY_MAX}
                  rows={4}
                  className={cn(fieldClass, 'py-2.5 leading-relaxed')}
                  placeholder="Qué le gustó a tu mascota, cómo llegó, si lo volverías a comprar…"
                />
              </label>
              <div className="flex flex-wrap gap-2">
                <button
                  type="submit"
                  disabled={saving}
                  className="inline-flex min-h-12 items-center rounded-xl bg-kadesh px-6 font-semibold text-white hover:bg-kadesh-600 disabled:opacity-60"
                >
                  {saving ? 'Guardando…' : mine ? 'Guardar cambios' : 'Publicar reseña'}
                </button>
                {editing ? (
                  <button
                    type="button"
                    onClick={() => setEditing(false)}
                    disabled={saving}
                    className="inline-flex min-h-12 items-center rounded-xl px-4 font-semibold text-[#5a5a5a] dark:text-[#b0b0b0]"
                  >
                    Cancelar
                  </button>
                ) : null}
              </div>
            </form>
          ) : null}
        </div>

        <div>
          {items.length > 0 ? (
            <ul>
              {items.map((review) => (
                <ReviewItem key={review.id} review={review} />
              ))}
            </ul>
          ) : (
            <p className="rounded-2xl border border-dashed border-[#d8dee8] px-6 py-10 text-center text-[#5a5a5a] dark:border-white/15 dark:text-[#b0b0b0]">
              Aquí aparecerán las reseñas de quienes lo califiquen.
            </p>
          )}
          {items.length > 0 && items.length < total ? (
            <button
              type="button"
              onClick={() => void loadMore()}
              disabled={loadingMore}
              className="mt-6 inline-flex min-h-12 items-center rounded-xl border border-[#d8dee8] px-6 font-semibold text-[#121212] hover:border-kadesh disabled:opacity-50 dark:border-white/15 dark:text-white"
            >
              {loadingMore ? 'Cargando…' : 'Ver más reseñas'}
            </button>
          ) : null}
        </div>
      </div>
      <ConfirmModal
        isOpen={confirmDelete}
        onClose={() => {
          if (!saving) setConfirmDelete(false);
        }}
        onConfirm={() => void handleDelete()}
        title="Borrar tu reseña"
        message={`¿Borrar tu reseña de ${productName}? Si te dio huellitas, se descuentan.`}
        confirmText="Borrar"
        cancelText="Conservarla"
        isLoading={saving}
        confirmButtonColor="red"
      />
    </section>
  );
}
