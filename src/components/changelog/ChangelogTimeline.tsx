'use client';

import ChangelogReleaseCard from './ChangelogReleaseCard';
import type { SystemRelease } from './types';

interface ChangelogTimelineProps {
  releases: SystemRelease[];
}

export default function ChangelogTimeline({ releases }: ChangelogTimelineProps) {
  return (
    <ol className="relative space-y-8 before:absolute before:top-2 before:left-[11px] before:h-[calc(100%-1rem)] before:w-px before:bg-gradient-to-b before:from-kadesh/80 before:via-[#e0e0e0] before:to-transparent sm:before:left-[15px] dark:before:from-kadesh/50 dark:before:via-[#3a3a3a]">
      {releases.map((release, index) => (
        <li key={release.id} className="relative pl-10 sm:pl-12">
          <span
            className={`absolute top-6 left-0 z-10 flex h-[22px] w-[22px] items-center justify-center rounded-full border-2 sm:top-6 sm:left-[1px] sm:h-[30px] sm:w-[30px] ${
              index === 0
                ? 'border-kadesh bg-kadesh shadow-[0_8px_16px_rgba(15,35,80,0.28)]'
                : 'border-[#e0e0e0] bg-white dark:border-white/20 dark:bg-night'
            }`}
            aria-hidden
          >
            {index === 0 && (
              <span className="h-2 w-2 rounded-full bg-white sm:h-2.5 sm:w-2.5" />
            )}
          </span>
          <ChangelogReleaseCard
            release={release}
            isLatest={index === 0}
            index={index}
          />
        </li>
      ))}
    </ol>
  );
}
