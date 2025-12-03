"use client";

import { HugeiconsIcon } from '@hugeicons/react';
import {
  FavouriteIcon,
  BubbleChatIcon,
  Bookmark02Icon,
  ViewIcon,
} from '@hugeicons/core-free-icons';
import { usePostLikes } from '../hooks/usePostLikes';
import { usePostComments } from '../hooks/usePostComments';

interface PostActionsProps {
  postId: string;
  viewsCount: number;
}

export default function PostActions({ postId, viewsCount }: PostActionsProps) {
  const {
    likesCount,
    isLiked,
    loading: likesLoading,
    isCreatingLike,
    isDeletingLike,
    handleLike,
  } = usePostLikes(postId);

  const { commentsCount } = usePostComments(postId);

  return (
    <div className="flex items-center gap-6">
      <button
        onClick={handleLike}
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
      <div className="flex items-center gap-2 text-[#616161] dark:text-[#b0b0b0]">
        <HugeiconsIcon
          icon={BubbleChatIcon}
          size={20}
          className="text-[#616161] dark:text-[#b0b0b0]"
          strokeWidth={2}
        />
        <span>{commentsCount}</span>
      </div>
      <div className="flex items-center gap-2 text-[#616161] dark:text-[#b0b0b0]">
        <HugeiconsIcon
          icon={ViewIcon}
          size={20}
          className="text-[#616161] dark:text-[#b0b0b0]"
          strokeWidth={2}
        />
        <span>{viewsCount}</span>
      </div>
      <button
        className="text-[#616161] dark:text-[#b0b0b0] hover:text-orange-500 dark:hover:text-orange-400 transition-colors"
        aria-label="Guardar artículo"
      >
        <HugeiconsIcon
          icon={Bookmark02Icon}
          size={20}
          className="text-[#616161] dark:text-[#b0b0b0] hover:text-orange-500 dark:hover:text-orange-400"
          strokeWidth={2}
        />
      </button>
    </div>
  );
}

