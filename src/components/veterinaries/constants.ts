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

export const TYPES_PET_PLACE = [
  { label: "Veterinaria", plural: "Veterinarias", value: "veterinary" },
  { label: "Refugio", plural: "Refugios", value: "pet_shelter" },
  { label: "Tienda", plural: "Tiendas", value: "pet_store" },
  {
    label: "Hotel/Guardería",
    plural: "Hoteles/Guarderías",
    value: "pet_boarding",
  },
  { label: "Parque", plural: "Parques", value: "pet_park" },
  { label: "Otro", plural: "Otros", value: "other" },
] as const;

export type PetPlaceTypeValue = (typeof TYPES_PET_PLACE)[number]["value"];

export function isPetPlaceTypeValue(value: string): value is PetPlaceTypeValue {
  return TYPES_PET_PLACE.some((type) => type.value === value);
}

export function petPlaceTypeLabel(type: {
  label?: string | null;
  value?: string | null;
}): string {
  const fromCatalog = TYPES_PET_PLACE.find(
    (option) => option.value === type.value,
  )?.label;
  return type.label?.trim() || fromCatalog || "";
}

export function formatPetPlaceTypeLabels(
  types:
    | Array<{ label?: string | null; value?: string | null }>
    | null
    | undefined,
): string {
  return (types ?? [])
    .map(petPlaceTypeLabel)
    .filter(Boolean)
    .join(" · ");
}

export const PET_PLACE_WEEKDAYS = [
  { label: "Lunes", value: "Lunes" },
  { label: "Martes", value: "Martes" },
  { label: "Miércoles", value: "Miércoles" },
  { label: "Jueves", value: "Jueves" },
  { label: "Viernes", value: "Viernes" },
  { label: "Sábado", value: "Sábado" },
  { label: "Domingo", value: "Domingo" },
] as const;

export const PET_PLACE_HOUR_OPTIONS = Array.from({ length: 24 }, (_, hour) => ({
  value: hour,
  label: `${String(hour).padStart(2, "0")}:00`,
}));
