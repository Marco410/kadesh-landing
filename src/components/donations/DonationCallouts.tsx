'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { HugeiconsIcon } from '@hugeicons/react';
import { Cancel01Icon } from '@hugeicons/core-free-icons';
import DonationIcon from 'kadesh/components/shared/icons/DonationIcon';
import { Routes } from 'kadesh/core/routes';
import {
  DONATION_CTA_LABEL,
  DONATION_STRIP_DISMISS_KEY,
  DONATION_STRIP_DISMISS_MS,
  formatDonationAmount,
} from './constants';
import DonateTrigger from './DonateTrigger';
import type { DonationSource } from './types';

/*
 * Quiet «Dame una patita» calls to action. Never pop up on their own, never cover content, and at
 * most one per page besides the header button (see README.md).
 */

const PILL_BUTTON =
  'inline-flex min-h-10 items-center justify-center gap-2 rounded-xl bg-kadesh px-4 text-sm font-semibold text-white transition-colors hover:bg-kadesh-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-kadesh';

type CalloutProps = { source: DonationSource; sourceRef?: string | null };

/** Side card (veterinary, blog, event, profile). */
export function DonationCard({
  source,
  sourceRef,
  title = DONATION_CTA_LABEL,
  body = 'Kadesh Pet es gratis para quien busca a su mascota. Si te sirve, ayúdanos a mantenerlo.',
  className = '',
}: CalloutProps & { title?: string; body?: string; className?: string }) {
  return (
    <aside
      aria-label={title}
      className={`rounded-2xl border border-kadesh/15 bg-kadesh/5 p-5 dark:border-kadesh/25 dark:bg-kadesh/10 ${className}`}
    >
      <div className="mb-2 flex items-center gap-2">
        <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-white text-kadesh dark:bg-night">
          <DonationIcon size={20} />
        </span>
        <h2 className="text-base font-bold tracking-[-0.02em] text-[#121212] dark:text-[#eef1f6]">{title}</h2>
      </div>
      <p className="mb-4 text-sm leading-relaxed text-[#3a3a3a] dark:text-[#d0d0d0]">{body}</p>
      <DonateTrigger source={source} sourceRef={sourceRef} className={`${PILL_BUTTON} w-full`}>
        <DonationIcon size={16} />
        {DONATION_CTA_LABEL}
      </DonateTrigger>
    </aside>
  );
}

function readDismissed(): boolean {
  try {
    const at = Number(window.localStorage.getItem(DONATION_STRIP_DISMISS_KEY) ?? 0);
    return Number.isFinite(at) && Date.now() - at < DONATION_STRIP_DISMISS_MS;
  } catch {
    return false;
  }
}

/** In-page strip (animal detail) that the person can close for 30 days. */
export function DonationStrip({
  source,
  sourceRef,
  title,
  text,
  className = '',
}: CalloutProps & {
  /** Says what the strip is (a donation), so the line below can explain why. */
  title: string;
  text: string;
  className?: string;
}) {
  // Hidden until mounted: the dismissal lives in this browser only.
  const [visible, setVisible] = useState(false);
  useEffect(() => setVisible(!readDismissed()), []);

  if (!visible) return null;

  const dismiss = () => {
    setVisible(false);
    try {
      window.localStorage.setItem(DONATION_STRIP_DISMISS_KEY, String(Date.now()));
    } catch {
      // Private window or blocked storage: hidden for this visit only.
    }
  };

  return (
    <aside
      aria-label={DONATION_CTA_LABEL}
      className={`flex flex-col gap-3 rounded-2xl border border-kadesh/15 bg-kadesh/5 p-4 sm:flex-row sm:items-center dark:border-kadesh/25 dark:bg-kadesh/10 ${className}`}
    >
      <span className="hidden h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white text-kadesh sm:inline-flex dark:bg-night">
        <DonationIcon size={22} />
      </span>
      <div className="flex-1">
        <p className="text-sm font-semibold text-[#121212] dark:text-[#eef1f6]">{title}</p>
        <p className="mt-0.5 text-sm leading-relaxed text-[#3a3a3a] dark:text-[#d0d0d0]">{text}</p>
      </div>
      <div className="flex items-center gap-2">
        <DonateTrigger source={source} sourceRef={sourceRef} className={`${PILL_BUTTON} flex-1 sm:flex-none`}>
          <DonationIcon size={16} />
          {DONATION_CTA_LABEL}
        </DonateTrigger>
        <button
          type="button"
          onClick={dismiss}
          aria-label="Ocultar por ahora"
          className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-[#5a5a5a] hover:bg-white/70 dark:text-[#9aa3b2] dark:hover:bg-night"
        >
          <HugeiconsIcon icon={Cancel01Icon} size={18} strokeWidth={1.5} />
        </button>
      </div>
    </aside>
  );
}

/** One line with a text link (end of a blog post, a reunited case). */
export function DonationNote({ source, sourceRef, lead, className = '' }: CalloutProps & { lead: string; className?: string }) {
  return (
    <p className={`flex flex-wrap items-center gap-x-1.5 gap-y-1 text-sm text-[#3a3a3a] dark:text-[#d0d0d0] ${className}`}>
      <DonationIcon size={16} className="text-kadesh" />
      <span>{lead}</span>
      <DonateTrigger
        source={source}
        sourceRef={sourceRef}
        className="font-semibold text-kadesh underline-offset-4 hover:underline focus-visible:underline"
      >
        {DONATION_CTA_LABEL}
      </DonateTrigger>
    </p>
  );
}

/**
 * Full-width page section (Conócenos, Contacto): a centered card with the reason, the button and,
 * a link to what the donations pay for. Static: no query, so it adds no load to the page.
 */
export function DonationSection({
  source,
  sourceRef,
  title = 'Dame una patita',
  body = `Kadesh Pet es gratis para quien reporta o busca a su mascota. Cada patita es una donación de ${formatDonationAmount(1)} que nos ayuda a pagar servidores, mapas y difusión. Es opcional y no desbloquea nada.`,
  className = '',
}: CalloutProps & { title?: string; body?: string; className?: string }) {
  const headingId = `donation-section-${source}`;
  return (
    <section aria-labelledby={headingId} className={`px-4 py-16 sm:px-6 sm:py-20 lg:px-8 ${className}`}>
      <div className="mx-auto flex max-w-3xl flex-col items-center rounded-3xl border border-kadesh/15 bg-kadesh/5 px-6 py-10 text-center sm:px-12 dark:border-kadesh/25 dark:bg-kadesh/10">
        <span className="mb-4 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-kadesh shadow-sm dark:bg-night dark:text-[#8fb2ff]">
          <DonationIcon size={30} />
        </span>
        <h2 id={headingId} className="text-2xl font-black tracking-[-0.03em] text-[#121212] sm:text-3xl dark:text-[#eef1f6]">
          {title}
        </h2>
        <p className="mt-3 max-w-xl text-base leading-relaxed text-[#3a3a3a] dark:text-[#d0d0d0]">{body}</p>
        <div className="mt-6 flex w-full flex-col items-center gap-3 sm:w-auto sm:flex-row">
          <DonateTrigger source={source} sourceRef={sourceRef} className={`${PILL_BUTTON} min-h-12 w-full px-6 text-base sm:w-auto`}>
            <DonationIcon size={18} />
            {DONATION_CTA_LABEL}
          </DonateTrigger>
          <Link
            href={Routes.donations}
            className="inline-flex min-h-12 items-center justify-center rounded-xl px-4 text-sm font-semibold text-kadesh underline-offset-4 hover:underline focus-visible:underline dark:text-[#8fb2ff]"
          >
            ¿En qué se usan?
          </Link>
        </div>
      </div>
    </section>
  );
}
