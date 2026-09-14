'use client';

import { useRef } from 'react';
import { gsap, useGSAP, HOME_EASE } from 'kadesh/components/home/gsap-register';

function CheckGlyph() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-4 w-4"
      aria-hidden
    >
      <path d="M5 12.5 9.5 17 19 7.5" />
    </svg>
  );
}

export default function ReportStepper({
  step,
  labels,
  onSelect,
}: {
  step: number;
  labels: readonly string[];
  onSelect: (index: number) => void;
}) {
  const scope = useRef<HTMLDivElement>(null);
  const prevStep = useRef(step);
  const isFirstPass = useRef(true);

  useGSAP(
    () => {
      const root = scope.current;
      if (!root) return;

      const connectors = gsap.utils.toArray<HTMLElement>('[data-connector]', root);
      const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

      connectors.forEach((el, index) => {
        gsap.set(el, { transformOrigin: 'left center' });
      });

      if (isFirstPass.current || reduced) {
        connectors.forEach((el, index) => {
          gsap.set(el, { scaleX: index < step ? 1 : 0 });
        });
        isFirstPass.current = false;
        prevStep.current = step;
        return;
      }

      const goingForward = step > prevStep.current;
      const tl = gsap.timeline({
        defaults: { ease: HOME_EASE, duration: 0.32 },
        overwrite: 'auto',
      });

      connectors.forEach((el, index) => {
        tl.to(el, { scaleX: index < step ? 1 : 0 }, 0);
      });

      const currentCircle = root.querySelector<HTMLElement>(
        `[data-step="${step}"] [data-circle]`
      );
      if (currentCircle) {
        tl.fromTo(
          currentCircle,
          { scale: 0.86 },
          { scale: 1, duration: 0.28, overwrite: 'auto' },
          0
        );
      }

      if (goingForward && step > 0) {
        const check = root.querySelector<HTMLElement>(
          `[data-step="${step - 1}"] [data-check]`
        );
        if (check) {
          tl.fromTo(
            check,
            { scale: 0.45, autoAlpha: 0 },
            { scale: 1, autoAlpha: 1, duration: 0.28, overwrite: 'auto' },
            0.04
          );
        }
      }

      prevStep.current = step;
    },
    { dependencies: [step], scope, revertOnUpdate: false }
  );

  return (
    <div ref={scope} className="relative mx-auto w-full max-w-2xl pt-1">
      <div
        className="pointer-events-none absolute left-[16.6%] right-[16.6%] top-[21px] flex h-0.5"
        aria-hidden
      >
        {labels.slice(0, -1).map((label) => (
          <div key={label} className="relative flex-1 overflow-hidden rounded-full bg-[#d8dee8] dark:bg-white/12">
            <div
              data-connector
              className="absolute inset-0 origin-left rounded-full bg-kadesh"
              style={{ transform: 'scaleX(0)' }}
            />
          </div>
        ))}
      </div>
      <ol
        className="relative grid grid-cols-3"
        aria-label={`Paso ${step + 1} de ${labels.length}`}
      >
        {labels.map((label, index) => {
          const isComplete = index < step;
          const isCurrent = index === step;
          return (
            <li key={label} className="flex justify-center">
              <button
                type="button"
                data-step={index}
                aria-current={isCurrent ? 'step' : undefined}
                aria-label={`${index + 1}. ${label}${isComplete ? ', listo' : ''}`}
                onClick={() => onSelect(index)}
                className="flex flex-col items-center gap-1.5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-kadesh"
              >
                <span
                  data-circle
                  className={`inline-flex h-9 w-9 origin-center items-center justify-center rounded-full text-sm font-bold ${
                    isComplete || isCurrent
                      ? 'bg-kadesh text-white shadow-[0_8px_18px_rgba(15,35,80,0.2)]'
                      : 'border-2 border-[#d8dee8] bg-white text-[#5a5a5a] dark:border-white/18 dark:bg-night dark:text-[#9aa3b2]'
                  } ${isCurrent ? 'ring-4 ring-kadesh/25' : ''}`}
                >
                  {isComplete ? (
                    <span data-check className="inline-flex">
                      <CheckGlyph />
                    </span>
                  ) : (
                    index + 1
                  )}
                </span>
                <span
                  className={`text-center text-[11px] font-semibold leading-tight ${
                    isCurrent
                      ? 'text-[#121212] dark:text-[#eef1f6]'
                      : 'text-[#5a5a5a] dark:text-[#9aa3b2]'
                  }`}
                >
                  {label}
                </span>
              </button>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
