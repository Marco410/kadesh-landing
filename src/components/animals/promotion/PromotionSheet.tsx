"use client";

import { useEffect, useId, useState } from 'react';
import { motion } from 'framer-motion';
import { HugeiconsIcon } from '@hugeicons/react';
import { CheckmarkCircle02Icon, SecurityCheckIcon, WhatsappIcon } from '@hugeicons/core-free-icons';
import { Sheet } from 'kadesh/components/shared';
import { useUiMotion } from 'kadesh/components/shared/motion';
import { KADESH_WHATSAPP } from 'kadesh/constants/constans';
import { formatPhone } from 'kadesh/components/events/format';
import { formatCurrency } from 'kadesh/utils/format-currency';
import { kadeshWhatsAppUrl } from 'kadesh/utils/kadeshWhatsApp';
import {
  PROMOTION_DEFAULT_BUDGET,
  PROMOTION_DEFAULT_DURATION,
  PROMOTION_DURATIONS,
  PROMOTION_MAX,
  PROMOTION_MIN,
  PROMOTION_NEXT_STEPS,
  PROMOTION_PRESETS,
  PROMOTION_PROMISES,
  type PromotableStatus,
} from './constants';
import {
  isValidPromotionBudget,
  parsePromotionBudget,
  promotionFolio,
  promotionWhatsAppText,
} from './promotionRequest';
import { animalNameSource, animalSentenceName } from 'kadesh/components/animals/animalName';

interface PromotionSheetProps {
  isOpen: boolean;
  onClose: () => void;
  animal: { id: string; slug?: string | null; name?: string | null };
  status: PromotableStatus;
  /** Zona del último registro, para el mensaje. */
  place?: string | null;
}

const OFFICIAL_PHONE = `+52 ${formatPhone(KADESH_WHATSAPP.slice(-10))}`;

const chipClass = (selected: boolean) =>
  `inline-flex min-h-11 items-center rounded-full px-4 text-sm font-semibold transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-kadesh ${
    selected
      ? 'bg-kadesh text-white'
      : 'bg-[#f3f5f8] text-[#3a3a3a] hover:bg-kadesh-50 dark:bg-night dark:text-[#d0d0d0] dark:hover:bg-kadesh/20'
  }`;

const fieldClass =
  'w-full rounded-xl border border-[#d8dee8] bg-white py-3 pl-8 pr-4 text-sm text-[#121212] placeholder:text-[#5a5a5a] focus:outline-none focus:ring-2 focus:ring-kadesh dark:border-white/18 dark:bg-night dark:text-[#eef1f6] dark:placeholder:text-[#9aa3b2]';

/**
 * Pide una difusión pagada por WhatsApp: monto y días, la promesa de que no hay lucro y el aviso
 * antiestafa antes de cualquier pago. No guarda nada; arma el mensaje y abre el WhatsApp oficial.
 */
export default function PromotionSheet({ isOpen, onClose, animal, status, place }: PromotionSheetProps) {
  const motionPrefs = useUiMotion();
  const customId = useId();
  const acceptId = useId();
  const [budget, setBudget] = useState<number>(PROMOTION_DEFAULT_BUDGET);
  const [custom, setCustom] = useState<string | null>(null);
  const [duration, setDuration] = useState<number>(PROMOTION_DEFAULT_DURATION);
  const [accepted, setAccepted] = useState(false);
  const [folio, setFolio] = useState('');
  const [sent, setSent] = useState(false);

  // Cada vez que se abre empieza de cero, con un folio nuevo. Depende del id/slug y no del objeto:
  // la ficha arma un `animal` nuevo en cada render y esto lo reiniciaría sin parar.
  const animalId = animal.id;
  const animalSlug = animal.slug;
  useEffect(() => {
    if (!isOpen) return;
    setBudget(PROMOTION_DEFAULT_BUDGET);
    setCustom(null);
    setDuration(PROMOTION_DEFAULT_DURATION);
    setAccepted(false);
    setSent(false);
    setFolio(promotionFolio({ id: animalId, slug: animalSlug }));
  }, [isOpen, animalId, animalSlug]);

  const subject = animalSentenceName(animalNameSource(animal));
  const foundBy = status === 'found';
  const amount = custom === null ? budget : parsePromotionBudget(custom);
  const validAmount = isValidPromotionBudget(amount);
  const customError = custom !== null && custom !== '' && !validAmount;
  const whatsappUrl = validAmount
    ? kadeshWhatsAppUrl(
        promotionWhatsAppText({ subject, folio, animal, place, durationDays: duration, budget: amount }),
      )
    : null;

  const openWhatsApp = () => {
    if (!whatsappUrl || !accepted) return;
    const opened = window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
    if (!opened) window.location.href = whatsappUrl;
    setSent(true);
  };

  const footer = sent ? (
    <div className="flex gap-3">
      <motion.a
        href={whatsappUrl ?? undefined}
        target="_blank"
        rel="noopener noreferrer"
        whileTap={motionPrefs.tap}
        className="inline-flex min-h-11 flex-1 items-center justify-center gap-2 rounded-xl bg-[#f3f5f8] px-4 text-sm font-semibold text-[#121212] hover:bg-[#e6e9ef] dark:bg-night dark:text-[#eef1f6] dark:hover:bg-white/10"
      >
        <HugeiconsIcon icon={WhatsappIcon} size={18} strokeWidth={1.6} />
        Abrir WhatsApp otra vez
      </motion.a>
      <motion.button
        type="button"
        onClick={onClose}
        whileTap={motionPrefs.tap}
        className="min-h-11 shrink-0 rounded-xl bg-kadesh px-6 text-sm font-semibold text-white hover:bg-kadesh-600 sm:flex-1"
      >
        Listo
      </motion.button>
    </div>
  ) : (
    <div className="flex gap-3">
      <motion.button
        type="button"
        onClick={onClose}
        whileTap={motionPrefs.tap}
        className="min-h-11 shrink-0 rounded-xl bg-[#f3f5f8] px-5 text-sm font-semibold text-[#121212] hover:bg-[#e6e9ef] dark:bg-night dark:text-[#eef1f6] dark:hover:bg-white/10 sm:flex-1"
      >
        Ahora no
      </motion.button>
      <motion.button
        type="button"
        onClick={openWhatsApp}
        disabled={!accepted || !validAmount}
        whileTap={accepted && validAmount ? motionPrefs.tap : undefined}
        className="inline-flex min-h-11 flex-1 items-center justify-center gap-2 rounded-xl bg-kadesh px-4 text-sm font-semibold text-white hover:bg-kadesh-600 disabled:cursor-not-allowed disabled:opacity-50"
      >
        <HugeiconsIcon icon={WhatsappIcon} size={18} strokeWidth={1.6} />
        Solicitar por WhatsApp
      </motion.button>
    </div>
  );

  return (
    <Sheet isOpen={isOpen} title="Impulsar en Facebook e Instagram" onClose={onClose} footer={footer}>
      {sent ? (
        <div className="space-y-4">
          <div className="rounded-xl bg-kadesh-50 p-4 dark:bg-kadesh/15">
            <p className="text-sm font-semibold text-[#121212] dark:text-[#eef1f6]">
              Envía el mensaje que se abrió en WhatsApp
            </p>
            <p className="mt-1 text-sm text-[#3a3a3a] dark:text-[#d0d0d0]">
              Tu folio es <span className="font-bold text-[#121212] dark:text-[#eef1f6]">{folio}</span>. Úsalo como
              concepto cuando transfieras.
            </p>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-[#121212] dark:text-[#eef1f6]">Siguientes pasos</h3>
            <ol className="mt-2 list-decimal space-y-1.5 pl-5 text-sm text-[#3a3a3a] dark:text-[#d0d0d0]">
              {PROMOTION_NEXT_STEPS(foundBy).map((step) => (
                <li key={step}>{step}</li>
              ))}
            </ol>
          </div>
          <p className="text-xs text-[#5a5a5a] dark:text-[#9aa3b2]">
            Solo te atendemos en el WhatsApp oficial de KADESH ({OFFICIAL_PHONE}).
          </p>
        </div>
      ) : (
        <div className="space-y-5">
          <p className="text-sm leading-relaxed text-[#3a3a3a] dark:text-[#d0d0d0]">
            Tu reporte ya está publicado gratis en nuestra página de Facebook. Si quieres que lo vean más personas
            cerca de donde {foundBy ? 'lo encontraron' : 'se perdió'}, puedes pagar un anuncio. Tú eliges cuánto.
          </p>

          <fieldset>
            <legend className="mb-2 text-sm font-semibold text-[#121212] dark:text-[#eef1f6]">
              ¿Cuánto quieres para el anuncio?
            </legend>
            <div className="flex flex-wrap gap-2">
              {PROMOTION_PRESETS.map((value) => {
                const selected = custom === null && budget === value;
                return (
                  <button
                    key={value}
                    type="button"
                    aria-pressed={selected}
                    onClick={() => {
                      setCustom(null);
                      setBudget(value);
                    }}
                    className={chipClass(selected)}
                  >
                    {formatCurrency(value).replace('.00', '')}
                  </button>
                );
              })}
              <button
                type="button"
                aria-pressed={custom !== null}
                onClick={() => setCustom((value) => value ?? '')}
                className={chipClass(custom !== null)}
              >
                Otro monto
              </button>
            </div>
            {custom !== null ? (
              <div className="mt-3">
                <label htmlFor={customId} className="sr-only">
                  Monto del anuncio en pesos
                </label>
                <div className="relative max-w-56">
                  <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-sm text-[#5a5a5a] dark:text-[#9aa3b2]">
                    $
                  </span>
                  <input
                    id={customId}
                    inputMode="numeric"
                    autoComplete="off"
                    autoFocus
                    value={custom}
                    onChange={(event) => setCustom(event.target.value.replace(/\D/g, '').slice(0, 5))}
                    placeholder={String(PROMOTION_DEFAULT_BUDGET)}
                    aria-invalid={customError}
                    aria-describedby={`${customId}-hint`}
                    className={`${fieldClass} ${customError ? 'ring-1 ring-red-500' : ''}`}
                  />
                </div>
                <p
                  id={`${customId}-hint`}
                  className={`mt-1.5 text-xs ${customError ? 'text-red-600' : 'text-[#5a5a5a] dark:text-[#9aa3b2]'}`}
                >
                  Entre {formatCurrency(PROMOTION_MIN)} y {formatCurrency(PROMOTION_MAX)}.
                </p>
              </div>
            ) : null}
          </fieldset>

          <fieldset>
            <legend className="mb-2 text-sm font-semibold text-[#121212] dark:text-[#eef1f6]">
              ¿Cuántos días?
            </legend>
            <div className="flex flex-wrap gap-2">
              {PROMOTION_DURATIONS.map((days) => (
                <button
                  key={days}
                  type="button"
                  aria-pressed={duration === days}
                  onClick={() => setDuration(days)}
                  className={chipClass(duration === days)}
                >
                  {days} días
                </button>
              ))}
            </div>
          </fieldset>

          <div className="rounded-xl border border-[#ececec] p-4 dark:border-white/10">
            <p className="text-xs text-[#5a5a5a] dark:text-[#9aa3b2]">Presupuesto del anuncio</p>
            <p className="text-2xl font-black tracking-[-0.03em] text-[#121212] dark:text-[#eef1f6]">
              {validAmount ? formatCurrency(amount) : '—'}
            </p>
            <p className="text-sm text-[#3a3a3a] dark:text-[#d0d0d0]">{duration} días · va completo a Meta</p>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-[#121212] dark:text-[#eef1f6]">Sin lucro y con comprobantes</h3>
            <ul className="mt-2 space-y-2">
              {PROMOTION_PROMISES(subject, foundBy).map((promise) => (
                <li key={promise} className="flex gap-2 text-sm text-[#3a3a3a] dark:text-[#d0d0d0]">
                  <HugeiconsIcon
                    icon={CheckmarkCircle02Icon}
                    size={18}
                    strokeWidth={1.6}
                    className="mt-px shrink-0 text-kadesh"
                  />
                  <span>{promise}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="flex gap-3 rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-100">
            <HugeiconsIcon icon={SecurityCheckIcon} size={20} strokeWidth={1.6} className="mt-px shrink-0" />
            <p>
              <span className="font-semibold">Cuida tu dinero:</span> solo atendemos esto en el WhatsApp oficial de
              KADESH ({OFFICIAL_PHONE}). Nunca te escribiremos primero para cobrarte ni te pediremos datos de tarjeta.
            </p>
          </div>

          <div className="flex items-start gap-3">
            <input
              id={acceptId}
              type="checkbox"
              checked={accepted}
              onChange={(event) => setAccepted(event.target.checked)}
              className="mt-0.5 h-5 w-5 shrink-0 cursor-pointer rounded border-[#c8d0dc] accent-kadesh"
            />
            <label htmlFor={acceptId} className="cursor-pointer text-sm text-[#121212] dark:text-[#eef1f6]">
              Entiendo que el pago es solo para el anuncio y que KADESH no se queda con ninguna parte.
            </label>
          </div>
        </div>
      )}
    </Sheet>
  );
}
