"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { HugeiconsIcon } from "@hugeicons/react";
import { ArrowDown01Icon, ArrowUp01Icon } from "@hugeicons/core-free-icons";
import ChangelogReleaseBody from "./ChangelogReleaseBody";
import { CHANGELOG_BODY_COLLAPSE_CHARS } from "./constants";
import { formatReleaseDate } from "./format-release-date";
import type { SystemRelease } from "./types";

interface ChangelogReleaseCardProps {
  release: SystemRelease;
  isLatest?: boolean;
  index?: number;
}

export default function ChangelogReleaseCard({
  release,
  isLatest = false,
  index = 0,
}: ChangelogReleaseCardProps) {
  const reduceMotion = useReducedMotion();
  const body = release.body?.trim() ?? "";
  const isCollapsible = body.length > CHANGELOG_BODY_COLLAPSE_CHARS;
  const [expanded, setExpanded] = useState(!isCollapsible);
  const displayBody =
    isCollapsible && !expanded
      ? `${body.slice(0, CHANGELOG_BODY_COLLAPSE_CHARS).trim()}…`
      : body;

  const heading = release.title?.trim() || `Versión ${release.version}`;

  return (
    <motion.article
      initial={reduceMotion ? false : { opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.4, delay: Math.min(index * 0.06, 0.3) }}
      className={`relative rounded-2xl border bg-white p-6 shadow-[0_8px_24px_rgba(15,35,80,0.06)] dark:bg-night-raised sm:p-8 ${
        isLatest
          ? "border-kadesh/50 ring-1 ring-kadesh/20 dark:border-kadesh/40"
          : "border-[#ececec] dark:border-white/10"
      }`}
    >
      <header className="flex flex-col gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <span
            className={`inline-flex items-center rounded-lg px-2.5 py-1 font-mono text-sm font-bold tracking-tight ${
              isLatest
                ? "bg-kadesh text-white"
                : "bg-[#f3f5f8] text-[#121212] dark:bg-night dark:text-kadesh-300"
            }`}
          >
            v{release.version}
          </span>
          {isLatest && (
            <span className="rounded-full bg-kadesh/15 px-2.5 py-0.5 text-xs font-semibold text-kadesh dark:text-kadesh-300">
              Más reciente
            </span>
          )}
        </div>
        <h2 className="text-xl font-bold tracking-[-0.02em] text-[#121212] dark:text-white sm:text-2xl">
          {heading}
        </h2>
        <time
          dateTime={release.releasedAt}
          className="text-sm text-[#5a5a5a] dark:text-[#9aa3b2]"
        >
          {formatReleaseDate(release.releasedAt)}
        </time>
      </header>

      {body ? (
        <div className="mt-5">
          <ChangelogReleaseBody body={displayBody} />
          {isCollapsible && (
            <button
              type="button"
              onClick={() => setExpanded((v) => !v)}
              className="mt-4 inline-flex min-h-11 items-center gap-1.5 text-sm font-semibold text-kadesh transition-colors hover:text-kadesh-600 dark:text-kadesh-300 dark:hover:text-kadesh-200"
            >
              <HugeiconsIcon
                icon={expanded ? ArrowUp01Icon : ArrowDown01Icon}
                size={16}
              />
              {expanded ? "Ver menos" : "Leer notas completas"}
            </button>
          )}
        </div>
      ) : (
        <p className="mt-4 text-sm italic text-[#6a6a6a] dark:text-[#9aa3b2]">
          Sin notas de cambio para esta versión.
        </p>
      )}
    </motion.article>
  );
}
