"use client";

import { motion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { HugeiconsIcon } from '@hugeicons/react';
import {
  Image01Icon,
} from '@hugeicons/core-free-icons';
import { BlogPostDetail } from '../types';
import { getCategoryLabel, getCategoryColors } from '../constants';
import { Routes } from 'kadesh/core/routes';
import renderers from 'kadesh/utils/renderes';
import { DocumentRenderer } from '@keystone-6/document-renderer';
import PostActions from './PostActions';
import AuthorCard from '../../shared/AuthorCard';

interface BlogPostDetailProps {
  post: BlogPostDetail;
}


export default function BlogPostDetailComponent({ post }: BlogPostDetailProps) {
  const categoryValue = post.category?.name || '';
  const categoryLabel = getCategoryLabel(categoryValue);
  const categoryColors = getCategoryColors(categoryValue);

  return (
    <article className="min-h-screen bg-[#ffffff] dark:bg-[#121212]">
      {/* Header con imagen */}
      <header className="relative w-full h-150 overflow-hidden">
        {post.image?.url ? (
          <Image
            src={post.image.url}
            alt={post.title}
            fill
            className="object-cover"
            priority
          />
        ) : (
          <div className="absolute inset-0 bg-[#f5f5f5] dark:bg-[#1e1e1e] flex items-center justify-center">
            <HugeiconsIcon
              icon={Image01Icon}
              size={128}
              className="text-[#616161] dark:text-[#b0b0b0]"
              strokeWidth={1.5}
            />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
        
        <div className="absolute bottom-0 left-0 right-0 p-8 text-white">
          <div className="max-w-4xl mx-auto">
            <div className="mb-4">
              <Link
                href={`${Routes.blog.index}?category=${post.category?.url}`}
                className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${categoryColors.border} ${categoryColors.bg} ${categoryColors.text} dark:border-opacity-70`}
              >
                {categoryLabel}
              </Link>
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-4">
              {post.title}
            </h1>
            <p className="text-sm">
              <span className="font-medium">Publicado el: </span>
              <span className="font-bold">{post.publishedAt
                ? new Date(post.publishedAt).toLocaleDateString('es-MX', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })
                : new Date(post.createdAt).toLocaleDateString('es-MX', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}</span>
            </p>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex items-center justify-end mb-8">
          <PostActions 
              postId={post.id}
              viewsCount={post.post_viewsCount}
            /> 
        </div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="prose prose-lg dark:prose-invert max-w-none mb-8"
        >
          <DocumentRenderer document={post.content?.document ?? []} renderers={renderers} />
        </motion.div>

        <div className="flex items-center gap-4 mb-8 pb-8 border-b border-[#e0e0e0] dark:border-[#3a3a3a]">
          <AuthorCard author={post.author} />
          <PostActions 
            postId={post.id}
            viewsCount={post.post_viewsCount}
          />
        </div>

        {post.tags && post.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-8">
            {post.tags.map((tag) => (
              <span
                key={tag.name}
                className="px-3 py-1 rounded-full bg-[#f5f5f5] dark:bg-[#1e1e1e] text-[#616161] dark:text-[#b0b0b0] text-sm"
              >
                #{tag.name}
              </span>
            ))}
          </div>
        )}
      
      </main>
    </article>
  );
}

