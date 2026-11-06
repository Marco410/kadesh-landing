import { petErrorMessage } from 'kadesh/components/pets/utils';
import { normalizeMxPhone } from 'kadesh/utils/phone';
import { ADOPTION_HOUSING_OPTIONS, ADOPTION_OWNERSHIP_OPTIONS, ADOPTION_STATUS } from './constants';
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

/** Qué le decimos a quien envió la solicitud, según su estado (aviso de la ficha y su detalle). */
export function adoptionApplicantCopy(status: string, name: string): string {
  switch (status) {
    case ADOPTION_STATUS.IN_REVIEW:
      return `Quien cuida a ${name} está revisando tu solicitud. Puede que te llame o te escriba para conocerte.`;
    case ADOPTION_STATUS.APPROVED:
      return `¡Aprobaron tu solicitud! Quien cuida a ${name} te contactará para coordinar la adopción.`;
    case ADOPTION_STATUS.REJECTED:
      return `Esta vez no aprobaron tu solicitud. Gracias por querer darle un hogar a ${name}.`;
    case ADOPTION_STATUS.WITHDRAWN:
      return `Retiraste tu solicitud. Si cambias de opinión, puedes enviar otra.`;
    case ADOPTION_STATUS.CLOSED:
      return `Tu solicitud se cerró. Gracias por querer darle un hogar a ${name}.`;
    case ADOPTION_STATUS.COMPLETED:
      return `¡Adoptaste a ${name}! Gracias por darle un hogar.`;
    default:
      return `Enviaste tu solicitud. Te avisaremos cuando quien cuida a ${name} la revise.`;
  }
}

/** «6 nov 2026». */
export function adoptionShortDate(iso: string | null | undefined): string {
  if (!iso) return '';
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return '';
  return date.toLocaleDateString('es-MX', { day: 'numeric', month: 'short', year: 'numeric' });
}

/** Se editó después de enviarla (más de un minuto entre `createdAt` y `updatedAt`). */
export function adoptionWasEdited(createdAt: string | null | undefined, updatedAt: string | null | undefined): boolean {
  if (!createdAt || !updatedAt) return false;
  return new Date(updatedAt).getTime() - new Date(createdAt).getTime() > 60_000;
}

export type AdoptionStepState = 'done' | 'current' | 'upcoming' | 'stopped';

export interface AdoptionStep {
  key: string;
  title: string;
  detail: string;
  state: AdoptionStepState;
  date?: string | null;
}

/**
 * Pasos del proceso para quien envió la solicitud: Enviada → En revisión → Aprobada → Adopción.
 * Solo hay fecha de envío y de la última decisión (`decidedAt`); los pasos intermedios ya pasados
 * van sin fecha. Si terminó sin adopción (no aprobada, retirada, cerrada), el último paso lo dice.
 */
export function adoptionSteps(
  application: { status: string; createdAt: string; decidedAt?: string | null },
  name: string,
): AdoptionStep[] {
  const { status, createdAt, decidedAt } = application;
  const sent: AdoptionStep = {
    key: 'sent',
    title: 'Enviaste tu solicitud',
    detail: 'Mientras nadie la revise, la puedes editar.',
    state: 'done',
    date: createdAt,
  };
  const stopped: Record<string, Omit<AdoptionStep, 'key' | 'state' | 'date'>> = {
    [ADOPTION_STATUS.REJECTED]: {
      title: 'No la aprobaron',
      detail: `Gracias por querer darle un hogar a ${name}. Hay más animales esperando familia.`,
    },
    [ADOPTION_STATUS.WITHDRAWN]: { title: 'La retiraste', detail: 'Si cambias de opinión, puedes enviar otra mientras siga en adopción.' },
    [ADOPTION_STATUS.CLOSED]: { title: 'Se cerró', detail: `${name.charAt(0).toUpperCase()}${name.slice(1)} encontró familia por otra vía.` },
  };
  if (stopped[status]) {
    return [{ ...sent, detail: '' }, { key: 'end', ...stopped[status], state: 'stopped', date: decidedAt }];
  }

  const order = [ADOPTION_STATUS.SUBMITTED, ADOPTION_STATUS.IN_REVIEW, ADOPTION_STATUS.APPROVED, ADOPTION_STATUS.COMPLETED];
  const reached = Math.max(0, order.indexOf(status as (typeof order)[number]));
  const stateFor = (index: number): AdoptionStepState =>
    index <= reached ? 'done' : index === reached + 1 ? 'current' : 'upcoming';
  return [
    { ...sent, detail: status === ADOPTION_STATUS.SUBMITTED ? sent.detail : '' },
    {
      key: 'review',
      title: 'En revisión',
      detail: `Quien cuida a ${name} lee tu solicitud y puede llamarte o escribirte para conocerte.`,
      state: stateFor(1),
      date: status === ADOPTION_STATUS.IN_REVIEW ? decidedAt : null,
    },
    {
      key: 'approved',
      title: 'Aprobada',
      detail: 'Te contactan para coordinar la entrega.',
      state: stateFor(2),
      date: status === ADOPTION_STATUS.APPROVED ? decidedAt : null,
    },
    {
      key: 'adopted',
      title: 'Llega a casa',
      detail: 'Al entregártelo, su cartilla pasa a tu cuenta.',
      state: stateFor(3),
      date: status === ADOPTION_STATUS.COMPLETED ? decidedAt : null,
    },
  ];
}
