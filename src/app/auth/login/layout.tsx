import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { Routes } from 'kadesh/core/routes';
import { SITE_URL } from 'kadesh/core/site';

/**
 * The login is linked from every review, like and comment box as `/auth/login?redirect=…`, and
 * Google listed each of those as a duplicate without canonical (144 by Nov 2026). One canonical
 * for all of them and noindex: the page has nothing to rank for. `follow` stays so the links in
 * it still count. Not in robots.txt on purpose: blocked, Google could not see this noindex.
 */
export const metadata: Metadata = {
  title: 'Iniciar sesión',
  alternates: { canonical: `${SITE_URL}${Routes.auth.login}` },
  robots: { index: false, follow: true },
};

export default function LoginLayout({ children }: { children: ReactNode }) {
  return children;
}
