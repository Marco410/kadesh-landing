'use client';

import Link from 'next/link';
import { useCallback, useMemo, useState, type FormEvent } from 'react';
import { useMutation } from '@apollo/client';
import { HugeiconsIcon } from '@hugeicons/react';
import { Share08Icon } from '@hugeicons/core-free-icons';
import { sileo } from 'sileo';
import Sheet from 'kadesh/components/shared/Sheet';
import TurnstileWidget, { TURNSTILE_SITE_KEY } from 'kadesh/components/shared/TurnstileWidget';
import DonationIcon from 'kadesh/components/shared/icons/DonationIcon';
import { Routes } from 'kadesh/core/routes';
import { SITE_URL } from 'kadesh/core/site';
import { friendlyErrorText } from 'kadesh/utils/errorText';
import { useUser } from 'kadesh/utils/UserContext';
import {
  DONATION_CTA_LABEL,
  DONATION_MESSAGE_MAX,
  DONATION_NAME_MAX,
  DONATION_UNIT_PRESETS,
  MAX_DONATION_UNITS,
  formatDonationAmount,
  patitasLabel,
} from '../constants';
import { SETTLE_DONATION_MUTATION, START_DONATION_MUTATION } from '../queries';
import type { DonationOpenOptions, StartDonationResult } from '../types';
import DonationPayStep from './DonationPayStep';

const fieldClass =
  'w-full rounded-xl border border-[#d8dee8] bg-white px-3.5 py-3 text-sm text-[#121212] placeholder:text-[#8a8f98] focus:border-kadesh focus:outline-none focus:ring-2 focus:ring-kadesh/25 dark:border-white/15 dark:bg-night dark:text-[#eef1f6] dark:placeholder:text-[#6f7787] dark:[color-scheme:dark]';
const labelClass = 'mb-1.5 block text-sm font-semibold text-[#121212] dark:text-[#eef1f6]';
const mutedClass = 'text-xs text-[#5a5a5a] dark:text-[#9aa3b2]';
const tileBase =
  'flex h-[4.5rem] flex-col items-center justify-center rounded-xl border text-center transition-colors focus-within:ring-2 focus-within:ring-kadesh/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-kadesh/30';
const tileIdle =
  'border-[#d8dee8] bg-white text-[#121212] hover:border-kadesh/50 dark:border-white/15 dark:bg-night dark:text-[#eef1f6] dark:hover:border-kadesh/60';
const tileActive = 'border-kadesh bg-kadesh/[0.07] text-kadesh ring-1 ring-kadesh dark:bg-kadesh/15 dark:text-[#8fb2ff]';
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
/** The counter shows up only near the limit, so it doesn't add noise. */
const MESSAGE_COUNTER_FROM = DONATION_MESSAGE_MAX - 60;

type Step = 'form' | 'pay' | 'thanks';

/** How the donation shows publicly: with the name, as «Alguien anónimo», or not at all. */
type Visibility = 'name' | 'anonymous' | 'hidden';

const VISIBILITY_OPTIONS: Array<{ key: Visibility; label: string; hint: string }> = [
  { key: 'name', label: 'Con mi nombre', hint: 'Sales con tu nombre e inicial del apellido.' },
  { key: 'anonymous', label: 'Anónimo', hint: 'Sales como «Alguien anónimo», con tu mensaje.' },
  { key: 'hidden', label: 'No aparecer', hint: 'No sales en el muro ni en el top. Tu patita sí cuenta y tu mensaje solo lo lee el equipo.' },
];

function newCheckoutKey(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) return crypto.randomUUID().replace(/-/g, '');
  return `${Date.now().toString(36)}${Math.random().toString(36).slice(2)}${Math.random().toString(36).slice(2)}`.slice(0, 40);
}

/** Digits only, capped at the max; '' while the person is still typing. */
function cleanCustomUnits(raw: string): string {
  const digits = raw.replace(/\D/g, '').replace(/^0+/, '').slice(0, 3);
  if (!digits) return '';
  return String(Math.min(Number(digits), MAX_DONATION_UNITS));
}

/** «Marco Castañeda» → «Marco C.», the same way the wall shows it. */
function wallName(name: string, anonymous: boolean): string {
  if (anonymous) return 'Alguien anónimo';
  const words = name.trim().split(/\s+/).filter(Boolean);
  if (words.length === 0) return 'Tú';
  return words[1] ? `${words[0]} ${words[1].charAt(0).toUpperCase()}.` : words[0];
}

/**
 * «Dame una patita»: choose patitas, leave a name and a message, pay by card without leaving the
 * page. Opened only by a click (`useDonation().open`), never on its own.
 */
export default function DonationSheet({
  isOpen,
  options,
  onClose,
}: {
  isOpen: boolean;
  options: DonationOpenOptions;
  onClose: () => void;
}) {
  const { user } = useUser();
  const [step, setStep] = useState<Step>('form');
  // A preset tile, or `null` when «Otra» is chosen and `customUnits` holds the typed amount.
  const [preset, setPreset] = useState<number | null>(DONATION_UNIT_PRESETS[1]);
  const [customUnits, setCustomUnits] = useState('');
  const [name, setName] = useState(() => (user ? [user.name, user.lastName].filter(Boolean).join(' ').slice(0, DONATION_NAME_MAX) : ''));
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [visibility, setVisibility] = useState<Visibility>('name');
  const anonymous = visibility === 'anonymous';
  const hiddenFromWall = visibility === 'hidden';
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [checkoutKey, setCheckoutKey] = useState(newCheckoutKey);
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [donationId, setDonationId] = useState<string | null>(null);
  const [paying, setPaying] = useState(false);

  const [startDonation, { loading: starting }] = useMutation<{ startDonation: StartDonationResult }>(START_DONATION_MUTATION);
  const [settleDonation] = useMutation<{ settleDonation: boolean }>(SETTLE_DONATION_MUTATION);

  // Paid: show the thanks right away and, in the background, let the back confirm it with Stripe
  // (the webhook does it too; whichever comes first counts it once).
  const handlePaid = useCallback(() => {
    setStep('thanks');
    if (donationId) void settleDonation({ variables: { donationId } }).catch(() => undefined);
  }, [donationId, settleDonation]);

  const units = preset ?? (Number(customUnits) || 0);
  const needsTurnstile = !user && Boolean(TURNSTILE_SITE_KEY);
  const amountLabel = formatDonationAmount(units);
  const busy = starting || paying;

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (busy) return;
    setError(null);
    if (units < 1) {
      setError('Elige cuántas patitas quieres dar.');
      return;
    }
    const cleanName = name.trim();
    const cleanEmail = email.trim();
    if (visibility === 'name' && cleanName.length < 2) {
      setError('Escribe tu nombre o elige «Anónimo» o «No aparecer».');
      return;
    }
    if (!user && !EMAIL_PATTERN.test(cleanEmail)) {
      setError('Escribe un correo válido para mandarte el recibo.');
      return;
    }
    if (needsTurnstile && !turnstileToken) {
      setError('Espera a que termine la verificación de abajo.');
      return;
    }
    try {
      const { data } = await startDonation({
        variables: {
          input: {
            unitCount: units,
            donorName: cleanName,
            donorEmail: user ? null : cleanEmail,
            message: message.trim(),
            isAnonymous: anonymous,
            hideFromWall: hiddenFromWall,
            source: options.source,
            sourceRef: options.sourceRef ?? null,
            checkoutKey,
            turnstileToken,
          },
        },
      });
      const result = data?.startDonation;
      if (!result?.success || !result.clientSecret) {
        setError(result?.message || 'No pudimos preparar tu donación. Intenta de nuevo.');
        return;
      }
      setClientSecret(result.clientSecret);
      setDonationId(result.donationId);
      setStep('pay');
    } catch (err) {
      setError(friendlyErrorText(err, 'No pudimos preparar tu donación. Intenta de nuevo.'));
    }
  };

  // Going back to change the amount is a new donation (the old intent stays unpaid).
  const editAmount = useCallback(() => {
    setClientSecret(null);
    setDonationId(null);
    setCheckoutKey(newCheckoutKey());
    setStep('form');
  }, []);

  const share = useCallback(async () => {
    const url = `${SITE_URL}${Routes.donations}`;
    const text = 'Acabo de darle una patita a Kadesh Pet para que siga gratis para quien busca a su mascota.';
    try {
      if (navigator.share) {
        await navigator.share({ title: DONATION_CTA_LABEL, text, url });
        return;
      }
      await navigator.clipboard.writeText(`${text} ${url}`);
      sileo.success({ title: 'Enlace copiado', description: 'Pégalo donde quieras compartirlo.' });
    } catch {
      // The person closed the share menu: nothing to do.
    }
  }, []);

  const title = step === 'thanks' ? '¡Gracias por tu patita!' : DONATION_CTA_LABEL;

  const footer = useMemo(() => {
    if (step !== 'form') return undefined;
    return (
      <div className="flex flex-col gap-2">
        <button
          type="submit"
          form="donation-form"
          disabled={busy || units < 1}
          className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-kadesh px-6 font-semibold text-white hover:bg-kadesh-600 disabled:opacity-60 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-kadesh"
        >
          <DonationIcon size={18} />
          {starting
            ? 'Preparando…'
            : units < 1
              ? 'Elige cuántas patitas'
              : `Dar ${patitasLabel(units)} · ${amountLabel}`}
        </button>
        <p className={`text-center ${mutedClass}`}>Pago seguro con tarjeta, en pesos mexicanos (MXN). Es opcional y no desbloquea nada.</p>
      </div>
    );
  }, [step, busy, starting, units, amountLabel]);

  return (
    <Sheet
      isOpen={isOpen}
      title={title}
      onClose={onClose}
      busy={busy}
      footer={footer}
      size="md"
      icon={
        <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-kadesh/10 text-kadesh dark:bg-kadesh/20 dark:text-[#8fb2ff]">
          <DonationIcon size={22} />
        </span>
      }
    >
      {step === 'form' ? (
        <form id="donation-form" onSubmit={handleSubmit} className="flex flex-col gap-5" noValidate>
          <p className="text-sm leading-relaxed text-[#3a3a3a] dark:text-[#d0d0d0]">
            Kadesh Pet es gratis para quien busca a su mascota. Cada patita es de {formatDonationAmount(1)} y nos ayuda a
            que siga así.
          </p>

          <fieldset>
            <legend className="sr-only">¿Cuántas patitas?</legend>
            <div role="radiogroup" aria-label="Patitas" className="grid grid-cols-4 gap-2">
              {DONATION_UNIT_PRESETS.map((value) => {
                const selected = preset === value;
                return (
                  <button
                    key={value}
                    type="button"
                    role="radio"
                    aria-checked={selected}
                    aria-label={`${patitasLabel(value)}, ${formatDonationAmount(value)}`}
                    onClick={() => setPreset(value)}
                    className={`${tileBase} ${selected ? tileActive : tileIdle}`}
                  >
                    <span className="text-xl font-bold leading-none">{value}</span>
                    <span className={`mt-1 px-1 text-[11px] leading-tight ${selected ? '' : 'text-[#5a5a5a] dark:text-[#9aa3b2]'}`}>
                      {formatDonationAmount(value)}
                    </span>
                  </button>
                );
              })}
              <label
                className={`${tileBase} cursor-text ${preset === null ? tileActive : tileIdle}`}
                onClick={() => setPreset(null)}
              >
                <input
                  type="text"
                  inputMode="numeric"
                  autoComplete="off"
                  aria-label="Otra cantidad de patitas"
                  placeholder="Otra"
                  value={customUnits}
                  onFocus={() => setPreset(null)}
                  onChange={(event) => setCustomUnits(cleanCustomUnits(event.target.value))}
                  className="w-full bg-transparent text-center text-xl font-bold leading-none placeholder:text-base placeholder:font-semibold placeholder:text-[#8a8f98] focus:outline-none dark:placeholder:text-[#6f7787]"
                />
                <span className={`mt-1 px-1 text-[11px] leading-tight ${preset === null ? '' : 'text-[#5a5a5a] dark:text-[#9aa3b2]'}`}>
                  {preset === null && Number(customUnits) > 0 ? formatDonationAmount(Number(customUnits)) : 'patitas'}
                </span>
              </label>
            </div>
          </fieldset>

          <fieldset>
            <legend className={labelClass}>¿Cómo quieres aparecer en el muro?</legend>
            <div role="radiogroup" aria-label="Cómo aparecer en el muro" className="grid grid-cols-3 gap-1 rounded-xl bg-[#f1f3f7] p-1 dark:bg-night">
              {VISIBILITY_OPTIONS.map((option) => {
                const selected = visibility === option.key;
                return (
                  <button
                    key={option.key}
                    type="button"
                    role="radio"
                    aria-checked={selected}
                    onClick={() => setVisibility(option.key)}
                    className={`min-h-10 rounded-lg px-2 text-sm font-semibold transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-kadesh ${
                      selected
                        ? 'bg-white text-kadesh shadow-sm dark:bg-night-raised dark:text-[#8fb2ff]'
                        : 'text-[#5a5a5a] hover:text-[#121212] dark:text-[#9aa3b2] dark:hover:text-white'
                    }`}
                  >
                    {option.label}
                  </button>
                );
              })}
            </div>
            <p className={`mt-1.5 ${mutedClass}`}>
              {visibility === 'name' && name.trim()
                ? `Sales como «${wallName(name, false)}».`
                : VISIBILITY_OPTIONS.find((option) => option.key === visibility)?.hint}
            </p>
            {visibility === 'name' ? (
              <div className="mt-3">
                <label htmlFor="donation-name" className="sr-only">
                  Tu nombre
                </label>
                <input
                  id="donation-name"
                  type="text"
                  autoComplete="name"
                  maxLength={DONATION_NAME_MAX}
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  placeholder="Tu nombre, ej. Ana López"
                  className={fieldClass}
                />
              </div>
            ) : null}
          </fieldset>

          {user ? null : (
            <div>
              <label htmlFor="donation-email" className={labelClass}>
                Tu correo
              </label>
              <input
                id="donation-email"
                type="email"
                autoComplete="email"
                inputMode="email"
                maxLength={200}
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="Para mandarte el recibo"
                className={fieldClass}
              />
              <p className={`mt-1 ${mutedClass}`}>No se publica.</p>
            </div>
          )}

          <div>
            <label htmlFor="donation-message" className={labelClass}>
              Mensaje <span className="font-normal text-[#5a5a5a] dark:text-[#9aa3b2]">(opcional)</span>
            </label>
            <textarea
              id="donation-message"
              rows={3}
              value={message}
              onChange={(event) => setMessage(event.target.value.slice(0, DONATION_MESSAGE_MAX))}
              placeholder="Ej. Gracias por ayudarme a encontrar a Luna."
              className={`${fieldClass} resize-none`}
            />
            {hiddenFromWall ? <p className={`mt-1 ${mutedClass}`}>Solo lo lee el equipo de Kadesh.</p> : null}
            {message.length >= MESSAGE_COUNTER_FROM ? (
              <p className={`mt-1 text-right ${mutedClass}`}>
                {message.length}/{DONATION_MESSAGE_MAX}
              </p>
            ) : null}
          </div>

          {error ? (
            <p role="alert" className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700 dark:border-red-800 dark:bg-red-950/40 dark:text-red-300">
              {error}
            </p>
          ) : null}

          {needsTurnstile && isOpen ? <TurnstileWidget onToken={setTurnstileToken} className="min-h-[65px]" /> : null}
        </form>
      ) : null}

      {step === 'pay' && clientSecret && donationId ? (
        <div className="flex flex-col gap-5">
          <div className="flex items-center justify-between gap-3 rounded-2xl bg-kadesh/5 p-3 dark:bg-kadesh/10">
            <span className="flex items-center gap-2 text-sm font-semibold text-[#121212] dark:text-[#eef1f6]">
              <DonationIcon size={20} className="text-kadesh" />
              {patitasLabel(units)} · {amountLabel}
            </span>
            <button
              type="button"
              onClick={editAmount}
              disabled={paying}
              className="rounded-lg px-2 py-1 text-sm font-semibold text-kadesh hover:bg-kadesh/10 disabled:opacity-50"
            >
              Cambiar
            </button>
          </div>
          <DonationPayStep
            donationId={donationId}
            clientSecret={clientSecret}
            amountLabel={amountLabel}
            onPaid={handlePaid}
            onBusy={setPaying}
          />
        </div>
      ) : null}

      {step === 'thanks' ? (
        <div className="flex flex-col items-center gap-4 py-2 text-center">
          <span className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-kadesh/10 text-kadesh">
            <DonationIcon size={36} />
          </span>
          <p className="text-base font-semibold text-[#121212] dark:text-[#eef1f6]">
            Recibimos tus {patitasLabel(units)}. Gracias por ayudar a que Kadesh Pet siga gratis.
          </p>
          {hiddenFromWall ? (
            <p className={mutedClass}>
              Como pediste, no sales en el muro ni en el top. Tu patita sí cuenta en el total. Te mandamos el recibo por correo.
            </p>
          ) : (
            <>
          <figure className="w-full rounded-2xl border border-[#ececec] bg-[#f7f8fa] p-4 text-left dark:border-white/10 dark:bg-night">
            <figcaption className="flex items-center gap-2 text-sm font-semibold text-[#121212] dark:text-[#eef1f6]">
              <DonationIcon size={16} className="text-kadesh" />
              {wallName(name, anonymous)} dio {patitasLabel(units)}
            </figcaption>
            {message.trim() ? (
              <blockquote className="mt-2 whitespace-pre-line text-sm text-[#3a3a3a] dark:text-[#d0d0d0]">{message.trim()}</blockquote>
            ) : null}
          </figure>
          <p className={mutedClass}>Así se verá en el muro de patitas. Te mandamos el recibo por correo.</p>
            </>
          )}
          <div className="flex w-full flex-col gap-3 sm:flex-row">
            <Link
              href={Routes.donations}
              onClick={onClose}
              className="inline-flex min-h-11 flex-1 items-center justify-center rounded-xl bg-kadesh px-5 font-semibold text-white hover:bg-kadesh-600"
            >
              Ver en qué se usan
            </Link>
            <button
              type="button"
              onClick={share}
              className="inline-flex min-h-11 flex-1 items-center justify-center gap-2 rounded-xl border-2 border-kadesh px-5 font-semibold text-kadesh hover:bg-kadesh/5"
            >
              <HugeiconsIcon icon={Share08Icon} size={18} strokeWidth={1.8} />
              Compartir
            </button>
          </div>
        </div>
      ) : null}
    </Sheet>
  );
}
