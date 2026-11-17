"use client";

import { useCallback, useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useMutation } from '@apollo/client';
import { HugeiconsIcon } from '@hugeicons/react';
import { CheckmarkCircle02Icon } from '@hugeicons/core-free-icons';
import { Sheet } from 'kadesh/components/shared';
import TurnstileWidget, { TURNSTILE_SITE_KEY } from 'kadesh/components/shared/TurnstileWidget';
import { useUiMotion } from 'kadesh/components/shared/motion';
import { friendlyErrorText } from 'kadesh/utils/errorText';
import { useUser } from 'kadesh/utils/UserContext';
import ChoiceChip from '../nuevo/ChoiceChip';
import LocationPicker from '../nuevo/LocationPicker';
import {
  REPORT_ANIMAL_SIGHTING_MUTATION,
  type ReportAnimalSightingResponse,
  type ReportAnimalSightingVariables,
} from '../queries';
import { buildSightingDate, dayKey, oldestSightingDay, type SightingWhen } from './time';

/** Mismos topes que kadesh-back (`models/Pet/Animal/AnimalSighting/constants.ts`). */
const NOTES_MAX = 500;
const NAME_MAX = 60;

const fieldClass =
  'w-full rounded-xl border border-[#d8dee8] bg-white px-3 py-2.5 text-sm text-[#121212] focus:border-kadesh focus:outline-none focus:ring-2 focus:ring-kadesh/30 dark:border-white/15 dark:bg-night dark:text-[#eef1f6] dark:[color-scheme:dark]';
const labelClass = 'mb-2 block text-sm font-semibold text-[#121212] dark:text-[#eef1f6]';
const hintClass = 'mb-1 block text-xs font-semibold text-[#5a5a5a] dark:text-[#9aa3b2]';

interface ReportSightingSheetProps {
  isOpen: boolean;
  onClose: () => void;
  /** Ya se guardó: la ficha se vuelve a pedir para mostrarlo. */
  onSent?: () => void | Promise<void>;
  animalId: string;
  /** «Luna» o «esta perra». */
  sentenceName: string;
  /** Centro del mapa: el último lugar del reporte. */
  mapCenter?: { lat: number; lng: number };
}

/**
 * «Lo vi»: cualquiera, con o sin cuenta, avisa dónde y cuándo vio al animal. Orden: dónde (pin) →
 * cuándo → cómo estaba → contacto opcional. Se publica al momento y le llega a quien lo busca.
 */
export default function ReportSightingSheet({
  isOpen,
  onClose,
  onSent,
  animalId,
  sentenceName,
  mapCenter,
}: ReportSightingSheetProps) {
  const motionPrefs = useUiMotion();
  const { user } = useUser();

  const [lat, setLat] = useState('');
  const [lng, setLng] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [country, setCountry] = useState('');
  const [isResolvingPlace, setIsResolvingPlace] = useState(false);
  const [when, setWhen] = useState<SightingWhen>('now');
  const [otherDay, setOtherDay] = useState('');
  const [time, setTime] = useState('');
  const [notes, setNotes] = useState('');
  const [contactName, setContactName] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [website, setWebsite] = useState('');
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [sent, setSent] = useState(false);

  // Cada vez que se abre arranca limpio; con sesión, el contacto viene de la cuenta.
  useEffect(() => {
    if (!isOpen) return;
    setLat('');
    setLng('');
    setAddress('');
    setCity('');
    setState('');
    setCountry('');
    setWhen('now');
    setOtherDay('');
    setTime('');
    setNotes('');
    setContactName(user?.name?.trim().split(/\s+/)[0] ?? '');
    setContactPhone(user?.phone ?? '');
    setWebsite('');
    setTurnstileToken(null);
    setErrors({});
    setSent(false);
  }, [isOpen, user?.name, user?.phone]);

  const [report, { loading }] = useMutation<ReportAnimalSightingResponse, ReportAnimalSightingVariables>(
    REPORT_ANIMAL_SIGHTING_MUTATION,
  );

  const handleLocationChange = useCallback((newLat: string, newLng: string) => {
    setLat(newLat);
    setLng(newLng);
  }, []);

  const handleAddressChange = useCallback((a: string, c: string, s: string, co: string) => {
    setAddress(a);
    setCity(c);
    setState(s);
    setCountry(co);
  }, []);

  const handleSubmit = async () => {
    if (loading) return;
    const next: Record<string, string> = {};
    if (!Number.isFinite(Number.parseFloat(lat)) || !Number.isFinite(Number.parseFloat(lng))) {
      next.location = 'Pon el pin donde lo viste, o usa «Usar mi ubicación actual».';
    } else if (isResolvingPlace) {
      next.location = 'Estamos ubicando el lugar. Espera un momento.';
    }
    const date = buildSightingDate(when, otherDay, time);
    if (!date.ok) next.date = date.reason;
    const phoneDigits = contactPhone.replace(/\D/g, '');
    if (phoneDigits && phoneDigits.length < 10) next.phone = 'Escribe los 10 dígitos, o déjalo vacío.';
    if (TURNSTILE_SITE_KEY && !turnstileToken) next.submit = 'Espera a que termine la verificación de abajo.';
    setErrors(next);
    if (Object.keys(next).length || !date.ok) return;

    try {
      const { data } = await report({
        variables: {
          input: {
            animalId,
            lat,
            lng,
            placeLabel: address || null,
            city: city || null,
            state: state || null,
            seenAt: date.iso,
            notes: notes.trim() || null,
            contactName: contactName.trim() || null,
            contactPhone: phoneDigits || null,
            turnstileToken,
            website: website || null,
          },
        },
      });
      const result = data?.reportAnimalSighting;
      if (!result?.success) {
        setErrors({ submit: result?.message || 'No pudimos guardar tu aviso. Intenta de nuevo.' });
        // Un token de Turnstile sirve una sola vez.
        setTurnstileToken(null);
        return;
      }
      setSent(true);
      await onSent?.();
    } catch (error) {
      setErrors({ submit: friendlyErrorText(error, 'No pudimos guardar tu aviso. Intenta de nuevo en un momento.') });
    }
  };

  if (sent) {
    return (
      <Sheet
        isOpen={isOpen}
        title="¡Gracias por avisar!"
        onClose={onClose}
        footer={
          <motion.button
            type="button"
            onClick={onClose}
            whileTap={motionPrefs.tap}
            className="min-h-11 w-full rounded-xl bg-kadesh px-4 text-sm font-semibold text-white hover:bg-kadesh-600"
          >
            Listo
          </motion.button>
        }
      >
        <SentMessage sentenceName={sentenceName} />
      </Sheet>
    );
  }

  return (
    <Sheet
      isOpen={isOpen}
      title={`¿Dónde viste a ${sentenceName}?`}
      onClose={onClose}
      busy={loading}
      footer={
        <div className="flex gap-3">
          <motion.button
            type="button"
            onClick={onClose}
            disabled={loading}
            whileTap={motionPrefs.tap}
            className="min-h-11 flex-1 rounded-xl bg-[#f3f5f8] px-4 text-sm font-semibold text-[#121212] hover:bg-[#e6e9ef] disabled:opacity-50 dark:bg-night dark:text-[#eef1f6] dark:hover:bg-white/10"
          >
            Cancelar
          </motion.button>
          <motion.button
            type="button"
            onClick={handleSubmit}
            disabled={loading}
            whileTap={loading ? undefined : motionPrefs.tap}
            className="min-h-11 flex-1 rounded-xl bg-kadesh px-4 text-sm font-semibold text-white hover:bg-kadesh-600 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? 'Enviando…' : 'Enviar aviso'}
          </motion.button>
        </div>
      }
    >
      <div className="space-y-6">
        <p className="text-sm text-[#5a5a5a] dark:text-[#9aa3b2]">
          No necesitas cuenta. Le llega al momento a quien lo busca.
        </p>

        {errors.submit ? (
          <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700 dark:border-red-800 dark:bg-red-950/40 dark:text-red-300">
            {errors.submit}
          </div>
        ) : null}

        <fieldset>
          <legend className={labelClass}>¿Dónde?</legend>
          <div className={errors.location ? 'rounded-xl ring-1 ring-red-500 ring-offset-2 dark:ring-offset-night-raised' : ''}>
            <LocationPicker
              lat={lat}
              lng={lng}
              address={address}
              city={city}
              state={state}
              country={country}
              mapCenter={mapCenter}
              isVisible={isOpen}
              compact
              onLocationChange={handleLocationChange}
              onAddressChange={handleAddressChange}
              onResolvingChange={setIsResolvingPlace}
            />
          </div>
          {errors.location ? <p className="mt-1 text-xs text-red-600">{errors.location}</p> : null}
        </fieldset>

        <fieldset>
          <legend className={labelClass}>¿Cuándo?</legend>
          <div className="flex flex-wrap gap-2">
            <ChoiceChip label="Ahora" selected={when === 'now'} onSelect={() => setWhen('now')} />
            <ChoiceChip label="Hoy" selected={when === 'today'} onSelect={() => setWhen('today')} />
            <ChoiceChip label="Ayer" selected={when === 'yesterday'} onSelect={() => setWhen('yesterday')} />
            <ChoiceChip label="Otro día" selected={when === 'other'} onSelect={() => setWhen('other')} />
          </div>
          <AnimatePresence initial={false}>
            {when !== 'now' ? (
              <motion.div
                variants={motionPrefs.expand}
                initial={motionPrefs.expand ? 'hidden' : false}
                animate="show"
                exit="hidden"
                className="mt-3 grid gap-3 sm:grid-cols-2"
              >
                {when === 'other' ? (
                  <div>
                    <label htmlFor="sighting-day" className={hintClass}>
                      Día
                    </label>
                    <input
                      id="sighting-day"
                      type="date"
                      min={oldestSightingDay()}
                      max={dayKey()}
                      value={otherDay}
                      onChange={(e) => setOtherDay(e.target.value)}
                      className={fieldClass}
                    />
                  </div>
                ) : null}
                <div>
                  <label htmlFor="sighting-time" className={hintClass}>
                    Hora aproximada, si la sabes
                  </label>
                  <input
                    id="sighting-time"
                    type="time"
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                    className={fieldClass}
                  />
                </div>
              </motion.div>
            ) : null}
          </AnimatePresence>
          {errors.date ? <p className="mt-1 text-xs text-red-600">{errors.date}</p> : null}
        </fieldset>

        <div>
          <label htmlFor="sighting-notes" className={labelClass}>
            ¿Cómo estaba? <span className="font-normal text-[#5a5a5a] dark:text-[#9aa3b2]">(opcional)</span>
          </label>
          <textarea
            id="sighting-notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value.slice(0, NOTES_MAX))}
            rows={3}
            className={`${fieldClass} resize-none`}
            placeholder="Ej. Iba hacia el parque, se veía asustado y traía collar rojo."
          />
        </div>

        <fieldset>
          <legend className={labelClass}>
            Tus datos <span className="font-normal text-[#5a5a5a] dark:text-[#9aa3b2]">(opcional)</span>
          </legend>
          <p className="-mt-1 mb-3 text-xs text-[#5a5a5a] dark:text-[#9aa3b2]">
            Solo los ve quien busca a {sentenceName}, por si quiere preguntarte algo.
          </p>
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label htmlFor="sighting-name" className={hintClass}>
                Nombre
              </label>
              <input
                id="sighting-name"
                type="text"
                autoComplete="given-name"
                maxLength={NAME_MAX}
                value={contactName}
                onChange={(e) => setContactName(e.target.value)}
                className={fieldClass}
              />
            </div>
            <div>
              <label htmlFor="sighting-phone" className={hintClass}>
                Teléfono o WhatsApp
              </label>
              <input
                id="sighting-phone"
                type="tel"
                inputMode="tel"
                autoComplete="tel-national"
                maxLength={20}
                value={contactPhone}
                onChange={(e) => setContactPhone(e.target.value)}
                className={`${fieldClass} ${errors.phone ? 'ring-1 ring-red-500' : ''}`}
                placeholder="10 dígitos"
              />
              {errors.phone ? <p className="mt-1 text-xs text-red-600">{errors.phone}</p> : null}
            </div>
          </div>
        </fieldset>

        {/* Campo trampa: invisible para personas; los bots que llenan todo lo mandan lleno. */}
        <div aria-hidden className="absolute -left-[9999px] h-px w-px overflow-hidden">
          <label htmlFor="sighting-website">No llenar</label>
          <input
            id="sighting-website"
            type="text"
            tabIndex={-1}
            autoComplete="off"
            value={website}
            onChange={(e) => setWebsite(e.target.value)}
          />
        </div>

        {isOpen ? <TurnstileWidget onToken={setTurnstileToken} className="min-h-[65px]" /> : null}
      </div>
    </Sheet>
  );
}

function SentMessage({ sentenceName }: { sentenceName: string }) {
  return (
    <div className="flex flex-col items-center gap-3 py-4 text-center">
      <span className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-emerald-50 text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-400">
        <HugeiconsIcon icon={CheckmarkCircle02Icon} size={26} strokeWidth={1.8} />
      </span>
      <p className="text-sm text-[#3a3a3a] dark:text-[#d0d0d0]">
        Ya le avisamos a quien busca a {sentenceName}. Tu aviso se ve en la ficha, en «Lo han visto».
      </p>
      <p className="text-xs text-[#5a5a5a] dark:text-[#9aa3b2]">
        Si lo vuelves a ver, avisa otra vez: cada lugar ayuda a saber hacia dónde va.
      </p>
    </div>
  );
}
