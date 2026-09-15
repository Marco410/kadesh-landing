'use client';

import { useEffect, useState } from 'react';
import {
  DIRECTORY_STATUS_MORE,
  DIRECTORY_STATUS_PRIMARY,
  getStatusColor,
} from './constants';
import { useChipPulse, useRevealChips } from './useChipMotion';

function StatusChip({
  value,
  label,
  selected,
  onSelect,
  more,
}: {
  value: string | null;
  label: string;
  selected: boolean;
  onSelect: (value: string | null) => void;
  more?: boolean;
}) {
  const color = value ? getStatusColor(value) : undefined;
  const { ref, pulse } = useChipPulse();

  return (
    <button
      ref={ref}
      type="button"
      aria-pressed={selected}
      data-more-chip={more ? '' : undefined}
      onClick={() => {
        pulse();
        onSelect(value);
      }}
      className={`inline-flex min-h-11 origin-center items-center gap-1.5 rounded-full px-3 text-sm font-semibold transition-[background-color,color,box-shadow] duration-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-kadesh ${
        selected
          ? 'text-white shadow-[0_8px_18px_rgba(15,35,80,0.18)]'
          : 'bg-[#f3f5f8] text-[#3a3a3a] hover:bg-kadesh-50 dark:bg-night dark:text-[#d0d0d0] dark:hover:bg-kadesh/20'
      }`}
      style={
        selected && color
          ? { backgroundColor: color }
          : selected
            ? { backgroundColor: 'var(--color-kadesh)' }
            : undefined
      }
    >
      {color && (
        <span
          className="h-2 w-2 shrink-0 rounded-full"
          style={{ backgroundColor: selected ? '#ffffff' : color }}
          aria-hidden
        />
      )}
      {label}
    </button>
  );
}

export default function StatusChips({
  value,
  onChange,
  includeAll = false,
  allowDeselect = true,
  showAll = false,
  labelledBy,
}: {
  value: string | null;
  onChange: (value: string | null) => void;
  includeAll?: boolean;
  allowDeselect?: boolean;
  /** En el alta no se oculta Abandonado / Rescatado detrás de Más. */
  showAll?: boolean;
  labelledBy?: string;
}) {
  const isMoreStatus = DIRECTORY_STATUS_MORE.some((item) => item.value === value);
  const [showMore, setShowMore] = useState(showAll || isMoreStatus);
  const statusRowRef = useRevealChips(showAll || showMore);
  const { ref: moreToggleRef, pulse: pulseMoreToggle } = useChipPulse();

  useEffect(() => {
    if (showAll || isMoreStatus) setShowMore(true);
  }, [isMoreStatus, showAll]);

  const selectStatus = (next: string | null) => {
    if (allowDeselect && next === value) {
      onChange(null);
      return;
    }
    onChange(next);
  };

  return (
    <div
      ref={statusRowRef}
      role="group"
      aria-label={labelledBy ? undefined : includeAll ? 'Qué buscas' : 'Qué reportas'}
      aria-labelledby={labelledBy}
      className="flex flex-wrap gap-1.5"
    >
      {includeAll && (
        <StatusChip
          value={null}
          label="Todos"
          selected={!value}
          onSelect={selectStatus}
        />
      )}
      {DIRECTORY_STATUS_PRIMARY.map((status) => (
        <StatusChip
          key={status.value}
          value={status.value}
          label={status.label}
          selected={value === status.value}
          onSelect={selectStatus}
        />
      ))}
      {DIRECTORY_STATUS_MORE.map((status) => (
        <StatusChip
          key={status.value}
          value={status.value}
          label={status.label}
          selected={value === status.value}
          onSelect={selectStatus}
          more={!showAll}
        />
      ))}
      {!showAll && (
        <button
          ref={moreToggleRef}
          type="button"
          aria-expanded={showMore}
          onClick={() => {
            pulseMoreToggle();
            setShowMore((open) => !open);
          }}
          className="inline-flex min-h-11 origin-center items-center rounded-full px-3 text-sm font-semibold text-kadesh hover:bg-kadesh-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-kadesh dark:hover:bg-kadesh/20"
        >
          {showMore ? 'Menos' : 'Más'}
        </button>
      )}
    </div>
  );
}
