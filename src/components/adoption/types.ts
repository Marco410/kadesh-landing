import type { ADOPTION_STATUS } from './constants';

export type AdoptionApplicationStatus = (typeof ADOPTION_STATUS)[keyof typeof ADOPTION_STATUS];

export type AdoptionHousing = 'house' | 'apartment' | 'other';
export type AdoptionHousingOwnership = 'own' | 'rent' | 'family';

/** Respuestas del formulario. Es el JSON `answers` de `AdoptionApplication`. */
export interface AdoptionAnswers {
  housing?: AdoptionHousing | string | null;
  housingOwnership?: AdoptionHousingOwnership | string | null;
  /** Solo cuando renta; null si no aplica. */
  petsAllowed?: boolean | null;
  hasYard?: boolean | null;
  hasChildren?: boolean | null;
  otherPets?: string | null;
  hoursAlone?: number | null;
  experience?: string | null;
  commitSterilization?: boolean | null;
  acceptsFollowUp?: boolean | null;
}

/** Animal de la solicitud. `organization` solo si se publicó a nombre de un espacio de rescate. */
export interface AdoptionApplicationAnimal {
  id: string;
  name: string;
  slug?: string | null;
  organization?: { id: string; name: string } | null;
}

/** Solicitud como la ven quien cuida al animal (o su equipo). */
export interface AdoptionApplication {
  id: string;
  status: AdoptionApplicationStatus | string;
  applicantName?: string | null;
  applicantEmail?: string | null;
  phone?: string | null;
  message?: string | null;
  /** JSON del API; puede llegar como texto si algún cliente lo serializa. */
  answers?: AdoptionAnswers | string | null;
  decisionNote?: string | null;
  decidedAt?: string | null;
  createdAt: string;
  updatedAt?: string | null;
  animal?: AdoptionApplicationAnimal | null;
  /** Ficha que recibió quien adoptó (después de completar). */
  pet?: { id: string } | null;
}

/** La solicitud propia de quien quiere adoptar (lo mínimo para el aviso de la ficha). */
export interface MyAdoptionApplication {
  id: string;
  status: AdoptionApplicationStatus | string;
  decisionNote?: string | null;
  decidedAt?: string | null;
  createdAt: string;
}

/** Animal de una solicitud propia (perfil «Adopciones»). `organization` solo si es de un espacio verificado. */
export interface MyAdoptionApplicationAnimal {
  id: string;
  name: string;
  slug?: string | null;
  sex?: string | null;
  multimedia?: Array<{ image?: { url?: string | null } | null }> | null;
  organization?: { id: string; name: string; slug?: string | null } | null;
}

/** Fila de «Adopciones» en el perfil. */
export interface MyAdoptionApplicationRow {
  id: string;
  status: AdoptionApplicationStatus | string;
  decidedAt?: string | null;
  createdAt: string;
  updatedAt?: string | null;
  animal?: MyAdoptionApplicationAnimal | null;
}

/** Detalle de una solicitud propia: lo que respondió y cómo va. */
export interface MyAdoptionApplicationDetail extends MyAdoptionApplicationRow {
  phone?: string | null;
  message?: string | null;
  answers?: AdoptionAnswers | string | null;
  decisionNote?: string | null;
  applicant?: { id: string } | null;
  /** Cartilla que recibió al completarse la adopción. */
  pet?: { id: string } | null;
}

/** `AdoptionApplicationInput` del backend. */
export interface AdoptionApplicationInput {
  phone: string;
  message: string;
  housing: AdoptionHousing;
  housingOwnership: AdoptionHousingOwnership;
  petsAllowed: boolean | null;
  hasYard: boolean;
  hasChildren: boolean;
  otherPets: string | null;
  hoursAlone: number;
  experience: string | null;
  commitSterilization: boolean;
  acceptsFollowUp: boolean;
}

/** Estados a los que lleva `reviewAdoptionApplication`. */
export type AdoptionReviewStatus = 'in_review' | 'approved' | 'rejected';
