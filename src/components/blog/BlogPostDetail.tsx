"use client";

import { motion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { HugeiconsIcon } from '@hugeicons/react';
import {
  FavouriteIcon,
  BubbleChatIcon,
  Bookmark02Icon,
  Image01Icon,
  ArrowLeftIcon
} from '@hugeicons/core-free-icons';
import { BlogPostDetail } from './types';
import { getCategoryLabel, getCategoryColors } from './constants';
import { Routes } from 'kadesh/core/routes';

interface BlogPostDetailProps {
  post: BlogPostDetail;
}

// Función básica para renderizar el contenido del documento
function renderDocumentContent(document: any): React.ReactNode {
  if (!document || !document.children) return null;

  const renderNode = (node: any, index: number): React.ReactNode => {
    if (!node) return null;

    switch (node.type) {
      case 'paragraph':
        return (
          <p key={index} className="mb-4 text-[#212121] dark:text-[#ffffff] leading-relaxed">
            {node.children?.map((child: any, i: number) => renderNode(child, i))}
          </p>
        );
      case 'heading':
        const HeadingTag = `h${node.level}` as keyof JSX.IntrinsicElements;
        const headingClasses = {
          1: 'text-4xl font-bold mb-6 mt-8',
          2: 'text-3xl font-bold mb-5 mt-7',
          3: 'text-2xl font-bold mb-4 mt-6',
          4: 'text-xl font-bold mb-3 mt-5',
          5: 'text-lg font-bold mb-3 mt-4',
          6: 'text-base font-bold mb-2 mt-3',
        }[node.level] || 'text-lg font-bold mb-3';
        return (
          <HeadingTag
            key={index}
            className={`${headingClasses} text-[#212121] dark:text-[#ffffff]`}
          >
            {node.children?.map((child: any, i: number) => renderNode(child, i))}
          </HeadingTag>
        );
      case 'blockquote':
        return (
          <blockquote
            key={index}
            className="border-l-4 border-orange-500 pl-4 my-6 italic text-[#616161] dark:text-[#b0b0b0]"
          >
            {node.children?.map((child: any, i: number) => renderNode(child, i))}
          </blockquote>
        );
      case 'code':
        return (
          <code
            key={index}
            className="bg-[#f5f5f5] dark:bg-[#1e1e1e] px-2 py-1 rounded text-sm font-mono text-[#212121] dark:text-[#ffffff]"
          >
            {node.text}
          </code>
        );
      case 'list':
        const ListTag = node.ordered ? 'ol' : 'ul';
        const listClasses = node.ordered ? 'list-decimal ml-6 mb-4' : 'list-disc ml-6 mb-4';
        return (
          <ListTag key={index} className={`${listClasses} text-[#212121] dark:text-[#ffffff]`}>
            {node.children?.map((child: any, i: number) => renderNode(child, i))}
          </ListTag>
        );
      case 'list-item':
        return (
          <li key={index} className="mb-2">
            {node.children?.map((child: any, i: number) => renderNode(child, i))}
          </li>
        );
      case 'link':
        return (
          <a
            key={index}
            href={node.href}
            target={node.openInNewTab ? '_blank' : undefined}
            rel={node.openInNewTab ? 'noopener noreferrer' : undefined}
            className="text-orange-500 hover:text-orange-600 dark:text-orange-400 dark:hover:text-orange-300 underline"
          >
            {node.children?.map((child: any, i: number) => renderNode(child, i))}
          </a>
        );
      case 'text':
        if (node.bold && node.italic) {
          return <strong key={index}><em>{node.text}</em></strong>;
        } else if (node.bold) {
          return <strong key={index}>{node.text}</strong>;
        } else if (node.italic) {
          return <em key={index}>{node.text}</em>;
        } else if (node.underline) {
          return <u key={index}>{node.text}</u>;
        } else if (node.strikethrough) {
          return <s key={index}>{node.text}</s>;
        }
        return <span key={index}>{node.text}</span>;
      case 'divider':
        return <hr key={index} className="my-8 border-[#e0e0e0] dark:border-[#3a3a3a]" />;
      default:
        return node.children?.map((child: any, i: number) => renderNode(child, i));
    }
  };

  return <div>{document.children.map((node: any, index: number) => renderNode(node, index))}</div>;
}

export default function BlogPostDetailComponent({ post }: BlogPostDetailProps) {
  const categoryValue = post.category?.name || '';
  const categoryLabel = getCategoryLabel(categoryValue);
  const categoryColors = getCategoryColors(categoryValue);

  return (
    <article className="min-h-screen bg-[#ffffff] dark:bg-[#121212]">
      {/* Header con imagen */}
      <header className="relative w-full h-96 overflow-hidden">
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
        
        {/* Botón de regreso */}
        <div className="absolute top-4 left-4 z-10">
          <Link
            href={Routes.blog.index}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/10 backdrop-blur-sm text-white hover:bg-white/20 transition-colors"
          >
            <HugeiconsIcon icon={ArrowLeftIcon} size={20} />
            <span>Volver al blog</span>
          </Link>
        </div>

        {/* Contenido del header */}
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
            {post.excerpt && (
              <p className="text-lg sm:text-xl opacity-90 max-w-3xl">
                {post.excerpt}
              </p>
            )}
          </div>
        </div>
      </header>

      {/* Contenido principal */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Información del autor y fecha */}
        <div className="flex items-center gap-4 mb-8 pb-8 border-b border-[#e0e0e0] dark:border-[#3a3a3a]">
          <div className="relative w-12 h-12 rounded-full bg-orange-500 flex items-center justify-center text-white font-bold overflow-hidden">
            {post.author?.profileImage?.url ? (
              <Image
                src={post.author.profileImage.url}
                alt={post.author.name}
                fill
                className="object-cover"
              />
            ) : (
              <span>{post.author?.name?.charAt(0) || 'A'}</span>
            )}
          </div>
          <div className="flex-1">
            <p className="font-semibold text-[#212121] dark:text-[#ffffff]">
              {post.author?.name || 'Autor'}
            </p>
            <p className="text-sm text-[#616161] dark:text-[#b0b0b0]">
              {post.publishedAt
                ? new Date(post.publishedAt).toLocaleDateString('es-MX', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })
                : new Date(post.createdAt).toLocaleDateString('es-MX', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
            </p>
          </div>
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2 text-[#616161] dark:text-[#b0b0b0]">
              <HugeiconsIcon
                icon={FavouriteIcon}
                size={20}
                className="text-[#616161] dark:text-[#b0b0b0]"
                strokeWidth={2}
              />
              <span>{post.post_likesCount || 0}</span>
            </div>
            <div className="flex items-center gap-2 text-[#616161] dark:text-[#b0b0b0]">
              <HugeiconsIcon
                icon={BubbleChatIcon}
                size={20}
                className="text-[#616161] dark:text-[#b0b0b0]"
                strokeWidth={2}
              />
              <span>{post.commentsCount || 0}</span>
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
        </div>

        {/* Tags */}
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

        {/* Contenido del post */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="prose prose-lg dark:prose-invert max-w-none"
        >
          {post.content?.document && renderDocumentContent(post.content.document)}
        </motion.div>
      </main>
    </article>
  );
}

