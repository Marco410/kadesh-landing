/**
 * Canonical origin of this app (KADESH Pet).
 * `www.kadesh.com.mx` / apex is the B2B SaaS — never use it as this site's canonical.
 */
const PET_ORIGIN = 'https://pet.kadesh.com.mx';
const B2B_HOSTS = new Set(['www.kadesh.com.mx', 'kadesh.com.mx']);

function resolveSiteUrl(): string {
  const raw = (process.env.NEXT_PUBLIC_SITE_URL || PET_ORIGIN).replace(/\/$/, '');

  try {
    const host = new URL(raw).hostname.toLowerCase();
    if (B2B_HOSTS.has(host)) {
      return PET_ORIGIN;
    }
  } catch {
    return PET_ORIGIN;
  }

  return raw;
}

export const SITE_URL = resolveSiteUrl();
