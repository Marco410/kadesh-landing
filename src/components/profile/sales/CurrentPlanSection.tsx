"use client";

import { formatDateShort } from "kadesh/utils/format-date";
import {  USER_COMPANY_CATEGORIES_QUERY, UserCompanyCategoriesResponse, UserCompanyCategoriesVariables } from "./queries";
import { useQuery } from "@apollo/client";
import { useRouter } from "next/navigation";
import { Routes } from "kadesh/core/routes";

interface CurrentPlanSectionProps {
  userId: string;
}

function PlanMetric({
  label,
  value,
  valueClassName = "text-[#212121] dark:text-[#ffffff]",
}: {
  label: string;
  value: React.ReactNode;
  valueClassName?: string;
}) {



  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-xs font-medium text-[#616161] dark:text-[#b0b0b0] uppercase tracking-wide">
        {label}
      </span>
      <span className={`text-base font-semibold ${valueClassName}`}>{value}</span>
    </div>
  );
}

export default function CurrentPlanSection({ userId }: CurrentPlanSectionProps) {
  const router = useRouter();
  const { data: userData } = useQuery<
      UserCompanyCategoriesResponse,
      UserCompanyCategoriesVariables
    >(USER_COMPANY_CATEGORIES_QUERY, {
      variables: { where: { id: userId } },
      skip: !userId,
    });

  if (userData?.user?.company?.subscriptions == null) {
    return (
      <div className="rounded-xl border border-[#e0e0e0] dark:border-[#3a3a3a] bg-white dark:bg-[#1e1e1e] p-6 shadow-sm">
        <p className="text-sm text-[#616161] dark:text-[#b0b0b0] text-center">
          No hay suscripción asignada a tu empresa.
        </p>
      </div>
    );
  }

  const subscription = userData?.user?.company?.subscriptions?.[0];

  return (
    <div className="rounded-xl border border-[#e0e0e0] dark:border-[#3a3a3a] bg-white dark:bg-[#1e1e1e] shadow-sm overflow-hidden">
      <div className="h-1 bg-gradient-to-r from-orange-500 to-orange-400" aria-hidden />
      <div className="p-5">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex flex-row gap-10 items-center justify-between  ">
            <div className="flex flex-col">
              <p className="text-xs font-medium text-[#616161] dark:text-[#b0b0b0] uppercase tracking-wide mb-1">
                Plan actual
              </p>
              <h3 className="text-xl font-bold text-[#212121] dark:text-[#ffffff]">
                {subscription?.planName}
              </h3>
            </div>
              <PlanMetric
                label="Límite de leads / mes"
                value={subscription?.planLeadLimit}
              />
              <PlanMetric
                label="Inicio de suscripción"
                value={formatDateShort(subscription?.activatedAt, false)}
              />
              <PlanMetric
                label="Fin de periodo"
                value={formatDateShort(subscription?.currentPeriodEnd, false)}
              />
              <button
                type="button"
                onClick={() => router.push(Routes.profilePlans)}
                className="inline-flex px-3 py-1.5 rounded-lg text-sm font-medium transition-colors bg-orange-500 text-white dark:bg-orange-500 hover:bg-orange-600 dark:hover:bg-orange-600"
              >
                Ver planes
              </button>
          </div>
          <span
            className={`inline-flex items-center gap-1.5 w-fit px-3 py-1 rounded-full text-sm font-medium ${
              subscription?.status === "active"
                ? "bg-green-500/15 text-green-700 dark:text-green-400 dark:bg-green-500/20"
                : "bg-[#e0e0e0] dark:bg-[#3a3a3a] text-[#616161] dark:text-[#b0b0b0]"
            }`}>
            {subscription?.status === "active" ? "Activo" : "Inactivo"}
          </span>
        </div>
      </div>
    </div>
  );
}

