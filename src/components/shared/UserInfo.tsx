"use client";

import Image from 'next/image';
import { formatDateWithDay } from 'kadesh/utils/format-date';
import Avatar from './Avatar';
import { div } from 'framer-motion/client';

interface User {
  createdAt: string;
  name: string;
  lastName?: string | null;
  secondLastName?: string | null;
  username: string;
  verified?: boolean | null;
  profileImage?: {
    url: string;
  } | null;
}

interface UserInfoProps {
  user: User;
  label?: string;
  contactNumber?: string;
}

export default function UserInfo({ user, contactNumber, label = "Reportado por" }: UserInfoProps) {
  const phoneHref = contactNumber
    ? `tel:${contactNumber.replace(/[^\d+]/g, '')}`
    : undefined;

  return (
    <div className="flex items-start justify-between pt-4 border-t border-[#e0e0e0] dark:border-[#3a3a3a]">
      <div className="flex-1 flex flex-col gap-2">
        <h3 className="text-xs font-semibold text-[#616161] dark:text-[#b0b0b0] uppercase tracking-wide mb-1">
          {label}
        </h3>
        <div className="flex items-center gap-2">
          <Avatar
            author={{
              id: user.username || '',
              name: user.name,
              lastName: user.lastName || '',
              username: user.username,
              verified: user.verified || false,
              profileImage: user.profileImage,
              createdAt: user.createdAt,
            }}
            verify={user.verified || false}
          />
          <div className="flex flex-col">
            <p className="text-[#212121] dark:text-[#ffffff] font-medium">
              {user.name} {user.lastName || ''} {user.secondLastName || ''}
            </p>
            {user.username && (
              <div className="flex flex-row items-center gap-2">
              <p className="text-[#616161] dark:text-[#b0b0b0] text-xs mt-1">
                @{user.username} 
              </p>
              {user.verified && <Image src="/icons/firmar.png" alt="Verificado" width={12} height={12} className="object-contain" />}
              </div>
            )}
            <small className="text-[#616161] dark:text-[#b0b0b0] text-xs">
              Se unió el: {formatDateWithDay(user.createdAt)}
            </small>
          </div>
          {contactNumber && (
            <div className="ml-auto flex flex-col items-end text-right">
              <h3 className="text-xs font-semibold text-[#616161] dark:text-[#b0b0b0] uppercase tracking-wide mb-1">
                Número de contacto
              </h3>
              <a
                href={phoneHref}
                className="inline-flex items-center justify-end gap-1 text-[#212121] dark:text-[#ffffff] font-medium hover:text-[#2e7d32] dark:hover:text-[#66bb6a] transition-colors"
                aria-label={`Llamar al ${contactNumber}`}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="h-4 w-4"
                  aria-hidden="true"
                >
                  <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6A19.79 19.79 0 0 1 2.12 4.18 2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.12.9.33 1.78.64 2.62a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.46-1.21a2 2 0 0 1 2.11-.45c.84.31 1.72.52 2.62.64A2 2 0 0 1 22 16.92z" />
                </svg>
                <span>{contactNumber}</span>
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
