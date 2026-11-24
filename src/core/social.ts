import {
  Facebook01Icon,
  InstagramIcon,
  Linkedin01Icon,
  NewTwitterIcon,
} from '@hugeicons/core-free-icons';
import type { IconSvgElement } from '@hugeicons/react';

/**
 * Official Kadesh Pet social profiles. Single source for the footer, Conócenos
 * and the Organization `sameAs` in JSON-LD.
 */
export type KadeshSocialLink = {
  label: string;
  /** Short text shown next to the icon. */
  handle: string;
  href: string;
  icon: IconSvgElement;
};

export const KADESH_SOCIAL_LINKS: readonly KadeshSocialLink[] = [
  {
    label: 'Facebook',
    handle: 'Kadesh Pet',
    href: 'https://www.facebook.com/profile.php?id=61594166402735',
    icon: Facebook01Icon,
  },
  {
    label: 'Instagram',
    handle: '@kadesh.pet',
    href: 'https://www.instagram.com/kadesh.pet/',
    icon: InstagramIcon,
  },
  {
    label: 'LinkedIn',
    handle: 'Kadesh Pet',
    href: 'https://www.linkedin.com/company/kadesh-pet/',
    icon: Linkedin01Icon,
  },
  {
    label: 'X',
    handle: '@kadeshpet',
    href: 'https://x.com/kadeshpet',
    icon: NewTwitterIcon,
  },
];

export const KADESH_SOCIAL_URLS: readonly string[] = KADESH_SOCIAL_LINKS.map((link) => link.href);
