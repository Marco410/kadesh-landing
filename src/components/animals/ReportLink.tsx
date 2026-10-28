'use client';

import { forwardRef, useState, type ComponentProps, type MouseEvent } from 'react';
import Link from 'next/link';
import { useUser } from 'kadesh/utils/UserContext';
import AuthGateModal from 'kadesh/components/auth/AuthGateModal';
import { reportAuthCopy } from './reportAuthCopy';

type ReportLinkProps = Omit<ComponentProps<typeof Link>, 'href'> & {
  /** `/animales/nuevo?status=…` */
  href: string;
};

function statusFromHref(href: string): string | null {
  const query = href.split('?')[1];
  return query ? new URLSearchParams(query).get('status') : null;
}

/**
 * Enlace a un reporte nuevo. Sin sesión no manda a /auth/login: abre un modal que explica por
 * qué hace falta cuenta, deja crearla o entrar ahí mismo y luego lleva al formulario (`href`).
 * Mientras se sabe si hay sesión, el enlace navega normal (la página del formulario también pide cuenta).
 */
const ReportLink = forwardRef<HTMLAnchorElement, ReportLinkProps>(function ReportLink(
  { href, onClick, children, ...props },
  ref,
) {
  const { user, loading } = useUser();
  const [open, setOpen] = useState(false);

  const handleClick = (event: MouseEvent<HTMLAnchorElement>) => {
    onClick?.(event);
    if (event.defaultPrevented || loading || user) return;
    event.preventDefault();
    setOpen(true);
  };

  return (
    <>
      <Link ref={ref} href={href} onClick={handleClick} {...props}>
        {children}
      </Link>
      {!user ? (
        <AuthGateModal
          isOpen={open}
          onClose={() => setOpen(false)}
          redirectTo={href}
          {...reportAuthCopy(statusFromHref(href))}
        />
      ) : null}
    </>
  );
});

export default ReportLink;
