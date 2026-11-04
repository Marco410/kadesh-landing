"use client";

import { useState, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
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
import { DashSegmented } from "kadesh/components/app-shell";
import { useProfileMotion } from "./motion";

interface UserPostsSectionProps {
  userId: string;
}

const POST_TABS = [
  { key: "favorites", label: "Favoritos" },
  { key: "liked", label: "Me gusta" },
  { key: "comments", label: "Comentarios" },
] as const;

export default function UserPostsSection({ userId }: UserPostsSectionProps) {
  const motionPrefs = useProfileMotion();
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
      <DashSegmented
        ariaLabel="Publicaciones"
        value={selectedTab}
        onChange={setSelectedTab}
        items={POST_TABS.map((tab) => ({ id: tab.key, label: tab.label, count: countFor[tab.key] }))}
      />

      <div className="mt-5">
        <AnimatePresence mode="wait">
          <motion.div
            key={selectedTab}
            variants={motionPrefs.panel}
            initial={motionPrefs.reduce ? false : "hidden"}
            animate="show"
            exit="exit"
          >
        {selectedTab === "favorites" &&
          (favoritesLoading ? (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              {[1, 2, 3].map((i) => (
                <BlogCardSkeleton key={i} />
              ))}
            </div>
          ) : favoritePosts.length === 0 ? (
            <div className="flex flex-col items-start gap-3 rounded-3xl border border-dash-line bg-dash-surface p-5 shadow-dash">
              <p className="text-sm text-dash-muted">
                Los artículos que guardes aparecen aquí.
              </p>
              <Link
                href={Routes.blog.index}
                className="inline-flex min-h-11 items-center px-4 text-sm font-semibold text-white rounded-full dash-grad-accent shadow-dash-accent transition-[transform,box-shadow,opacity] duration-200 ease-[cubic-bezier(0.16,0.84,0.44,1)] hover:-translate-y-px hover:shadow-dash-accent-lift"
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
            <div className="flex flex-col items-start gap-3 rounded-3xl border border-dash-line bg-dash-surface p-5 shadow-dash">
              <p className="text-sm text-dash-muted">
                Los artículos que marques con me gusta aparecen aquí.
              </p>
              <Link
                href={Routes.blog.index}
                className="inline-flex min-h-11 items-center px-4 text-sm font-semibold text-white rounded-full dash-grad-accent shadow-dash-accent transition-[transform,box-shadow,opacity] duration-200 ease-[cubic-bezier(0.16,0.84,0.44,1)] hover:-translate-y-px hover:shadow-dash-accent-lift"
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
                  className="h-24 animate-pulse rounded-xl bg-dash-surface-3"
                />
              ))}
            </div>
          ) : comments.length === 0 ? (
            <div className="flex flex-col items-start gap-3 rounded-3xl border border-dash-line bg-dash-surface p-5 shadow-dash">
              <p className="text-sm text-dash-muted">
                Tus comentarios en el blog aparecen aquí.
              </p>
              <Link
                href={Routes.blog.index}
                className="inline-flex min-h-11 items-center px-4 text-sm font-semibold text-white rounded-full dash-grad-accent shadow-dash-accent transition-[transform,box-shadow,opacity] duration-200 ease-[cubic-bezier(0.16,0.84,0.44,1)] hover:-translate-y-px hover:shadow-dash-accent-lift"
              >
                Ir al blog
              </Link>
            </div>
          ) : (
            <motion.div
              className="space-y-2"
              variants={motionPrefs.list}
              initial={motionPrefs.reduce ? false : "hidden"}
              animate="show"
            >
              {comments.map((comment: UserComment) => (
                <motion.div
                  key={comment.id}
                  variants={motionPrefs.item}
                  className="relative rounded-[20px] border border-dash-line bg-dash-surface p-3 shadow-dash"
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
                      <h3 className="truncate font-semibold text-dash-ink">
                        {comment.post.title}
                      </h3>
                      <p className="mt-1 line-clamp-2 text-sm text-dash-muted">
                        {comment.comment}
                      </p>
                      <p className="mt-1 text-xs text-dash-muted">
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
                    className="absolute right-2 top-2 inline-flex h-11 w-11 items-center justify-center rounded-lg text-dash-muted hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/40 dark:hover:text-red-400"
                    aria-label="Eliminar comentario"
                  >
                    <HugeiconsIcon icon={Delete02Icon} size={16} />
                  </button>
                </motion.div>
              ))}
            </motion.div>
          ))}
          </motion.div>
        </AnimatePresence>
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
