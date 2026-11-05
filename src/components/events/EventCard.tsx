import Image from 'next/image';
import Link from 'next/link';
import { HugeiconsIcon } from '@hugeicons/react';
import { Calendar03Icon, Location01Icon, UserGroupIcon } from '@hugeicons/core-free-icons';
import { Routes } from 'kadesh/core/routes';
import { cn } from 'kadesh/utils/cn';
import { Bone } from 'kadesh/components/ui/skeleton';
import { eventCategory } from './constants';
import EventCategoryChip from './EventCategoryChip';
import {
  eventDateBadge,
  eventPlaceText,
  eventPriceText,
  eventTimeZone,
  formatDistanceKm,
  formatSessionRange,
} from './format';
import type { EventFeedItem } from './types';

/**
 * Tarjeta de un evento (portada, `/eventos`). Sirve en servidor y en cliente: sin hooks. Las
 * fechas salen en la zona horaria del evento.
 */
export default function EventCard({ item, className }: { item: EventFeedItem; className?: string }) {
  const { event } = item;
  const tz = eventTimeZone(event);
  const startsAt = item.nextStartsAt ?? event.nextStartsAt ?? event.firstStartsAt;
  const endsAt = item.nextEndsAt ?? event.nextEndsAt ?? event.lastEndsAt;
  const cover = event.multimedia?.[0]?.image?.url ?? null;
  const badge = startsAt ? eventDateBadge(startsAt, tz) : null;
  const moreDates = Math.max((event.sessionsCount ?? 1) - 1, 0);
  const place = eventPlaceText(event, { withState: true });
  const distance = formatDistanceKm(item.distanceKm);
  const category = eventCategory(event.category);
  const going = event.goingCount ?? 0;
  const href = Routes.events.detail(event.slug ?? event.id);

  return (
    <article
      data-event-card
      className={cn(
        'group relative flex flex-col overflow-hidden rounded-2xl border border-[#ececec] bg-white transition-[transform,box-shadow] duration-200 hover:-translate-y-1 hover:shadow-[0_16px_40px_rgba(15,35,80,0.1)] dark:border-[#2a2a2a] dark:bg-[#1e1e1e]',
        className,
      )}
    >
      <div className="relative aspect-[16/10] w-full overflow-hidden bg-[#e8edf3] dark:bg-[#2a3548]">
        {cover ? (
          <Image
            src={cover}
            alt=""
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          />
        ) : (
          <div
            className="flex h-full w-full items-center justify-center text-white/90"
            style={{ backgroundImage: `linear-gradient(135deg, ${category.color} 0%, #0b2f7a 100%)` }}
          >
            <HugeiconsIcon icon={category.icon} size={56} strokeWidth={1.3} aria-hidden="true" />
          </div>
        )}
        <EventCategoryChip category={event.category} className="absolute top-3 left-3 z-10" />
        {badge ? (
          <div
            aria-hidden="true"
            className="absolute bottom-3 left-3 z-10 flex min-w-14 flex-col items-center rounded-xl bg-white px-2.5 py-1.5 leading-none shadow-md dark:bg-night"
          >
            <span className="text-[11px] font-bold tracking-wide text-red-600">{badge.month}</span>
            <span className="mt-0.5 text-2xl font-black text-[#121212] dark:text-white">{badge.day}</span>
          </div>
        ) : null}
        {event.status === 'cancelled' ? (
          <span className="absolute top-3 right-3 z-10 rounded-full bg-red-600 px-3 py-1.5 text-xs font-bold text-white">
            Cancelado
          </span>
        ) : event.isFull ? (
          <span className="absolute top-3 right-3 z-10 rounded-full bg-[#121212]/85 px-3 py-1.5 text-xs font-bold text-white">
            Cupo lleno
          </span>
        ) : null}
      </div>

      <div className="flex flex-1 flex-col gap-1.5 p-5">
        <h3 className="line-clamp-2 text-lg font-bold leading-snug text-[#212121] dark:text-white">
          <Link href={href} className="after:absolute after:inset-0 focus-visible:outline-none">
            {event.title}
          </Link>
        </h3>
        {startsAt && endsAt ? (
          <p className="flex items-start gap-1.5 text-sm font-medium text-[#3a3a3a] dark:text-[#d0d0d0]">
            <HugeiconsIcon icon={Calendar03Icon} size={16} className="mt-0.5 flex-shrink-0" aria-hidden />
            <span>
              <time dateTime={startsAt}>{formatSessionRange(startsAt, endsAt, tz)}</time>
              {moreDates > 0 ? (
                <span className="text-[#5a5a5a] dark:text-[#9aa3b2]">
                  {' '}
                  · +{moreDates} {moreDates === 1 ? 'fecha' : 'fechas'}
                </span>
              ) : null}
            </span>
          </p>
        ) : null}
        {place ? (
          <p className="flex items-start gap-1.5 text-sm text-[#616161] dark:text-[#b0b0b0]">
            <HugeiconsIcon icon={Location01Icon} size={16} className="mt-0.5 flex-shrink-0" aria-hidden />
            <span className="line-clamp-1">{place}</span>
          </p>
        ) : null}
        <div className="mt-auto flex flex-wrap items-center gap-x-3 gap-y-1 pt-3 text-sm">
          <span
            className={cn(
              'rounded-full px-2.5 py-0.5 text-xs font-bold',
              event.isFree
                ? 'bg-green-50 text-green-800 dark:bg-green-500/15 dark:text-green-300'
                : 'bg-[#f1f3f6] text-[#3a3a3a] dark:bg-white/10 dark:text-[#d0d0d0]',
            )}
          >
            {eventPriceText(event)}
          </span>
          {going > 0 ? (
            <span className="inline-flex items-center gap-1 text-[#5a5a5a] dark:text-[#9aa3b2]">
              <HugeiconsIcon icon={UserGroupIcon} size={14} aria-hidden />
              {going} {going === 1 ? 'asistirá' : 'asistirán'}
            </span>
          ) : null}
          {distance ? <span className="font-medium text-kadesh">{distance}</span> : null}
        </div>
      </div>
    </article>
  );
}

/** Silueta de `EventCard`, con sus mismas medidas. */
export function EventCardSkeleton() {
  return (
    <div className="flex flex-col overflow-hidden rounded-2xl border border-[#ececec] bg-white dark:border-[#2a2a2a] dark:bg-[#1e1e1e]">
      <Bone kind="box" radius={0} className="aspect-[16/10]" />
      <div className="flex flex-1 flex-col gap-1.5 p-5">
        <Bone kind="title" slot={28} width="72%" />
        <Bone kind="line" slot={20} width="58%" />
        <Bone kind="line" slot={20} width="66%" />
        <Bone kind="box" width={64} height={22} radius={9999} className="mt-3" />
      </div>
    </div>
  );
}
