"use client";

import { useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import { Footer, Navigation } from 'kadesh/components/layout';
import { usePostByUrl } from 'kadesh/components/blog/hooks/usePostByUrl';
import { usePostView } from 'kadesh/components/blog/hooks/usePostView';
import BlogPostDetailComponent from 'kadesh/components/blog/post/BlogPostDetail';
import { ErrorState } from 'kadesh/components/shared';

interface BlogPostPageProps {
  params: Promise<{
    url: string;
  }>;
}

export default function BlogPostPage({ params }: BlogPostPageProps) {
  const router = useRouter();
  const { url } = use(params);
  const { post, loading, error } = usePostByUrl(url);
  
  usePostView(post?.id || '');

  useEffect(() => {
    if (!loading && !error && !post) {
      router.push('/404');
    }
  }, [loading, error, post, router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#ffffff] dark:bg-[#121212]">
        <Navigation />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="animate-pulse space-y-8">
            <div className="h-96 bg-gray-300 dark:bg-neutral-700 rounded-lg"></div>
            <div className="h-8 bg-gray-300 dark:bg-neutral-700 rounded w-3/4"></div>
            <div className="h-4 bg-gray-300 dark:bg-neutral-700 rounded w-full"></div>
            <div className="h-4 bg-gray-300 dark:bg-neutral-700 rounded w-5/6"></div>
            <div className="h-4 bg-gray-300 dark:bg-neutral-700 rounded w-4/6"></div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#ffffff] dark:bg-[#121212]">
        <Navigation />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <ErrorState
            message={error?.message || 'Error desconocido al cargar el post'}
            title="Error al cargar el post"
          />
        </div>
        <Footer />
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen bg-[#ffffff] dark:bg-[#121212]">
        <Navigation />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-[#212121] dark:text-[#ffffff] mb-4">
              Post no encontrado
            </h1>
            <p className="text-[#616161] dark:text-[#b0b0b0] mb-6">
              El post que buscas no existe o ha sido eliminado.
            </p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#ffffff] dark:bg-[#121212]">
      <Navigation />
      <BlogPostDetailComponent post={post} />
      <Footer />
    </div>
  );
}

