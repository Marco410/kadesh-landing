"use client";

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useQuery } from '@apollo/client';
import { HugeiconsIcon } from '@hugeicons/react';
import { ArrowRight01Icon, FavouriteIcon } from '@hugeicons/core-free-icons';
import {
  DashEmptyState,
  DashErrorState,
  DashFilterChips,
  DashLoadingRows,
  DashStatusBadge,
  dashButtonClass,
  dashSurfaceClass,
} from 'kadesh/components/app-shell';
import { Routes } from 'kadesh/core/routes';
import { friendlyErrorText } from 'kadesh/utils/errorText';
import MyAdoptionApplicationDetail from './MyAdoptionApplicationDetail';
import { ADOPTION_APPLICATION_PARAM, ADOPTION_OPEN_STATUSES, adoptionStatusMeta, isOpenAdoptionStatus } from './constants';
import { adoptionAnimalTitle, adoptionShortDate } from './format';
import { MY_ADOPTION_APPLICATIONS_QUERY, myAdoptionWhere, type MyAdoptionApplicationsResponse } from './queries';
import type { MyAdoptionApplicationRow } from './types';

type Filter = 'open' | 'all';

/** Cuántas se cargan: una persona rara vez tiene más; la lista se filtra aquí. */
const MY_ADOPTIONS_TAKE = 100;

function ApplicationRow({ application }: { application: MyAdoptionApplicationRow }) {
  const animal = application.animal;
  const title = adoptionAnimalTitle(animal?.name);
  const photo = animal?.multimedia?.[0]?.image?.url ?? null;
  const meta = adoptionStatusMeta(application.status);
  const caretaker = animal?.organization?.name;
  const when = isOpenAdoptionStatus(application.status) || !application.decidedAt
    ? `Enviada el ${adoptionShortDate(application.createdAt)}`
    : `Actualizada el ${adoptionShortDate(application.decidedAt)}`;

  return (
    <li>
      <Link
        href={Routes.profileAdoption(application.id)}
        className="flex items-center gap-3 rounded-[20px] border border-dash-line bg-dash-surface p-3 shadow-dash transition-[transform,box-shadow] duration-200 ease-[cubic-bezier(0.16,0.84,0.44,1)] hover:-translate-y-0.5 hover:shadow-dash-lift focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-kadesh"
      >
        <span className="relative size-16 shrink-0 overflow-hidden rounded-xl bg-dash-surface-2">
          {photo ? (
            <Image src={photo} alt="" fill className="object-cover" sizes="64px" />
          ) : (
            <span className="flex size-full items-center justify-center text-dash-faint">
              <HugeiconsIcon icon={FavouriteIcon} size={22} strokeWidth={1.5} aria-hidden />
            </span>
          )}
        </span>
        <span className="min-w-0 flex-1">
          <span className="flex flex-wrap items-center gap-2">
            <span className="truncate font-semibold text-dash-ink">{title}</span>
            <DashStatusBadge label={meta.label} tone={meta.tone} />
          </span>
          <span className="mt-0.5 block truncate text-[13px] text-dash-muted">
            {[when, caretaker ? `${animal?.sex === 'female' ? 'La' : 'Lo'} cuida ${caretaker}` : null].filter(Boolean).join(' · ')}
          </span>
        </span>
        <HugeiconsIcon icon={ArrowRight01Icon} size={18} className="shrink-0 text-dash-faint" aria-hidden />
      </Link>
    </li>
  );
}

/**
 * «Adopciones» del perfil: las solicitudes que envió la persona, abiertas primero en el filtro, y
 * con `?solicitud=<id>` el detalle de una (proceso, respuestas, editar y retirar). Las notificaciones
 * de su solicitud y «Ver solicitud» de la ficha del animal abren ese detalle.
 */
export default function MyAdoptionApplicationsSection({ userId }: { userId: string }) {
  const searchParams = useSearchParams();
  const openId = searchParams.get(ADOPTION_APPLICATION_PARAM);
  const [chosen, setChosen] = useState<Filter | null>(null);

  const { data, loading, error } = useQuery<MyAdoptionApplicationsResponse>(MY_ADOPTION_APPLICATIONS_QUERY, {
    variables: {
      where: myAdoptionWhere(userId),
      openWhere: myAdoptionWhere(userId, ADOPTION_OPEN_STATUSES),
      allWhere: myAdoptionWhere(userId),
      take: MY_ADOPTIONS_TAKE,
    },
    skip: Boolean(openId),
    fetchPolicy: 'cache-and-network',
  });

  if (openId) return <MyAdoptionApplicationDetail applicationId={openId} userId={userId} />;

  const all = data?.adoptionApplications ?? [];
  const openCount = data?.openCount ?? null;
  const allCount = data?.allCount ?? null;
  // Sin elegir: abiertas si hay alguna; si no, todas (para no mostrar una lista vacía de entrada).
  const filter: Filter = chosen ?? (openCount === 0 ? 'all' : 'open');
  const rows = filter === 'open' ? all.filter((row) => isOpenAdoptionStatus(row.status)) : all;

  if (loading && !data) return <DashLoadingRows rows={3} label="Cargando tus solicitudes" />;
  if (error && !data) {
    return <DashErrorState message={friendlyErrorText(error, 'No pudimos cargar tus solicitudes. Intenta de nuevo.')} />;
  }

  if (!allCount) {
    return (
      <DashEmptyState
        icon={FavouriteIcon}
        title="Aún no envías solicitudes de adopción"
        description="Cuando un animal está «En adopción», en su ficha aparece «Quiero adoptarlo». Aquí vas a ver en qué va cada solicitud."
        action={
          <Link href={Routes.animals.index} className={dashButtonClass({ variant: 'dark', size: 'sm' })}>
            Ver animales
          </Link>
        }
      />
    );
  }

  return (
    <div className="space-y-4">
      <DashFilterChips<Filter>
        label="Mostrar"
        value={filter}
        onChange={setChosen}
        options={[
          { value: 'open', label: 'Abiertas', count: openCount },
          { value: 'all', label: 'Todas', count: allCount },
        ]}
      />
      {rows.length === 0 ? (
        <div className={`${dashSurfaceClass} p-5 text-sm text-dash-muted`}>
          No tienes solicitudes abiertas. En «Todas» ves las que ya terminaron.
        </div>
      ) : (
        <ul className="grid gap-3">
          {rows.map((application) => (
            <ApplicationRow key={application.id} application={application} />
          ))}
        </ul>
      )}
    </div>
  );
}
