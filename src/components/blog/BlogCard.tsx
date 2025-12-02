"use client";

import { motion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { HugeiconsIcon } from '@hugeicons/react';
import {
    FavouriteIcon,
    BubbleChatIcon,
    Bookmark02Icon
} from '@hugeicons/core-free-icons';

interface BlogPost {
  id: number;
  title: string;
  excerpt: string;
  author: string;
  date: string;
  category: string;
  image: string;
}

interface BlogCardProps {
  post: BlogPost;
  index: number;
}

export default function BlogCard({ post, index }: BlogCardProps) {
  const categoryColors: Record<string, { border: string; text: string; bg: string }> = {
    'Rescate': { border: 'border-2 border-blue-600', text: 'text-blue-700', bg: 'bg-blue-50' },
    'Salud': { border: 'border-2 border-yellow-600', text: 'text-yellow-700', bg: 'bg-yellow-50' },
    'Historias': { border: 'border-2 border-purple-600', text: 'text-purple-700', bg: 'bg-purple-50' },
    'Adopción': { border: 'border-2 border-green-600', text: 'text-green-700', bg: 'bg-green-50' },
    'Comunidad': { border: 'border-2 border-pink-600', text: 'text-pink-700', bg: 'bg-pink-50' },
  };

  return (
    <motion.article
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      whileHover={{ y: -5 }}
      className="bg-[#f5f5f5] dark:bg-[#1e1e1e] rounded-xl overflow-hidden hover:shadow-lg transition-all duration-300 flex flex-col"
    >
      <Link href={`/blog/${post.id}`}>
        <div className="relative w-full h-48 overflow-hidden bg-gray-200 dark:bg-gray-800 ">
          <Image
            src={post.image}
            alt={post.title}
            fill
            className="object-cover hover:scale-110 transition-transform duration-300"
          />
          
          <div className="absolute top-3 left-3 flex flex-col gap-2">
            <span className={`
              px-2.5 py-1 rounded-full text-xs font-semibold
              ${categoryColors[post.category]?.border || 'border-2 border-orange-600'}
              ${categoryColors[post.category]?.bg || 'bg-orange-50'}
              ${categoryColors[post.category]?.text || 'text-orange-700'}
              dark:border-opacity-70
            `}>
              {post.category}
            </span>
          </div>
        </div>
        
        <div className="p-4 flex flex-col flex-1">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 rounded-full bg-orange-500 flex items-center justify-center text-white font-bold text-xs">
              {post.author.charAt(0)}
            </div>
            <div className="flex items-center gap-1.5 text-xs">
              <span className="font-medium text-[#212121] dark:text-[#ffffff]">{post.author}</span>
              <span className="text-[#616161] dark:text-[#b0b0b0]">·</span>
              <span className="text-[#616161] dark:text-[#b0b0b0]">{post.date}</span>
            </div>
          </div>
          
          <h2 className="text-base font-bold text-[#212121] dark:text-[#ffffff] mb-3 line-clamp-2 hover:text-orange-500 dark:hover:text-orange-400 transition-colors">
            {post.title}
          </h2>
          
          <div className="flex items-center gap-4 mt-auto pt-3">
            <div className="flex items-center gap-1.5 text-[#616161] dark:text-[#b0b0b0]">
              <HugeiconsIcon 
                icon={FavouriteIcon} 
                size={16} 
                className="text-[#616161] dark:text-[#b0b0b0]"
                strokeWidth={2}
              />
              <span className="text-xs">2</span>
            </div>
            <div className="flex items-center gap-1.5 text-[#616161] dark:text-[#b0b0b0]">
              <HugeiconsIcon 
                icon={BubbleChatIcon} 
                size={16} 
                className="text-[#616161] dark:text-[#b0b0b0]"
                strokeWidth={2}
              />
              <span className="text-xs">11</span>
            </div>
            <button 
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
              }}
              className="ml-auto text-[#616161] dark:text-[#b0b0b0] hover:text-orange-500 dark:hover:text-orange-400 transition-colors"
              aria-label="Guardar artículo"
            >
              <HugeiconsIcon 
                icon={Bookmark02Icon} 
                size={16} 
                className="text-[#616161] dark:text-[#b0b0b0] hover:text-orange-500 dark:hover:text-orange-400"
                strokeWidth={2}
              />
            </button>
          </div>
        </div>
      </Link>
    </motion.article>
  );
}

