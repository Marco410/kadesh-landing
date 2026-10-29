"use client";

import { useEffect, useRef, useState, type FormEvent } from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { HugeiconsIcon } from '@hugeicons/react';
import { Cancel01Icon, ImageAdd01Icon } from '@hugeicons/core-free-icons';
import { sileo } from 'sileo';
import { useUiMotion } from 'kadesh/components/shared/motion';
import { normalizeMxPhone } from 'kadesh/utils/phone';
import { toUploadableImage } from 'kadesh/utils/uploadable-image';
import { claimErrorMessage, useCreateAnimalClaim } from './useAnimalClaims';

const MESSAGE_MIN = 10;
const MESSAGE_MAX = 500;
const MAX_IMAGE_BYTES = 5 * 1024 * 1024;

const fieldClass =
  'w-full rounded-xl border border-[#d8dee8] bg-white px-4 py-3 text-sm text-[#121212] placeholder:text-[#5a5a5a] focus:outline-none focus:ring-2 focus:ring-kadesh dark:border-white/18 dark:bg-night dark:text-[#eef1f6] dark:placeholder:text-[#9aa3b2]';

interface ClaimReportFormProps {
  animalId: string;
  animalName?: string | null;
  defaultPhone?: string | null;
  cancelLabel?: string;
  onCancel: () => void;
  /** Ya se mandó: quien reportó recibe el aviso. */
  onDone: () => void;
  onBusyChange?: (busy: boolean) => void;
}

/**
 * «Es mi mascota»: pide a quien atiende el reporte que pase a tu nombre. Mensaje para que sepa
 * que es tuya, tu teléfono (queda como contacto si aprueba) y, si quieres, una foto con ella.
 */
export default function ClaimReportForm({
  animalId,
  animalName,
  defaultPhone,
  cancelLabel = 'Cancelar',
  onCancel,
  onDone,
  onBusyChange,
}: ClaimReportFormProps) {
  const motionPrefs = useUiMotion();
  const { createClaim, loading } = useCreateAnimalClaim();
  const [message, setMessage] = useState('');
  const [phone, setPhone] = useState(defaultPhone ?? '');
  const [photo, setPhoto] = useState<{ file: File; preview: string } | null>(null);
  const [errors, setErrors] = useState<{ message?: string; phone?: string; form?: string }>({});
  const fileInput = useRef<HTMLInputElement>(null);

  useEffect(() => {
    onBusyChange?.(loading);
  }, [loading, onBusyChange]);

  useEffect(() => () => {
    if (photo) URL.revokeObjectURL(photo.preview);
  }, [photo]);

  const pickPhoto = async (raw: File | undefined) => {
    if (!raw) return;
    try {
      const file = await toUploadableImage(raw);
      if (file.size > MAX_IMAGE_BYTES) {
        sileo.error({ title: 'Foto demasiado pesada', description: 'Debe pesar 5 MB o menos.' });
        return;
      }
      setPhoto({ file, preview: URL.createObjectURL(file) });
    } catch (error) {
      console.error('[claim] no se pudo leer la foto', error);
      sileo.error({ title: 'No pudimos leer la foto', description: 'Intenta con otra o guárdala como JPG.' });
    }
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (loading) return;
    const nextErrors: typeof errors = {};
    const text = message.trim();
    if (text.length < MESSAGE_MIN) {
      nextErrors.message = 'Cuéntale cómo saber que es tuya: una seña, su nombre, cuándo se perdió.';
    }
    const normalized = normalizeMxPhone(phone);
    if (!normalized.ok) nextErrors.phone = normalized.reason;
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length || !normalized.ok) return;

    try {
      await createClaim({
        data: {
          animal: { connect: { id: animalId } },
          message: text,
          phone: normalized.digits,
          ...(photo ? { evidence: { upload: photo.file } } : {}),
        },
      });
      sileo.success({
        title: 'Le avisamos a quien lo reportó',
        description: 'Te avisaremos cuando responda tu solicitud.',
      });
      onDone();
    } catch (error) {
      console.error('[claim] no se pudo mandar la solicitud', error);
      setErrors({ form: claimErrorMessage(error) });
    }
  };

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-5">
      <p className="text-sm leading-relaxed text-[#5a5a5a] dark:text-[#9aa3b2]">
        Le pediremos a quien publicó {animalName && animalName !== 'Sin nombre' ? `el reporte de ${animalName}` : 'este reporte'} que
        lo pase a tu nombre. Si acepta, podrás actualizarlo y tu teléfono quedará como contacto.
      </p>

      {errors.form ? (
        <div
          role="alert"
          className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700 dark:border-red-800 dark:bg-red-950/40 dark:text-red-300"
        >
          {errors.form}
        </div>
      ) : null}

      <div>
        <label htmlFor="claim-message" className="mb-2 block text-sm font-semibold text-[#121212] dark:text-[#eef1f6]">
          ¿Cómo sabe que es tu mascota? <span className="text-red-600">*</span>
        </label>
        <textarea
          id="claim-message"
          value={message}
          onChange={(event) => setMessage(event.target.value.slice(0, MESSAGE_MAX))}
          rows={4}
          className={`${fieldClass} resize-none ${errors.message ? 'ring-1 ring-red-500' : ''}`}
          placeholder="Ej.: Se llama Chaneque, se salió el 11 de octubre. Tiene una mancha café en la oreja y su collar es rojo."
          disabled={loading}
        />
        <div className="mt-1 flex justify-between gap-3 text-xs">
          <span className="text-red-600">{errors.message ?? ''}</span>
          <span className="text-[#5a5a5a] dark:text-[#9aa3b2]">
            {message.length}/{MESSAGE_MAX}
          </span>
        </div>
      </div>

      <div>
        <label htmlFor="claim-phone" className="mb-2 block text-sm font-semibold text-[#121212] dark:text-[#eef1f6]">
          Tu teléfono <span className="text-red-600">*</span>
        </label>
        <input
          id="claim-phone"
          type="tel"
          inputMode="tel"
          maxLength={18}
          value={phone}
          onChange={(event) => setPhone(event.target.value)}
          className={`${fieldClass} ${errors.phone ? 'ring-1 ring-red-500' : ''}`}
          placeholder="443 521 5638"
          autoComplete="tel"
          disabled={loading}
        />
        {errors.phone ? <p className="mt-2 text-xs text-red-600">{errors.phone}</p> : null}
      </div>

      <div>
        <p className="mb-2 text-sm font-semibold text-[#121212] dark:text-[#eef1f6]">Una foto tuya con tu mascota</p>
        <p className="mb-3 text-sm text-[#5a5a5a] dark:text-[#9aa3b2]">
          Opcional. Solo la ven quien reportó y el equipo de Kadesh.
        </p>
        {photo ? (
          <div className="relative h-36 w-36 overflow-hidden rounded-xl border border-[#ececec] dark:border-white/10">
            <Image src={photo.preview} alt="Foto de evidencia" fill sizes="144px" className="object-cover" />
            <button
              type="button"
              onClick={() => setPhoto(null)}
              disabled={loading}
              className="absolute right-1.5 top-1.5 inline-flex h-8 w-8 items-center justify-center rounded-full bg-black/60 text-white hover:bg-black/75"
              aria-label="Quitar foto"
            >
              <HugeiconsIcon icon={Cancel01Icon} size={16} strokeWidth={1.8} />
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => fileInput.current?.click()}
            disabled={loading}
            className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-dashed border-[#c8d0dc] px-4 text-sm font-semibold text-kadesh hover:bg-kadesh-50 disabled:opacity-50 dark:border-white/20 dark:hover:bg-kadesh/10"
          >
            <HugeiconsIcon icon={ImageAdd01Icon} size={18} strokeWidth={1.5} />
            Agregar foto
          </button>
        )}
        <input
          ref={fileInput}
          type="file"
          accept="image/*,.heic,.heif"
          className="hidden"
          onChange={(event) => {
            void pickPhoto(event.target.files?.[0]);
            event.target.value = '';
          }}
        />
      </div>

      <div className="flex gap-3 pt-1">
        <motion.button
          type="button"
          onClick={onCancel}
          disabled={loading}
          whileTap={motionPrefs.tap}
          className="min-h-11 flex-1 rounded-xl bg-[#f3f5f8] px-4 text-sm font-semibold text-[#121212] hover:bg-[#e6e9ef] disabled:opacity-50 dark:bg-night dark:text-[#eef1f6] dark:hover:bg-white/10"
        >
          {cancelLabel}
        </motion.button>
        <motion.button
          type="submit"
          disabled={loading}
          whileTap={loading ? undefined : motionPrefs.tap}
          className="min-h-11 flex-1 rounded-xl bg-kadesh px-4 text-sm font-semibold text-white hover:bg-kadesh-600 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loading ? 'Enviando…' : 'Enviar solicitud'}
        </motion.button>
      </div>
    </form>
  );
}
