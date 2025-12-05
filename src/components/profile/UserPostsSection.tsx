"use client";

import { useState, useEffect } from 'react';
import { Tabs, Tab } from '@heroui/tabs';
import { useUserFavoritePosts } from './hooks/useUserFavoritePosts';
import { useUserLikedPosts } from './hooks/useUserLikedPosts';
import EmptyState from '../shared/EmptyState';
import BlogCardSkeleton from '../blog/BlogCardSkeleton';
import BlogCard from '../blog/BlogCard';
import { useUserComments } from './hooks/useUserComments';
import { Routes } from 'kadesh/core/routes';
import Image from 'next/image';
import Link from 'next/link';
import { ConfirmModal } from '../shared';
import { HugeiconsIcon } from '@hugeicons/react';
import { Delete02Icon } from '@hugeicons/core-free-icons';

interface UserPostsSectionProps {
  userId: string;
}

export default function UserPostsSection({ userId }: UserPostsSectionProps) {
  const [selectedTab, setSelectedTab] = useState('favorites');

  const { posts: favoritePosts, loading: favoritesLoading } = useUserFavoritePosts(userId);
  const { posts: likedPosts, loading: likesLoading } = useUserLikedPosts(userId);
  const { comments, loading: commentsLoading, refetch: refetchComments, handleDelete, isDeletingComment } = useUserComments(userId);

  useEffect(() => {
    if (selectedTab === 'comments') {
      refetchComments();
    }
  }, [selectedTab, refetchComments]);


  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-MX', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
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


  return (
    <div className="bg-white dark:bg-[#1e1e1e] rounded-xl p-6 sm:p-8 border border-[#e0e0e0] dark:border-[#3a3a3a] shadow-md dark:shadow-lg">
      <Tabs
        selectedKey={selectedTab}
        onSelectionChange={(key) => setSelectedTab(key as string)}
        classNames={{
          tabList: "w-full bg-[#f5f5f5] dark:bg-[#2a2a2a] rounded-lg p-1",
          tab: "flex-1 text-sm font-semibold data-[selected=true]:bg-white dark:data-[selected=true]:bg-[#1e1e1e] data-[selected=true]:text-orange-500 dark:data-[selected=true]:text-orange-400 rounded-lg w-34 h-10",
          tabContent: "text-[#616161] dark:text-[#b0b0b0]",
          panel: "mt-6",
        }}
      >
        <Tab key="favorites" title={`Favoritos (${favoritePosts.length})`}>
          {favoritesLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <BlogCardSkeleton key={i} />
              ))}
            </div>
          ) : favoritePosts.length === 0 ? (
            <EmptyState
              title="No tienes posts favoritos"
              description="Los posts que guardes como favoritos aparecerán aquí."
              icon="⭐"
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {favoritePosts.map((post, index) => (
                <div key={post.id} className="border border-[#e0e0e0] dark:border-[#4a4a4a] rounded-xl overflow-hidden shadow-sm dark:shadow-md">
                  <BlogCard post={post} index={index} />
                </div>
              ))}
            </div>
          )}
        </Tab>

        <Tab key="liked" title={`Likeados (${likedPosts.length})`}>
          {likesLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <BlogCardSkeleton key={i} />
              ))}
            </div>
          ) : likedPosts.length === 0 ? (
            <EmptyState
              title="No has dado like a ningún post"
              description="Los posts a los que les des like aparecerán aquí."
              icon="❤️"
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {likedPosts.map((post, index) => (
                <div key={post.id} className="border border-[#e0e0e0] dark:border-[#4a4a4a] rounded-xl overflow-hidden shadow-sm dark:shadow-md">
                  <BlogCard post={post} index={index} />
                </div>
              ))}
            </div>
          )}
        </Tab>

        <Tab key="comments" title={`Comentarios (${comments.length})`}>
          {commentsLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <BlogCardSkeleton key={i} />
              ))}
            </div>
          ) : comments.length === 0 ? (
            <EmptyState
              title="No has comentado en ningún post"
              description="Los comentarios que hagas en los posts aparecerán aquí."
              icon="💬"
            />
          ) : (
            <div className="grid grid-cols-1 gap-6">
              {comments.map((comment) => (
              <div
                key={comment.id}
                className="block bg-white dark:bg-[#2a2a2a] rounded-lg p-4 hover:shadow-md transition-all duration-300 relative group"
              >
                <Link href={Routes.blog.post(comment.post.url)}>
                  <div className="flex gap-4">
                    {comment.post.image?.url && (
                      <div className="relative w-20 h-20 rounded-lg overflow-hidden flex-shrink-0">
                        <Image
                          src={comment.post.image.url}
                          alt={comment.post.title}
                          fill
                          className="object-cover"
                        />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg font-semibold text-[#212121] dark:text-[#ffffff] mb-2 line-clamp-1">
                        {comment.post.title}
                      </h3>
                      <p className="text-[#616161] dark:text-[#b0b0b0] mb-3 line-clamp-2">
                        {comment.comment}
                      </p>
                      <p className="text-xs text-[#616161] dark:text-[#b0b0b0]">
                        {formatDate(comment.createdAt)}
                      </p>
                    </div>
                  </div>
                </Link>
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    openDeleteModal(comment.id);
                  }}
                  className="absolute top-4 right-4 p-2 text-[#616161] dark:text-[#b0b0b0] hover:text-red-500 dark:hover:text-red-400 transition-colors "
                  aria-label="Eliminar comentario"
                >
                  <HugeiconsIcon icon={Delete02Icon} size={20} />
                </button>
              </div>
            ))}
            </div>
          )}
        </Tab>
      </Tabs>

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
