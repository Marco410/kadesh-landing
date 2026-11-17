import Image from 'next/image';
import Link from 'next/link';
import { HugeiconsIcon } from '@hugeicons/react';
import { FavouriteIcon, Image01Icon, Location01Icon } from '@hugeicons/core-free-icons';
import { animalDetailHref } from 'kadesh/components/animals/animalSlug';
import ReportLink from 'kadesh/components/animals/ReportLink';
import { Routes } from 'kadesh/core/routes';
import type { PetLandingStats, ReunionStory } from './server';

/** Con menos historias la sección se ve vacía: mejor no pintarla. */
const MIN_STORIES = 2;
/** La cifra de arriba solo se muestra desde aquí (misma regla que el hero). */
const MIN_COUNT_TO_SHOW = 10;

const OUTCOME_LABEL: Record<string, string> = {
  reunited: 'Volvió a casa',
  adopted: 'Adoptado',
  other_home: 'Encontró hogar',
};

function closedMonth(iso: string | null): string | null {
  if (!iso) return null;
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return null;
  return date.toLocaleDateString('es-MX', { month: 'long', year: 'numeric', timeZone: 'America/Mexico_City' });
}

function StoryCard({ story }: { story: ReunionStory }) {
  const month = closedMonth(story.closedAt);
  const place = story.city || story.state;
  return (
    <article className="group flex flex-col overflow-hidden rounded-2xl border border-[#ececec] bg-white transition-[transform,box-shadow] duration-200 hover:-translate-y-1 hover:shadow-[0_16px_40px_rgba(15,35,80,0.1)] dark:border-white/10 dark:bg-night-raised">
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-[#e8edf3] dark:bg-[#2a3548]">
        {story.coverUrl ? (
          <Image
            src={story.coverUrl}
            alt={story.displayName}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-[#5a5a5a]">
            <HugeiconsIcon icon={Image01Icon} size={40} strokeWidth={1.5} aria-hidden="true" />
          </div>
        )}
        <span className="absolute left-3 top-3 z-10 rounded-full bg-emerald-600 px-3 py-1.5 text-xs font-bold text-white shadow-md">
          {OUTCOME_LABEL[story.outcome] ?? 'Con hogar'}
        </span>
      </div>
      <div className="flex flex-1 flex-col gap-2 p-5">
        <h3 className="line-clamp-1 text-lg font-bold text-[#212121] dark:text-white">
          <Link href={animalDetailHref(story)} className="after:absolute after:inset-0 focus-visible:outline-none">
            {story.displayName}
          </Link>
        </h3>
        {place || month ? (
          <p className="flex items-center gap-1.5 text-sm text-[#5a5a5a] dark:text-[#9aa3b2]">
            {place ? <HugeiconsIcon icon={Location01Icon} size={14} strokeWidth={1.6} aria-hidden="true" /> : null}
            {[place, month].filter(Boolean).join(' · ')}
          </p>
        ) : null}
        <blockquote className="mt-1 line-clamp-4 text-[15px] leading-relaxed text-[#3a3a3a] dark:text-[#d0d0d0]">
          «{story.story}»
        </blockquote>
      </div>
    </article>
  );
}

/**
 * «Ya volvieron a casa»: historias reales de casos cerrados con hogar cuya familia aceptó
 * publicarlas (`petReunionStories`, `storyConsent`). Va justo después de los reportes: a quien
 * busca le dice que sí funciona. Componente de servidor: todo llega en el HTML. Con menos de
 * `MIN_STORIES` no se pinta.
 */
export default function ReunionsSection({
  stories,
  stats,
}: {
  stories: ReunionStory[];
  stats?: PetLandingStats | null;
}) {
  if (stories.length < MIN_STORIES) return null;
  const homes = (stats?.reunions ?? 0) + (stats?.adoptions ?? 0);

  return (
    <section
      id="reencuentros"
      aria-labelledby="reencuentros-heading"
      className="relative w-full scroll-mt-20 bg-white py-24 dark:bg-night"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto mb-12 max-w-3xl text-center">
          <p className="mb-5 inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1.5 text-sm font-semibold text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300">
            <HugeiconsIcon icon={FavouriteIcon} size={16} strokeWidth={1.8} aria-hidden="true" />
            {homes >= MIN_COUNT_TO_SHOW ? `${homes} ya tienen hogar` : 'Reencuentros'}
          </p>
          <h2
            id="reencuentros-heading"
            className="mb-4 text-4xl font-black tracking-[-0.03em] text-[#121212] dark:text-white sm:text-5xl"
          >
            Ya volvieron a casa
          </h2>
          <p className="text-lg text-[#5a5a5a] dark:text-[#b0b0b0]">
            Historias que contaron sus familias al cerrar el caso en Kadesh Pet. Sin testimonios inventados.
          </p>
        </div>

        <ul className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {stories.map((story) => (
            <li key={story.id} className="relative flex">
              <StoryCard story={story} />
            </li>
          ))}
        </ul>

        <div className="mt-10 text-center">
          <ReportLink
            href={`${Routes.animals.new}?status=lost`}
            className="inline-flex min-h-11 items-center font-semibold text-kadesh-700 hover:underline dark:text-kadesh-300"
          >
            ¿Se perdió la tuya? Repórtala gratis →
          </ReportLink>
        </div>
      </div>
    </section>
  );
}
