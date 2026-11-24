'use client';

import { useEffect, useRef, useState, type CSSProperties } from 'react';
import Link from 'next/link';
import { HugeiconsIcon } from '@hugeicons/react';
import {
  ArrowUpRight01Icon,
  Bone01Icon,
  Megaphone01Icon,
  ShoppingBag01Icon,
  Stethoscope02Icon,
  UserSearch01Icon,
} from '@hugeicons/core-free-icons';
import { cn } from 'kadesh/utils/cn';
import { CUSTOM_TONE_RE, customToneColors } from './customTone';
import { trackAdClick, trackAdImpression } from './track';
import type { AdPlacement, PublicAd } from './types';

/** How often the card changes when there are several ads. */
const ROTATE_MS = 10_000;
/** The card must stay at least half on screen this long to count as seen. */
const IMPRESSION_MS = 1_000;

/** Colors of each named `tone` (light and dark). Orange is Kadesh Business, green Kadesh Food, sky Kadesh Pet (#216BFA). */
const TONES: Record<string, { card: string; button: string; dots: string }> = {
  orange: {
    card: 'bg-[#fff3eb] text-[#c96b2c] dark:bg-[#f7945e]/15 dark:text-[#ffb47e]',
    button: 'bg-[#f7945e] text-[#121212] hover:bg-[#e07c3a]',
    dots: 'text-[#c96b2c] dark:text-[#ffb47e]',
  },
  green: {
    card: 'bg-[#ECF1EB] text-[#387F39] dark:bg-[#70B56A]/15 dark:text-[#8fcb8a]',
    button: 'bg-[#70B56A] text-[#121212] hover:bg-[#629c5d]',
    dots: 'text-[#387F39] dark:text-[#8fcb8a]',
  },
  sky: {
    card: 'bg-[#e4edfe] text-[#1e60e1] dark:bg-[#1d2f51] dark:text-[#6497fc]',
    button: 'bg-[#216BFA] text-white hover:bg-[#1c5cd7]',
    dots: 'text-[#1e60e1] dark:text-[#6497fc]',
  },
  violet: {
    card: 'bg-[#f2edfb] text-[#6b46b8] dark:bg-[#9a78e0]/15 dark:text-[#c4adf2]',
    button: 'bg-[#9a78e0] text-[#121212] hover:bg-[#8664cc]',
    dots: 'text-[#6b46b8] dark:text-[#c4adf2]',
  },
  neutral: {
    card: 'bg-[#f3f4f6] text-[#4b5563] dark:bg-white/10 dark:text-[#c5ccd8]',
    button: 'bg-[#121212] text-white hover:bg-[#2a2a2a] dark:bg-white dark:text-[#121212] dark:hover:bg-[#e6e9ef]',
    dots: 'text-[#4b5563] dark:text-[#c5ccd8]',
  },
};

const KIND_ICON = {
  house: UserSearch01Icon,
  brand: Megaphone01Icon,
  pet_place: Stethoscope02Icon,
  store_product: ShoppingBag01Icon,
  animal: Bone01Icon,
} as const;

interface ToneStyle {
  card: string;
  button: string;
  dots: string;
  /** Only a custom color: the CSS variables the classes read. */
  vars?: CSSProperties;
  buttonStyle?: CSSProperties;
}

/** A custom color (`#rrggbb`) reads its shades from CSS variables, so light and dark still switch with `dark:`. */
const CUSTOM_TONE = {
  card: 'bg-(--ad-card) text-(--ad-accent) dark:bg-(--ad-card-dark) dark:text-(--ad-accent-dark)',
  button: 'border hover:brightness-95',
  dots: 'text-(--ad-accent) dark:text-(--ad-accent-dark)',
};

function toneOf(value: string): ToneStyle {
  if (!CUSTOM_TONE_RE.test(value)) return TONES[value] ?? TONES.orange;
  const colors = customToneColors(value);
  return {
    ...CUSTOM_TONE,
    vars: {
      '--ad-card': colors.card,
      '--ad-card-dark': colors.cardDark,
      '--ad-accent': colors.accent,
      '--ad-accent-dark': colors.accentDark,
    } as CSSProperties,
    buttonStyle: { backgroundColor: colors.button, color: colors.buttonText, borderColor: colors.buttonBorder },
  };
}

function isInternal(href: string) {
  return href.startsWith('/') && !href.startsWith('//');
}

/** Outside links carry where the visit came from. */
function withUtm(href: string, placement: AdPlacement, adId: string) {
  try {
    const url = new URL(href);
    url.searchParams.set('utm_source', 'kadesh_pet');
    url.searchParams.set('utm_medium', 'ad');
    url.searchParams.set('utm_campaign', placement);
    url.searchParams.set('utm_content', adId);
    return url.toString();
  } catch {
    return href;
  }
}

/**
 * The ads of one slot, one at a time. Rotates every 10 s (stops on hover or focus) and counts an
 * impression when the visible card stays at least half on screen for 1 s.
 */
export default function AdCarousel({
  ads,
  placement,
  pageKey,
  className,
}: {
  ads: PublicAd[];
  placement: AdPlacement;
  /** The page (pathname): the same ad counts once per page view. */
  pageKey: string;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  const [onScreen, setOnScreen] = useState(false);
  const current = ads[Math.min(active, ads.length - 1)];

  useEffect(() => {
    const node = ref.current;
    if (!node || typeof IntersectionObserver === 'undefined') return;
    const observer = new IntersectionObserver(([entry]) => setOnScreen(Boolean(entry?.isIntersecting)), { threshold: 0.5 });
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  // The visible card counts after 1 s on screen with the tab open.
  useEffect(() => {
    if (!onScreen || !current) return;
    const id = window.setTimeout(() => {
      if (document.visibilityState === 'visible') trackAdImpression(current.id, placement, pageKey);
    }, IMPRESSION_MS);
    return () => window.clearTimeout(id);
  }, [onScreen, current, placement, pageKey]);

  useEffect(() => {
    if (paused || ads.length < 2) return;
    const id = window.setInterval(() => setActive((index) => (index + 1) % ads.length), ROTATE_MS);
    return () => window.clearInterval(id);
  }, [paused, active, ads.length]);

  if (!current) return null;
  const currentTone = toneOf(current.tone);

  return (
    <div
      ref={ref}
      role="region"
      aria-roledescription="carrusel"
      aria-label="Anuncios"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) setPaused(false);
      }}
      className={cn('relative grid min-h-0 flex-1', className)}
    >
      {ads.map((ad, index) => {
        const isActive = index === active;
        const tone = toneOf(ad.tone);
        const internal = isInternal(ad.href);
        const cardClass = cn(
          // Every slide shares one cell: the height is the tallest one's and nothing jumps.
          'col-start-1 row-start-1 flex min-h-0 flex-col overflow-hidden rounded-xl transition-opacity duration-500 motion-reduce:transition-none',
          tone.card,
          isActive ? 'opacity-100' : 'pointer-events-none invisible opacity-0',
        );
        const content = (
          <>
            {ad.imageUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={ad.imageUrl} alt="" loading="lazy" className="h-28 w-full shrink-0 object-cover" />
            ) : null}
            <span className="flex min-h-0 flex-1 flex-col p-4">
              {ad.brandLabel ? (
                <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider">
                  <HugeiconsIcon icon={KIND_ICON[ad.kind as keyof typeof KIND_ICON] ?? Megaphone01Icon} size={16} strokeWidth={1.75} />
                  {ad.brandLabel}
                </span>
              ) : null}
              <span className="mt-3 text-lg font-black leading-tight tracking-[-0.02em] text-[#121212] [overflow-wrap:anywhere] dark:text-white">
                {ad.title}
              </span>
              {ad.body ? (
                <span className="mb-3 mt-2 text-sm leading-relaxed text-[#3a3a3a] [overflow-wrap:anywhere] dark:text-[#c5ccd8]">
                  {ad.body}
                </span>
              ) : null}
              <span
                className={cn(
                  'mt-auto inline-flex h-8 items-center justify-center gap-1 self-start rounded-md px-3 text-xs font-semibold transition-colors',
                  tone.button,
                )}
                style={tone.buttonStyle}
              >
                {ad.ctaLabel || 'Ver más'}
                <HugeiconsIcon icon={ArrowUpRight01Icon} size={14} strokeWidth={2} />
              </span>
            </span>
          </>
        );
        const common = {
          'aria-hidden': !isActive,
          tabIndex: isActive ? undefined : -1,
          className: cardClass,
          style: tone.vars,
          onClick: () => trackAdClick(ad.id, placement),
        };
        return internal ? (
          <Link key={ad.id} href={ad.href} {...common}>
            {content}
          </Link>
        ) : (
          <a key={ad.id} href={withUtm(ad.href, placement, ad.id)} target="_blank" rel="noopener sponsored" {...common}>
            {content}
          </a>
        );
      })}

      {ads.length > 1 ? (
        <div className="absolute bottom-4 right-4 flex items-center gap-1.5" style={currentTone.vars}>
          {ads.map((ad, index) => (
            <button
              key={ad.id}
              type="button"
              onClick={() => setActive(index)}
              aria-label={`Ver anuncio ${index + 1} de ${ads.length}`}
              aria-current={index === active}
              className={cn(
                'h-2 rounded-full transition-all duration-300 motion-reduce:transition-none',
                currentTone.dots,
                index === active ? 'w-5 bg-current' : 'w-2 bg-current opacity-35 hover:opacity-70',
              )}
            />
          ))}
        </div>
      ) : null}
    </div>
  );
}
