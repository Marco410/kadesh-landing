import {
  Facebook01Icon,
  Globe02Icon,
  InstagramIcon,
  NewTwitterIcon,
  TiktokIcon,
} from '@hugeicons/core-free-icons';
import type { IconSvgElement } from '@hugeicons/react';
import type { PetEvent } from './types';

/**
 * Redes del evento. Mismas reglas que kadesh-back (`PET_EVENT_SOCIAL_NETWORKS` y
 * `normalizeSocialUrl`): se acepta el link o el usuario (`@refugio`) y se guarda el link.
 */

export type EventSocialField = 'facebookUrl' | 'instagramUrl' | 'tiktokUrl' | 'xUrl' | 'websiteUrl';

type SocialConfig = {
  field: EventSocialField;
  label: string;
  icon: IconSvgElement;
  placeholder: string;
  /** Dominios válidos; vacío = cualquier link (sitio web). */
  hosts: readonly string[];
  profileBase: string | null;
};

export const EVENT_SOCIAL_LINKS: readonly SocialConfig[] = [
  {
    field: 'facebookUrl',
    label: 'Facebook',
    icon: Facebook01Icon,
    placeholder: 'facebook.com/tu-pagina o el link del evento',
    hosts: ['facebook.com', 'fb.com', 'fb.me'],
    profileBase: 'https://www.facebook.com/',
  },
  {
    field: 'instagramUrl',
    label: 'Instagram',
    icon: InstagramIcon,
    placeholder: '@tu_cuenta',
    hosts: ['instagram.com'],
    profileBase: 'https://www.instagram.com/',
  },
  {
    field: 'tiktokUrl',
    label: 'TikTok',
    icon: TiktokIcon,
    placeholder: '@tu_cuenta',
    hosts: ['tiktok.com'],
    profileBase: 'https://www.tiktok.com/@',
  },
  { field: 'xUrl', label: 'X', icon: NewTwitterIcon, placeholder: '@tu_cuenta', hosts: ['x.com', 'twitter.com'], profileBase: 'https://x.com/' },
  { field: 'websiteUrl', label: 'Sitio web', icon: Globe02Icon, placeholder: 'https://…', hosts: [], profileBase: null },
];

function parseUrl(value: string): URL | null {
  try {
    const url = new URL(/^https?:\/\//i.test(value) ? value : `https://${value}`);
    if ((url.protocol !== 'https:' && url.protocol !== 'http:') || !url.hostname.includes('.')) return null;
    return url;
  } catch {
    return null;
  }
}

/** Link o usuario → link (o el error que se muestra bajo el campo). */
export function normalizeSocialInput(
  config: SocialConfig,
  raw: string,
): { ok: true; url: string } | { ok: false; message: string } {
  const value = raw.trim();
  if (!value) return { ok: true, url: '' };
  if (config.profileBase) {
    const handle = value.replace(/^@/, '');
    const looksLikeUrl =
      /^https?:\/\//i.test(value) ||
      value.includes('/') ||
      /^www\./i.test(value) ||
      config.hosts.some((host) => value.toLowerCase().includes(host));
    if (value.startsWith('@') || !looksLikeUrl) {
      return /^[A-Za-z0-9._-]{1,60}$/.test(handle)
        ? { ok: true, url: `${config.profileBase}${handle}` }
        : { ok: false, message: `Revisa el usuario de ${config.label}.` };
    }
  }
  const url = parseUrl(value);
  if (!url) {
    return { ok: false, message: config.profileBase ? `El link de ${config.label} no es válido.` : 'El link del sitio web no es válido.' };
  }
  if (config.hosts.length > 0) {
    const host = url.hostname.toLowerCase().replace(/^(www|m|mobile|web)\./, '');
    if (!config.hosts.some((allowed) => host === allowed || host.endsWith(`.${allowed}`))) {
      return { ok: false, message: `El link de ${config.label} debe ser de ${config.hosts[0]}.` };
    }
  }
  return { ok: true, url: url.toString() };
}

/** Texto corto para el botón: "@refugio" o el dominio del sitio. */
export function socialLinkText(config: SocialConfig, url: string): string {
  const parsed = parseUrl(url);
  if (!parsed) return config.label;
  if (!config.profileBase) return parsed.hostname.replace(/^www\./, '');
  const first = parsed.pathname.split('/').filter(Boolean)[0];
  // Links de una publicación, un evento o un perfil por número (`profile.php?id=…`): solo la red.
  if (!first || /\.php$/i.test(first) || ['events', 'e', 'groups', 'share', 'p', 'reel', 'video', 'people'].includes(first)) {
    return config.label;
  }
  return first.startsWith('@') ? first : `@${first}`;
}

/** Redes del evento que sí tienen link, en el orden de `EVENT_SOCIAL_LINKS`. */
export function eventSocialLinks(event: Partial<Pick<PetEvent, EventSocialField>>) {
  return EVENT_SOCIAL_LINKS.flatMap((config) => {
    const url = event[config.field]?.trim();
    return url ? [{ ...config, url, text: socialLinkText(config, url) }] : [];
  });
}
