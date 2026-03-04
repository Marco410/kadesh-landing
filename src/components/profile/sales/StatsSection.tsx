"use client";

import { useQuery } from "@apollo/client";

import {
  TECH_BUSINESS_LEADS_COUNT_QUERY,
  TECH_PROPOSALS_QUERY,
  type TechBusinessLeadsCountVariables,
  type TechBusinessLeadsCountResponse,
  type TechProposalsResponse,
  type TechProposalsBySellerVariables,
} from "kadesh/components/profile/sales/queries";
import { PIPELINE_STATUS, PROPOSAL_STATUS } from "./constants";
import { formatCurrency } from "kadesh/utils/format-currency";

interface StatsSectionProps {
  userId: string;
}

export default function StatsSection({ userId }: StatsSectionProps) {
  const { data: proposalsData } = useQuery<
    TechProposalsResponse,
    TechProposalsBySellerVariables
  >(TECH_PROPOSALS_QUERY, {
    variables: {
      where: {
        assignedSeller: { id: { equals: userId } },
      },
    },
    skip: !userId,
  });

  const { data: contactadosData } = useQuery<
    TechBusinessLeadsCountResponse,
    TechBusinessLeadsCountVariables
  >(TECH_BUSINESS_LEADS_COUNT_QUERY, {
    variables: {
      where: {
        salesPerson: { id: { equals: userId } },
        status: { firstContactDate: { not: null } },
      },
    },
    skip: !userId,
  });

  const { data: clientesGanadosData } = useQuery<
    TechBusinessLeadsCountResponse,
    TechBusinessLeadsCountVariables
  >(TECH_BUSINESS_LEADS_COUNT_QUERY, {
    variables: {
      where: {
        salesPerson: { id: { equals: userId } },
        status: { pipelineStatus: { equals: PIPELINE_STATUS.CERRADO_GANADO } },
      },
    },
    skip: !userId,
  });

  const allProposals = proposalsData?.techProposals ?? [];

  const ganancias = allProposals
    .filter((p) => p.status === PROPOSAL_STATUS.COMPRADA)
    .reduce((sum, p) => sum + (p.amount ?? 0), 0);
  const comisionesSinCierre = allProposals
    .filter((p) => p.status !== PROPOSAL_STATUS.COMPRADA)
    .reduce((sum, p) => sum + (p.amount ?? 0), 0);

  const clientesGanados = clientesGanadosData?.techBusinessLeadsCount ?? 0;
  const contactados = contactadosData?.techBusinessLeadsCount ?? 0;


  return (
    <>
      {/* Stats */}
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
            {formatCurrency(comisionesSinCierre)}
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
    </>
  );
}
