"use client";

import { useEffect, type ReactNode } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { HugeiconsIcon } from '@hugeicons/react';
import { ArrowLeft01Icon } from '@hugeicons/core-free-icons';
import { Navigation } from 'kadesh/components/layout';
import { Bone, SkeletonRegion } from 'kadesh/components/ui/skeleton';
import { Routes } from 'kadesh/core/routes';
import { useUser } from 'kadesh/utils/UserContext';

interface NotificationsShellProps {
  title: string;
  description?: string;
  back?: { href: string; label: string };
  actions?: ReactNode;
  children: ReactNode;
}

/** Marco de las páginas de notificaciones: header, título y sesión obligatoria. */
export default function NotificationsShell({
  title,
  description,
  back,
  actions,
  children,
}: NotificationsShellProps) {
  const { user, loading } = useUser();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!loading && !user?.id) {
      router.push(`${Routes.auth.login}?redirect=${encodeURIComponent(pathname)}`);
    }
  }, [loading, user, router, pathname]);

  return (
    <main className="min-h-dvh bg-white pt-[72px] dark:bg-night">
      <Navigation />
      <div className="mx-auto w-full max-w-2xl px-4 py-6 sm:px-6">
        {back ? (
          <Link
            href={back.href}
            className="mb-4 inline-flex min-h-11 items-center gap-1.5 text-sm font-semibold text-kadesh-700 hover:underline dark:text-kadesh-300"
          >
            <HugeiconsIcon icon={ArrowLeft01Icon} size={16} strokeWidth={2} aria-hidden="true" />
            {back.label}
          </Link>
        ) : null}
        <header className="mb-6 flex flex-wrap items-start justify-between gap-3">
          <div>
            <h1 className="text-2xl font-black tracking-[-0.03em] text-[#121212] dark:text-white">
              {title}
            </h1>
            {description ? (
              <p className="mt-1 text-sm text-[#5a5a5a] dark:text-[#b0b0b0]">{description}</p>
            ) : null}
          </div>
          {user?.id ? actions : null}
        </header>

        {loading || !user?.id ? (
          <SkeletonRegion label="Cargando" className="space-y-3">
            <Bone kind="box" height={72} radius={16} />
            <Bone kind="box" height={72} radius={16} />
            <Bone kind="box" height={72} radius={16} />
          </SkeletonRegion>
        ) : (
          children
        )}
      </div>
    </main>
  );
}
