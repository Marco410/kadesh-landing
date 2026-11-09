export interface PetImage {
  id: string;
  order?: number | null;
  image?: { url: string } | null;
}

export interface PetReminder {
  id: string;
  title: string;
  /** "AAAA-MM-DD" */
  dueDate: string;
  notifyDaysBefore: number;
  channels: string[] | null;
  status: string;
  sentAt?: string | null;
  healthRecord?: { id: string; type: string; name: string } | null;
}

export interface PetHealthRecord {
  id: string;
  type: string;
  name: string;
  appliedDate: string;
  nextDueDate?: string | null;
  notes?: string | null;
  verifiedByVet?: boolean | null;
  veterinary?: { id: string; name: string } | null;
  attachments: PetImage[];
}

export interface PetOwner {
  id: string;
  role: string;
  userName?: string | null;
  /** Solo viene para la propia fila: el `User` de los demás no es visible. */
  user?: { id: string } | null;
}

export interface PetSummary {
  id: string;
  name: string;
  status: string;
  birthday?: string | null;
  approximateAge?: string | null;
  age?: string | null;
  animal_type?: { id: string; name: string } | null;
  animal_breed?: { id: string; breed: string } | null;
  multimedia: PetImage[];
  lostReport?: { id: string; slug?: string | null } | null;
  reminders: Pick<PetReminder, 'id' | 'title' | 'dueDate'>[];
}

export interface PetDetail extends Omit<PetSummary, 'reminders'> {
  sex?: string | null;
  color?: string | null;
  distinctiveMarks?: string | null;
  weightKg?: string | null;
  sterilized?: string | null;
  microchipNumber?: string | null;
  owners: PetOwner[];
  healthRecords: PetHealthRecord[];
  reminders: PetReminder[];
  /**
   * Con qué rol entra quien consulta: `principal` / `family` (dueños) o su rol en el equipo del
   * espacio de rescate (`admin`, `coordinator`, `volunteer`, `foster`). Lo calcula el backend.
   */
  viewerRole?: string | null;
  /** Ficha interna de un espacio de rescate (sin dueños hasta que se adopta). */
  organization?: { id: string; name: string } | null;
  /** Etapa en el espacio (`PET_RESCUE_STAGE`); solo fichas de un espacio. */
  stage?: string | null;
  /** "AAAA-MM-DD" */
  intakeDate?: string | null;
  /** Hogar temporal: alguien del equipo del espacio. */
  fosterMember?: { id: string; userName?: string | null } | null;
  /** Reporte público ligado a la ficha, con su último estado. */
  publicReport?: { id: string; slug?: string | null; logs: { status: string }[] } | null;
  /** Espacio del que se adoptó (cartilla de la familia). */
  adoptedFromOrganization?: { id: string; name: string; slug?: string | null } | null;
  adoptedAt?: string | null;
}

/** Código para traspasar la mascota a otra cuenta (`createPetTransferCode`). */
export interface PetTransferCode {
  id: string;
  /** Sin guion: «7KQ2M9XA». Se muestra «7KQ2-M9XA». */
  code: string;
  status: string;
  expiresAt: string;
  isExpired?: boolean | null;
  message?: string | null;
}

/** Lo que ve quien recibe antes de aceptar (`previewPetTransferCode`). */
export interface PetTransferPreview {
  success: boolean;
  message: string;
  petName?: string | null;
  /** Valor de `AnimalType.name` (dog, cat…). */
  species?: string | null;
  breed?: string | null;
  photoUrl?: string | null;
  fromName?: string | null;
  fromOrganization?: boolean | null;
  transferMessage?: string | null;
  expiresAt?: string | null;
}
