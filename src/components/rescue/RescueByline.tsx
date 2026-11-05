import Image from "next/image";
import Link from "next/link";
import { HugeiconsIcon } from "@hugeicons/react";
import { CheckmarkBadge01Icon, WhatsappIcon } from "@hugeicons/core-free-icons";
import { initialsOf } from "kadesh/components/app-shell/DashAvatar";
import { Routes } from "kadesh/core/routes";
import { RESCUE_ORG_STATUS, rescueTypeLabel } from "./constants";
import { rescueContactWhatsAppUrl } from "./rescueWhatsApp";

export type RescueBylineOrg = {
  id: string;
  name: string;
  slug?: string | null;
  type: string;
  city?: string | null;
  state?: string | null;
  status?: string | null;
  isAlly?: boolean | null;
  whatsapp?: string | null;
  logo?: { url?: string | null } | null;
};

/**
 * «Publicado por» en la ficha de un animal de un espacio de rescate. Al público solo le llega la
 * organización si está verificada; si su equipo la ve en revisión, se lo decimos.
 */
export default function RescueByline({
  org,
  animalName,
  publishedBy,
  publishedAt,
}: {
  org: RescueBylineOrg;
  animalName: string;
  publishedBy?: string | null;
  publishedAt: string;
}) {
  const verified = org.status === RESCUE_ORG_STATUS.VERIFIED;
  const place = [org.city, org.state].filter(Boolean).join(", ");
  const logoUrl = org.logo?.url;
  const whatsappUrl =
    verified && org.whatsapp
      ? rescueContactWhatsAppUrl(org.whatsapp, `Hola, vi a ${animalName} en KADESH y quiero información.`)
      : null;

  return (
    <div className="flex flex-col gap-3 border-t border-[#ececec] pt-3 dark:border-white/10">
      <div className="flex items-center gap-3">
        <span className="relative flex size-12 shrink-0 items-center justify-center overflow-hidden rounded-full bg-kadesh-50 text-sm font-bold text-kadesh dark:bg-kadesh/15">
          {logoUrl ? (
            <Image src={logoUrl} alt="" fill sizes="48px" className="object-cover" />
          ) : (
            <span aria-hidden>{initialsOf(org.name)}</span>
          )}
        </span>
        <div className="min-w-0">
          <p className="text-xs text-[#5a5a5a] dark:text-[#9aa3b2]">Publicado por</p>
          <p className="flex min-w-0 items-center gap-1.5 font-semibold text-[#121212] dark:text-[#eef1f6]">
            <span className="truncate">{org.name}</span>
            {verified ? (
              <HugeiconsIcon
                icon={CheckmarkBadge01Icon}
                size={16}
                className="shrink-0 text-kadesh"
                aria-label="Espacio de rescate verificado"
              />
            ) : null}
          </p>
          <p className="text-xs text-[#5a5a5a] dark:text-[#9aa3b2]">
            {[rescueTypeLabel(org.type), place].filter(Boolean).join(" · ")}
          </p>
        </div>
      </div>

      {org.isAlly && verified ? (
        <p className="inline-flex w-fit items-center rounded-full bg-kadesh-50 px-2.5 py-0.5 text-xs font-semibold text-kadesh-800 dark:bg-kadesh/15 dark:text-kadesh-200">
          Aliado KADESH
        </p>
      ) : null}

      {!verified ? (
        <p className="rounded-xl bg-amber-50 px-3 py-2 text-xs text-amber-900 dark:bg-amber-500/10 dark:text-amber-200">
          Tu espacio está en revisión: el público ve este reporte con el nombre de quien lo publicó hasta que lo
          verifiquemos.
        </p>
      ) : null}

      {verified ? (
        <div className="flex flex-wrap gap-2">
          {org.slug ? (
            <Link
              href={Routes.organizations.detail(org.slug)}
              className="inline-flex min-h-11 items-center rounded-full border border-[#dcdcdc] px-4 text-sm font-semibold text-[#121212] transition-colors hover:border-kadesh focus:outline-none focus-visible:ring-2 focus-visible:ring-kadesh dark:border-white/15 dark:text-[#eef1f6]"
            >
              Ver perfil
            </Link>
          ) : null}
          {whatsappUrl ? (
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex min-h-11 items-center gap-1.5 rounded-full bg-[#25d366] px-4 text-sm font-semibold text-white transition-opacity hover:opacity-90 focus:outline-none focus-visible:ring-2 focus-visible:ring-kadesh"
            >
              <HugeiconsIcon icon={WhatsappIcon} size={16} strokeWidth={1.6} aria-hidden />
              Escribir por WhatsApp
            </a>
          ) : null}
        </div>
      ) : null}

      <p className="text-xs text-[#5a5a5a] dark:text-[#9aa3b2]">
        {publishedBy ? `Lo publicó ${publishedBy} · ` : ""}
        {publishedAt}
      </p>
    </div>
  );
}
