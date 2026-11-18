'use client';

import Link from 'next/link';
import { useQuery } from '@apollo/client';
import LevelAvatar from 'kadesh/components/paws/LevelAvatar';
import { Routes } from 'kadesh/core/routes';
import { ANIMAL_AUTHOR_QUERY } from './queries';
import type { PublicUserCard } from './types';

/**
 * Quién publicó el reporte, visible para cualquiera: foto con la insignia de su nivel, nombre con
 * inicial y enlace a su perfil público. Consulta aparte (`animalAuthor`): si la persona apagó su
 * perfil o la consulta falla, queda «Usuario de KADESH».
 */
export default function AnimalAuthorByline({
  animalId,
  publishedAt,
}: {
  animalId: string;
  publishedAt: string;
}) {
  const { data, loading } = useQuery<{ animalAuthor: PublicUserCard | null }>(ANIMAL_AUTHOR_QUERY, {
    variables: { animalId },
    fetchPolicy: 'cache-first',
  });
  const author = data?.animalAuthor ?? null;

  if (loading && !author) {
    return (
      <div className="flex items-center gap-3 border-t border-[#ececec] pt-3 dark:border-white/10" aria-hidden>
        <span className="size-12 animate-pulse rounded-full bg-[#eef1f5] dark:bg-white/10" />
        <span className="h-4 w-32 animate-pulse rounded-full bg-[#eef1f5] dark:bg-white/10" />
      </div>
    );
  }

  const name = author?.displayName ?? 'Usuario de KADESH';
  const content = (
    <>
      <LevelAvatar name={name} avatarUrl={author?.avatarUrl} level={author?.level} size="md" />
      <span className="min-w-0">
        <span className="block truncate font-semibold text-[#121212] group-hover:underline dark:text-[#eef1f6]">{name}</span>
        <span className="block text-xs text-[#5a5a5a] dark:text-[#9aa3b2]">
          {author?.level ? `Nivel ${author.level.level} · ${author.level.label} · ` : ''}
          {publishedAt}
        </span>
      </span>
    </>
  );

  return author?.username ? (
    <Link
      href={Routes.publicProfile(author.username)}
      className="group flex items-center gap-3 border-t border-[#ececec] pt-3 focus:outline-none focus-visible:ring-2 focus-visible:ring-kadesh-400 dark:border-white/10"
    >
      {content}
    </Link>
  ) : (
    <div className="flex items-center gap-3 border-t border-[#ececec] pt-3 dark:border-white/10">{content}</div>
  );
}
