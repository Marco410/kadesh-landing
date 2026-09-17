import { kadeshWhatsAppUrl } from "kadesh/utils/kadeshWhatsApp";
import { claimRoleLabel } from "./constants";
import { Routes } from "kadesh/core/routes";

export function placePublicUrl(place: { id: string; slug?: string | null }): string {
  const path = Routes.veterinaries.detail(place.slug || place.id);
  if (typeof window === "undefined") return path;
  return `${window.location.origin}${path}`;
}

export function claimWhatsAppUrl(input: {
  placeName: string;
  placeId: string;
  role: string;
  phone: string;
  notes?: string;
}): string {
  const lines = [
    `Hola, quiero reclamar la ficha de ${input.placeName} en KADESH.`,
    "",
    `ID: ${input.placeId}`,
    `Soy ${claimRoleLabel(input.role)} de la clínica.`,
    `Teléfono: ${input.phone}`,
  ];
  if (input.notes?.trim()) {
    lines.push(`Cómo lo compruebo: ${input.notes.trim()}`);
  }
  lines.push("", "Quedo atento para validar que es mía.");
  return kadeshWhatsAppUrl(lines.join("\n"));
}

export function disputeClaimWhatsAppUrl(place: {
  name: string;
  id: string;
  slug?: string | null;
}): string {
  return kadeshWhatsAppUrl(
    [
      `Hola, vi la ficha de ${place.name} en KADESH.`,
      "Dice que alguien ya la pidió y creo que es un error.",
      placePublicUrl(place),
      "",
      "¿Me pueden ayudar a revisarlo?",
    ].join("\n"),
  );
}
