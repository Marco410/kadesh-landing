"use client";

import { useState } from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { useAnimalComments } from './hooks/useAnimalComments';
import { Avatar, ConfirmModal } from '../../shared';
import { HugeiconsIcon } from '@hugeicons/react';
import { Delete02Icon } from '@hugeicons/core-free-icons';
import { useUser } from 'kadesh/utils/UserContext';
import { Routes } from 'kadesh/core/routes';
import { formatDateWithDay } from 'kadesh/utils/format-date';
import { AnimalDetail } from './hooks/useAnimalDetail';
import Link from 'next/link';
import { useUiMotion } from 'kadesh/components/shared/motion';

interface AnimalCommentsSectionProps {
  animal: AnimalDetail;
}

export default function AnimalCommentsSection({ animal }: AnimalCommentsSectionProps) {
  const {
    comments,
    commentsCount,
    comment,
    setComment,
    isSubmitting,
    isCreatingComment,
    isDeletingComment,
    handleSubmit,
    handleDelete,
  } = useAnimalComments(animal.id);

  const { user } = useUser();
  const motionPrefs = useUiMotion();
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [commentToDelete, setCommentToDelete] = useState<string | null>(null);

  const openDeleteModal = (commentId: string) => {
    setCommentToDelete(commentId);
    setDeleteModalOpen(true);
  };

  const closeDeleteModal = () => {
    setDeleteModalOpen(false);
    setCommentToDelete(null);
  };

  const confirmDelete = () => {
    if (commentToDelete) {
      handleDelete(commentToDelete);
      closeDeleteModal();
    }
  };

  return (
    <section
      id="comments-section"
      className="scroll-mt-20 rounded-2xl border border-[#ececec] bg-white p-4 dark:border-white/10 dark:bg-night-raised"
    >
      <h2 className="text-lg font-black tracking-[-0.03em] text-[#121212] dark:text-[#eef1f6]">
        Comentarios {commentsCount > 0 ? `(${commentsCount})` : ''}
      </h2>

      <div className="mt-4 space-y-4">
        {user ? (
          <form onSubmit={handleSubmit}>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Escribe tu comentario…"
              className="w-full min-h-[96px] resize-none rounded-xl border border-[#d8dee8] bg-[#f7f8fa] p-3 text-[#121212] placeholder:text-[#5a5a5a] focus:border-kadesh focus:outline-none focus:ring-2 focus:ring-kadesh/30 dark:border-white/12 dark:bg-night dark:text-[#eef1f6] dark:placeholder:text-[#9aa3b2]"
              rows={3}
              disabled={isSubmitting || isCreatingComment}
            />
            <div className="mt-3 flex justify-end">
              <motion.button
                type="submit"
                disabled={!comment.trim() || isSubmitting || isCreatingComment}
                whileTap={
                  !comment.trim() || isSubmitting || isCreatingComment
                    ? undefined
                    : motionPrefs.tap
                }
                className="inline-flex min-h-11 items-center rounded-xl bg-kadesh px-5 text-sm font-semibold text-white transition-colors hover:bg-kadesh-600 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isSubmitting || isCreatingComment ? 'Publicando…' : 'Publicar'}
              </motion.button>
            </div>
          </form>
        ) : (
          <div className="flex flex-col items-start gap-3 rounded-xl bg-[#f7f8fa] px-4 py-5 dark:bg-night">
            <p className="text-sm text-[#5a5a5a] dark:text-[#9aa3b2]">
              Inicia sesión para dejar un comentario.
            </p>
            <Link
              href={Routes.auth.login}
              className="inline-flex min-h-11 items-center rounded-xl bg-kadesh px-5 text-sm font-semibold text-white transition-colors hover:bg-kadesh-600"
            >
              Iniciar sesión
            </Link>
          </div>
        )}

        {comments.length === 0 ? (
          <p className="py-6 text-sm text-[#5a5a5a] dark:text-[#9aa3b2]">
            Nadie ha comentado todavía.
          </p>
        ) : (
          <motion.ul
            className="divide-y divide-[#ececec] dark:divide-white/10"
            variants={motionPrefs.list}
            initial={motionPrefs.list ? 'hidden' : false}
            animate="show"
          >
            {comments.map((commentItem) => (
              <motion.li
                key={commentItem.id}
                variants={motionPrefs.item}
                className="py-4 first:pt-0"
              >
                <div className="flex items-start gap-3">
                  <Avatar
                    author={
                      commentItem.user
                        ? {
                            id: commentItem.user.id,
                            name: commentItem.user.name,
                            lastName: commentItem.user.lastName || '',
                            username: commentItem.user.username,
                            verified: commentItem.user.verified || false,
                            profileImage: commentItem.user.profileImage,
                            createdAt: commentItem.user.createdAt,
                          }
                        : null
                    }
                    size={40}
                    verify={commentItem.user?.verified || false}
                  />
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                      <p className="font-semibold text-[#121212] dark:text-[#eef1f6]">
                        {commentItem.user
                          ? `${commentItem.user.name} ${commentItem.user.lastName || ''}`.trim()
                          : 'Usuario anónimo'}
                      </p>
                      {commentItem.user?.verified && (
                        <Image
                          src="/icons/firmar.png"
                          alt="Verificado"
                          width={14}
                          height={14}
                          className="object-contain"
                        />
                      )}
                      {commentItem.user?.id === animal?.user?.id && (
                        <span className="rounded-full bg-kadesh-50 px-2 py-0.5 text-xs font-semibold text-kadesh dark:bg-kadesh/20">
                          Quien reportó
                        </span>
                      )}
                    </div>
                    <p className="mt-1 whitespace-pre-wrap leading-relaxed text-[#121212] dark:text-[#eef1f6]">
                      {commentItem.comment}
                    </p>
                    <div className="mt-2 flex items-center justify-between gap-3">
                      <p className="text-xs text-[#5a5a5a] dark:text-[#9aa3b2]">
                        {formatDateWithDay(commentItem.createdAt)}
                      </p>
                      {commentItem.user?.id === user?.id && (
                        <button
                          type="button"
                          onClick={() => openDeleteModal(commentItem.id)}
                          disabled={isDeletingComment}
                          className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-[#5a5a5a] hover:bg-red-50 hover:text-red-600 disabled:opacity-50 dark:text-[#9aa3b2] dark:hover:bg-red-950/40 dark:hover:text-red-400"
                          aria-label="Eliminar comentario"
                        >
                          <HugeiconsIcon icon={Delete02Icon} size={16} strokeWidth={1.5} />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </motion.li>
            ))}
          </motion.ul>
        )}
      </div>

      <ConfirmModal
        isOpen={deleteModalOpen}
        onClose={closeDeleteModal}
        onConfirm={confirmDelete}
        title="Eliminar comentario"
        message="¿Estás seguro de que deseas eliminar este comentario? Esta acción no se puede deshacer."
        confirmText="Eliminar"
        cancelText="Cancelar"
        isLoading={isDeletingComment}
        confirmButtonColor="red"
      />
    </section>
  );
}
