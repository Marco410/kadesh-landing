import { petErrorMessage } from 'kadesh/components/pets/utils';
import { normalizeMxPhone } from 'kadesh/utils/phone';
import { ADOPTION_HOUSING_OPTIONS, ADOPTION_OWNERSHIP_OPTIONS } from './constants';
import type { AdoptionAnswers, AdoptionApplication } from './types';

/** `answers` es un JSON: normalmente llega como objeto, pero se acepta texto por si acaso. */
export function parseAdoptionAnswers(raw: AdoptionApplication['answers']): AdoptionAnswers {
  if (!raw) return {};
  if (typeof raw === 'string') {
    try {
      const parsed = JSON.parse(raw) as unknown;
      return parsed && typeof parsed === 'object' ? (parsed as AdoptionAnswers) : {};
    } catch {
      return {};
    }
  }
  return raw;
}

function yesNo(value: boolean | null | undefined): string {
  if (value == null) return 'no respondió';
  return value ? 'sí' : 'no';
}

/** Sus respuestas en renglones cortos para quien revisa: «Vivienda», «Patio: sí», «Solo 4 h al día»… */
export function adoptionAnswerFacts(answers: AdoptionAnswers): Array<{ label: string; value: string }> {
  const facts: Array<{ label: string; value: string }> = [];
  const housing = ADOPTION_HOUSING_OPTIONS.find((option) => option.value === answers.housing)?.label;
  const ownership = ADOPTION_OWNERSHIP_OPTIONS.find((option) => option.value === answers.housingOwnership)?.review;
  if (housing || ownership) {
    facts.push({
      label: 'Vivienda',
      value: [housing ?? 'Sin tipo', ownership].filter(Boolean).join(', '),
    });
  }
  if (answers.housingOwnership === 'rent') {
    facts.push({
      label: 'Renta',
      value:
        answers.petsAllowed == null
          ? 'no dijo si permiten mascotas'
          : answers.petsAllowed
            ? 'sí permiten mascotas'
            : 'no permiten mascotas',
    });
  }
  facts.push({ label: 'Patio o jardín', value: yesNo(answers.hasYard) });
  facts.push({ label: 'Niños en casa', value: yesNo(answers.hasChildren) });
  if (typeof answers.hoursAlone === 'number') {
    facts.push({
      label: 'Tiempo solo',
      value: answers.hoursAlone === 0 ? 'casi nunca se quedaría solo' : `${answers.hoursAlone} h al día`,
    });
  }
  return facts;
}

/** Compromisos que aceptó al enviar (siempre los dos, el backend los exige). */
export function adoptionCommitments(answers: AdoptionAnswers): string[] {
  const list: string[] = [];
  if (answers.commitSterilization) list.push('Se compromete a esterilizarlo si aún no lo está.');
  if (answers.acceptsFollowUp) list.push('Acepta que le contacten para dar seguimiento después de la adopción.');
  return list;
}

/** 10 dígitos o null si el teléfono guardado no es válido. */
export function adoptionPhoneDigits(phone: string | null | undefined): string | null {
  if (!phone) return null;
  const result = normalizeMxPhone(phone);
  return result.ok ? result.digits : null;
}

/** «443 521 5638». */
export function formatMxPhone(digits: string): string {
  return digits.replace(/^(\d{3})(\d{3})(\d{4})$/, '$1 $2 $3');
}

export function firstName(name: string | null | undefined): string {
  return name?.trim().split(/\s+/)[0] || '';
}

/** WhatsApp a quien envió la solicitud, con un saludo que dice de dónde viene. */
export function adoptionWhatsAppUrl(digits: string, applicantName: string | null | undefined, animalName: string | null | undefined): string {
  const name = firstName(applicantName);
  const text = `Hola${name ? `, ${name}` : ''}. Te escribo de KADESH por tu solicitud para adoptar a ${animalName?.trim() || 'nuestro animal'}.`;
  return `https://wa.me/52${digits}?text=${encodeURIComponent(text)}`;
}

/** Nombre a mostrar del animal (los reportes sin nombre dicen «Sin nombre»). */
export function adoptionAnimalName(name: string | null | undefined): string {
  const clean = name?.trim();
  return clean && clean !== 'Sin nombre' ? clean : 'este animal';
}

/**
 * Mensaje de un error de red o de GraphQL para la persona: el motivo en español del backend
 * (también el de una validación de Keystone); lo técnico se cambia por `fallback`.
 */
export function adoptionErrorMessage(error: unknown, fallback: string): string {
  return petErrorMessage(error, fallback);
}
