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
  /** Título y descripción propios (si no, los de la vista en `profileNav`). */
  title?: string;
  description?: string;
  back?: { href: string; label: string };
  actions?: ReactNode;
  /** Ancho para dos columnas (contenido + columna lateral). Si no, la medida de una lista. */
  wide?: boolean;
  children: ReactNode;
}

/**
 * Contenido de las páginas de notificaciones dentro del panel (`app/(cuenta)`): encabezado con el
 * título y la descripción de la vista (de `profileNav`) y sus acciones. La sesión la exige el shell.
 */
export default function NotificationsShell({
  view,
  title,
  description,
  back,
  actions,
  wide = false,
  children,
}: NotificationsShellProps) {
  const { user, loading } = useUser();
  const config = PROFILE_VIEWS[view];

  return (
    // Alineado a la izquierda como las demás vistas del panel; la lista conserva su medida.
    <div className={wide ? 'w-full max-w-6xl' : 'w-full max-w-3xl'}>
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
        title={title ?? config.label}
        description={description ?? config.description}
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
