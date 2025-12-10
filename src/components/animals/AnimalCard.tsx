"use client";

import { motion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { LostAnimal } from './types';

interface AnimalCardProps {
  animal: LostAnimal;
  index: number;
  onFavoriteToggle?: (animal: LostAnimal) => void;
  isSelected?: boolean;
  onClick?: () => void;
  variant?: 'vertical' | 'horizontal';
}

const getStatusLabel = (status: string) => {
  switch (status) {
    case 'perdido':
      return 'Perdido';
    case 'encontrado':
      return 'Encontrado';
    case 'en_adopcion':
      return 'En Adopción';
    default:
      return status;
  }
};

const getStatusColor = (status: string) => {
  switch (status) {
    case 'perdido':
      return 'bg-red-500 text-white';
    case 'encontrado':
      return 'bg-green-500 text-white';
    case 'en_adopcion':
      return 'bg-blue-500 text-white';
    default:
      return 'bg-gray-500 text-white';
  }
};

const getTypeLabel = (type: string) => {
  const labels: Record<string, string> = {
    perro: 'Perro',
    gato: 'Gato',
    conejo: 'Conejo',
    ave: 'Ave',
    otro: 'Otro',
  };
  return labels[type] || type;
};

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  const now = new Date();
  const diffTime = Math.abs(now.getTime() - date.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return 'Hoy';
  if (diffDays === 1) return 'Ayer';
  if (diffDays < 7) return `Hace ${diffDays} días`;
  if (diffDays < 30) return `Hace ${Math.ceil(diffDays / 7)} semanas`;
  return `Hace ${Math.ceil(diffDays / 30)} meses`;
};

export default function AnimalCard({ 
  animal, 
  index, 
  onFavoriteToggle,
  isSelected = false,
  onClick,
  variant = 'vertical'
}: AnimalCardProps) {
  // Horizontal variant for map view
  if (variant === 'horizontal') {
    return (
      <motion.article
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.3, delay: index * 0.05 }}
        onClick={onClick}
        className={`bg-white dark:bg-[#1e1e1e] rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-all duration-200 flex flex-row cursor-pointer border-2 ${
          isSelected 
            ? 'border-orange-500 bg-orange-50/50 dark:bg-orange-900/10' 
            : 'border-transparent hover:border-gray-200 dark:hover:border-gray-700'
        }`}
      >
        {/* Image */}
        <div className="relative w-24 h-24 flex-shrink-0 bg-gray-200 dark:bg-gray-800">
          {animal.image?.url ? (
            <Image
              src={animal.image.url}
              alt={animal.name}
              fill
              className="object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-400">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 p-3 flex flex-col justify-between min-w-0">
          <div className="flex items-start justify-between gap-2 mb-1">
            <h3 className="text-sm font-bold text-[#212121] dark:text-[#ffffff] truncate">
              {animal.name}
            </h3>
            <div className={`px-2 py-0.5 rounded-full text-xs font-semibold flex-shrink-0 ${getStatusColor(animal.status)}`}>
              {getStatusLabel(animal.status)}
            </div>
          </div>

          <div className="space-y-1 text-[#616161] dark:text-[#b0b0b0]">
            <p className="text-xs truncate">
              {getTypeLabel(animal.type)}
              {animal.breed && ` • ${animal.breed}`}
            </p>
            <p className="text-xs flex items-center gap-1 truncate">
              <span>📍</span>
              <span className="truncate">{animal.location}</span>
            </p>
            <p className="text-xs flex items-center gap-1">
              <span>🕐</span>
              {formatDate(animal.createdAt)}
            </p>
          </div>
        </div>

        {/* Favorite button */}
        {onFavoriteToggle && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onFavoriteToggle(animal);
            }}
            className={`p-2 flex-shrink-0 self-start mt-2 mr-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-all ${
              animal.isFavorite ? 'text-red-500' : 'text-gray-400'
            }`}
          >
            <svg className="w-4 h-4" fill={animal.isFavorite ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
          </button>
        )}
      </motion.article>
    );
  }

  // Vertical variant (original)
  return (
    <motion.article
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      whileHover={{ y: -5 }}
      className="bg-white dark:bg-[#1e1e1e] rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 flex flex-col"
    >
      <div className="relative h-64 w-full bg-gray-200 dark:bg-gray-800">
        {animal.image?.url ? (
          <Image
            src={animal.image.url}
            alt={animal.name}
            fill
            className="object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400">
            <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
        )}
        
        <div className="absolute top-4 right-4 flex gap-2">
          <div className={`px-3 py-1 rounded-full text-sm font-semibold ${getStatusColor(animal.status)}`}>
            {getStatusLabel(animal.status)}
          </div>
          {onFavoriteToggle && (
            <button
              onClick={() => onFavoriteToggle(animal)}
              className={`p-2 rounded-full bg-white/90 dark:bg-[#1e1e1e]/90 backdrop-blur-sm hover:bg-white dark:hover:bg-[#1e1e1e] transition-all ${
                animal.isFavorite ? 'text-red-500' : 'text-gray-400'
              }`}
            >
              <svg className="w-5 h-5" fill={animal.isFavorite ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
            </button>
          )}
        </div>
      </div>

      <div className="p-6 flex-1 flex flex-col">
        <h3 className="text-2xl font-bold text-[#212121] dark:text-[#ffffff] mb-2">
          {animal.name}
        </h3>

        <div className="space-y-2 text-[#616161] dark:text-[#b0b0b0] mb-4">
          <p className="flex items-center gap-2 text-sm">
            <span className="font-medium">Tipo:</span>
            {getTypeLabel(animal.type)}
            {animal.breed && ` • ${animal.breed}`}
          </p>
          <p className="flex items-center gap-2 text-sm">
            <span>📍</span>
            {animal.location}
          </p>
          <p className="flex items-center gap-2 text-sm">
            <span>🕐</span>
            {formatDate(animal.createdAt)}
          </p>
        </div>

        {animal.description && (
          <p className="text-sm text-[#616161] dark:text-[#b0b0b0] mb-4 line-clamp-2">
            {animal.description}
          </p>
        )}

        <div className="mt-auto pt-4 border-t border-[#e0e0e0] dark:border-[#3a3a3a]">
          <Link
            href={`/animales/${animal.id}`}
            className="block w-full text-center px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white font-semibold rounded-lg transition-colors"
          >
            Ver detalles
          </Link>
        </div>
      </div>
    </motion.article>
  );
}
