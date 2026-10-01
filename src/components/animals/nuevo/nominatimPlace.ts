/** Morelia, Michoacán. Centro del mapa cuando no hay ubicación del usuario. */
export const MORELIA_CENTER = { lat: 19.705, lng: -101.194 };

const CITY_KEYS = ['city', 'town', 'municipality', 'county'] as const;
const NEIGHBORHOOD_KEYS = [
  'suburb',
  'neighbourhood',
  'city_district',
  'quarter',
  'hamlet',
  'village',
] as const;

const STREET_LABEL =
  /^(calle|av\.?|avenida|blvd\.?|boulevard|carr\.?|carretera|camino|privada|cerrada|andador|prolongaci[oó]n)\b/i;
const COLONIA_PREFIX = /^(col\.?|colonia|fracc\.?|fraccionamiento|unidad)\s+/i;

export interface NominatimAddress {
  road?: string;
  house_number?: string;
  neighbourhood?: string;
  city?: string;
  town?: string;
  village?: string;
  municipality?: string;
  county?: string;
  city_district?: string;
  quarter?: string;
  suburb?: string;
  hamlet?: string;
  state?: string;
  country?: string;
  postcode?: string;
}

export interface ParsedPlace {
  address: string;
  city: string;
  state: string;
  country: string;
  neighborhood: string;
  postalCode: string;
}

export interface SearchHit extends ParsedPlace {
  id: string;
  label: string;
  lat: number;
  lng: number;
}

interface NominatimResult {
  lat: string;
  lon: string;
  display_name: string;
  address?: NominatimAddress;
}

function cleanAdmin(value: string) {
  return value.trim().replace(/^municipio de\s+/i, '').trim();
}

function firstOf(address: NominatimAddress, keys: readonly (keyof NominatimAddress)[]) {
  for (const key of keys) {
    const value = address[key];
    if (typeof value === 'string' && value.trim()) return cleanAdmin(value);
  }
  return '';
}

/**
 * La ciudad sale de ciudad/municipio. La colonia y el código postal se guardan
 * aparte: un CP de Tarímbaro no cambia el municipio, y la colonia no entra al título.
 */
export function parseNominatimPlace(data: NominatimResult): ParsedPlace {
  const address = data.address ?? {};
  const street =
    [address.road, address.house_number].filter(Boolean).join(' ') ||
    data.display_name.split(',')[0]?.trim() ||
    '';
  return {
    address: street,
    city: firstOf(address, CITY_KEYS),
    state: address.state?.trim() || '',
    country: address.country?.trim() || '',
    neighborhood: firstOf(address, NEIGHBORHOOD_KEYS),
    postalCode: address.postcode?.trim() || '',
  };
}

/** Texto que escribió quien reporta, para el título. No usa la colonia del geocodificador. */
export function placeLabelFromAddress(address: string): string {
  const parts = address
    .split(',')
    .map((part) => part.trim())
    .filter((part) => part && !/^\d{4,6}$/.test(part));
  if (!parts.length) return '';
  const colonia = parts.find((part) => COLONIA_PREFIX.test(part));
  const raw = colonia || parts.find((part) => !STREET_LABEL.test(part)) || parts[0];
  return raw.replace(COLONIA_PREFIX, '').trim();
}

export function cityHint(query: string): string {
  const parts = query.split(',').map((part) => part.trim()).filter(Boolean);
  if (parts.length < 2) return '';
  return parts[parts.length - 1];
}

function fold(value: string) {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();
}

export function hitMatchesHint(
  hit: Pick<SearchHit, 'city' | 'state' | 'neighborhood'>,
  hint: string,
) {
  const needle = fold(hint);
  if (!needle) return true;
  return [hit.city, hit.state, hit.neighborhood].some((part) => fold(part).includes(needle));
}

function tokenScore(label: string, query: string) {
  const tokens = fold(query)
    .split(/[^a-z0-9]+/)
    .filter((token) => token.length > 2);
  const haystack = fold(label);
  return tokens.reduce((score, token) => score + (haystack.includes(token) ? 1 : 0), 0);
}

function distanceKm(a: { lat: number; lng: number }, b: { lat: number; lng: number }) {
  const dx = (a.lat - b.lat) * 111;
  const dy = (a.lng - b.lng) * 111 * Math.cos((b.lat * Math.PI) / 180);
  return Math.hypot(dx, dy);
}

export function rankSearchHits(hits: SearchHit[], query: string, bias: { lat: number; lng: number }) {
  const hint = cityHint(query);
  const ranked = [...hits].sort((a, b) => {
    const hintDelta = Number(hitMatchesHint(b, hint)) - Number(hitMatchesHint(a, hint));
    if (hint && hintDelta) return hintDelta;
    const tokenDelta = tokenScore(b.label, query) - tokenScore(a.label, query);
    if (tokenDelta) return tokenDelta;
    return distanceKm(a, bias) - distanceKm(b, bias);
  });
  if (hint) {
    const matching = ranked.filter((hit) => hitMatchesHint(hit, hint));
    return matching.slice(0, 5);
  }
  return ranked.slice(0, 5);
}

function viewbox(bias: { lat: number; lng: number }) {
  const delta = 0.55;
  return `${bias.lng - delta},${bias.lat + delta},${bias.lng + delta},${bias.lat - delta}`;
}

const NOMINATIM_HEADERS = {
  'Accept-Language': 'es',
  'User-Agent': 'KadeshPet/1.0 (https://pet.kadesh.com.mx)',
};

export async function searchNominatim(
  query: string,
  bias: { lat: number; lng: number } = MORELIA_CENTER,
): Promise<SearchHit[]> {
  const url =
    `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}` +
    `&format=json&addressdetails=1&limit=10&countrycodes=mx&viewbox=${viewbox(bias)}&bounded=0`;
  const res = await fetch(url, { headers: NOMINATIM_HEADERS });
  if (!res.ok) return [];
  const data: NominatimResult[] = await res.json();
  const hits = data.map((item, index) => {
    const parsed = parseNominatimPlace(item);
    return {
      id: `${item.lat}-${item.lon}-${index}`,
      label: item.display_name,
      lat: parseFloat(item.lat),
      lng: parseFloat(item.lon),
      ...parsed,
    };
  });
  return rankSearchHits(hits, query, bias);
}

export async function reverseGeocodeNominatim(
  latitude: number,
  longitude: number,
): Promise<ParsedPlace | null> {
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json&addressdetails=1`,
      { headers: NOMINATIM_HEADERS },
    );
    if (!res.ok) return null;
    const data: NominatimResult = await res.json();
    return parseNominatimPlace(data);
  } catch {
    return null;
  }
}
