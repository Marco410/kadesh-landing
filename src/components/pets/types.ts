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
}
