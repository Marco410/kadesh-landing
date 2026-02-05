"use client";

import Image from 'next/image';
import Link from 'next/link';
import { LostAnimal } from './types';
import { getStatusColor, getStatusLabel, getTypeLabel } from './constants';
import { HugeiconsIcon } from '@hugeicons/react';
import { Cancel01Icon, SentIcon } from '@hugeicons/core-free-icons';
import { formatDate } from 'kadesh/utils/format-date';
import { Routes } from 'kadesh/core/routes';

interface AnimalInfoWindowProps {
  animal: LostAnimal;
  isDarkMode: boolean;
  onClose: () => void;
}

export default function AnimalInfoWindow({ 
  animal, 
  isDarkMode, 
  onClose 
}: AnimalInfoWindowProps) {
  return (
    <div 
      style={{
        width: '280px',
        maxWidth: '100%',
        backgroundColor: isDarkMode ? '#1e1e1e' : '#ffffff',
        color: isDarkMode ? '#ffffff' : '#212121',
        borderRadius: '12px',
        boxShadow: isDarkMode 
          ? '0 4px 12px rgba(0, 0, 0, 0.5), 0 2px 4px rgba(0, 0, 0, 0.3)' 
          : '0 4px 12px rgba(0, 0, 0, 0.15), 0 2px 4px rgba(0, 0, 0, 0.1)',
      }}
    >
      {/* Image */}
      {animal.image?.url && (
        <div 
          style={{
            position: 'relative',
            width: '100%',
            height: '180px',
            overflow: 'hidden',
            backgroundColor: isDarkMode ? '#2a2a2a' : '#e5e7eb',
          }}
        >
          <Image
            src={animal.image.url}
            alt={animal.name}
            fill
            className="object-cover rounded-xl"
            unoptimized
          />
          {/* Close Button */}
          <button
            onClick={onClose}
            style={{
              position: 'absolute',
              top: '8px',
              right: '8px',
              padding: '2px',
              borderRadius: '8px',
              backgroundColor: isDarkMode 
                ? 'rgba(0, 0, 0, 0.5)' 
                : 'rgba(255, 255, 255, 0.6)',
              border: 'none',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              zIndex: 10,
              transition: 'all 0.2s ease',
              boxShadow: isDarkMode
                ? '0 2px 4px rgba(0, 0, 0, 0.3)'
                : '0 2px 4px rgba(0, 0, 0, 0.15)',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = isDarkMode 
                ? 'rgba(0, 0, 0, 0.8)' 
                : 'rgba(255, 255, 255, 1)';
              e.currentTarget.style.transform = 'scale(1.1)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = isDarkMode 
                ? 'rgba(0, 0, 0, 0.6)' 
                : 'rgba(255, 255, 255, 0.9)';
              e.currentTarget.style.transform = 'scale(1)';
            }}
            aria-label="Cerrar"
          >
            <HugeiconsIcon
              icon={Cancel01Icon}
              size={20}
              color={isDarkMode ? '#ffffff' : '#1f2937'}
            />
          </button>
        </div>
      )}
      
      {/* Content */}
      <div style={{ padding: '16px' }}>
        {/* Name and Status */}
        <div style={{ 
          display: 'flex', 
          alignItems: 'flex-start', 
          justifyContent: 'space-between', 
          gap: '10px', 
          marginBottom: '10px' 
        }}>
          <h3 style={{ 
            fontWeight: '700', 
            fontSize: '20px', 
            lineHeight: '1.2',
            color: isDarkMode ? '#ffffff' : '#111827',
            flex: 1,
            margin: 0,
            letterSpacing: '-0.01em',
          }}>
            {animal.name}
          </h3>
          <span
            style={{
              padding: '5px 10px',
              borderRadius: '12px',
              fontSize: '11px',
              fontWeight: '700',
              color: '#ffffff',
              backgroundColor: getStatusColor(animal.status),
              flexShrink: 0,
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
            }}
          >
            {getStatusLabel(animal.status)}
          </span>
        </div>

        {/* Type and Breed */}
        <div style={{ marginBottom: '10px' }}>
          <p style={{ 
            fontSize: '15px', 
            fontWeight: '500',
            color: isDarkMode ? '#e5e7eb' : '#374151',
            margin: 0,
            lineHeight: '1.4',
          }}>
            {getTypeLabel(animal.type)}
            {animal.breed && (
              <span style={{ 
                color: isDarkMode ? '#9ca3af' : '#6b7280',
                fontWeight: '400',
              }}> • {animal.breed}</span>
            )}
          </p>
        </div>

        {/* Distance */}
        {animal.distance !== undefined && animal.distance !== null && (
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '6px', 
            marginBottom: '10px',
            padding: '6px 0',
          }}>
            <span style={{ fontSize: '14px', lineHeight: 1 }}>🚗</span>
            <p style={{ 
              fontSize: '13px',
              fontWeight: '500',
              color: isDarkMode ? '#d1d5db' : '#4b5563',
              margin: 0,
            }}>
              {animal.distance < 1 
                ? `${Math.round(animal.distance * 1000)} m` 
                : `${animal.distance.toFixed(1)} km`}
            </p>
          </div>
        )}

        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between',
          gap: '8px',
          marginBottom: '10px',
        }}>
          <p style={{ 
            fontSize: '12px',
            color: isDarkMode ? '#9ca3af' : '#6b7280',
            margin: 0,
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
          }}>
            <span>🕐</span>
            {formatDate(animal.createdAt)}
          </p>
          <Link
            href={Routes.animals.detail(animal.id)}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '6px 10px',
              borderRadius: '8px',
              backgroundColor: isDarkMode 
                ? 'rgba(249, 115, 22, 0.2)' 
                : 'rgba(249, 115, 22, 0.1)',
              color: isDarkMode ? '#fb923c' : '#ea580c',
              textDecoration: 'none',
              fontSize: '12px',
              fontWeight: '600',
              transition: 'all 0.2s ease',
              border: 'none',
              cursor: 'pointer',
              gap: '4px',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = isDarkMode 
                ? 'rgba(249, 115, 22, 0.3)' 
                : 'rgba(249, 115, 22, 0.15)';
              e.currentTarget.style.transform = 'scale(1.05)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = isDarkMode 
                ? 'rgba(249, 115, 22, 0.2)' 
                : 'rgba(249, 115, 22, 0.1)';
              e.currentTarget.style.transform = 'scale(1)';
            }}
            aria-label="Ver detalles"
          >
            <HugeiconsIcon
              icon={SentIcon}
              size={14}
              color={isDarkMode ? '#fb923c' : '#ea580c'}
            />
            <span>Detalles</span>
          </Link>
        </div>

        {/* Location */}
        <div style={{ 
          display: 'flex', 
          alignItems: 'flex-start', 
          gap: '6px', 
          marginTop: '12px', 
          paddingTop: '12px',
          borderTop: `1px solid ${isDarkMode ? '#3a3a3a' : '#e5e7eb'}`,
        }}>
          <span style={{ 
            fontSize: '13px', 
            marginTop: '1px',
            flexShrink: 0,
          }}>📍</span>
          <p style={{ 
            fontSize: '12px',
            fontWeight: '400',
            color: isDarkMode ? '#9ca3af' : '#6b7280',
            lineHeight: '1.5',
            margin: 0,
          }}>
            {animal.location}
          </p>
        </div>

       
      </div>
    </div>
  );
}
