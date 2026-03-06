"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useQuery } from "@apollo/client";
import {
  SAAS_PLANS_QUERY,
  USER_COMPANY_CATEGORIES_QUERY,
  type SaasPlansResponse,
  type SaasPlanItem,
  type PlanFeatureItem,
  type UserCompanyCategoriesResponse,
  type UserCompanyCategoriesVariables,
} from "kadesh/components/profile/sales/queries";
import { Routes } from "kadesh/core/routes";
import { useUser } from "kadesh/utils/UserContext";
import { cn } from "kadesh/utils/cn";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  ArrowLeft01Icon,
  CheckmarkCircle02Icon,
  Cancel01Icon,
} from "@hugeicons/core-free-icons";

function formatPrice(cost: number, currency: string, frequency: string): string {
  const formatter = new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency: currency || "MXN",
  });
  return formatter.format(cost);
}

function formatPeriod(frequency: string): string {
  const f = frequency?.toLowerCase();
  return f === "monthly" ? "mes" : f === "yearly" ? "año" : frequency || "";
}

function FeatureRow({ feature }: { feature: PlanFeatureItem }) {
  return (
    <li className="flex items-start gap-3">
      <span className="mt-0.5 flex-shrink-0" aria-hidden>
        {feature.included ? (
          <HugeiconsIcon
            icon={CheckmarkCircle02Icon}
            size={20}
            className="text-orange-500 dark:text-orange-400"
          />
        ) : (
          <HugeiconsIcon
            icon={Cancel01Icon}
            size={20}
            className="text-red-500 dark:text-red-400"
          />
        )}
      </span>
      <span className="relative inline group/name">
        <span
          className="cursor-help text-sm text-[#616161] dark:text-[#b0b0b0] border-b border-dotted border-[#616161] dark:border-[#b0b0b0]"
          title={feature.description}
        >
          {feature.name}
        </span>
        <span
          role="tooltip"
          className="pointer-events-none absolute left-0 bottom-full z-10 mb-1.5 max-w-[240px] rounded-lg bg-[#212121] dark:bg-[#2a2a2a] px-3 py-2 text-xs text-white dark:text-[#e0e0e0] shadow-lg opacity-0 transition-opacity duration-150 group-hover/name:opacity-100"
        >
          {feature.description}
        </span>
      </span>
    </li>
  );
}

function PlanCard({
  plan,
  onSubscribe,
  isCurrentPlan,
}: {
  plan: SaasPlanItem;
  onSubscribe?: (plan: SaasPlanItem) => void;
  isCurrentPlan?: boolean;
}) {
  const isActive = plan.active;
  const highlighted = isCurrentPlan === true;

  return (
    <div
      className={cn(
        "relative rounded-2xl border p-6 sm:p-8",
        highlighted
          ? "border-orange-500 dark:border-orange-500 bg-orange-500/5 dark:bg-orange-500/10 shadow-lg shadow-orange-500/10"
          : "border-[#e0e0e0] dark:border-[#3a3a3a] bg-white dark:bg-[#1e1e1e]",
      )}
    >
      {plan.bestSeller === true && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-orange-500 px-4 py-1 text-xs font-bold text-white">
          MÁS VENDIDO
        </div>
      )}
      {isCurrentPlan && (
        <div className="absolute top-3 right-3">
          <span className="inline-flex items-center rounded-full bg-blue-500 px-2.5 py-1 text-xs font-medium text-white">
            Tu plan actual
          </span>
        </div>
      )}

      <div className="text-center">
        <h3 className="text-lg font-bold text-[#212121] dark:text-[#ffffff]">
          {plan.name}
        </h3>
        {!isActive && !isCurrentPlan && (
          <span className="mt-1 block text-xs text-[#616161] dark:text-[#b0b0b0]">
            No disponible
          </span>
        )}
        <div className="mt-4">
          <span className="text-4xl font-bold text-[#212121] dark:text-[#ffffff]">
            {formatPrice(plan.cost, plan.currency, plan.frequency)}
          </span>
          <span className="text-[#616161] dark:text-[#b0b0b0]">
            /{formatPeriod(plan.frequency)}
          </span>
        </div>
        {plan.leadLimit != null && (
          <p className="mt-2 text-sm text-[#616161] dark:text-[#b0b0b0]">
            Hasta <strong className="text-[#212121] dark:text-[#e0e0e0]">{plan.leadLimit}</strong> leads/mes
          </p>
        )}
      </div>

      {plan.planFeatures != null && plan.planFeatures.length > 0 && (
        <ul className="mt-8 space-y-3">
          {plan.planFeatures.map((f) => (
            <FeatureRow key={f.key} feature={f} />
          ))}
        </ul>
      )}

      {isActive && onSubscribe && (
        <button
          type="button"
          onClick={() => onSubscribe(plan)}
          disabled={isCurrentPlan}
          className={cn(
            "mt-8 w-full rounded-xl px-4 py-2.5 text-sm font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 dark:focus:ring-offset-[#1e1e1e] disabled:cursor-not-allowed disabled:opacity-60",
            highlighted
              ? "bg-orange-500 text-white hover:bg-orange-600 dark:bg-orange-500 dark:hover:bg-orange-600"
              : "border-2 border-orange-500 text-orange-500 hover:bg-orange-500/10 dark:border-orange-500 dark:text-orange-400 dark:hover:bg-orange-500/20",
            isCurrentPlan && "hover:bg-orange-500 dark:hover:bg-orange-500",
          )}
        >
          {isCurrentPlan ? "Plan actual" : "Iniciar suscripción"}
        </button>
      )}
    </div>
  );
}

function getCurrentPlanName(subscription: { planName: string } | null | undefined): string | null {
  return subscription?.planName?.trim() ?? null;
}

export default function PlansSection() {
  const router = useRouter();
  const { user } = useUser();
  const userId = user?.id ?? "";

  const { data, loading, error } = useQuery<SaasPlansResponse>(SAAS_PLANS_QUERY);
  const { data: userData } = useQuery<
    UserCompanyCategoriesResponse,
    UserCompanyCategoriesVariables
  >(USER_COMPANY_CATEGORIES_QUERY, {
    variables: { where: { id: userId } },
    skip: !userId,
  });

  const currentPlanName = getCurrentPlanName(userData?.user?.company?.subscriptions?.[0] ?? null);

  const handleSubscribe = (plan: SaasPlanItem) => {
    router.push(Routes.profilePlanSubscribe(plan.id));
  };

  return (
    <div className="w-full max-w-5xl mx-auto space-y-8">
      <div className="mb-6">
        <Link
          href={`${Routes.profile}?tab=ventas`}
          className="inline-flex items-center gap-1.5 text-sm text-[#616161] dark:text-[#b0b0b0] hover:text-orange-500 dark:hover:text-orange-400"
        >
          <HugeiconsIcon icon={ArrowLeft01Icon} size={16} />
          Volver a Ventas
        </Link>
      </div>

      <section id="planes" className="text-center">
        <h1 className="text-3xl font-bold text-[#212121] dark:text-[#ffffff]">
          Planes y precios
        </h1>
        <p className="mt-2 text-[#616161] dark:text-[#b0b0b0]">
          Planes a la medida de tu empresa
        </p>
      </section>

      {loading && (
        <div className="flex justify-center py-16">
          <span className="size-10 animate-spin rounded-full border-2 border-orange-500 border-t-transparent" />
        </div>
      )}

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-800 dark:bg-red-900/20 dark:text-red-300">
          No se pudieron cargar los planes. Intenta de nuevo más tarde.
        </div>
      )}

      {data?.saasPlans && data.saasPlans.length === 0 && !loading && (
        <div className="rounded-2xl border border-[#e0e0e0] bg-[#f5f5f5] p-8 text-center text-[#616161] dark:border-[#3a3a3a] dark:bg-[#2a2a2a] dark:text-[#b0b0b0]">
          No hay planes disponibles.
        </div>
      )}

      {data?.saasPlans && data.saasPlans.length > 0 && (
        <div className="mx-auto grid max-w-5xl gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {[...data.saasPlans]
            .sort((a, b) => a.cost - b.cost)
            .map((plan) => {
              const isCurrentPlan =
                currentPlanName != null &&
                plan.name.trim().toLowerCase() === currentPlanName.toLowerCase();
              return (
                <PlanCard
                  key={plan.id}
                  plan={plan}
                  onSubscribe={plan.active ? handleSubscribe : undefined}
                  isCurrentPlan={isCurrentPlan}
                />
              );
            })}
        </div>
      )}
    </div>
  );
}
