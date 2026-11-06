"use client";

import { useEffect, useId, useRef, useState, type FormEvent, type ReactNode } from 'react';
import { motion } from 'framer-motion';
import { sileo } from 'sileo';
import ChoiceChip from 'kadesh/components/animals/nuevo/ChoiceChip';
import { Sheet } from 'kadesh/components/shared';
import { useUiMotion } from 'kadesh/components/shared/motion';
import { normalizeMxPhone } from 'kadesh/utils/phone';
import {
  ADOPTION_HOUSING_OPTIONS,
  ADOPTION_LIMITS,
  ADOPTION_OWNERSHIP_OPTIONS,
} from './constants';
import { adoptionAnimalName, adoptionErrorMessage } from './format';
import { useAdoptionActions } from './hooks/useAdoptionActions';
import type { AdoptionHousing, AdoptionHousingOwnership } from './types';

const fieldClass =
  'w-full rounded-xl border border-[#d8dee8] bg-white px-4 py-3 text-sm text-[#121212] placeholder:text-[#5a5a5a] focus:outline-none focus:ring-2 focus:ring-kadesh dark:border-white/18 dark:bg-night dark:text-[#eef1f6] dark:placeholder:text-[#9aa3b2]';
const labelClass = 'mb-2 block text-sm font-semibold text-[#121212] dark:text-[#eef1f6]';
const hintClass = 'text-xs text-[#5a5a5a] dark:text-[#9aa3b2]';
const errorClass = 'mt-1.5 text-xs text-red-600 dark:text-red-400';

type Draft = {
  message: string;
  housing: AdoptionHousing | '';
  ownership: AdoptionHousingOwnership | '';
  petsAllowed: boolean | null;
  hasYard: boolean | null;
  hasChildren: boolean | null;
  hoursAlone: string;
  otherPets: string;
  experience: string;
  phone: string;
  commitSterilization: boolean;
  acceptsFollowUp: boolean;
};

type Field = Exclude<keyof Draft, 'otherPets' | 'experience'>;
type Errors = Partial<Record<Field | 'form', string>>;

/** Orden en que aparecen: al fallar la validación se baja al primer error. */
const FIELD_ORDER: Field[] = [
  'message',
  'housing',
  'ownership',
  'petsAllowed',
  'hasYard',
  'hasChildren',
  'hoursAlone',
  'phone',
  'commitSterilization',
  'acceptsFollowUp',
];

function emptyDraft(phone: string): Draft {
  return {
    message: '',
    housing: '',
    ownership: '',
    petsAllowed: null,
    hasYard: null,
    hasChildren: null,
    hoursAlone: '',
    otherPets: '',
    experience: '',
    phone,
    commitSterilization: false,
    acceptsFollowUp: false,
  };
}

function YesNo({ value, onChange }: { value: boolean | null; onChange: (value: boolean) => void }) {
  return (
    <div className="flex flex-wrap gap-2">
      <ChoiceChip label="Sí" selected={value === true} onSelect={() => onChange(true)} />
      <ChoiceChip label="No" selected={value === false} onSelect={() => onChange(false)} />
    </div>
  );
}

function ChoiceField({
  id,
  legend,
  error,
  hint,
  children,
}: {
  id: string;
  legend: string;
  error?: string;
  hint?: ReactNode;
  children: ReactNode;
}) {
  return (
    <fieldset id={id} className="scroll-mt-4" aria-describedby={error ? `${id}-error` : undefined}>
      <legend className={labelClass}>
        {legend} <span className="text-red-600">*</span>
      </legend>
      {children}
      {hint ? <div className={`mt-2 ${hintClass}`}>{hint}</div> : null}
      {error ? (
        <p id={`${id}-error`} className={errorClass}>
          {error}
        </p>
      ) : null}
    </fieldset>
  );
}

interface AdoptionApplicationModalProps {
  isOpen: boolean;
  onClose: () => void;
  animalId: string;
  animalName?: string | null;
  /** `female` para decir «adoptarla», «sola»… */
  animalSex?: string | null;
  defaultPhone?: string | null;
  /** Ya se envió: refresca el aviso de la ficha. */
  onSubmitted: () => void;
}

/**
 * Formulario «Quiero adoptarlo» (`submitAdoptionApplication`). Lo que escribe se conserva si cierra
 * la hoja sin querer; se limpia al enviarse. Los errores de negocio (ya tiene una abierta, ya no
 * está en adopción, límite del día) llegan como `message` y se muestran arriba.
 */
export default function AdoptionApplicationModal({
  isOpen,
  onClose,
  animalId,
  animalName,
  animalSex,
  defaultPhone,
  onSubmitted,
}: AdoptionApplicationModalProps) {
  const motionPrefs = useUiMotion();
  const baseId = useId();
  const formId = `${baseId}-form`;
  const fieldId = (field: Field) => `${baseId}-${field}`;
  const alertRef = useRef<HTMLDivElement>(null);
  const { submit, submitting } = useAdoptionActions();
  const [draft, setDraft] = useState<Draft>(() => emptyDraft(defaultPhone ?? ''));
  const [errors, setErrors] = useState<Errors>({});
  const name = adoptionAnimalName(animalName);
  const female = animalSex === 'female';
  const pronoun = female ? 'la' : 'lo';
  const alone = female ? 'sola' : 'solo';

  useEffect(() => {
    // Si el perfil carga después, prellena el teléfono (sin pisar lo que ya escribió).
    if (defaultPhone) setDraft((current) => (current.phone ? current : { ...current, phone: defaultPhone }));
  }, [defaultPhone]);

  useEffect(() => {
    if (errors.form) alertRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, [errors.form]);

  const set = <K extends keyof Draft>(key: K, value: Draft[K]) => {
    setDraft((current) => ({ ...current, [key]: value }));
    if (key in errors) setErrors((current) => ({ ...current, [key]: undefined }));
  };

  const validate = (): Errors => {
    const next: Errors = {};
    const message = draft.message.trim();
    if (message.length < ADOPTION_LIMITS.MESSAGE_MIN) {
      next.message = `Cuéntale un poco más sobre ti (mínimo ${ADOPTION_LIMITS.MESSAGE_MIN} caracteres).`;
    }
    if (!draft.housing) next.housing = 'Elige tu tipo de vivienda.';
    if (!draft.ownership) next.ownership = 'Elige una opción.';
    if (draft.ownership === 'rent' && draft.petsAllowed == null) next.petsAllowed = 'Elige sí o no.';
    if (draft.hasYard == null) next.hasYard = 'Elige sí o no.';
    if (draft.hasChildren == null) next.hasChildren = 'Elige sí o no.';
    const hours = Number(draft.hoursAlone);
    if (
      draft.hoursAlone.trim() === '' ||
      !Number.isInteger(hours) ||
      hours < ADOPTION_LIMITS.HOURS_MIN ||
      hours > ADOPTION_LIMITS.HOURS_MAX
    ) {
      next.hoursAlone = 'Escribe un número de horas entre 0 y 24.';
    }
    const phone = normalizeMxPhone(draft.phone);
    if (!phone.ok) next.phone = phone.reason;
    if (!draft.commitSterilization) next.commitSterilization = 'Es necesario para enviar tu solicitud.';
    if (!draft.acceptsFollowUp) next.acceptsFollowUp = 'Es necesario para enviar tu solicitud.';
    return next;
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (submitting) return;
    const next = validate();
    setErrors(next);
    const first = FIELD_ORDER.find((field) => next[field]);
    if (first) {
      document.getElementById(fieldId(first))?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }
    const phone = normalizeMxPhone(draft.phone);
    if (!phone.ok || !draft.housing || !draft.ownership || draft.hasYard == null || draft.hasChildren == null) return;

    try {
      const result = await submit(animalId, {
        phone: phone.digits,
        message: draft.message.trim(),
        housing: draft.housing,
        housingOwnership: draft.ownership,
        petsAllowed: draft.ownership === 'rent' ? draft.petsAllowed : null,
        hasYard: draft.hasYard,
        hasChildren: draft.hasChildren,
        otherPets: draft.otherPets.trim() || null,
        hoursAlone: Number(draft.hoursAlone),
        experience: draft.experience.trim() || null,
        commitSterilization: draft.commitSterilization,
        acceptsFollowUp: draft.acceptsFollowUp,
      });
      if (!result?.success) {
        setErrors({ form: result?.message || 'No se pudo enviar tu solicitud. Inténtalo de nuevo.' });
        return;
      }
      sileo.success({
        title: 'Enviamos tu solicitud',
        description: `Quien cuida a ${name} la revisará. Te avisaremos cuando responda.`,
      });
      setDraft(emptyDraft(defaultPhone ?? ''));
      setErrors({});
      onClose();
      onSubmitted();
    } catch (error) {
      console.error('[adopcion] no se pudo enviar la solicitud', error);
      setErrors({
        form: adoptionErrorMessage(error, 'No se pudo enviar tu solicitud. Revisa tu conexión e inténtalo de nuevo.'),
      });
    }
  };

  const textarea = `${fieldClass} resize-none`;
  const invalid = (field: Field) => (errors[field] ? 'ring-1 ring-red-500' : '');

  return (
    <Sheet
      isOpen={isOpen}
      title={`Adoptar a ${name}`}
      onClose={onClose}
      busy={submitting}
      footer={
        <div className="flex gap-3">
          <motion.button
            type="button"
            onClick={onClose}
            disabled={submitting}
            whileTap={motionPrefs.tap}
            className="min-h-11 flex-1 rounded-xl bg-[#f3f5f8] px-4 text-sm font-semibold text-[#121212] hover:bg-[#e6e9ef] disabled:opacity-50 dark:bg-night dark:text-[#eef1f6] dark:hover:bg-white/10"
          >
            Cancelar
          </motion.button>
          <motion.button
            type="submit"
            form={formId}
            disabled={submitting}
            whileTap={submitting ? undefined : motionPrefs.tap}
            className="min-h-11 flex-1 rounded-xl bg-kadesh px-4 text-sm font-semibold text-white hover:bg-kadesh-600 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {submitting ? 'Enviando…' : 'Enviar solicitud'}
          </motion.button>
        </div>
      }
    >
      <form id={formId} onSubmit={handleSubmit} noValidate className="space-y-6">
        <p className="text-sm leading-relaxed text-[#5a5a5a] dark:text-[#9aa3b2]">
          Cuéntale a quien cuida a {name} sobre ti y tu hogar. Con esto te conoce un poco antes de llamarte o
          escribirte. Te toma unos 3 minutos.
        </p>

        {errors.form ? (
          <div
            ref={alertRef}
            role="alert"
            className="scroll-mt-4 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700 dark:border-red-800 dark:bg-red-950/40 dark:text-red-300"
          >
            {errors.form}
          </div>
        ) : null}

        <div>
          <label htmlFor={fieldId('message')} className={labelClass}>
            ¿Por qué quieres adoptar a {name}? <span className="text-red-600">*</span>
          </label>
          <textarea
            id={fieldId('message')}
            value={draft.message}
            onChange={(event) => set('message', event.target.value.slice(0, ADOPTION_LIMITS.MESSAGE_MAX))}
            rows={4}
            className={`${textarea} scroll-mt-4 ${invalid('message')}`}
            placeholder="Ej.: Vivo con mi pareja, trabajamos desde casa y buscamos un compañero para salir a caminar."
            aria-invalid={Boolean(errors.message)}
            disabled={submitting}
          />
          <div className="mt-1 flex justify-between gap-3 text-xs">
            <span className="text-red-600 dark:text-red-400">{errors.message ?? ''}</span>
            <span className="shrink-0 text-[#5a5a5a] dark:text-[#9aa3b2]">
              {draft.message.length}/{ADOPTION_LIMITS.MESSAGE_MAX}
            </span>
          </div>
        </div>

        <section className="space-y-5" aria-label="Tu hogar">
          <h3 className="text-base font-black tracking-[-0.02em] text-[#121212] dark:text-[#eef1f6]">Tu hogar</h3>

          <ChoiceField id={fieldId('housing')} legend="Vivienda" error={errors.housing}>
            <div className="flex flex-wrap gap-2">
              {ADOPTION_HOUSING_OPTIONS.map((option) => (
                <ChoiceChip
                  key={option.value}
                  label={option.label}
                  selected={draft.housing === option.value}
                  onSelect={() => set('housing', option.value)}
                />
              ))}
            </div>
          </ChoiceField>

          <ChoiceField id={fieldId('ownership')} legend="Tu vivienda es" error={errors.ownership}>
            <div className="flex flex-wrap gap-2">
              {ADOPTION_OWNERSHIP_OPTIONS.map((option) => (
                <ChoiceChip
                  key={option.value}
                  label={option.label}
                  selected={draft.ownership === option.value}
                  onSelect={() => set('ownership', option.value)}
                />
              ))}
            </div>
          </ChoiceField>

          {draft.ownership === 'rent' ? (
            <ChoiceField
              id={fieldId('petsAllowed')}
              legend="¿Te permiten tener mascotas?"
              error={errors.petsAllowed}
              hint={
                draft.petsAllowed === false
                  ? 'Te recomendamos confirmarlo con quien te renta antes de adoptar: así nadie tiene que despedirse después.'
                  : undefined
              }
            >
              <YesNo value={draft.petsAllowed} onChange={(value) => set('petsAllowed', value)} />
            </ChoiceField>
          ) : null}

          <ChoiceField id={fieldId('hasYard')} legend="¿Tiene patio o jardín?" error={errors.hasYard}>
            <YesNo value={draft.hasYard} onChange={(value) => set('hasYard', value)} />
          </ChoiceField>

          <ChoiceField id={fieldId('hasChildren')} legend="¿Hay niños en casa?" error={errors.hasChildren}>
            <YesNo value={draft.hasChildren} onChange={(value) => set('hasChildren', value)} />
          </ChoiceField>
        </section>

        <section className="space-y-5" aria-label="Tu día a día">
          <h3 className="text-base font-black tracking-[-0.02em] text-[#121212] dark:text-[#eef1f6]">Tu día a día</h3>

          <div>
            <label htmlFor={fieldId('hoursAlone')} className={labelClass}>
              ¿Cuántas horas al día estaría {alone}? <span className="text-red-600">*</span>
            </label>
            <input
              id={fieldId('hoursAlone')}
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              autoComplete="off"
              value={draft.hoursAlone}
              onChange={(event) => set('hoursAlone', event.target.value.replace(/[^\d]/g, '').slice(0, 2))}
              className={`${fieldClass} max-w-40 scroll-mt-4 ${invalid('hoursAlone')}`}
              placeholder="Ej.: 4"
              aria-invalid={Boolean(errors.hoursAlone)}
              aria-describedby={`${fieldId('hoursAlone')}-hint`}
              disabled={submitting}
            />
            <p id={`${fieldId('hoursAlone')}-hint`} className={errors.hoursAlone ? errorClass : `mt-1.5 ${hintClass}`}>
              {errors.hoursAlone ?? 'De 0 a 24. Un aproximado está bien.'}
            </p>
          </div>

          <div>
            <label htmlFor={`${baseId}-otherPets`} className={labelClass}>
              ¿Tienes otros animales?
            </label>
            <textarea
              id={`${baseId}-otherPets`}
              value={draft.otherPets}
              onChange={(event) => set('otherPets', event.target.value.slice(0, ADOPTION_LIMITS.TEXT_MAX))}
              rows={2}
              className={textarea}
              placeholder="Ej.: Una perrita de 5 años, esterilizada y muy tranquila."
              disabled={submitting}
            />
            <p className={`mt-1 ${hintClass}`}>Opcional. Si no tienes, déjalo en blanco.</p>
          </div>

          <div>
            <label htmlFor={`${baseId}-experience`} className={labelClass}>
              Experiencia con mascotas
            </label>
            <textarea
              id={`${baseId}-experience`}
              value={draft.experience}
              onChange={(event) => set('experience', event.target.value.slice(0, ADOPTION_LIMITS.TEXT_MAX))}
              rows={2}
              className={textarea}
              placeholder="Ej.: Crecí con perros y cuidé a un gato rescatado por 10 años."
              disabled={submitting}
            />
            <p className={`mt-1 ${hintClass}`}>Opcional. No hace falta tener experiencia para adoptar.</p>
          </div>
        </section>

        <div>
          <label htmlFor={fieldId('phone')} className={labelClass}>
            Tu teléfono <span className="text-red-600">*</span>
          </label>
          <input
            id={fieldId('phone')}
            type="tel"
            inputMode="tel"
            maxLength={18}
            value={draft.phone}
            onChange={(event) => set('phone', event.target.value)}
            className={`${fieldClass} scroll-mt-4 ${invalid('phone')}`}
            placeholder="443 521 5638"
            autoComplete="tel"
            aria-invalid={Boolean(errors.phone)}
            aria-describedby={`${fieldId('phone')}-hint`}
            disabled={submitting}
          />
          <p id={`${fieldId('phone')}-hint`} className={errors.phone ? errorClass : `mt-1.5 ${hintClass}`}>
            {errors.phone ?? '10 dígitos. Para que te llamen o te escriban por WhatsApp.'}
          </p>
        </div>

        <fieldset className="space-y-3">
          <legend className={labelClass}>
            Compromisos <span className="text-red-600">*</span>
          </legend>
          {(
            [
              ['commitSterilization', `Me comprometo a esterilizar${pronoun} si aún no lo está.`],
              ['acceptsFollowUp', 'Acepto que me contacten para dar seguimiento después de la adopción.'],
            ] as const
          ).map(([field, label]) => (
            <div key={field} id={fieldId(field)} className="scroll-mt-4">
              <label className="flex cursor-pointer items-start gap-3 text-sm text-[#121212] dark:text-[#eef1f6]">
                <input
                  type="checkbox"
                  checked={draft[field]}
                  onChange={(event) => set(field, event.target.checked)}
                  className="mt-0.5 h-5 w-5 shrink-0 rounded border-[#d8dee8] text-kadesh focus:ring-kadesh"
                  aria-invalid={Boolean(errors[field])}
                  aria-describedby={errors[field] ? `${fieldId(field)}-error` : undefined}
                  disabled={submitting}
                />
                <span>{label}</span>
              </label>
              {errors[field] ? (
                <p id={`${fieldId(field)}-error`} className={`${errorClass} pl-8`}>
                  {errors[field]}
                </p>
              ) : null}
            </div>
          ))}
        </fieldset>

        <p className="rounded-xl bg-[#f3f5f8] p-3 text-xs leading-relaxed text-[#5a5a5a] dark:bg-night dark:text-[#9aa3b2]">
          Compartiremos tu nombre, correo y teléfono con quien cuida a {name} para que pueda contactarte.
        </p>
      </form>
    </Sheet>
  );
}
