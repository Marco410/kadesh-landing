"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { HugeiconsIcon } from '@hugeicons/react';
import {
  FavouriteIcon,
  BubbleChatIcon,
  Bookmark02Icon,
  ViewIcon,
} from '@hugeicons/core-free-icons';
import { usePostLikes } from '../hooks/usePostLikes';
import { usePostComments } from '../hooks/usePostComments';
import { usePostFavorites } from '../hooks/usePostFavorites';
import { useUser } from 'kadesh/utils/UserContext';
import ConfirmModal from 'kadesh/components/shared/ConfirmModal';
import { Routes } from 'kadesh/core/routes';

interface PostActionsProps {
  postId: string;
  viewsCount: number;
}

export default function PostActions({ postId, viewsCount }: PostActionsProps) {
  const router = useRouter();
  const { user } = useUser();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const {
    likesCount,
    isLiked,
    loading: likesLoading,
    isCreatingLike,
    isDeletingLike,
    handleLike,
  } = usePostLikes(postId);

  const { commentsCount } = usePostComments(postId);

  const {
    isFavorited,
    loading: favoritesLoading,
    isCreatingFavorite,
    isDeletingFavorite,
    handleFavorite,
  } = usePostFavorites(postId);

  const handleLikeClick = () => {
    if (!user?.id) {
      setShowAuthModal(true);
      return;
    }
    handleLike();
  };

  const handleGoToAuth = () => {
    setShowAuthModal(false);
    const currentPath = typeof window !== 'undefined' ? window.location.pathname : '';
    router.push(`${Routes.auth.login}?redirect=${currentPath}`);
  };

  const handleCommentsClick = () => {
    const commentsSection = document.getElementById('comments-section');
    if (commentsSection) {
      commentsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <div className="flex items-center gap-6">
      <button
        onClick={handleLikeClick}
        className={`flex items-center gap-2 transition-colors ${
          isLiked 
            ? "text-orange-500 dark:text-orange-400" 
            : "text-[#616161] dark:text-[#b0b0b0] hover:text-orange-500 dark:hover:text-orange-400"
        } ${isCreatingLike || isDeletingLike || likesLoading ? "opacity-50 cursor-wait" : "cursor-pointer"}`}
        aria-label="Dar like al artículo"
      >
        <HugeiconsIcon
          icon={FavouriteIcon}
          size={20}
          className={isLiked ? "text-orange-500 dark:text-orange-400" : ""}
          strokeWidth={2}
        />
        <span>{likesCount}</span>
      </button>
      <button
        onClick={handleCommentsClick}
        className="flex items-center gap-2 text-[#616161] dark:text-[#b0b0b0] hover:text-orange-500 dark:hover:text-orange-400 transition-colors cursor-pointer"
        aria-label="Ver comentarios"
      >
        <HugeiconsIcon
          icon={BubbleChatIcon}
          size={20}
          className="text-current"
          strokeWidth={2}
        />
        <span>{commentsCount}</span>
      </button>
      <div className="flex items-center gap-2 text-[#616161] dark:text-[#b0b0b0]">
        <HugeiconsIcon
          icon={ViewIcon}
          size={20}
          className="text-[#616161] dark:text-[#b0b0b0]"
          strokeWidth={2}
        />
        <span>{viewsCount}</span>
      </div>
      {user?.id && (
        <button
          onClick={handleFavorite}
          className={`flex items-center gap-2 transition-colors ${
            isFavorited 
              ? "text-orange-500 dark:text-orange-400" 
              : "text-[#616161] dark:text-[#b0b0b0] hover:text-orange-500 dark:hover:text-orange-400"
          } ${isCreatingFavorite || isDeletingFavorite || favoritesLoading ? "opacity-50 cursor-wait" : "cursor-pointer"}`}
          aria-label="Guardar artículo"
        >
          <HugeiconsIcon
            icon={Bookmark02Icon}
            size={20}
            className={isFavorited ? "text-orange-500 dark:text-orange-400" : ""}
            strokeWidth={2}
          />
        </button>
      )}
      <ConfirmModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        onConfirm={handleGoToAuth}
        title="¡Únete a nuestra comunidad! 🐾"
        message="Para dar like y ser parte de nuestra comunidad, necesitas una cuenta. ¡Es gratis y solo toma un minuto!"
        confirmText="Ya tengo cuenta/Registrarme"
        cancelText="Tal vez después"
        confirmButtonColor="orange"
      />
    </div>
  );
}

