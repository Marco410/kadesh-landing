/** Espacio de rescate como lo ve su equipo en el panel. */
export interface RescueOrganization {
  id: string;
  name: string;
  slug?: string | null;
  type: string;
  description?: string | null;
  city?: string | null;
  state?: string | null;
  species?: string[] | null;
  capacity?: number | null;
  whatsapp?: string | null;
  email?: string | null;
  websiteUrl?: string | null;
  facebookUrl?: string | null;
  instagramUrl?: string | null;
  tiktokUrl?: string | null;
  donationUrl?: string | null;
  donationInfo?: string | null;
  needs?: string | null;
  status: string;
  statusNote?: string | null;
  verifiedAt?: string | null;
  isAlly?: boolean | null;
  allySince?: string | null;
  logo?: { url?: string | null } | null;
  cover?: { url?: string | null } | null;
  /** Rol de quien consulta (`admin`, `coordinator`, `volunteer`, `foster`) o null. */
  viewerRole?: string | null;
  publishedCount?: number | null;
  adoptedCount?: number | null;
  inAdoptionCount?: number | null;
  membersCount?: number | null;
  createdAt?: string | null;
}

export interface RescueMember {
  id: string;
  role: string;
  userName?: string | null;
  /** Solo para admins y coordinadores del espacio (o la propia persona). */
  userEmail?: string | null;
  isViewer: boolean;
  createdAt?: string | null;
}

export interface RescueOrganizationWithMembers extends RescueOrganization {
  members: RescueMember[];
}

/** Animal publicado a nombre del espacio (lista del panel). */
export interface RescueAnimalRow {
  id: string;
  slug?: string | null;
  name: string;
  createdAt?: string | null;
  user?: { id: string; name?: string | null } | null;
  animal_type?: { name?: string | null } | null;
  logs: Array<{ status: string; date_status?: string | null; city?: string | null }>;
  multimedia: Array<{ image?: { url?: string | null } | null }>;
  /** Ficha interna ligada (null si no tiene o si no la puedes ver). */
  pet?: { id: string } | null;
}

/** Ficha interna de un animal del espacio (`Pet` con `organization`), para la lista «Fichas». */
export interface RescuePetRow {
  id: string;
  name: string;
  status: string;
  stage?: string | null;
  /** "AAAA-MM-DD" */
  intakeDate?: string | null;
  animal_type?: { name?: string | null } | null;
  animal_breed?: { breed?: string | null } | null;
  multimedia: Array<{ image?: { url?: string | null } | null }>;
  fosterMember?: { id: string; userName?: string | null } | null;
  publicReport?: { id: string; slug?: string | null; logs: Array<{ status: string }> } | null;
  reminders: Array<{ id: string; title: string; dueDate: string }>;
}

/** Aliado de la portada (`rescueAllies`). Público, sin datos de contacto. */
export interface RescueAlly {
  id: string;
  name: string;
  slug?: string | null;
  type: string;
  city?: string | null;
  state?: string | null;
  logoUrl?: string | null;
  allySince?: string | null;
  publishedCount: number;
  adoptedCount: number;
}

/** Perfil público (`/organizaciones/<slug>`): solo organizaciones verificadas. */
export interface PublicRescueOrganization {
  id: string;
  name: string;
  slug: string;
  type: string;
  description?: string | null;
  city?: string | null;
  state?: string | null;
  species?: string[] | null;
  capacity?: number | null;
  whatsapp?: string | null;
  email?: string | null;
  websiteUrl?: string | null;
  facebookUrl?: string | null;
  instagramUrl?: string | null;
  tiktokUrl?: string | null;
  donationUrl?: string | null;
  donationInfo?: string | null;
  needs?: string | null;
  isAlly?: boolean | null;
  allySince?: string | null;
  verifiedAt?: string | null;
  logo?: { url?: string | null } | null;
  cover?: { url?: string | null } | null;
  publishedCount: number;
  adoptedCount: number;
  inAdoptionCount: number;
  updatedAt?: string | null;
}

/** Animal del perfil público (tarjetas). */
export interface PublicRescueAnimal {
  id: string;
  slug?: string | null;
  name: string;
  sex?: string | null;
  age?: string | null;
  animal_type?: { name?: string | null } | null;
  animal_breed?: { breed?: string | null } | null;
  logs: Array<{ status: string; date_status?: string | null; city?: string | null; state?: string | null }>;
  multimedia: Array<{ image?: { url?: string | null } | null }>;
}
