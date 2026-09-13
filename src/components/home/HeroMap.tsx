'use client';

import { useRef } from 'react';
import Link from 'next/link';
import { Routes } from 'kadesh/core/routes';
import { getStatusColor, getStatusLabel } from 'kadesh/components/animals/constants';
import { gsap, useGSAP, HOME_EASE } from 'kadesh/components/home/gsap-register';

type PawPin = {
  kind: 'paw';
  status: 'lost' | 'found' | 'rescued' | 'in_adoption' | 'abandoned' | 'in_family';
  x: number;
  y: number;
};

type VetPin = {
  kind: 'vet';
  x: number;
  y: number;
};

const PINS: Array<PawPin | VetPin> = [
  { kind: 'paw', status: 'lost', x: 22, y: 30 },
  { kind: 'paw', status: 'found', x: 61, y: 24 },
  { kind: 'vet', x: 78, y: 36 },
  { kind: 'paw', status: 'rescued', x: 36, y: 54 },
  { kind: 'paw', status: 'in_adoption', x: 70, y: 58 },
  { kind: 'vet', x: 24, y: 70 },
  { kind: 'paw', status: 'abandoned', x: 50, y: 42 },
  { kind: 'paw', status: 'in_family', x: 84, y: 74 },
  { kind: 'vet', x: 48, y: 16 },
];

const LEGEND_STATUSES: PawPin['status'][] = ['lost', 'found', 'rescued', 'in_adoption'];

function PawGlyph({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden>
      <circle cx="6.5" cy="8" r="2.15" fill="currentColor" />
      <circle cx="12" cy="5.6" r="2.2" fill="currentColor" />
      <circle cx="17.5" cy="8" r="2.15" fill="currentColor" />
      <ellipse cx="12" cy="16.2" rx="5.1" ry="4.4" fill="currentColor" />
    </svg>
  );
}

function StreetLayer() {
  return (
    <svg
      className="kadesh-hero-map-streets"
      viewBox="0 0 400 400"
      preserveAspectRatio="xMidYMid slice"
      aria-hidden
    >
      <rect width="400" height="400" className="fill-[#eef3f8] dark:fill-[#1a2433]" />
      <rect x="0" y="86" width="400" height="18" className="fill-white dark:fill-[#2a3548]" />
      <rect x="0" y="198" width="400" height="22" className="fill-white dark:fill-[#2a3548]" />
      <rect x="0" y="312" width="400" height="16" className="fill-white dark:fill-[#2a3548]" />
      <rect x="72" y="0" width="16" height="400" className="fill-white dark:fill-[#2a3548]" />
      <rect x="188" y="0" width="22" height="400" className="fill-white dark:fill-[#2a3548]" />
      <rect x="308" y="0" width="16" height="400" className="fill-white dark:fill-[#2a3548]" />
      <rect
        x="96"
        y="112"
        width="84"
        height="74"
        rx="10"
        className="fill-[#d5e4d8] dark:fill-[#1e3a2a]"
      />
      <rect
        x="218"
        y="228"
        width="80"
        height="70"
        rx="10"
        className="fill-[#dbe6f4] dark:fill-[#1c2d48]"
      />
    </svg>
  );
}

export default function HeroMap() {
  const rootRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const root = rootRef.current;
      if (!root) return;

      const mm = gsap.matchMedia();
      mm.add('(prefers-reduced-motion: no-preference)', () => {
        const tl = gsap.timeline({ defaults: { ease: HOME_EASE } });

        tl.from('[data-hero-map-frame]', {
          clipPath: 'inset(8% 8% 8% 8% round 28px)',
          duration: 0.7,
        }).from(
          '[data-hero-pin]',
          {
            y: 18,
            scale: 0.55,
            opacity: 0.4,
            duration: 0.45,
            stagger: 0.07,
            transformOrigin: '50% 100%',
          },
          0.18
        );

        gsap.to('[data-hero-pin="lost"]', {
          y: -5,
          duration: 1.8,
          ease: 'sine.inOut',
          yoyo: true,
          repeat: -1,
          delay: 1.2,
        });
      });

      return () => mm.revert();
    },
    { scope: rootRef }
  );

  return (
    <div ref={rootRef} className="mx-auto w-full max-w-[30rem] lg:justify-self-end">
      <div
        data-hero-map-frame
        className="overflow-hidden rounded-[1.75rem] bg-white shadow-[0_24px_56px_rgba(8,20,50,0.28)] dark:bg-night-raised"
      >
        <div className="relative aspect-square overflow-hidden">
          <StreetLayer />

          {PINS.map((pin, index) => {
            if (pin.kind === 'vet') {
              return (
                <Link
                  key={`vet-${index}`}
                  href={Routes.veterinaries.index}
                  data-hero-pin="vet"
                  style={{ left: `${pin.x}%`, top: `${pin.y}%` }}
                  className="absolute z-10 -translate-x-1/2 -translate-y-full"
                  aria-label="Veterinaria en el mapa"
                >
                  <span className="relative flex h-10 w-8 items-end justify-center">
                    <svg viewBox="0 0 36 44" className="h-10 w-8" aria-hidden>
                      <path
                        fill="var(--color-kadesh)"
                        stroke="#ffffff"
                        strokeWidth="2"
                        d="M18 2C10.82 2 5 7.82 5 15c0 9.75 13 25.5 13 25.5S31 24.75 31 15C31 7.82 25.18 2 18 2z"
                      />
                      <path fill="#ffffff" d="M13 10h10v2h-4v8h-2v-8h-4z" />
                    </svg>
                  </span>
                </Link>
              );
            }

            const color = getStatusColor(pin.status);
            return (
              <Link
                key={`${pin.status}-${index}`}
                href={Routes.animals.index}
                data-hero-pin={pin.status}
                style={{ left: `${pin.x}%`, top: `${pin.y}%` }}
                className="absolute z-10 -translate-x-1/2 -translate-y-full"
                aria-label={`Animal ${getStatusLabel(pin.status)}`}
              >
                {pin.status === 'lost' ? (
                  <span
                    className="kadesh-hero-pin-pulse absolute left-1/2 top-[70%] h-7 w-7 -translate-x-1/2 -translate-y-1/2 rounded-full"
                    style={{ backgroundColor: color }}
                    aria-hidden
                  />
                ) : null}
                <span
                  className="relative flex h-11 w-11 items-center justify-center rounded-full border-2 border-white shadow-[0_8px_18px_rgba(15,35,80,0.28)]"
                  style={{ backgroundColor: color }}
                >
                  <PawGlyph className="h-6 w-6 text-white" />
                </span>
              </Link>
            );
          })}
        </div>

        <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2 border-t border-[#ececec] px-4 py-3 dark:border-white/10">
          {LEGEND_STATUSES.map((status) => (
            <span key={status} className="inline-flex items-center gap-1.5 text-xs font-medium text-[#3a3a3a] dark:text-[#d0d0d0]">
              <span
                className="flex h-5 w-5 items-center justify-center rounded-full"
                style={{ backgroundColor: getStatusColor(status) }}
              >
                <PawGlyph className="h-3 w-3 text-white" />
              </span>
              {getStatusLabel(status)}
            </span>
          ))}
          <span className="inline-flex items-center gap-1.5 text-xs font-medium text-[#3a3a3a] dark:text-[#d0d0d0]">
            <span className="h-3.5 w-3 rounded-sm bg-kadesh" />
            Veterinaria
          </span>
        </div>
      </div>
    </div>
  );
}
