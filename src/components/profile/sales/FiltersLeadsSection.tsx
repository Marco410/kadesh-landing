"use client";

import {
  PIPELINE_STATUS,
  PIPELINE_STATUS_COLORS,
  PIPELINE_STATUS_RING,
  PIPELINE_RING_BASE,
  GOOGLE_PLACE_CATEGORIES,
} from "kadesh/components/profile/sales/constants";

const PIPELINE_VALUES = Object.values(PIPELINE_STATUS);

interface FiltersLeadsSectionProps {
  selectedPipeline: string | null;
  onPipelineChange: (value: string | null) => void;
  selectedCategory: string | null;
  onCategoryChange: (value: string | null) => void;
  searchQuery: string;
  onSearchChange: (value: string) => void;
}

export default function FiltersLeadsSection({
  selectedPipeline,
  onPipelineChange,
  selectedCategory,
  onCategoryChange,
  searchQuery,
  onSearchChange,
}: FiltersLeadsSectionProps) {
  const categoryOptions = GOOGLE_PLACE_CATEGORIES;

  return (
    <div className="space-y-4 mb-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
            {/* Filtro por nombre de empresa */}
            <div className="flex flex-wrap items-center gap-2">
              <label
                htmlFor="filter-business-name"
                className="text-sm font-medium text-[#616161] dark:text-[#b0b0b0] shrink-0"
              >
                Empresa
              </label>
              <input
                id="filter-business-name"
                type="search"
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                placeholder="Buscar por nombre..."
                className="rounded-lg border border-[#e0e0e0] dark:border-[#3a3a3a] bg-white dark:bg-[#2a2a2a] px-3 py-1.5 text-sm text-[#212121] dark:text-[#ffffff] placeholder-[#9ca3af] focus:outline-none min-w-[200px]"
                aria-label="Buscar por nombre de empresa"
              />
            </div>
            {/* Filtro por categoría */}
            <div className="flex flex-wrap items-center gap-2">
                <label
                htmlFor="filter-category"
                className="text-sm font-medium text-[#616161] dark:text-[#b0b0b0] shrink-0"
                >
                Categoría
                </label>
                <select
                id="filter-category"
                value={selectedCategory ?? ""}
                onChange={(e) => onCategoryChange(e.target.value || null)}
                className="rounded-lg border border-[#e0e0e0] dark:border-[#3a3a3a] bg-white dark:bg-[#2a2a2a] px-3 py-1.5 text-sm text-[#212121] dark:text-[#ffffff] focus:ring-2 focus:ring-orange-500 focus:border-orange-500 min-w-[180px]"
                aria-label="Filtrar por categoría"
                >
                <option value="">Todas las categorías</option>
                {categoryOptions.map(({ value, label }) => (
                    <option key={value} value={value}>
                    {label}
                    </option>
                ))}
                </select>
            </div>
        </div>

      {/* Filtro por pipeline */}
      <div className="flex flex-wrap gap-2">
      <button
        type="button"
        onClick={() => onPipelineChange(null)}
        className={`inline-flex px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
          selectedPipeline === null
            ? "bg-orange-500 text-white dark:bg-orange-500 dark:text-white ring-2 ring-orange-500 ring-offset-2 dark:ring-offset-[#1e1e1e]"
            : "bg-[#f0f0f0] text-[#616161] dark:bg-[#2a2a2a] dark:text-[#b0b0b0] hover:bg-[#e5e5e5] dark:hover:bg-[#353535]"
        }`}
      >
        Todos
      </button>
      {PIPELINE_VALUES.map((status) => {
        const isSelected = selectedPipeline === status;
        const colorClass =
          PIPELINE_STATUS_COLORS[status] ??
          "bg-neutral-100 text-neutral-600 dark:bg-neutral-700 dark:text-neutral-300";
        const ringColor = PIPELINE_STATUS_RING[status] ?? "neutral-500";
        return (
          <button
            key={status}
            type="button"
            onClick={() => onPipelineChange(isSelected ? null : status)}
            className={`inline-flex px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${colorClass} ${
              isSelected
                ? `${PIPELINE_RING_BASE} ring-${ringColor}`
                : "opacity-90 hover:opacity-100"
            }`}
          >
            {status.replace(/^\d+\s*-\s*/, "")}
          </button>
        );
      })}
      </div>
    </div>
  );
}
