"use client";

import { useState, useEffect, useRef } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useQuery } from "@apollo/client";
import {
  TECH_BUSINESS_LEADS_QUERY,
  TECH_BUSINESS_LEADS_COUNT_QUERY,
  USER_COMPANY_CATEGORIES_QUERY,
  type TechBusinessLeadsResponse,
  type TechBusinessLeadsVariables,
  type TechBusinessLeadsCountResponse,
  type TechBusinessLeadsCountVariables,
  type UserCompanyCategoriesResponse,
  type UserCompanyCategoriesVariables,
} from "kadesh/components/profile/sales/queries";
import SalesLeadsTable from "kadesh/components/profile/sales/SalesLeadsTable";
import StatsSection from "./StatsSection";
import FiltersLeadsSection from "./FiltersLeadsSection";

const LEADS_PAGE_SIZE = 10;

interface SalesSectionProps {
  userId: string;
}

function parsePageParam(value: string | null): number {
  const n = value ? parseInt(value, 10) : NaN;
  return Number.isNaN(n) || n < 1 ? 1 : n;
}

/** Normaliza texto para búsqueda: quita acentos y diacríticos. */
function normalizeSearch(value: string): string {
  return value
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "");
}

export default function SalesSection({ userId }: SalesSectionProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [selectedPipeline, setSelectedPipeline] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchInput, setSearchInput] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  const page = parsePageParam(searchParams.get("page"));

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(searchInput.trim()), 300);
    return () => clearTimeout(t);
  }, [searchInput]);

  const { data: userData } = useQuery<
    UserCompanyCategoriesResponse,
    UserCompanyCategoriesVariables
  >(USER_COMPANY_CATEGORIES_QUERY, {
    variables: { where: { id: userId } },
    skip: !userId,
  });

  const allowedCategoryValues =
    userData?.user?.company?.allowedGooglePlaceCategories ?? [];

  const categoryFilter =
    selectedCategory != null && selectedCategory !== ""
      ? { category: { equals: selectedCategory } as const }
      : allowedCategoryValues.length > 0
        ? { category: { in: allowedCategoryValues } as const }
        : {};

  const where = {
    salesPerson: { id: { equals: userId } },
    ...(selectedPipeline != null && {
      status: { pipelineStatus: { equals: selectedPipeline } },
    }),
    ...categoryFilter,
    ...(debouncedSearch.length > 0 && {
      businessName: {
        contains: normalizeSearch(debouncedSearch),
        mode: "insensitive" as const,
      },
    }),
  };

  const setPageInUrl = (newPage: number) => {
    const params = new URLSearchParams(searchParams.toString());
    if (newPage <= 1) params.delete("page");
    else params.set("page", String(newPage));
    const q = params.toString();
    router.replace(q ? `${pathname}?${q}` : pathname);
  };

  const isFirstMount = useRef(true);
  useEffect(() => {
    if (isFirstMount.current) {
      isFirstMount.current = false;
      return;
    }
    setPageInUrl(1);
  }, [selectedPipeline, selectedCategory, debouncedSearch]);

  const { data: countData } = useQuery<
    TechBusinessLeadsCountResponse,
    TechBusinessLeadsCountVariables
  >(TECH_BUSINESS_LEADS_COUNT_QUERY, {
    variables: { where },
    skip: !userId,
  });

  const totalCount = countData?.techBusinessLeadsCount ?? 0;
  const totalPages = Math.max(1, Math.ceil(totalCount / LEADS_PAGE_SIZE));
  const effectivePage = totalCount > 0 ? Math.min(page, totalPages) : page;

  const { data, loading, error } = useQuery<
    TechBusinessLeadsResponse,
    TechBusinessLeadsVariables
  >(TECH_BUSINESS_LEADS_QUERY, {
    variables: {
      where,
      take: LEADS_PAGE_SIZE,
      skip: (effectivePage - 1) * LEADS_PAGE_SIZE,
    },
    skip: !userId,
  });

  const leads = data?.techBusinessLeads ?? [];

  useEffect(() => {
    if (countData != null && totalPages >= 1 && page > totalPages)
      setPageInUrl(totalPages);
  }, [countData, totalPages, page]);

  const from = totalCount === 0 ? 0 : (effectivePage - 1) * LEADS_PAGE_SIZE + 1;
  const to = Math.min(effectivePage * LEADS_PAGE_SIZE, totalCount);


  return (
    <div className="w-full space-y-6">

      <StatsSection userId={userId} />

      {/* Título + filtros por pipeline + tabla */}
      <div>
        <h2 className="text-xl font-bold text-[#212121] dark:text-[#ffffff] mb-4">
          Clientes ({totalCount})
        </h2>
        <FiltersLeadsSection
          selectedPipeline={selectedPipeline}
          onPipelineChange={setSelectedPipeline}
          selectedCategory={selectedCategory}
          onCategoryChange={setSelectedCategory}
          allowedCategoryValues={allowedCategoryValues}
          searchQuery={searchInput}
          onSearchChange={setSearchInput}
        />
        <SalesLeadsTable leads={leads} loading={loading} error={error} />
        {totalCount > LEADS_PAGE_SIZE && (
          <div className="flex flex-wrap items-center justify-between gap-3 mt-4 py-3 px-4 rounded-lg border border-[#e0e0e0] dark:border-[#3a3a3a] bg-[#fafafa] dark:bg-[#252525]">
            <p className="text-sm text-[#616161] dark:text-[#b0b0b0]">
              Mostrando {from}–{to} de {totalCount}
            </p>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setPageInUrl(Math.max(1, effectivePage - 1))}
                disabled={effectivePage <= 1}
                className="px-3 py-1.5 rounded-lg text-sm font-medium border border-[#e0e0e0] dark:border-[#3a3a3a] bg-white dark:bg-[#2a2a2a] text-[#212121] dark:text-[#ffffff] hover:bg-[#f5f5f5] dark:hover:bg-[#333] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-white dark:disabled:hover:bg-[#2a2a2a]"
              >
                Anterior
              </button>
              <span className="text-sm text-[#616161] dark:text-[#b0b0b0] px-2">
                Página {effectivePage} de {totalPages}
              </span>
              <button
                type="button"
                onClick={() => setPageInUrl(Math.min(totalPages, effectivePage + 1))}
                disabled={effectivePage >= totalPages}
                className="px-3 py-1.5 rounded-lg text-sm font-medium border border-[#e0e0e0] dark:border-[#3a3a3a] bg-white dark:bg-[#2a2a2a] text-[#212121] dark:text-[#ffffff] hover:bg-[#f5f5f5] dark:hover:bg-[#333] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-white dark:disabled:hover:bg-[#2a2a2a]"
              >
                Siguiente
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
