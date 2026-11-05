'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useQuery } from '@apollo/client';
import AuthGateModal from 'kadesh/components/auth/AuthGateModal';
import { Footer, Navigation } from 'kadesh/components/layout';
import { Bone, SkeletonRegion } from 'kadesh/components/ui/skeleton';
import { Role } from 'kadesh/constants/constans';
import { Routes } from 'kadesh/core/routes';
import { useUser } from 'kadesh/utils/UserContext';
import { EVENT_BY_SLUG_QUERY, type EventBySlugResponse } from '../queries';
import EventForm from './EventForm';

const AUTH_COPY = {
  title: 'Publica tu evento',
  description:
    'Pedimos una cuenta para que cada evento tenga a alguien responsable detrás. Te toma un minuto y luego pasas directo al formulario.',
  reasons: [
    'Lo revisamos y lo publicamos en Kadesh Pet.',
    'Avisamos a la gente que tiene alertas en esa zona, municipio o estado.',
    'Ves cuántas personas asistirán y puedes editarlo o cancelarlo.',
  ],
};

function FormSkeleton() {
  return (
    <SkeletonRegion label="Cargando formulario" className="space-y-6">
      {[0, 1, 2].map((index) => (
        <Bone key={index} kind="box" height={220} radius={24} />
      ))}
    </SkeletonRegion>
  );
}

function Shell({ title, description, children }: { title: string; description: string; children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#f7f8fa] dark:bg-night">
      <Navigation />
      <main className="mx-auto max-w-3xl px-4 pt-28 pb-16 sm:px-6">
        <Link href={Routes.events.index} className="text-sm font-semibold text-kadesh-700 hover:underline dark:text-kadesh-300">
          ← Eventos
        </Link>
        <h1 className="mt-3 text-3xl font-black tracking-[-0.02em] text-[#121212] dark:text-white sm:text-4xl">{title}</h1>
        <p className="mt-2 mb-8 text-[#5a5a5a] dark:text-[#b0b0b0]">{description}</p>
        {children}
      </main>
      <Footer />
    </div>
  );
}

/** `/eventos/nuevo`: sin sesión, el modal de cuenta aparece aquí mismo. */
export function NewEventPage() {
  const router = useRouter();
  const { user, loading } = useUser();
  return (
    <Shell
      title="Publica un evento"
      description="Campañas de esterilización, vacunación, ferias de adopción, colectas… Es gratis."
    >
      {loading || !user ? <FormSkeleton /> : <EventForm />}
      <AuthGateModal
        isOpen={!loading && !user}
        onClose={() => {
          if (window.history.length > 1) router.back();
          else router.push(Routes.events.index);
        }}
        redirectTo={Routes.events.new}
        {...AUTH_COPY}
      />
    </Shell>
  );
}

/** `/eventos/<slug>/editar`: solo quien lo publicó (o un admin). */
export function EditEventPage({ slug }: { slug: string }) {
  const router = useRouter();
  const { user, loading: userLoading } = useUser();
  const { data, loading } = useQuery<EventBySlugResponse>(EVENT_BY_SLUG_QUERY, {
    variables: { slug },
    skip: !user?.id,
    fetchPolicy: 'network-only',
  });
  const event = data?.petEvent ?? null;
  const isAdmin = Boolean(user?.roles?.some((role) => role.name === Role.ADMIN));
  const canEdit = Boolean(event && user?.id && (isAdmin || event.user?.id === user.id));

  let content: React.ReactNode;
  if (userLoading || (user?.id && loading && !data)) content = <FormSkeleton />;
  else if (!user) content = <FormSkeleton />;
  else if (!event || !canEdit) {
    content = (
      <p className="rounded-2xl border border-[#ececec] bg-white p-5 text-[#3a3a3a] dark:border-[#2a2a2a] dark:bg-[#1e1e1e] dark:text-[#d0d0d0]">
        No encontramos este evento o no lo publicaste tú.{' '}
        <Link href={Routes.events.mine} className="font-semibold text-kadesh-700 underline dark:text-kadesh-300">
          Ver mis eventos
        </Link>
      </p>
    );
  } else if (event.status === 'cancelled') {
    content = (
      <p className="rounded-2xl border border-[#ececec] bg-white p-5 text-[#3a3a3a] dark:border-[#2a2a2a] dark:bg-[#1e1e1e] dark:text-[#d0d0d0]">
        Este evento está cancelado: ya no se puede editar.
      </p>
    );
  } else {
    content = <EventForm event={event} />;
  }

  return (
    <Shell title="Editar evento" description={event?.title ?? 'Cambia lo que necesites y guarda.'}>
      {content}
      <AuthGateModal
        isOpen={!userLoading && !user}
        onClose={() => router.push(Routes.events.detail(slug))}
        redirectTo={Routes.events.edit(slug)}
        {...AUTH_COPY}
        title="Entra para editar tu evento"
      />
    </Shell>
  );
}
