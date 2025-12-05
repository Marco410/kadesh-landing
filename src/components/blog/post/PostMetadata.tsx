"use client";

import { useEffect } from 'react';
import { BlogPostDetail } from '../types';
import { Routes } from 'kadesh/core/routes';

interface PostMetadataProps {
  post: BlogPostDetail;
}

export default function PostMetadata({ post }: PostMetadataProps) {
  useEffect(() => {
    if (!post) return;

    const baseUrl = typeof window !== 'undefined' ? window.location.origin : 'https://www.kadesh.com.mx';
    const postUrl = `${baseUrl}${Routes.blog.post(post.url)}`;
    
    // Asegurar que la URL de la imagen sea absoluta
    let imageUrl = `${baseUrl}/og-image.png`; // fallback
    if (post.image?.url) {
      if (post.image.url.startsWith('http://') || post.image.url.startsWith('https://')) {
        imageUrl = post.image.url;
      } else if (post.image.url.startsWith('/')) {
        imageUrl = `${baseUrl}${post.image.url}`;
      } else {
        // Si es una URL relativa sin /, agregar el dominio de la API si es necesario
        const apiUrl = process.env.NEXT_PUBLIC_API_URL;
        if (apiUrl && !post.image.url.includes('http')) {
          const apiBase = apiUrl.replace('/api/graphql', '');
          imageUrl = `${apiBase}${post.image.url.startsWith('/') ? '' : '/'}${post.image.url}`;
        } else {
          imageUrl = `${baseUrl}/${post.image.url}`;
        }
      }
    }
    
    const description = post.excerpt || `Lee este artículo en el blog de KADESH: ${post.title}`;

    // Actualizar o crear meta tags
    const updateMetaTag = (property: string, content: string, isProperty = true) => {
      const selector = isProperty ? `meta[property="${property}"]` : `meta[name="${property}"]`;
      let meta = document.querySelector(selector) as HTMLMetaElement;
      
      if (!meta) {
        meta = document.createElement('meta');
        if (isProperty) {
          meta.setAttribute('property', property);
        } else {
          meta.setAttribute('name', property);
        }
        document.head.appendChild(meta);
      }
      meta.setAttribute('content', content);
    };

    // Title
    document.title = `${post.title} | KADESH Blog`;

    // Basic meta
    updateMetaTag('description', description, false);
    
    // Open Graph
    updateMetaTag('og:title', post.title);
    updateMetaTag('og:description', description);
    updateMetaTag('og:image', imageUrl);
    updateMetaTag('og:image:width', '1200');
    updateMetaTag('og:image:height', '630');
    updateMetaTag('og:image:type', 'image/jpeg');
    updateMetaTag('og:url', postUrl);
    updateMetaTag('og:type', 'article');
    updateMetaTag('og:site_name', 'KADESH');
    updateMetaTag('og:locale', 'es_MX');
    
    // Twitter Card
    updateMetaTag('twitter:card', 'summary_large_image', false);
    updateMetaTag('twitter:title', post.title, false);
    updateMetaTag('twitter:description', description, false);
    updateMetaTag('twitter:image', imageUrl, false);

    // Article meta (opcional pero útil)
    if (post.publishedAt) {
      updateMetaTag('article:published_time', new Date(post.publishedAt).toISOString());
    }
    if (post.author?.name) {
      updateMetaTag('article:author', post.author.name);
    }
    if (post.category?.name) {
      updateMetaTag('article:section', post.category.name);
    }
    if (post.tags && post.tags.length > 0) {
      post.tags.forEach((tag, index) => {
        updateMetaTag(`article:tag${index > 0 ? index + 1 : ''}`, tag.name);
      });
    }

    // Cleanup function
    return () => {
      // Opcional: restaurar meta tags por defecto si es necesario
    };
  }, [post]);

  return null;
}
