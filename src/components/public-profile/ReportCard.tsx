import Image from 'next/image';
import Link from 'next/link';
import { HugeiconsIcon } from '@hugeicons/react';
import { Image01Icon, Location01Icon } from '@hugeicons/core-free-icons';
import { animalDetailHref } from 'kadesh/components/animals/animalSlug';
import { getStatusColor, getStatusLabel } from 'kadesh/components/animals/constants';
import type { PublicUserReport } from './types';

/** Tarjeta de un reporte en el perfil público: foto, estado, nombre y ciudad. Sin hooks. */
export default function ReportCard({ report }: { report: PublicUserReport }) {
  const status = report.status ?? '';
  return (
    <Link
      href={animalDetailHref(report)}
      className="group flex w-full min-w-0 flex-col overflow-hidden rounded-2xl border border-[#ececec] bg-white transition-[transform,box-shadow] duration-200 hover:-translate-y-0.5 hover:shadow-[0_12px_32px_rgba(15,35,80,0.1)] focus:outline-none focus-visible:ring-2 focus-visible:ring-kadesh-400 dark:border-white/10 dark:bg-night-raised"
    >
      <span className="relative block aspect-[4/3] w-full overflow-hidden bg-[#e8edf3] dark:bg-[#2a3548]">
        {report.coverUrl ? (
          <Image
            src={report.coverUrl}
            alt={report.displayName}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 260px"
          />
        ) : (
          <span className="flex h-full w-full items-center justify-center text-[#5a5a5a]">
            <HugeiconsIcon icon={Image01Icon} size={32} strokeWidth={1.5} aria-hidden="true" />
          </span>
        )}
        {status ? (
          <span
            className="absolute left-2.5 top-2.5 rounded-full px-2.5 py-1 text-[11px] font-bold text-white shadow"
            style={{ backgroundColor: getStatusColor(status) }}
          >
            {getStatusLabel(status)}
          </span>
        ) : null}
      </span>
      <span className="flex flex-1 flex-col gap-1 p-3">
        <span className="line-clamp-1 font-semibold text-[#121212] dark:text-white">{report.displayName}</span>
        {report.city ? (
          <span className="flex items-center gap-1 text-[13px] text-[#5a5a5a] dark:text-[#9aa3b2]">
            <HugeiconsIcon icon={Location01Icon} size={13} strokeWidth={1.6} aria-hidden="true" />
            <span className="truncate">{report.city}</span>
          </span>
        ) : null}
      </span>
    </Link>
  );
}
