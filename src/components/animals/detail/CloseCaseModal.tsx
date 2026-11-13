'use client';

import { useState } from 'react';
import { useMutation } from '@apollo/client';
import { motion } from 'framer-motion';
import { sileo } from 'sileo';
import { Sheet } from 'kadesh/components/shared';
import { useUiMotion } from 'kadesh/components/shared/motion';
import { friendlyErrorText } from 'kadesh/utils/errorText';
import ChoiceChip from '../nuevo/ChoiceChip';
import {
  ANIMAL_OUTCOME_OPTIONS,
  HELPED_BY_KADESH_OPTIONS,
  OUTCOME_CHANNEL_OPTIONS,
  type AnimalOutcome,
} from '../constants';
import {
  CLOSE_ANIMAL_REPORT_MUTATION,
  type CloseAnimalReportResponse,
  type CloseAnimalReportVariables,
} from '../queries';
import { capitalizeFirst } from '../animalName';

const MAX_STORY = 1000;
/** Desenlaces con hogar: solo en esos tiene sentido contar la historia para la portada. */
const HOME_OUTCOMES: AnimalOutcome[] = ['reunited', 'adopted', 'other_home'];

interface CloseCaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onClosed: () => void | Promise<void>;
  animalId: string;
  /** Nombre para usar en una frase: el nombre, o «esta perra» (`animalSentenceName`). */
  animalName: string;
  /** `lost`: la pregunta es «¿volvió a casa?»; en los demás, «¿encontró hogar?». */
  status: string;
}

function Question({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <fieldset className="space-y-2">
      <legend className="mb-2 text-sm font-semibold text-[#121212] dark:text-[#eef1f6]">{title}</legend>
      <div className="flex flex-wrap gap-2">{children}</div>
    </fieldset>
  );
}

/**
 * «Cerrar caso»: cómo terminó, si Kadesh ayudó y por dónde, y una historia opcional para la
 * portada (solo con permiso). Lo guarda `closeAnimalReport`, que también deja la bitácora final.
 * Estas respuestas alimentan el contador de reencuentros y adopciones.
 */
export default function CloseCaseModal({
  isOpen,
  onClose,
  onClosed,
  animalId,
  animalName,
  status,
}: CloseCaseModalProps) {
  const motionPrefs = useUiMotion();
  const [outcome, setOutcome] = useState<AnimalOutcome | null>(null);
  const [helped, setHelped] = useState<string | null>(null);
  const [channel, setChannel] = useState<string | null>(null);
  const [story, setStory] = useState('');
  const [storyConsent, setStoryConsent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [closeReport, { loading }] = useMutation<CloseAnimalReportResponse, CloseAnimalReportVariables>(
    CLOSE_ANIMAL_REPORT_MUTATION,
  );

  const name = animalName || 'este animal';
  const Name = capitalizeFirst(name);
  const isLost = status === 'lost';
  // A un perdido no se le «adopta»; a uno encontrado o en adopción no se le «reencuentra» con quien lo halló.
  const outcomeOptions = ANIMAL_OUTCOME_OPTIONS.filter((option) =>
    isLost ? option.value !== 'adopted' : true,
  );
  const hasHome = outcome !== null && HOME_OUTCOMES.includes(outcome);

  const reset = () => {
    setOutcome(null);
    setHelped(null);
    setChannel(null);
    setStory('');
    setStoryConsent(false);
    setError(null);
  };

  const handleClose = () => {
    if (loading) return;
    reset();
    onClose();
  };

  const handleSubmit = async () => {
    if (!outcome) {
      setError('Elige cómo terminó el caso.');
      return;
    }
    setError(null);
    try {
      const result = await closeReport({
        variables: {
          input: {
            animalId,
            outcome,
            helpedByKadesh: hasHome ? helped : null,
            outcomeChannel: hasHome && helped === 'yes' ? channel : null,
            story: hasHome ? story.trim() || null : null,
            storyConsent: hasHome && Boolean(story.trim()) && storyConsent,
          },
        },
      });
      const payload = result.data?.closeAnimalReport;
      if (!payload?.success) {
        setError(payload?.message || 'No se pudo cerrar el caso. Intenta de nuevo.');
        return;
      }
      sileo.success({ title: payload.message });
      reset();
      onClose();
      await onClosed();
    } catch (err) {
      setError(friendlyErrorText(err, 'No se pudo cerrar el caso. Intenta de nuevo.'));
    }
  };

  return (
    <Sheet
      isOpen={isOpen}
      title={`Cerrar el caso de ${name}`}
      onClose={handleClose}
      busy={loading}
      footer={
        <div className="flex gap-3">
          <motion.button
            type="button"
            onClick={handleClose}
            disabled={loading}
            whileTap={motionPrefs.tap}
            className="min-h-11 flex-1 rounded-xl bg-[#f3f5f8] px-4 text-sm font-semibold text-[#121212] hover:bg-[#e6e9ef] disabled:opacity-50 dark:bg-night dark:text-[#eef1f6] dark:hover:bg-white/10"
          >
            Cancelar
          </motion.button>
          <motion.button
            type="button"
            onClick={handleSubmit}
            disabled={loading || !outcome}
            whileTap={loading ? undefined : motionPrefs.tap}
            className="min-h-11 flex-1 rounded-xl bg-kadesh px-4 text-sm font-semibold text-white hover:bg-kadesh-600 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? 'Guardando…' : 'Cerrar caso'}
          </motion.button>
        </div>
      }
    >
      <div className="space-y-6">
        {error ? (
          <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700 dark:border-red-800 dark:bg-red-950/40 dark:text-red-300">
            {error}
          </div>
        ) : null}

        <Question title={isLost ? `¿${Name} volvió a casa?` : `¿Qué pasó con ${name}?`}>
          {outcomeOptions.map((option) => (
            <ChoiceChip
              key={option.value}
              label={option.label}
              selected={outcome === option.value}
              onSelect={() => setOutcome(option.value)}
            />
          ))}
        </Question>

        {hasHome ? (
          <>
            <Question title="¿Kadesh ayudó a que pasara?">
              {HELPED_BY_KADESH_OPTIONS.map((option) => (
                <ChoiceChip
                  key={option.value}
                  label={option.label}
                  selected={helped === option.value}
                  onSelect={() => setHelped(option.value)}
                />
              ))}
            </Question>

            {helped === 'yes' ? (
              <Question title="¿Por dónde?">
                {OUTCOME_CHANNEL_OPTIONS.map((option) => (
                  <ChoiceChip
                    key={option.value}
                    label={option.label}
                    selected={channel === option.value}
                    onSelect={() => setChannel(option.value)}
                  />
                ))}
              </Question>
            ) : null}

            <div>
              <label
                htmlFor="close-case-story"
                className="mb-2 block text-sm font-semibold text-[#121212] dark:text-[#eef1f6]"
              >
                Cuéntanos cómo fue <span className="font-normal text-[#5a5a5a] dark:text-[#9aa3b2]">(opcional)</span>
              </label>
              <textarea
                id="close-case-story"
                value={story}
                onChange={(event) => setStory(event.target.value.slice(0, MAX_STORY))}
                rows={3}
                className="w-full resize-none rounded-xl border border-[#d8dee8] bg-[#f7f8fa] px-3 py-2 text-[#121212] placeholder:text-[#5a5a5a] focus:border-kadesh focus:outline-none focus:ring-2 focus:ring-kadesh/30 dark:border-white/12 dark:bg-night dark:text-[#eef1f6]"
                placeholder="Dónde apareció, quién ayudó, cómo está ahora…"
              />
              {story.trim() ? (
                <label className="mt-2 flex items-start gap-2 text-sm text-[#3a3a3a] dark:text-[#d0d0d0]">
                  <input
                    type="checkbox"
                    checked={storyConsent}
                    onChange={(event) => setStoryConsent(event.target.checked)}
                    className="mt-0.5 h-4 w-4 rounded border-[#d8dee8] text-kadesh focus:ring-kadesh"
                  />
                  Kadesh puede publicar mi historia con la foto de {name}.
                </label>
              ) : null}
            </div>
          </>
        ) : null}
      </div>
    </Sheet>
  );
}
