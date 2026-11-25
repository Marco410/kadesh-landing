"use client";

import { useId, useState } from "react";
import DonationIcon from "kadesh/components/shared/icons/DonationIcon";
import { PODIUM_MIN_NAMED, namedDonors, patitasLabel } from "../constants";
import type { DonorRankingEntry } from "../types";

type Period = "month" | "all_time";

const TABS: Array<{ key: Period; label: string }> = [
  { key: "month", label: "Este mes" },
  { key: "all_time", label: "De siempre" },
];

/**
 * Podium steps, in visual order (2nd, 1st, 3rd). Ribbon colors (gold, silver, bronze) on paw
 * badges: no photos, levels or streaks, so it never reads as the huellitas ranking (`/ranking`).
 */
const PODIUM = [
  {
    place: 2,
    height: "h-24 sm:h-28",
    badge: "bg-[#c9d1dc] text-[#3d4652]",
    step: "from-kadesh/20 to-kadesh/5",
  },
  {
    place: 1,
    height: "h-32 sm:h-40",
    badge: "bg-[#f5c542] text-[#5c4300]",
    step: "from-kadesh/35 to-kadesh/10",
  },
  {
    place: 3,
    height: "h-20 sm:h-24",
    badge: "bg-[#e2a26b] text-[#5a2f0c]",
    step: "from-kadesh/15 to-kadesh/5",
  },
] as const;

function PodiumSpot({
  entry,
  place,
  height,
  badge,
  step,
}: { entry?: DonorRankingEntry } & (typeof PODIUM)[number]) {
  const first = place === 1;
  return (
    <li className="flex min-w-0 flex-1 flex-col items-center justify-end">
      {entry ? (
        <div className="mb-3 flex w-full min-w-0 flex-col items-center text-center">
          <span
            className={`relative inline-flex items-center justify-center rounded-full bg-white text-kadesh shadow-[0_8px_24px_rgba(33,107,250,0.18)] ring-4 ring-white dark:bg-night dark:text-[#8fb2ff] dark:ring-night-raised ${
              first ? "h-20 w-20 sm:h-24 sm:w-24" : "h-16 w-16 sm:h-20 sm:w-20"
            }`}
          >
            <DonationIcon size={first ? 44 : 34} />
            <span
              className={`absolute -bottom-1 -right-1 inline-flex h-8 w-8 items-center justify-center rounded-full text-sm font-black ring-2 ring-white dark:ring-night-raised ${badge}`}
              aria-hidden
            >
              {place}
            </span>
          </span>
          <p
            className={`mt-3 w-full truncate px-1 font-bold text-[#121212] dark:text-white ${first ? "text-base sm:text-lg" : "text-sm sm:text-base"}`}
          >
            {entry.displayName}
          </p>
          <p className="text-sm font-semibold tabular-nums text-kadesh dark:text-[#8fb2ff]">
            {patitasLabel(entry.units)}
          </p>
          <span className="sr-only">Lugar {place}</span>
        </div>
      ) : (
        <div
          className="mb-3 flex flex-col items-center text-center"
          aria-hidden
        >
          <span className="inline-flex h-16 w-16 items-center justify-center rounded-full border-2 border-dashed border-kadesh/25 text-kadesh/40">
            <DonationIcon size={28} />
          </span>
          <p className="mt-3 text-sm text-[#5a5a5a] dark:text-[#9aa3b2]">
            ¿Tú?
          </p>
        </div>
      )}
      <div
        className={`flex w-full items-start justify-center rounded-t-2xl bg-gradient-to-b pt-2 text-2xl font-black text-kadesh/50 dark:text-[#8fb2ff]/50 ${height} ${step}`}
        aria-hidden
      >
        {place}
      </div>
    </li>
  );
}

/**
 * «Quienes nos dieron una patita»: top 3 on a podium (from `PODIUM_MIN_NAMED` names) and the rest in a list, by patitas (never
 * pesos). Both periods come from the server; the tabs only switch between them.
 */
export default function DonorTop({
  month,
  allTime,
}: {
  month: DonorRankingEntry[];
  allTime: DonorRankingEntry[];
}) {
  const [period, setPeriod] = useState<Period>(
    month.length > 0 ? "month" : "all_time",
  );
  const baseId = useId();
  const rows = period === "month" ? month : allTime;
  const byPlace = new Map(
    rows.slice(0, 3).map((row, index) => [index + 1, row]),
  );
  // A podium with one or two people looks lonely: below `PODIUM_MIN_NAMED` names, a plain list.
  const showPodium = namedDonors(rows) >= PODIUM_MIN_NAMED;
  const rest = showPodium ? rows.slice(3) : rows;

  return (
    <div className="rounded-3xl border border-[#ececec] bg-white p-4 shadow-[0_16px_40px_rgba(15,35,80,0.06)] dark:border-white/10 dark:bg-night-raised sm:p-8">
      <div className="flex justify-center">
        <div
          role="tablist"
          aria-label="Periodo"
          className="inline-flex rounded-xl bg-[#f1f3f7] p-1 dark:bg-night"
        >
          {TABS.map((tab) => {
            const selected = tab.key === period;
            return (
              <button
                key={tab.key}
                id={`${baseId}-${tab.key}`}
                type="button"
                role="tab"
                aria-selected={selected}
                aria-controls={`${baseId}-panel`}
                onClick={() => setPeriod(tab.key)}
                className={`min-h-10 rounded-lg px-5 text-sm font-semibold transition-colors ${
                  selected
                    ? "bg-white text-kadesh shadow-sm dark:bg-night-raised dark:text-[#8fb2ff]"
                    : "text-[#5a5a5a] hover:text-[#121212] dark:text-[#9aa3b2] dark:hover:text-white"
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      <div
        id={`${baseId}-panel`}
        role="tabpanel"
        aria-labelledby={`${baseId}-${period}`}
        className="mt-8"
      >
        <>
          {showPodium ? (
            <ol
              className="mx-auto flex max-w-xl items-end gap-2 sm:gap-4"
              aria-label="Podio"
            >
              {PODIUM.map((spot) => (
                <PodiumSpot
                  key={spot.place}
                  entry={byPlace.get(spot.place)}
                  {...spot}
                />
              ))}
            </ol>
          ) : null}

          {rest.length > 0 ? (
            <ol
              start={showPodium ? 4 : 1}
              className="mx-auto mt-6 max-w-xl divide-y divide-[#ececec] dark:divide-white/10"
            >
              {rest.map((row) => (
                <li
                  key={`${period}-${row.rank}`}
                  className="flex items-center gap-3 py-3"
                >
                  <span className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#f1f3f7] text-sm font-bold tabular-nums text-[#5a5a5a] dark:bg-night dark:text-[#9aa3b2]">
                    {row.rank}
                  </span>
                  <span className="min-w-0 flex-1 truncate text-sm font-semibold text-[#121212] dark:text-[#eef1f6]">
                    {row.displayName}
                  </span>
                  <span className="inline-flex shrink-0 items-center gap-1 text-sm font-semibold tabular-nums text-kadesh dark:text-[#8fb2ff]">
                    <DonationIcon size={14} />
                    {patitasLabel(row.units)}
                  </span>
                </li>
              ))}
            </ol>
          ) : null}
          {rows.length === 0 ? (
            <p className="mt-6 text-center text-sm text-[#5a5a5a] dark:text-[#9aa3b2]">
              {period === "month"
                ? "Este mes aún no hay patitas. La tuya puede ser la primera."
                : "Aún no hay patitas. La tuya puede ser la primera."}
            </p>
          ) : null}
        </>
      </div>
    </div>
  );
}
