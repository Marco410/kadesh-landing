"use client";

import { useRouter } from "next/navigation";
import type { TechBusinessLeadsResponse } from "kadesh/components/profile/sales/queries";
import {
  PIPELINE_STATUS_COLORS,
  GOOGLE_PLACE_CATEGORIES,
} from "kadesh/components/profile/sales/constants";
import { Routes } from "kadesh/core/routes";
import { getCategoryLabel } from "./helpers/category";
import { ApolloError } from "@apollo/client";



const DEFAULT_PIPELINE_COLOR =
  "bg-neutral-100 text-neutral-600 dark:bg-neutral-700 dark:text-neutral-300";

type LeadItem = TechBusinessLeadsResponse["techBusinessLeads"][number];

interface SalesLeadsTableProps {
  leads: LeadItem[];
  loading: boolean;
  error: ApolloError | undefined;
}

export default function SalesLeadsTable({ leads, loading, error }: SalesLeadsTableProps) {
  const router = useRouter();

  if (leads.length === 0) {
    return (
      <div className="w-full space-y-6">
        <div className="p-8 rounded-xl bg-[#f5f5f5] dark:bg-[#2a2a2a] border border-[#e0e0e0] dark:border-[#3a3a3a] text-center text-[#616161] dark:text-[#b0b0b0]">
          No hay leads.
        </div>
      </div>
    );
  }

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
    <div className="w-full overflow-x-auto rounded-xl border border-[#e0e0e0] dark:border-[#3a3a3a] bg-white dark:bg-[#1e1e1e]">
      <table className="w-full min-w-[900px] text-sm border-collapse">
        <thead>
          <tr className="border-b border-[#e0e0e0] dark:border-[#3a3a3a] bg-[#f5f5f5] dark:bg-[#2a2a2a]">
            <th className="text-left px-4 py-3 font-semibold text-[#212121] dark:text-[#ffffff] whitespace-nowrap">
              Empresa
            </th>
            <th className="text-left px-4 py-3 font-semibold text-[#212121] dark:text-[#ffffff] whitespace-nowrap">
              Categoría
            </th>
            <th className="text-left px-4 py-3 font-semibold text-[#212121] dark:text-[#ffffff] whitespace-nowrap">
              Pipeline
            </th>
            <th className="text-left px-4 py-3 font-semibold text-[#212121] dark:text-[#ffffff] whitespace-nowrap">
              Teléfono
            </th>
            <th className="text-left px-4 py-3 font-semibold text-[#212121] dark:text-[#ffffff] whitespace-nowrap">
              Ciudad
            </th>
            <th className="text-left px-4 py-3 font-semibold text-[#212121] dark:text-[#ffffff] whitespace-nowrap">
              Estado
            </th>
            <th className="text-left px-4 py-3 font-semibold text-[#212121] dark:text-[#ffffff] whitespace-nowrap">
              País
            </th>
            <th className="text-left px-4 py-3 font-semibold text-[#212121] dark:text-[#ffffff] whitespace-nowrap">
              Oportunidad
            </th>
            <th className="text-center px-4 py-3 font-semibold text-[#212121] dark:text-[#ffffff] whitespace-nowrap">
              Rating
            </th>
            <th className="text-left px-4 py-3 font-semibold text-[#212121] dark:text-[#ffffff] whitespace-nowrap">
              Fuente
            </th>
          </tr>
        </thead>
        <tbody>
          {leads.map((lead) => (
            <tr
              key={lead.id}
              role="button"
              tabIndex={0}
              onClick={() => router.push(Routes.profileLead(lead.id))}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  router.push(Routes.profileLead(lead.id));
                }
              }}
              className="border-b border-[#e0e0e0] dark:border-[#3a3a3a] hover:bg-[#fafafa] dark:hover:bg-[#252525] transition-colors cursor-pointer"
            >
              <td className="px-4 py-3 text-[#212121] dark:text-[#ffffff] font-medium">
                {lead.businessName || "—"}
              </td>
              <td className="px-4 py-3 text-[#616161] dark:text-[#b0b0b0]">
                {getCategoryLabel(lead.category)}
              </td>
              <td className="px-4 py-3">
                {lead.status?.pipelineStatus ? (
                  <span
                    className={`inline-flex px-2 py-1 rounded-md text-xs font-medium whitespace-nowrap ${
                      PIPELINE_STATUS_COLORS[lead.status.pipelineStatus] ??
                      DEFAULT_PIPELINE_COLOR
                    }`}
                  >
                    {lead.status.pipelineStatus}
                  </span>
                ) : (
                  <span className="text-[#616161] dark:text-[#b0b0b0]">—</span>
                )}
              </td>
              <td
                className="px-4 py-3 text-[#616161] dark:text-[#b0b0b0] whitespace-nowrap"
                onClick={(e) => e.stopPropagation()}
              >
                {lead.phone ? (
                  <a
                    href={`tel:${lead.phone.replace(/\s/g, "")}`}
                    className="text-orange-500 dark:text-orange-400 hover:underline focus:outline-none focus:ring-2 focus:ring-orange-500 rounded"
                  >
                    {lead.phone}
                  </a>
                ) : (
                  "—"
                )}
              </td>
              <td className="px-4 py-3 text-[#616161] dark:text-[#b0b0b0]">
                {lead.city ?? "—"}
              </td>
              <td className="px-4 py-3 text-[#616161] dark:text-[#b0b0b0]">
                {lead.state ?? "—"}
              </td>
              <td className="px-4 py-3 text-[#616161] dark:text-[#b0b0b0]">
                {lead.country ?? "—"}
              </td>
              <td className="px-4 py-3 text-[#616161] dark:text-[#b0b0b0]">
                {lead.status?.opportunityLevel ?? "—"}
              </td>
              <td className="px-4 py-3 text-center text-[#212121] dark:text-[#ffffff]">
                {lead.rating != null ? lead.rating : "—"}
              </td>
              <td className="px-4 py-3 text-[#616161] dark:text-[#b0b0b0]">
                {lead.source ?? "—"}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
