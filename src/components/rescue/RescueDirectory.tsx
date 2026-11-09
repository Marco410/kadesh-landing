import Link from 'next/link';
import { HugeiconsIcon } from '@hugeicons/react';
import { Award01Icon, Location01Icon } from '@hugeicons/core-free-icons';
import { Routes } from 'kadesh/core/routes';
import { RESCUE_ORG_TYPE_OPTIONS, rescueTypeLabel } from './constants';
import RescueAvatar from './RescueAvatar';
import RescueDirectoryFilters, { type RescueDirectoryEntry } from './RescueDirectoryFilters';
import { rescueLocation, rescueTypePluralLabel } from './rescue-seo';
import type { RescueDirectoryItem } from './server';

type DirectoryOrg = RescueDirectoryItem & { slug: string };

function countsText(org: RescueDirectoryItem): string {
  const parts = [
    org.inAdoptionCount > 0 ? `${org.inAdoptionCount.toLocaleString('es-MX')} en adopción` : '',
    org.adoptedCount > 0
      ? `${org.adoptedCount.toLocaleString('es-MX')} ${org.adoptedCount === 1 ? 'adoptado' : 'adoptados'}`
      : '',
  ].filter(Boolean);
  if (parts.length > 0) return parts.join(' · ');
  return org.publishedCount > 0
    ? `${org.publishedCount.toLocaleString('es-MX')} ${org.publishedCount === 1 ? 'animal publicado' : 'animales publicados'}`
    : 'Recién llegado a KADESH';
}

/** Tarjeta de un espacio en el directorio (servidor, sin hooks). */
export function RescueOrgCard({ org }: { org: DirectoryOrg }) {
  const where = rescueLocation(org);
  return (
    <article className="group relative flex h-full items-start gap-4 rounded-2xl border border-[#ececec] bg-white p-5 transition-[transform,box-shadow] duration-200 hover:shadow-[0_16px_40px_rgba(15,35,80,0.1)] has-[a:focus-visible]:ring-2 has-[a:focus-visible]:ring-kadesh has-[a:focus-visible]:ring-offset-2 motion-safe:hover:-translate-y-0.5 dark:border-white/10 dark:bg-night-raised dark:ring-offset-night">
      <RescueAvatar name={org.name} logoUrl={org.logo?.url} size="lg" />
      <div className="min-w-0 flex-1">
        <h3 className="text-lg font-bold leading-snug text-[#121212] dark:text-white">
          <Link href={Routes.organizations.detail(org.slug)} className="after:absolute after:inset-0 focus-visible:outline-none">
            {org.name}
          </Link>
        </h3>
        <p className="mt-0.5 text-sm text-[#5a5a5a] dark:text-[#b0b0b0]">{rescueTypeLabel(org.type)}</p>
        {where ? (
          <p className="mt-1 flex items-center gap-1.5 text-sm text-[#5a5a5a] dark:text-[#b0b0b0]">
            <HugeiconsIcon icon={Location01Icon} size={14} strokeWidth={1.5} className="shrink-0" aria-hidden="true" />
            <span className="truncate">{where}</span>
          </p>
        ) : null}
        <div className="mt-3 flex flex-wrap items-center gap-2">
          {org.isAlly ? (
            <span className="inline-flex items-center gap-1 rounded-full bg-kadesh px-2.5 py-0.5 text-xs font-bold text-white">
              <HugeiconsIcon icon={Award01Icon} size={14} strokeWidth={1.8} aria-hidden="true" />
              Aliado KADESH
            </span>
          ) : null}
          <span className="text-sm font-semibold text-[#3a3a3a] dark:text-[#d0d0d0]">{countsText(org)}</span>
        </div>
      </div>
    </article>
  );
}

/**
 * Directorio de espacios verificados (`/organizaciones`). Las tarjetas las pinta el servidor (llegan
 * en el HTML); `RescueDirectoryFilters` solo filtra por tipo y texto en el navegador.
 */
export default function RescueDirectory({ orgs }: { orgs: RescueDirectoryItem[] }) {
  const listed = orgs.filter((org): org is DirectoryOrg => Boolean(org.slug));
  const entries: RescueDirectoryEntry[] = listed.map((org) => ({
    id: org.id,
    type: org.type,
    search: [org.name, org.city, org.state, rescueTypeLabel(org.type)].filter(Boolean).join(' '),
    card: <RescueOrgCard org={org} />,
  }));
  const types = RESCUE_ORG_TYPE_OPTIONS.map((option) => ({
    value: option.value,
    label: rescueTypePluralLabel(option.value),
    count: listed.filter((org) => org.type === option.value).length,
  })).filter((option) => option.count > 0);

  return <RescueDirectoryFilters entries={entries} types={types} />;
}
