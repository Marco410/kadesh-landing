'use client';

import Link from 'next/link';
import { useQuery } from '@apollo/client';
import { Footer, Navigation } from 'kadesh/components/layout';
import { Routes } from 'kadesh/core/routes';
import { useUser } from 'kadesh/utils/UserContext';
import { Bone, SkeletonRegion } from 'kadesh/components/ui/skeleton';
import EventDetail from './EventDetail';
import { EVENT_BY_SLUG_QUERY, type EventBySlugResponse } from './queries';

/**
 * El servidor (sin sesión) no encontró el evento: puede no existir o estar en revisión. Con la
 * sesión de quien lo publicó (o de un admin) se muestra la vista previa con su estado.
 */
export default function EventPrivatePreview({ slug }: { slug: string }) {
  const { user, loading: userLoading } = useUser();
  const { data, loading } = useQuery<EventBySlugResponse>(EVENT_BY_SLUG_QUERY, {
    variables: { slug },
    skip: !user?.id,
    fetchPolicy: 'network-only',
  });
  const event = data?.petEvent ?? null;

  if (userLoading || (user?.id && loading && !data)) {
    return (
      <div className="min-h-screen bg-[#f7f8fa] dark:bg-night">
        <Navigation />
        <SkeletonRegion label="Cargando evento" className="mx-auto max-w-6xl px-4 pt-28 pb-20 sm:px-6 lg:px-8">
          <Bone kind="box" className="aspect-[16/9] w-full" radius={24} />
          <Bone kind="title" slot={40} width="60%" className="mt-6" />
          <Bone kind="line" slot={24} width="40%" />
        </SkeletonRegion>
      </div>
    );
  }

  if (event) {
    const isPublic = event.status === 'approved' || event.status === 'cancelled';
    return <EventDetail event={event} preview={isPublic ? null : { status: event.status, reviewNote: event.reviewNote }} />;
  }

  return (
    <div className="min-h-screen bg-[#f7f8fa] dark:bg-night">
      <Navigation />
      <main className="mx-auto flex max-w-xl flex-col items-center px-4 pt-36 pb-24 text-center">
        <h1 className="mb-3 text-3xl font-black text-[#121212] dark:text-white">No encontramos este evento</h1>
        <p className="mb-8 text-[#5a5a5a] dark:text-[#b0b0b0]">
          Puede que el link esté mal, que lo hayan quitado o que todavía esté en revisión.
        </p>
        <Link
          href={Routes.events.index}
          className="inline-flex min-h-12 items-center rounded-xl bg-kadesh px-6 font-semibold text-white hover:bg-kadesh-600"
        >
          Ver próximos eventos
        </Link>
      </main>
      <Footer />
    </div>
  );
}
