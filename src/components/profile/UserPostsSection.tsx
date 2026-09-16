"use client";

import { useState, useEffect } from "react";
import { useUserFavoritePosts } from "./hooks/useUserFavoritePosts";
import { useUserLikedPosts } from "./hooks/useUserLikedPosts";
import BlogCardSkeleton from "../blog/BlogCardSkeleton";
import BlogCard from "../blog/BlogCard";
import { useUserComments } from "./hooks/useUserComments";
import { Routes } from "kadesh/core/routes";
import Image from "next/image";
import Link from "next/link";
import { ConfirmModal } from "kadesh/components/shared";
import { HugeiconsIcon } from "@hugeicons/react";
import { Delete02Icon } from "@hugeicons/core-free-icons";
import type { UserComment } from "./queries";

interface UserPostsSectionProps {
  userId: string;
}

const POST_TABS = [
  { key: "favorites", label: "Favoritos" },
  { key: "liked", label: "Me gusta" },
  { key: "comments", label: "Comentarios" },
] as const;

export default function UserPostsSection({ userId }: UserPostsSectionProps) {
  const [selectedTab, setSelectedTab] =
    useState<(typeof POST_TABS)[number]["key"]>("favorites");

  const { posts: favoritePosts, loading: favoritesLoading } =
    useUserFavoritePosts(userId);
  const { posts: likedPosts, loading: likesLoading } =
    useUserLikedPosts(userId);
  const {
    comments,
    loading: commentsLoading,
    refetch: refetchComments,
    handleDelete,
    isDeletingComment,
  } = useUserComments(userId);

  useEffect(() => {
    if (selectedTab === "comments") {
      refetchComments();
    }
  }, [selectedTab, refetchComments]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("es-MX", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

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

  const countFor = {
    favorites: favoritePosts.length,
    liked: likedPosts.length,
    comments: comments.length,
  };

  return (
    <div>
      <div
        role="tablist"
        aria-label="Publicaciones"
        className="flex flex-wrap gap-2"
      >
        {POST_TABS.map((tab) => {
          const selected = tab.key === selectedTab;
          return (
            <button
              key={tab.key}
              type="button"
              role="tab"
              aria-selected={selected}
              onClick={() => setSelectedTab(tab.key)}
              className={`inline-flex min-h-11 items-center rounded-full px-4 text-sm font-semibold transition-colors duration-150 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-kadesh ${
                selected
                  ? "bg-kadesh text-white shadow-[0_8px_18px_rgba(15,35,80,0.18)]"
                  : "bg-[#f3f5f8] text-[#3a3a3a] hover:bg-kadesh-50 dark:bg-night dark:text-[#d0d0d0] dark:hover:bg-kadesh/20"
              }`}
            >
              {tab.label} ({countFor[tab.key]})
            </button>
          );
        })}
      </div>

      <div className="mt-5">
        {selectedTab === "favorites" &&
          (favoritesLoading ? (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              {[1, 2, 3].map((i) => (
                <BlogCardSkeleton key={i} />
              ))}
            </div>
          ) : favoritePosts.length === 0 ? (
            <div className="flex flex-col items-start gap-3 rounded-2xl border border-[#ececec] bg-white p-5 dark:border-white/10 dark:bg-night-raised">
              <p className="text-sm text-[#5a5a5a] dark:text-[#9aa3b2]">
                Los artículos que guardes aparecen aquí.
              </p>
              <Link
                href={Routes.blog.index}
                className="inline-flex min-h-11 items-center rounded-xl bg-kadesh px-4 text-sm font-semibold text-white hover:bg-kadesh-600"
              >
                Ir al blog
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              {favoritePosts.map((post, index) => (
                <BlogCard key={post.id} post={post} index={index} />
              ))}
            </div>
          ))}

        {selectedTab === "liked" &&
          (likesLoading ? (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              {[1, 2, 3].map((i) => (
                <BlogCardSkeleton key={i} />
              ))}
            </div>
          ) : likedPosts.length === 0 ? (
            <div className="flex flex-col items-start gap-3 rounded-2xl border border-[#ececec] bg-white p-5 dark:border-white/10 dark:bg-night-raised">
              <p className="text-sm text-[#5a5a5a] dark:text-[#9aa3b2]">
                Los artículos que marques con me gusta aparecen aquí.
              </p>
              <Link
                href={Routes.blog.index}
                className="inline-flex min-h-11 items-center rounded-xl bg-kadesh px-4 text-sm font-semibold text-white hover:bg-kadesh-600"
              >
                Ir al blog
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              {likedPosts.map((post, index) => (
                <BlogCard key={post.id} post={post} index={index} />
              ))}
            </div>
          ))}

        {selectedTab === "comments" &&
          (commentsLoading ? (
            <div className="space-y-2">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="h-24 animate-pulse rounded-xl bg-[#e6e9ef] dark:bg-white/10"
                />
              ))}
            </div>
          ) : comments.length === 0 ? (
            <div className="flex flex-col items-start gap-3 rounded-2xl border border-[#ececec] bg-white p-5 dark:border-white/10 dark:bg-night-raised">
              <p className="text-sm text-[#5a5a5a] dark:text-[#9aa3b2]">
                Tus comentarios en el blog aparecen aquí.
              </p>
              <Link
                href={Routes.blog.index}
                className="inline-flex min-h-11 items-center rounded-xl bg-kadesh px-4 text-sm font-semibold text-white hover:bg-kadesh-600"
              >
                Ir al blog
              </Link>
            </div>
          ) : (
            <div className="space-y-2">
              {comments.map((comment: UserComment) => (
                <div
                  key={comment.id}
                  className="relative rounded-2xl border border-[#ececec] bg-white p-3 dark:border-white/10 dark:bg-night-raised"
                >
                  <Link
                    href={Routes.blog.post(comment.post.url)}
                    className="flex gap-3"
                  >
                    {comment.post.image?.url && (
                      <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-lg">
                        <Image
                          src={comment.post.image.url}
                          alt=""
                          fill
                          className="object-cover"
                        />
                      </div>
                    )}
                    <div className="min-w-0 flex-1 pr-8">
                      <h3 className="truncate font-semibold text-[#121212] dark:text-[#eef1f6]">
                        {comment.post.title}
                      </h3>
                      <p className="mt-1 line-clamp-2 text-sm text-[#5a5a5a] dark:text-[#9aa3b2]">
                        {comment.comment}
                      </p>
                      <p className="mt-1 text-xs text-[#9aa3b2]">
                        {formatDate(comment.createdAt)}
                      </p>
                    </div>
                  </Link>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      openDeleteModal(comment.id);
                    }}
                    className="absolute right-2 top-2 inline-flex h-11 w-11 items-center justify-center rounded-lg text-[#5a5a5a] hover:bg-red-50 hover:text-red-600 dark:text-[#9aa3b2] dark:hover:bg-red-950/40 dark:hover:text-red-400"
                    aria-label="Eliminar comentario"
                  >
                    <HugeiconsIcon icon={Delete02Icon} size={16} />
                  </button>
                </div>
              ))}
            </div>
          ))}
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
    </div>
  );
}
