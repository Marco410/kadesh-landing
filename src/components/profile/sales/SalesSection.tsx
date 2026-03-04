"use client";

import { useState } from "react";
import { useQuery } from "@apollo/client";
import {
  TECH_BUSINESS_LEADS_QUERY,
  type TechBusinessLeadsResponse,
  type TechBusinessLeadsVariables,
} from "kadesh/components/profile/sales/queries";
import {
  PIPELINE_STATUS,
  PIPELINE_STATUS_COLORS,
  PIPELINE_STATUS_RING,
  PIPELINE_RING_BASE,
} from "kadesh/components/profile/sales/constants";
import SalesLeadsTable from "kadesh/components/profile/sales/SalesLeadsTable";

function formatCurrency(value: number): string {
  return new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency: "MXN",
  }).format(value);
}

interface SalesSectionProps {
  userId: string;
}

const PIPELINE_VALUES = Object.values(PIPELINE_STATUS);

export default function SalesSection({ userId }: SalesSectionProps) {
  const [selectedPipeline, setSelectedPipeline] = useState<string | null>(null);

  const { data, loading, error } = useQuery<
    TechBusinessLeadsResponse,
    TechBusinessLeadsVariables
  >(TECH_BUSINESS_LEADS_QUERY, {
    variables: {
      where: {
        salesPerson: { id: { equals: userId } },
        ...(selectedPipeline != null && {
          status: { pipelineStatus: { equals: selectedPipeline } },
        }),
      },
    },
    skip: !userId,
  });

  const leads = data?.techBusinessLeads ?? [];

  const clientesGanados = leads.filter(
    (l) => l.status?.pipelineStatus?.toLowerCase().includes("ganad") ?? false,
  ).length;
  const ganancias = leads.reduce(
    (sum, l) => sum + (l.status?.estimatedValue ?? 0),
    0,
  );
  const contactados = leads.filter((l) => l.status?.firstContactDate != null).length;

  if (loading) {
    return (
      <div className="w-full flex items-center justify-center py-16">
        <span className="animate-spin size-10 border-2 border-orange-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full p-6 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 text-sm">
        No se pudieron cargar los leads. Intenta de nuevo más tarde.
      </div>
    );
  }



  return (
    <div className="w-full space-y-6">
      {/* Estadísticas */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="rounded-xl border border-[#e0e0e0] dark:border-[#3a3a3a] bg-white dark:bg-[#1e1e1e] p-4 shadow-sm">
          <p className="text-sm font-medium text-[#616161] dark:text-[#b0b0b0]">
            Clientes ganados
          </p>
          <p className="text-2xl font-bold text-[#212121] dark:text-[#ffffff] mt-1">
            {clientesGanados}
          </p>
        </div>
        <div className="rounded-xl border border-[#e0e0e0] dark:border-[#3a3a3a] bg-white dark:bg-[#1e1e1e] p-4 shadow-sm">
          <p className="text-sm font-medium text-[#616161] dark:text-[#b0b0b0]">
            Mis comisiones
          </p>
          <p className="text-2xl font-bold text-[#212121] dark:text-[#ffffff] mt-1">
            {formatCurrency(ganancias)}
          </p>
        </div>
        <div className="rounded-xl border border-[#e0e0e0] dark:border-[#3a3a3a] bg-white dark:bg-[#1e1e1e] p-4 shadow-sm">
          <p className="text-sm font-medium text-[#616161] dark:text-[#b0b0b0]">
            Comisiones sin cierre
          </p>
          <p className="text-2xl font-bold text-[#212121] dark:text-[#ffffff] mt-1">
            {formatCurrency(ganancias)}
          </p>
        </div>
        <div className="rounded-xl border border-[#e0e0e0] dark:border-[#3a3a3a] bg-white dark:bg-[#1e1e1e] p-4 shadow-sm">
          <p className="text-sm font-medium text-[#616161] dark:text-[#b0b0b0]">
            Contactados
          </p>
          <p className="text-2xl font-bold text-[#212121] dark:text-[#ffffff] mt-1">
            {contactados}
          </p>
        </div>
      </div>

      {/* Título + filtros por pipeline + tabla */}
      <div>
        <h2 className="text-xl font-bold text-[#212121] dark:text-[#ffffff] mb-4">
          Clientes
        </h2>
        <div className="flex flex-wrap gap-2 mb-4">
          <button
            type="button"
            onClick={() => setSelectedPipeline(null)}
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
            const ringColor =
              PIPELINE_STATUS_RING[status] ?? "neutral-500";
            return (
              <button
                key={status}
                type="button"
                onClick={() =>
                  setSelectedPipeline(isSelected ? null : status)
                }
                className={`inline-flex px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${colorClass} ${
                  isSelected ? `${PIPELINE_RING_BASE} ring-${ringColor}` : "opacity-90 hover:opacity-100"
                }`}
              >
                {status.replace(/^\d+\s*-\s*/, "")}
              </button>
            );
          })}
        </div>
        <SalesLeadsTable leads={leads} />
      </div>
    </div>
  );
}
