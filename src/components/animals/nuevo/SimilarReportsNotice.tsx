"use client";

import { AnimatePresence, motion } from 'framer-motion';
import { HugeiconsIcon } from '@hugeicons/react';
import { SearchVisualIcon } from '@hugeicons/core-free-icons';
import { useUiMotion } from 'kadesh/components/shared/motion';
import type { SimilarReport } from 'kadesh/components/animals/queries';
import { similarNoticeCopy } from 'kadesh/components/animals/similarReportsCopy';

interface SimilarReportsNoticeProps {
  reports: SimilarReport[];
  status: string;
  onReview: () => void;
}

/** Aviso que no frena: aparece en el paso «Dónde» en cuanto hay reportes parecidos cerca. */
export default function SimilarReportsNotice({ reports, status, onReview }: SimilarReportsNoticeProps) {
  const motionPrefs = useUiMotion();
  const visible = reports.length > 0;
  const copy = visible ? similarNoticeCopy(reports, status) : null;

  return (
    <AnimatePresence initial={false}>
      {visible && copy ? (
        <motion.div
          key="similar-notice"
          role="status"
          variants={motionPrefs.expand}
          initial={motionPrefs.expand ? 'hidden' : false}
          animate="show"
          exit="exit"
          className="overflow-hidden"
        >
          <div className="flex items-start gap-3 rounded-xl border border-amber-300 bg-amber-50 p-3 text-[#121212] dark:border-amber-700/60 dark:bg-amber-950/40 dark:text-[#eef1f6]">
            <span className="mt-0.5 inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-300">
              <HugeiconsIcon icon={SearchVisualIcon} size={18} strokeWidth={1.6} />
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold">{copy.title}</p>
              <p className="mt-0.5 text-sm text-[#5a5a5a] dark:text-[#c3cad6]">{copy.description}</p>
              <motion.button
                type="button"
                onClick={onReview}
                whileTap={motionPrefs.tap}
                className="mt-2 inline-flex min-h-11 items-center rounded-xl bg-kadesh px-4 text-sm font-semibold text-white hover:bg-kadesh-600"
              >
                Revisar
              </motion.button>
            </div>
          </div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
