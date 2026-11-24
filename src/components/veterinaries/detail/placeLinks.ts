import type { PetPlaceDetail } from "../types";

function digits(value: string): string {
  return value.replace(/\D/g, "");
}

export function httpUrl(value: string): string {
  const trimmed = value.trim();
  if (!trimmed) return "";
  return /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
}

export function hasCoords(place: Pick<PetPlaceDetail, "lat" | "lng">): boolean {
  return !Number.isNaN(parseFloat(place.lat)) && !Number.isNaN(parseFloat(place.lng));
}

/** Every way to reach the clinic, already turned into links. Empty values are `null`. */
export function placeLinks(place: PetPlaceDetail) {
  const phone = place.phone?.trim() || null;
  const whatsapp = place.whatsapp?.trim() || null;
  const email = place.email?.trim() || null;
  const website = place.website?.trim() || null;
  const street = place.street?.trim() || place.address?.trim() || "";
  const locality = [place.municipality, place.state].filter(Boolean).join(", ");
  const postal = place.cp?.trim() ? `C.P. ${place.cp.trim()}` : "";

  return {
    phone,
    phoneHref: phone ? `tel:${phone.replace(/\s/g, "")}` : null,
    whatsapp,
    whatsappHref: whatsapp ? `https://wa.me/${digits(whatsapp)}` : null,
    email,
    emailHref: email ? `mailto:${email}` : null,
    website,
    websiteHref: website ? httpUrl(website) : null,
    street: street || null,
    locality: locality || null,
    postal: postal || null,
    directionsHref: hasCoords(place)
      ? `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(`${place.lat},${place.lng}`)}&travelmode=driving`
      : null,
  };
}

export type PlaceLinks = ReturnType<typeof placeLinks>;
