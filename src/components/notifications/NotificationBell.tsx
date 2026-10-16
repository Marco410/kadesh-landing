"use client";

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { AnimatePresence, motion } from 'framer-motion';
import { HugeiconsIcon } from '@hugeicons/react';
import { Notification03Icon, Settings02Icon } from '@hugeicons/core-free-icons';
import { Routes } from 'kadesh/core/routes';
import { cn } from 'kadesh/utils/cn';
import { useNotificationInbox } from './hooks';
import { unreadBadgeLabel } from './inbox';
import NotificationList from './NotificationList';

type BellTone = 'onDark' | 'onLight';

interface NotificationBellProps {
  tone: BellTone;
  /** No leídas (de `useUnreadNotifications`, que se consulta una vez en el header). */
  count: number;
  /** `panel` abre la bandeja ahí mismo (desktop); `link` lleva a la página (móvil). */
  variant: 'panel' | 'link';
}

function BellIcon({ count }: { count: number }) {
  return (
    <>
      <HugeiconsIcon icon={Notification03Icon} size={22} strokeWidth={1.5} aria-hidden="true" />
      {count > 0 ? (
        <span className="absolute -top-0.5 -right-0.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-red-600 px-1 text-[11px] font-bold leading-none text-white ring-2 ring-white dark:ring-night">
          {unreadBadgeLabel(count)}
        </span>
      ) : null}
    </>
  );
}

function bellLabel(count: number): string {
  if (count === 0) return 'Notificaciones';
  return `Notificaciones, ${count} sin leer`;
}

function bellButtonClass(tone: BellTone): string {
  return cn(
    'relative flex h-10 w-10 items-center justify-center rounded-full transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-kadesh',
    tone === 'onLight'
      ? 'bg-gray-200 text-gray-800 hover:bg-gray-300'
      : 'bg-white/10 text-white hover:bg-white/20'
  );
}

function NotificationPanelBell({ tone, count }: { tone: BellTone; count: number }) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const inbox = useNotificationInbox({ skip: !open });

  useEffect(() => {
    if (!open) return;
    const handleClickOutside = (event: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(event.target as Node)) setOpen(false);
    };
    const handleKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKey);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKey);
    };
  }, [open]);

  return (
    <div className="relative" ref={rootRef}>
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-label={bellLabel(count)}
        aria-expanded={open}
        aria-haspopup="dialog"
        className={bellButtonClass(tone)}
      >
        <BellIcon count={count} />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            role="dialog"
            aria-label="Notificaciones"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute right-0 top-full z-50 mt-2 flex max-h-[70vh] w-[380px] flex-col overflow-hidden rounded-2xl border border-[#ececec] bg-white shadow-[0_16px_40px_rgba(15,35,80,0.16)] dark:border-white/10 dark:bg-night-raised"
          >
            <div className="flex items-center justify-between gap-2 border-b border-[#ececec] px-4 py-3 dark:border-white/10">
              <h2 className="text-base font-bold text-[#121212] dark:text-white">Notificaciones</h2>
              <div className="flex items-center gap-1">
                {inbox.hasUnread ? (
                  <button
                    type="button"
                    onClick={() => void inbox.markAllRead()}
                    disabled={inbox.markingAll}
                    className="rounded-lg px-2 py-1.5 text-xs font-semibold text-kadesh transition-colors hover:bg-kadesh-50 disabled:opacity-50 dark:hover:bg-kadesh/15"
                  >
                    Marcar todas como leídas
                  </button>
                ) : null}
                <Link
                  href={Routes.notifications.alerts}
                  onClick={() => setOpen(false)}
                  aria-label="Configurar alertas de zona"
                  className="flex h-9 w-9 items-center justify-center rounded-lg text-[#5a5a5a] transition-colors hover:bg-[#f5f6f8] hover:text-kadesh dark:text-[#b0b0b0] dark:hover:bg-white/5"
                >
                  <HugeiconsIcon icon={Settings02Icon} size={18} strokeWidth={1.5} />
                </Link>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-2">
              <NotificationList
                notifications={inbox.notifications}
                loading={inbox.loading}
                error={inbox.error}
                hasMore={inbox.hasMore}
                loadingMore={inbox.loadingMore}
                onLoadMore={() => void inbox.loadMore()}
                onRetry={() => void inbox.refetch()}
                onSelect={(notification) => {
                  void inbox.markRead(notification);
                  setOpen(false);
                }}
                skeletonRows={4}
              />
            </div>

            <Link
              href={Routes.notifications.index}
              onClick={() => setOpen(false)}
              className="border-t border-[#ececec] px-4 py-3 text-center text-sm font-semibold text-kadesh-700 hover:underline dark:border-white/10 dark:text-kadesh-300"
            >
              Ver todas
            </Link>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/**
 * Campana del header (solo con sesión). En desktop abre un panel con la bandeja;
 * en pantallas chicas lleva a la página de notificaciones.
 */
export default function NotificationBell({ tone, count, variant }: NotificationBellProps) {
  if (variant === 'link') {
    return (
      <Link
        href={Routes.notifications.index}
        aria-label={bellLabel(count)}
        className={bellButtonClass(tone)}
      >
        <BellIcon count={count} />
      </Link>
    );
  }
  return <NotificationPanelBell tone={tone} count={count} />;
}
