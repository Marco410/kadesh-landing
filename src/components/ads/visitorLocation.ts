/**
 * Approximate location of the visitor (city level, by IP) for zone ads on blog and store. Asked
 * once a day per browser to the site's own worker (`/api/visitor-location`), never to the backend,
 * and only when a slot could show a zone ad. Never asks for the browser's GPS permission.
 */

const STORAGE_KEY = 'kadesh-ads-visitor-location';
const TTL_MS = 24 * 60 * 60 * 1000;

export type VisitorLocation = { lat: number; lng: number } | null;

let pending: Promise<VisitorLocation> | null = null;

function readStored(): { value: VisitorLocation; at: number } | null {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as { value: VisitorLocation; at: number };
    return typeof parsed?.at === 'number' ? parsed : null;
  } catch {
    return null;
  }
}

function store(value: VisitorLocation) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ value, at: Date.now() }));
  } catch {
    // Private mode or full storage: it is asked again next time.
  }
}

export function getVisitorLocation(): Promise<VisitorLocation> {
  if (typeof window === 'undefined') return Promise.resolve(null);
  const stored = readStored();
  if (stored && Date.now() - stored.at < TTL_MS) return Promise.resolve(stored.value);
  if (!pending) {
    pending = fetch('/api/visitor-location')
      .then((response) => (response.ok ? response.json() : null))
      .then((json: { lat?: number | null; lng?: number | null } | null) => {
        const value =
          typeof json?.lat === 'number' && typeof json?.lng === 'number' ? { lat: json.lat, lng: json.lng } : null;
        store(value);
        return value;
      })
      .catch(() => null)
      .finally(() => {
        pending = null;
      });
  }
  return pending;
}
