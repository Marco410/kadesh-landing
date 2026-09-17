export const PET_PLACE_CLAIM_STATUS = {
  UNCLAIMED: "unclaimed",
  PENDING: "pending",
  VERIFIED: "verified",
  REJECTED: "rejected",
} as const;

export type PetPlaceClaimStatus =
  (typeof PET_PLACE_CLAIM_STATUS)[keyof typeof PET_PLACE_CLAIM_STATUS];

export const PET_PLACE_CLAIM_ROLE = {
  OWNER: "owner",
  MANAGER: "manager",
  VET: "vet",
} as const;

export type PetPlaceClaimRole =
  (typeof PET_PLACE_CLAIM_ROLE)[keyof typeof PET_PLACE_CLAIM_ROLE];

export const CLAIM_ROLE_OPTIONS: Array<{
  value: PetPlaceClaimRole;
  label: string;
}> = [
  { value: PET_PLACE_CLAIM_ROLE.OWNER, label: "Propietario" },
  { value: PET_PLACE_CLAIM_ROLE.MANAGER, label: "Encargado" },
  { value: PET_PLACE_CLAIM_ROLE.VET, label: "Veterinario" },
];

export function claimRoleLabel(role: string | null | undefined): string {
  return CLAIM_ROLE_OPTIONS.find((option) => option.value === role)?.label ?? "del equipo";
}

export const CLAIM_BENEFITS = [
  "Horarios reales y si atienden urgencias",
  "Teléfono, WhatsApp y correo de la clínica",
  "Redes (Instagram, Facebook y más)",
  "Dirección y cómo llegar",
  "Sitio web, cita previa y estacionamiento",
] as const;

export const SOCIAL_MEDIA_OPTIONS = [
  "Facebook",
  "Instagram",
  "X",
  "LinkedIn",
  "TikTok",
] as const;

export type SocialMediaNetwork = (typeof SOCIAL_MEDIA_OPTIONS)[number];
