"use client";

import { useState } from 'react';
import Image from 'next/image';
import { useAnimalComments } from './hooks/useAnimalComments';
import { Avatar, ConfirmModal } from '../../shared';
import { HugeiconsIcon } from '@hugeicons/react';
import { Delete02Icon } from '@hugeicons/core-free-icons';
import { useUser } from 'kadesh/utils/UserContext';
import { Routes } from 'kadesh/core/routes';
import { formatDateWithDay } from 'kadesh/utils/format-date';
import { AnimalDetail } from './hooks/useAnimalDetail';

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
    <section id="comments-section" className="scroll-mt-20">
      <h2 className="text-2xl font-bold text-[#212121] dark:text-[#ffffff] mb-8">
        Comentarios ({commentsCount}) 
      </h2>
      
      <div className="space-y-6">
        { user ? (
        <form onSubmit={handleSubmit} className="mb-8">
          <div className="bg-[#f5f5f5] dark:bg-[#1e1e1e] rounded-xl p-6 border border-[#e0e0e0] dark:border-[#3a3a3a] transition-all hover:shadow-md">
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Escribe tu comentario..."
              className="w-full min-h-[120px] p-4 rounded-lg border border-[#e0e0e0] dark:border-[#3a3a3a] bg-white dark:bg-[#121212] text-[#212121] dark:text-[#ffffff] placeholder:text-[#616161] dark:placeholder:text-[#b0b0b0] focus:outline-none focus:ring-2 focus:ring-orange-500 dark:focus:ring-orange-400 focus:border-transparent resize-none transition-all"
              rows={4}
              disabled={isSubmitting || isCreatingComment}
            />
            <div className="flex justify-end mt-4">
              <button
                type="submit"
                disabled={!comment.trim() || isSubmitting || isCreatingComment}
                className="px-6 py-2.5 bg-orange-500 hover:bg-orange-600 dark:bg-orange-500 dark:hover:bg-orange-600 text-white font-semibold rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg hover:scale-105 active:scale-100"
              >
                {isSubmitting || isCreatingComment ? 'Publicando...' : 'Publicar comentario'}
              </button>
            </div>
          </div>
        </form>
        ) : (
          <div className="flex flex-col items-center justify-center py-12 bg-[#f5f5f5] dark:bg-[#1e1e1e] rounded-xl border border-[#e0e0e0] dark:border-[#3a3a3a]">
            <p className="text-center text-[#616161] dark:text-[#b0b0b0] mb-4">
              ¿Quieres unirte a la conversación?{' '}
              <span className="font-semibold text-orange-500 dark:text-orange-400">
                Inicia sesión para dejar tu comentario.
              </span>
            </p>
            <a
              href={Routes.auth.login}
              className="inline-block px-6 py-2.5 bg-orange-500 hover:bg-orange-600 dark:bg-orange-500 dark:hover:bg-orange-600 text-white font-semibold rounded-lg transition-all hover:shadow-lg hover:scale-105 active:scale-100"
            >
              Iniciar sesión
            </a>
          </div>
        )}
        <div className="space-y-4">
          {comments.length === 0 ? (
            <div className="text-center py-12 bg-[#f5f5f5] dark:bg-[#1e1e1e] rounded-xl border border-[#e0e0e0] dark:border-[#3a3a3a]">
              <p className="text-[#616161] dark:text-[#b0b0b0]">
                No hay comentarios aún. ¡Sé el primero en comentar!
              </p>
            </div>
          ) : (
            comments.map((commentItem) => (
              <div
                key={commentItem.id}
                className="bg-[#f5f5f5] dark:bg-[#1e1e1e] rounded-xl p-6 border border-[#e0e0e0] dark:border-[#3a3a3a] transition-all hover:shadow-md hover:border-orange-200 dark:hover:border-orange-800/50"
              >
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0">
                    <Avatar
                      author={commentItem.user ? {
                        id: commentItem.user.id,
                        name: commentItem.user.name,
                        lastName: commentItem.user.lastName || '',
                        username: commentItem.user.username,
                        verified: commentItem.user.verified || false,
                        profileImage: commentItem.user.profileImage,
                        createdAt: commentItem.user.createdAt,
                      } : null}
                      size={48}
                      verify={commentItem.user?.verified || false}
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2 flex-wrap">
                      <p className="font-semibold text-[#212121] dark:text-[#ffffff] text-base">
                        {commentItem.user
                          ? `${commentItem.user.name} ${commentItem.user.lastName || ''} ${commentItem.user.secondLastName || ''}`.trim()
                          : 'Usuario anónimo'}
                      </p>
                      {commentItem.user?.verified && (
                        <Image
                          src="/icons/firmar.png"
                          alt="Verificado"
                          width={14}
                          height={14}
                          className="object-contain flex-shrink-0"
                        />
                      )}
                      {commentItem.user?.id === animal?.user?.id && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-700/50">
                          Reportó este animal
                        </span>
                      )}
                      {commentItem.user && (
                        <span className="text-xs text-[#616161] dark:text-[#b0b0b0] flex items-center gap-1">
                          @{commentItem.user.username}
                        </span>
                      )}
                    </div>
                    <p className="text-[#212121] dark:text-[#ffffff] whitespace-pre-wrap leading-relaxed mb-3">
                      {commentItem.comment}
                    </p>
                    <div className="flex items-center gap-3 justify-between pt-2 border-t border-[#e0e0e0] dark:border-[#3a3a3a]">
                      <p className="text-xs text-[#616161] dark:text-[#b0b0b0]">
                        {formatDateWithDay(commentItem.createdAt)}
                      </p>
                      {
                        commentItem.user?.id === user?.id && (
                          <button
                            onClick={() => openDeleteModal(commentItem.id)}
                            disabled={isDeletingComment}
                            className="p-1.5 rounded-lg text-[#616161] dark:text-[#b0b0b0] hover:text-red-500 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                            title="Eliminar comentario"
                          >
                            <HugeiconsIcon icon={Delete02Icon} size={18} />
                          </button>
                        )
                      }
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
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
