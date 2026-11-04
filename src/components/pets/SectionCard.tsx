import type { ReactNode } from 'react';
import { HugeiconsIcon } from '@hugeicons/react';
import { Add01Icon } from '@hugeicons/core-free-icons';

/** Bloque del detalle de una mascota: título, acción opcional y contenido. */
export default function SectionCard({
  title,
  description,
  actionLabel,
  onAction,
  children,
}: {
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
  children: ReactNode;
}) {
  return (
    <section className="rounded-3xl border border-dash-line bg-dash-surface p-4 shadow-dash">
      <div className="mb-3 flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <h3 className="text-base font-bold tracking-[-0.02em] text-dash-ink">{title}</h3>
          {description ? (
            <p className="mt-0.5 text-sm text-dash-muted">{description}</p>
          ) : null}
        </div>
        {actionLabel && onAction ? (
          <button
            type="button"
            onClick={onAction}
            className="inline-flex min-h-10 shrink-0 items-center justify-center gap-1.5 self-start rounded-full border border-dash-line-strong bg-dash-surface px-4 text-sm font-semibold text-dash-ink transition-colors hover:border-kadesh-400 focus:outline-none focus-visible:ring-2 focus-visible:ring-kadesh-400"
          >
            <HugeiconsIcon icon={Add01Icon} size={16} strokeWidth={1.8} aria-hidden="true" />
            {actionLabel}
          </button>
        ) : null}
      </div>
      {children}
    </section>
  );
}

/** Botón de ícono de 44px (editar, borrar…). */
export function IconAction({
  label,
  onClick,
  children,
  tone = 'default',
  disabled,
}: {
  label: string;
  onClick: () => void;
  children: ReactNode;
  tone?: 'default' | 'danger';
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      title={label}
      disabled={disabled}
      className={`inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl disabled:opacity-50 ${
        tone === 'danger'
          ? 'text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-500/10'
          : 'text-dash-muted hover:bg-dash-hover'
      }`}
    >
      {children}
    </button>
  );
}
