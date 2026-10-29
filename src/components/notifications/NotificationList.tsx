"use client";

import Link from 'next/link';
import { HugeiconsIcon } from '@hugeicons/react';
import {
  Alert02Icon,
  BubbleChatIcon,
  CheckmarkCircle02Icon,
  Link04Icon,
  Notification03Icon,
  NotificationOff01Icon,
  SearchVisualIcon,
  UserCheck01Icon,
} from '@hugeicons/core-free-icons';
import { Routes } from 'kadesh/core/routes';
import { cn } from 'kadesh/utils/cn';
import { Bone, SkeletonRegion, boneWidth } from 'kadesh/components/ui/skeleton';
import { ANIMAL_REPORT_NOTIFICATION_TYPE as REPORT_TYPE, NOTIFICATION_TONE_COLOR } from './constants';
import {
  appPathFromUrl,
  formatNotificationTime,
  groupNotifications,
  isExternalPath,
  notificationTone,
} from './inbox';
import type { AppNotification } from './types';

const TONE_ICON = {
  found: CheckmarkCircle02Icon,
  lost: Alert02Icon,
  brand: Notification03Icon,
} as const;

/** Íconos propios de los avisos de un reporte; el resto usa el del tono. */
const TYPE_ICON: Record<string, typeof Notification03Icon> = {
  [REPORT_TYPE.COMMENTED]: BubbleChatIcon,
  [REPORT_TYPE.DUPLICATE_REPORTED]: BubbleChatIcon,
  [REPORT_TYPE.POSSIBLE_MATCH]: SearchVisualIcon,
  [REPORT_TYPE.CLAIM_REQUESTED]: UserCheck01Icon,
  [REPORT_TYPE.CLAIM_APPROVED]: UserCheck01Icon,
  [REPORT_TYPE.CLAIM_REJECTED]: UserCheck01Icon,
  [REPORT_TYPE.MERGED]: Link04Icon,
};

interface NotificationListProps {
  notifications: AppNotification[];
  loading: boolean;
  error?: unknown;
  hasMore: boolean;
  loadingMore: boolean;
  onLoadMore: () => void;
  onSelect: (notification: AppNotification) => void;
  onRetry?: () => void;
  /** Cuántas filas de esqueleto caben a la vista. */
  skeletonRows?: number;
}

function NotificationItem({
  notification,
  onSelect,
}: {
  notification: AppNotification;
  onSelect: (notification: AppNotification) => void;
}) {
  const tone = notificationTone(notification);
  const color = NOTIFICATION_TONE_COLOR[tone];
  const unread = !notification.readAt;
  const path = appPathFromUrl(notification.url);

  const content = (
    <>
      <span
        className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full"
        style={{ color, backgroundColor: `color-mix(in srgb, ${color} 14%, transparent)` }}
        aria-hidden="true"
      >
        <HugeiconsIcon icon={TYPE_ICON[notification.type] ?? TONE_ICON[tone]} size={20} strokeWidth={1.5} />
      </span>
      <span className="min-w-0 flex-1">
        <span
          className={cn(
            'block text-sm leading-snug text-[#121212] dark:text-white',
            unread ? 'font-bold' : 'font-medium'
          )}
        >
          {notification.title}
        </span>
        {notification.body ? (
          <span className="mt-0.5 line-clamp-2 block text-sm text-[#5a5a5a] dark:text-[#b0b0b0]">
            {notification.body}
          </span>
        ) : null}
        <span className="mt-1 block text-xs text-[#5a5a5a] dark:text-[#9aa3b2]">
          {formatNotificationTime(notification.createdAt)}
        </span>
      </span>
      {unread ? (
        <span className="mt-1.5 h-2.5 w-2.5 flex-shrink-0 rounded-full bg-kadesh">
          <span className="sr-only">Sin leer</span>
        </span>
      ) : null}
    </>
  );

  const className = cn(
    'flex w-full items-start gap-3 rounded-xl px-3 py-3 text-left transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-kadesh',
    unread
      ? 'bg-kadesh-50 hover:bg-kadesh-100 dark:bg-kadesh/10 dark:hover:bg-kadesh/15'
      : 'hover:bg-[#f5f6f8] dark:hover:bg-white/5'
  );

  if (path && isExternalPath(path)) {
    return (
      <a
        href={path}
        target="_blank"
        rel="noopener noreferrer"
        onClick={() => onSelect(notification)}
        className={className}
      >
        {content}
      </a>
    );
  }

  if (path) {
    return (
      <Link href={path} onClick={() => onSelect(notification)} className={className}>
        {content}
      </Link>
    );
  }

  return (
    <button type="button" onClick={() => onSelect(notification)} className={className}>
      {content}
    </button>
  );
}

const SKELETON_TITLE_WIDTHS = ['78%', '62%', '70%', '54%'] as const;
const SKELETON_BODY_WIDTHS = ['90%', '74%', '82%', '66%'] as const;

export function NotificationItemSkeleton({ index = 0 }: { index?: number }) {
  return (
    <div className="flex items-start gap-3 px-3 py-3">
      <Bone kind="circle" width={40} />
      <div className="min-w-0 flex-1">
        <Bone kind="line" slot={20} width={boneWidth(SKELETON_TITLE_WIDTHS, index)} />
        <Bone kind="line" slot={20} width={boneWidth(SKELETON_BODY_WIDTHS, index)} className="mt-0.5" />
        <Bone kind="line" slot={16} width={56} className="mt-1" />
      </div>
    </div>
  );
}

export default function NotificationList({
  notifications,
  loading,
  error,
  hasMore,
  loadingMore,
  onLoadMore,
  onSelect,
  onRetry,
  skeletonRows = 5,
}: NotificationListProps) {
  if (loading) {
    return (
      <SkeletonRegion label="Cargando notificaciones" className="space-y-1">
        {Array.from({ length: skeletonRows }).map((_, index) => (
          <NotificationItemSkeleton key={index} index={index} />
        ))}
      </SkeletonRegion>
    );
  }

  if (error && notifications.length === 0) {
    return (
      <div className="flex flex-col items-center px-4 py-10 text-center">
        <p className="text-sm font-semibold text-[#121212] dark:text-white">
          No pudimos cargar tus notificaciones
        </p>
        {onRetry ? (
          <button
            type="button"
            onClick={onRetry}
            className="mt-4 inline-flex min-h-11 items-center justify-center rounded-xl border-2 border-kadesh px-4 text-sm font-semibold text-kadesh transition-colors hover:bg-kadesh hover:text-white"
          >
            Reintentar
          </button>
        ) : null}
      </div>
    );
  }

  if (notifications.length === 0) {
    return (
      <div className="flex flex-col items-center px-4 py-10 text-center">
        <span className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-kadesh-50 text-kadesh dark:bg-kadesh/15">
          <HugeiconsIcon icon={NotificationOff01Icon} size={28} strokeWidth={1.5} aria-hidden="true" />
        </span>
        <p className="text-base font-semibold text-[#121212] dark:text-white">Todo tranquilo por aquí</p>
        <p className="mt-2 max-w-xs text-sm leading-relaxed text-[#5a5a5a] dark:text-[#b0b0b0]">
          Te avisaremos aquí cuando reporten una mascota cerca de tu zona.
        </p>
        <Link
          href={Routes.notifications.alerts}
          className="mt-5 inline-flex min-h-11 items-center justify-center rounded-xl bg-kadesh px-5 text-sm font-semibold text-white transition-colors hover:bg-kadesh-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-kadesh"
        >
          Configurar mis alertas
        </Link>
      </div>
    );
  }

  return (
    <div>
      {groupNotifications(notifications).map((group) => (
        <section key={group.label} aria-label={group.label} className="mb-2">
          <h3 className="px-3 pb-1 pt-2 text-xs font-bold uppercase tracking-wide text-[#5a5a5a] dark:text-[#9aa3b2]">
            {group.label}
          </h3>
          <ul className="space-y-1">
            {group.items.map((notification) => (
              <li key={notification.id}>
                <NotificationItem notification={notification} onSelect={onSelect} />
              </li>
            ))}
          </ul>
        </section>
      ))}

      {hasMore ? (
        <div className="px-3 pb-2 pt-1">
          <button
            type="button"
            onClick={onLoadMore}
            disabled={loadingMore}
            className="inline-flex min-h-11 w-full items-center justify-center rounded-xl border border-[#dcdcdc] text-sm font-semibold text-[#3a3a3a] transition-colors hover:border-kadesh hover:text-kadesh disabled:opacity-50 dark:border-white/15 dark:text-[#d0d0d0]"
          >
            {loadingMore ? 'Cargando más…' : 'Ver anteriores'}
          </button>
        </div>
      ) : null}
    </div>
  );
}
