"use client";

import { useState } from 'react';
import Image from 'next/image';
import { AuthenticatedItem } from 'kadesh/utils/types';

interface ProfileDataProps {
  user: AuthenticatedItem;
}

export default function ProfileData({ user }: ProfileDataProps) {
  const [isEditing, setIsEditing] = useState(false);

  const formatDate = (dateString: string | null | undefined) => {
    if (!dateString) return 'No especificado';
    return new Date(dateString).toLocaleDateString('es-MX', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <div className="bg-white dark:bg-[#1e1e1e] rounded-xl p-6 sm:p-8 border border-[#e0e0e0] dark:border-[#3a3a3a] shadow-md dark:shadow-lg">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-[#212121] dark:text-[#ffffff]">
          Información Personal
        </h2>
        <button
          onClick={() => setIsEditing(!isEditing)}
          className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white font-semibold rounded-lg transition-colors"
        >
          {isEditing ? 'Cancelar' : 'Editar'}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Avatar */}
        <div className="md:col-span-2 flex items-center gap-6 mb-4 pb-6 border-b border-[#e0e0e0] dark:border-[#3a3a3a]">
          <div className="relative w-24 h-24 rounded-full bg-orange-500 flex items-center justify-center text-white font-bold text-2xl overflow-hidden">
            {user.profileImage?.url ? (
              <Image
                src={user.profileImage.url}
                alt={user.name || 'Usuario'}
                fill
                className="object-cover"
              />
            ) : (
              <span>{user.name?.charAt(0) || 'U'}</span>
            )}
          </div>
          <div>
            <h3 className="text-xl font-bold text-[#212121] dark:text-[#ffffff]">
              {user.name} {user.lastName} {user.secondLastName || ''}
            </h3>
            <p className="text-[#616161] dark:text-[#b0b0b0]">@{user.username}</p>
            {user.verified && (
              <span className="inline-flex items-center gap-1 mt-1 text-xs text-orange-500 dark:text-orange-400">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 .723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                Verificado
              </span>
            )}
          </div>
        </div>

        {/* Name */}
        <div>
          <label className="block text-sm font-semibold text-[#616161] dark:text-[#b0b0b0] mb-2">
            Nombre
          </label>
          <div className="bg-[#f5f5f5] dark:bg-[#2a2a2a] rounded-lg px-4 py-3 text-[#212121] dark:text-[#ffffff] border border-[#e0e0e0] dark:border-[#3a3a3a]">
            {user.name || 'No especificado'}
          </div>
        </div>

        {/* Last Name */}
        <div>
          <label className="block text-sm font-semibold text-[#616161] dark:text-[#b0b0b0] mb-2">
            Apellido Paterno
          </label>
          <div className="bg-[#f5f5f5] dark:bg-[#2a2a2a] rounded-lg px-4 py-3 text-[#212121] dark:text-[#ffffff] border border-[#e0e0e0] dark:border-[#3a3a3a]">
            {user.lastName || 'No especificado'}
          </div>
        </div>

        {/* Second Last Name */}
        <div>
          <label className="block text-sm font-semibold text-[#616161] dark:text-[#b0b0b0] mb-2">
            Apellido Materno
          </label>
          <div className="bg-[#f5f5f5] dark:bg-[#2a2a2a] rounded-lg px-4 py-3 text-[#212121] dark:text-[#ffffff] border border-[#e0e0e0] dark:border-[#3a3a3a]">
            {user.secondLastName || 'No especificado'}
          </div>
        </div>

        {/* Username */}
        <div>
          <label className="block text-sm font-semibold text-[#616161] dark:text-[#b0b0b0] mb-2">
            Nombre de Usuario
          </label>
          <div className="bg-[#f5f5f5] dark:bg-[#2a2a2a] rounded-lg px-4 py-3 text-[#212121] dark:text-[#ffffff] border border-[#e0e0e0] dark:border-[#3a3a3a]">
            @{user.username || 'No especificado'}
          </div>
        </div>

        {/* Email */}
        <div>
          <label className="block text-sm font-semibold text-[#616161] dark:text-[#b0b0b0] mb-2">
            Correo Electrónico
          </label>
          <div className="bg-[#f5f5f5] dark:bg-[#2a2a2a] rounded-lg px-4 py-3 text-[#212121] dark:text-[#ffffff] border border-[#e0e0e0] dark:border-[#3a3a3a]">
            {user.email || 'No especificado'}
          </div>
        </div>

        {/* Phone */}
        <div>
          <label className="block text-sm font-semibold text-[#616161] dark:text-[#b0b0b0] mb-2">
            Teléfono
          </label>
          <div className="bg-[#f5f5f5] dark:bg-[#2a2a2a] rounded-lg px-4 py-3 text-[#212121] dark:text-[#ffffff] border border-[#e0e0e0] dark:border-[#3a3a3a]">
            {user.phone || 'No especificado'}
          </div>
        </div>

        {/* Birthday */}
        <div>
          <label className="block text-sm font-semibold text-[#616161] dark:text-[#b0b0b0] mb-2">
            Fecha de Nacimiento
          </label>
          <div className="bg-[#f5f5f5] dark:bg-[#2a2a2a] rounded-lg px-4 py-3 text-[#212121] dark:text-[#ffffff] border border-[#e0e0e0] dark:border-[#3a3a3a]">
            {(user as any).birthday ? formatDate((user as any).birthday) : 'No especificado'}
          </div>
        </div>

        {/* Age */}
        <div>
          <label className="block text-sm font-semibold text-[#616161] dark:text-[#b0b0b0] mb-2">
            Edad
          </label>
          <div className="bg-[#f5f5f5] dark:bg-[#2a2a2a] rounded-lg px-4 py-3 text-[#212121] dark:text-[#ffffff] border border-[#e0e0e0] dark:border-[#3a3a3a]">
            {(user as any).age ? `${(user as any).age} años` : 'No especificado'}
          </div>
        </div>

        {/* Created At */}
        <div className="md:col-span-2">
          <label className="block text-sm font-semibold text-[#616161] dark:text-[#b0b0b0] mb-2">
            Miembro desde
          </label>
          <div className="bg-[#f5f5f5] dark:bg-[#2a2a2a] rounded-lg px-4 py-3 text-[#212121] dark:text-[#ffffff] border border-[#e0e0e0] dark:border-[#3a3a3a]">
            {formatDate(user.createdAt)}
          </div>
        </div>
      </div>
    </div>
  );
}
