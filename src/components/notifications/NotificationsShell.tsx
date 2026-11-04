"use client";

import type { ReactNode } from 'react';
import Link from 'next/link';
import { HugeiconsIcon } from '@hugeicons/react';
import { ArrowLeft01Icon } from '@hugeicons/core-free-icons';
import { AppPageHeader } from 'kadesh/components/app-shell';
import { PROFILE_VIEWS, profileGroupTitle } from 'kadesh/components/profile/shell/profileNav';
import { Bone, SkeletonRegion } from 'kadesh/components/ui/skeleton';
import { useUser } from 'kadesh/utils/UserContext';

interface NotificationsShellProps {
  view: 'notifications' | 'alerts';
  back?: { href: string; label: string };
  actions?: ReactNode;
  children: ReactNode;
}

/**
 * Contenido de las páginas de notificaciones dentro del panel (`app/(cuenta)`): encabezado con el
 * título y la descripción de la vista (de `profileNav`) y sus acciones. La sesión la exige el shell.
 */
export default function NotificationsShell({ view, back, actions, children }: NotificationsShellProps) {
  const { user, loading } = useUser();
  const config = PROFILE_VIEWS[view];

  return (
    <div className="mx-auto w-full max-w-3xl">
      <AppPageHeader
        eyebrow={
          back ? (
            <Link
              href={back.href}
              className="inline-flex items-center gap-1 rounded transition-colors hover:text-dash-ink focus:outline-none focus-visible:ring-2 focus-visible:ring-kadesh-400"
            >
              <HugeiconsIcon icon={ArrowLeft01Icon} size={14} strokeWidth={2} aria-hidden="true" />
              {back.label}
            </Link>
          ) : (
            profileGroupTitle(view)
          )
        }
        title={config.label}
        description={config.description}
        actions={user?.id ? actions : null}
      />

      {loading || !user?.id ? (
        <SkeletonRegion label="Cargando" className="space-y-3">
          <Bone kind="box" height={72} radius={24} />
          <Bone kind="box" height={72} radius={24} />
          <Bone kind="box" height={72} radius={24} />
        </SkeletonRegion>
      ) : (
        children
      )}
    </div>
  );
}
